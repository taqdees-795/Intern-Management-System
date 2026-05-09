const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const SECRET = process.env.JWT_SECRET || 'InternHub_SharedSecret_2024';
const User = require('./models/User');

// ── Stripe Setup ───────────────────────────────────────────
let stripe;
try {
  const key = process.env.STRIPE_SECRET_KEY;
  if (key && key !== 'sk_test_placeholder' && !key.includes('****')) {
    stripe = require('stripe')(key);
    console.log('✅ Stripe initialized');
  } else {
    console.log('ℹ️  Stripe running in demo mode (no real key)');
  }
} catch (e) { console.log('Stripe not available:', e.message); }

// ── Multer (Image Upload) ──────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Images only'));
  }
});
app.use('/uploads', express.static(uploadsDir));

// ── Schemas ────────────────────────────────────────────────
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  category: String,
  level: { type: String, default: 'Beginner' },
  duration: String,
  instructor: String,
  isPremium: { type: Boolean, default: false },
  tags: [String],
  rating: { type: Number, default: 4.5 },
  studentsCount: { type: Number, default: 0 },
  image: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  resources: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
const Course = mongoose.model('Course', courseSchema);

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: Number,
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, enum: ['paypal','stripe','free'] },
  paymentId: String,
  status: { type: String, enum: ['pending','completed','failed','refunded'], default: 'pending' },
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);

// ── Auth Middleware ────────────────────────────────────────
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = await User.findById(jwt.verify(token, SECRET).id).select('-password');
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

// ── Auth Routes ────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.matchPassword(req.body.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const fullUser = await User.findById(user._id).select('-password');
    res.json({
      token: jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' }),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        internshipType: user.internshipType,
        purchasedCourses: fullUser.purchasedCourses || []
      }
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// ── Image Upload ───────────────────────────────────────────
app.post('/api/upload', auth, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `${process.env.BASE_URL || `http://localhost:${process.env.PORT || 5005}`}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// ── Course Routes ──────────────────────────────────────────
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().populate('createdBy','name').sort({ createdAt: -1 });
    res.json(courses);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('createdBy','name');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/courses', auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(course);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/courses/:id', auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 🗑️ DELETE course → also remove all enrollments & unenroll students
app.delete('/api/courses/:id', auth, adminOnly, async (req, res) => {
  try {
    const courseId = req.params.id;
    const orders = await Order.find({ course: courseId });
    for (const order of orders) {
      await User.findByIdAndUpdate(order.user, {
        $pull: { purchasedCourses: courseId }
      });
    }
    await Order.deleteMany({ course: courseId });
    await Course.findByIdAndDelete(courseId);
    res.json({ message: 'Course and all related enrollments deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Free Enroll ────────────────────────────────────────────
app.post('/api/courses/:id/enroll', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Admins cannot enroll' });
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Not found' });
    if (course.isPremium) return res.status(403).json({ message: 'Purchase required' });
    const existing = await Order.findOne({ user: req.user._id, course: req.params.id, status: 'completed' });
    if (!existing) {
      await Order.create({ user: req.user._id, course: req.params.id, amount: 0, paymentMethod: 'free', status: 'completed' });
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { purchasedCourses: req.params.id } });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── My Courses ─────────────────────────────────────────────
app.get('/api/my-courses', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.json([]);
    const user = await User.findById(req.user._id).populate({ path: 'purchasedCourses', model: 'Course' });
    res.json(user.purchasedCourses || []);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Order Routes ───────────────────────────────────────────
app.get('/api/orders', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const orders = await Order.find(filter)
      .populate('course','title price category')
      .populate('user','name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: refund a paid enrollment
app.put('/api/orders/:id/refund', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: 'refunded' }, { new: true });
    if (order) await User.findByIdAndUpdate(order.user, { $pull: { purchasedCourses: order.course } });
    res.json(order);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Admin: unenroll without refund
app.put('/api/orders/:id/unenroll', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await User.findByIdAndUpdate(order.user, { $pull: { purchasedCourses: order.course } });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enrollment removed successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Student: leave course by courseId
app.delete('/api/enrollments/:courseId', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Admins cannot leave courses' });
    const courseId = req.params.courseId;
    await Order.deleteMany({ user: req.user._id, course: courseId });
    await User.findByIdAndUpdate(req.user._id, { $pull: { purchasedCourses: courseId } });
    res.json({ message: 'Successfully left the course' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Admin Stats ────────────────────────────────────────────
app.get('/api/admin/stats', auth, adminOnly, async (req, res) => {
  try {
    const [rev, oc, cc, uc] = await Promise.all([
      Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Order.countDocuments({ status: 'completed' }),
      Course.countDocuments(),
      User.countDocuments({ role: { $ne: 'admin' } })
    ]);
    res.json({ totalRevenue: rev[0]?.total || 0, orderCount: oc, courseCount: cc, userCount: uc });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Admin Users Route ──────────────────────────────────────
app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Stripe Routes ──────────────────────────────────────────
// Create PaymentIntent & return clientSecret for Stripe Elements
app.post('/api/payments/stripe/create-intent', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Admins cannot purchase courses' });
    const course = await Course.findById(req.body.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const existing = await Order.findOne({ user: req.user._id, course: req.body.courseId, status: 'completed' });
    if (existing) return res.status(400).json({ message: 'Already purchased' });

    if (!stripe) {
      // Demo mode – instant completion
      const demoId = `demo_${Date.now()}`;
      await Order.create({
        user: req.user._id, course: req.body.courseId,
        amount: course.price, paymentMethod: 'stripe',
        paymentId: demoId, status: 'completed'
      });
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { purchasedCourses: req.body.courseId } });
      return res.json({ clientSecret: 'demo', paymentIntentId: demoId, demoMode: true });
    }

    // Real Stripe – create PaymentIntent with course details and user email
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100),
      currency: 'usd',
      description: `Course: ${course.title}`,
      receipt_email: req.user.email,
      metadata: {
        courseId: req.body.courseId,
        userId: req.user._id.toString(),
        courseTitle: course.title,
        userEmail: req.user.email
      }
    });
    // Create a pending order
    await Order.create({
      user: req.user._id, course: req.body.courseId,
      amount: course.price, paymentMethod: 'stripe',
      paymentId: pi.id, status: 'pending'
    });
    res.json({ clientSecret: pi.client_secret, paymentIntentId: pi.id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Secure completion endpoint – called after Stripe Elements confirms payment
app.post('/api/payments/stripe/complete', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Admins cannot purchase courses' });
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: 'Missing paymentIntentId' });

    // Demo mode
    if (paymentIntentId.startsWith('demo_')) {
      return res.json({ success: true, demo: true });
    }

    if (!stripe) return res.status(400).json({ message: 'Stripe not configured' });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const order = await Order.findOneAndUpdate(
      { paymentId: paymentIntentId, status: 'pending' },
      { status: 'completed' },
      { new: true }
    );
    if (order) {
      await User.findByIdAndUpdate(order.user, { $addToSet: { purchasedCourses: order.course } });
    }
    res.json({ success: true, order });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Stripe Webhook – handles successful payments as backup
app.post('/api/payments/stripe/webhook', async (req, res) => {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET || !stripe) return res.json({ received: true });
    const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const order = await Order.findOneAndUpdate(
        { paymentId: pi.id, status: 'pending' },
        { status: 'completed' },
        { new: true }
      );
      if (order) await User.findByIdAndUpdate(order.user, { $addToSet: { purchasedCourses: order.course } });
    }
    res.json({ received: true });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ── PayPal Routes ──────────────────────────────────────────
const getPayPalToken = async () => {
  const { data } = await axios.post(
    'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    'grant_type=client_credentials',
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      auth: { username: process.env.PAYPAL_CLIENT_ID, password: process.env.PAYPAL_CLIENT_SECRET }
    }
  );
  return data.access_token;
};

app.post('/api/payments/paypal/create', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Admins cannot purchase courses' });
    const course = await Course.findById(req.body.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID === 'your_paypal_client_id') {
      return res.status(400).json({ message: 'PayPal is not configured. Please use Card payment.' });
    }
    const token = await getPayPalToken();
    const BASE = process.env.FRONTEND_URL || 'http://localhost:3000';
    const { data } = await axios.post(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: course.price.toFixed(2) },
          description: course.title
        }],
        application_context: {
          return_url: `${BASE}/checkout/success`,
          cancel_url: `${BASE}/checkout/${req.body.courseId}`
        }
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    const order = await Order.create({
      user: req.user._id, course: req.body.courseId,
      amount: course.price, paymentMethod: 'paypal',
      paymentId: data.id, status: 'pending'
    });
    res.json({
      orderId: data.id,
      approvalUrl: data.links.find(l => l.rel === 'approve')?.href,
      internalOrderId: order._id
    });
  } catch (e) {
    console.error('PayPal create error:', e.message);
    res.status(500).json({ message: 'PayPal error. Please use Card payment instead.' });
  }
});

app.post('/api/payments/paypal/capture', auth, async (req, res) => {
  try {
    if (req.user.role === 'admin') return res.status(403).json({ message: 'Admins cannot purchase courses' });
    const token = await getPayPalToken();
    const { data } = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${req.body.paypalOrderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    if (data.status === 'COMPLETED') {
      const order = await Order.findOneAndUpdate(
        { paymentId: req.body.paypalOrderId },
        { status: 'completed' },
        { new: true }
      );
      if (order) await User.findByIdAndUpdate(order.user, { $addToSet: { purchasedCourses: order.course } });
      res.json({ success: true, order });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Seed Admin ─────────────────────────────────────────────
const seedAdmin = async () => {
  try {
    const exists = await User.findOne({ email: 'admin@internhub.com' });
    if (!exists) {
      await User.create({ name: 'Admin', email: 'admin@internhub.com', password: 'Admin@2024', role: 'admin' });
      console.log('✅ Admin seeded: admin@internhub.com / Admin@2024');
    }
  } catch (e) { console.error('Seed error:', e.message); }
};

// ── Connect & Start ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intern_management')
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();
    const PORT = process.env.PORT || 5005;
    app.listen(PORT, () => console.log(`🚀 LMS API running on port ${PORT}`));
  })
  .catch(e => console.error('❌ MongoDB connection error:', e.message));