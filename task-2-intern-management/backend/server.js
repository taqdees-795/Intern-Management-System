const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/interns',    require('./routes/interns'));
app.use('/api/tasks',      require('./routes/tasks'));
app.use('/api/interntasks',require('./routes/internTasks'));
app.use('/api/feedback',   require('./routes/feedback'));

app.get('/', (req, res) => res.json({ message: 'InternHub API v2.0' }));

// ── Seed admin on startup ──────────────────────────
const seedAdmin = async () => {
  const User = require('./models/User');
  const exists = await User.findOne({ email: 'admin@internhub.com' });
  if (!exists) {
    await User.create({
      name: 'Admin', email: 'admin@internhub.com',
      password: 'Admin@2024', role: 'admin',
      internshipType: 'Management',
    });
    console.log('✅ Admin seeded: admin@internhub.com / Admin@2024');
  }
};

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intern_management')
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();
    app.listen(process.env.PORT || 5002, () =>
      console.log(`🚀 InternHub API on port ${process.env.PORT || 5002}`)
    );
  })
  .catch(err => console.error('❌ DB Error:', err));
