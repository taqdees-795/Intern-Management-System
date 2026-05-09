const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const SECRET = process.env.JWT_SECRET || 'InternHub_SharedSecret_2024';
const User = require('./models/User');

// ── Resume Schema ──────────────────────────────────────────
const skillSchema = new mongoose.Schema({
  name:  { type: String, default: '' },
  level: { type: String, default: '' },
  type:  { type: String, default: 'technical' },
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, default: 'Untitled Resume' },
  template:    { type: String, default: 'classic' },
  accentColor: { type: String, default: '#2D4A6B' },
  personal: {
    name: String, title: String, tagline: String,
    email: String, phone: String, location: String,
    linkedin: String, github: String, website: String, summary: String
  },
  skills:         { type: [skillSchema], default: [] },
  experience:     [{ company: String, role: String, startDate: String, endDate: String, current: Boolean, bullets: [String] }],
  education:      [{ institution: String, degree: String, field: String, startDate: String, endDate: String, gpa: String }],
  projects:       [{ name: String, description: String, tech: String, url: String }],
  certifications: [{ name: String, issuer: String, date: String, url: String }],
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);

// ── Auth middleware ────────────────────────────────────────
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = await User.findById(jwt.verify(token, SECRET).id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

// ── Auth routes ────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await user.matchPassword(req.body.password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({
      token: jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' }),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/auth/me', auth, (req, res) => res.json(req.user));

// ── Helper: sanitize skills array ─────────────────────────
function parseSkills(raw) {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { return []; }
  }
  if (!Array.isArray(raw)) return [];
  return raw.map(s => {
    if (typeof s === 'string') {
      try { s = JSON.parse(s); } catch { return null; }
    }
    if (!s || typeof s !== 'object') return null;
    return { name: s.name || '', level: s.level || '', type: s.type || 'technical' };
  }).filter(Boolean);
}

// ── Draft CRUD ─────────────────────────────────────────────

// All drafts
app.get('/api/resumes', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ owner: req.user._id })
      .select('title template accentColor personal updatedAt createdAt')
      .sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Single draft
app.get('/api/resumes/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, owner: req.user._id }).lean();
    if (!resume) return res.status(404).json({ message: 'Draft not found' });
    res.json(resume);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Create new draft
app.post('/api/resumes', auth, async (req, res) => {
  try {
    const { _id, owner, __v, createdAt, updatedAt, ...body } = req.body;
    body.skills = parseSkills(body.skills);
    const resume = await Resume.create({ ...body, owner: req.user._id });
    res.status(201).json(resume);
  } catch (e) {
    console.error('Create error:', e.message);
    res.status(500).json({ message: e.message });
  }
});

// Update draft
app.put('/api/resumes/:id', auth, async (req, res) => {
  try {
    const { _id, owner, __v, createdAt, updatedAt, ...body } = req.body;
    body.skills = parseSkills(body.skills);
    const updated = await Resume.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: body },
      { new: true, runValidators: false }
    );
    if (!updated) return res.status(404).json({ message: 'Draft not found' });
    res.json(updated);
  } catch (e) {
    console.error('Update error:', e.message);
    res.status(500).json({ message: e.message });
  }
});

// Delete draft
app.delete('/api/resumes/:id', auth, async (req, res) => {
  try {
    await Resume.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── PDF Export (layout improved) ───────────────────────────
const hexToRgb = (hex) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1],16)/255, parseInt(r[2],16)/255, parseInt(r[3],16)/255] : [0.18,0.29,0.42];
};
const LEVEL_LABELS = { beginner:'Beginner', intermediate:'Intermediate', professional:'Professional', master:'Master' };
const detectGpaOrPercent = (val) => {
  if (!val) return { label:'GPA', value:'' };
  const s = String(val).trim();
  if (s.includes('%') || parseFloat(s) > 10) return { label:'Percentage', value: s.replace('%','').trim()+'%' };
  return { label:'GPA', value:s };
};

app.get('/api/resumes/:id/export', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, owner: req.user._id }).lean();
    if (!resume) return res.status(404).json({ message: 'Draft not found' });

    const p  = resume.personal || {};
    const ac = resume.accentColor || '#2D4A6B';
    const skills = parseSkills(resume.skills);

    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    // ✅ Use resume.title for the filename, fallback to personal name, then 'resume'
    const fileNameBase = (resume.title || p.name || 'resume').replace(/\s+/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileNameBase}.pdf"`);
    doc.pipe(res);

    // Header
    const headerH = 125;
    doc.rect(0, 0, 595, headerH).fill(ac);
    doc.fillColor('white').font('Helvetica-Bold').fontSize(26).text(p.name || 'Resume', 50, 22, { width: 495 });

    let hy = 54;
    if (p.title)   { doc.fontSize(12).font('Helvetica').fillColor('white').text(p.title, 50, hy, { width:495 }); hy += 16; }
    if (p.tagline) { doc.fontSize(9).font('Helvetica').fillColor([1,1,1,0.72]).text(p.tagline, 50, hy, { width:495 }); hy += 13; }

    doc.moveTo(50, hy+1).lineTo(545, hy+1).strokeColor([1,1,1,0.28]).lineWidth(0.5).stroke();
    hy += 7;

    const contactParts = [
      p.email    ? 'e: '+p.email   : null,
      p.phone    ? p.phone         : null,
      p.location ? p.location      : null,
      p.linkedin ? 'LinkedIn: '+p.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//,'') : null,
      p.github   ? 'GitHub: '+p.github.replace(/^https?:\/\/(www\.)?github\.com\//,'')           : null,
      p.website  ? p.website.replace(/^https?:\/\/(www\.)?/,'')                                   : null,
    ].filter(Boolean);
    if (contactParts.length) {
      doc.fontSize(8.5).font('Helvetica').fillColor([1,1,1,0.88])
         .text(contactParts.join('   |   '), 50, hy, { width:495 });
    }

    doc.y = headerH + 14;

    const sectionHead = (title) => {
      if (doc.y > 730) doc.addPage();
      doc.moveDown(0.5);
      doc.fillColor(ac).font('Helvetica-Bold').fontSize(10)
         .text(title.toUpperCase(), 50, doc.y, { characterSpacing:1.5, width:495 });
      doc.moveDown(0.1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(ac).lineWidth(1.5).stroke();
      doc.moveDown(0.38);
    };

    const techSkills = skills.filter(s => s.type !== 'soft');
    const softSkills = skills.filter(s => s.type === 'soft');

    // Summary
    if (p.summary) {
      sectionHead('Professional Summary');
      doc.fillColor('#444').font('Helvetica').fontSize(10).text(p.summary, 50, doc.y, { width:495, lineGap:3 });
    }

    // Unified skill display – one skill per line, name left, level right, same font/color
    const skillLeftX = 50;
    const skillLeftW = 400;
    const skillRightX = 450;
    const skillRightW = 95;
    const skillLineH = 15;

    function drawSkillList(skillArr) {
      let y = doc.y;
      skillArr.forEach(sk => {
        const name = sk.name || '';
        const levelText = sk.level ? (LEVEL_LABELS[sk.level] || sk.level) : '';
        doc.fillColor('#1a1a1a').font('Helvetica').fontSize(10)
           .text(name, skillLeftX, y, { width: skillLeftW });
        if (levelText) {
          doc.fillColor('#1a1a1a').font('Helvetica').fontSize(10)
             .text(levelText, skillRightX, y, { width: skillRightW, align: 'right' });
        }
        y += skillLineH;
      });
      doc.y = y;
    }

    if (techSkills.length) {
      sectionHead('Technical Skills');
      drawSkillList(techSkills);
    }

    if (softSkills.length) {
      sectionHead('Soft Skills & Languages');
      drawSkillList(softSkills);
    }

    // Work Experience
    if ((resume.experience||[]).length) {
      sectionHead('Work Experience');
      resume.experience.forEach(exp => {
        if (doc.y > 720) doc.addPage();
        const dateStr = [exp.startDate, exp.current?'Present':exp.endDate].filter(Boolean).join(' - ');
        // Role (left) and dates (right) on same line – no italic
        doc.fillColor('#1a1a1a').font('Helvetica-Bold').fontSize(11)
           .text(exp.role||'', 50, doc.y, { width: 380 });
        if (dateStr) {
          doc.fillColor('#777').font('Helvetica').fontSize(9)
             .text(dateStr, 380, doc.y, { width: 165, align: 'right' });
        }
        doc.moveDown(0.2);
        if (exp.company) {
          doc.fillColor(ac).font('Helvetica').fontSize(10)
             .text(exp.company, 50, doc.y);
        }
        (exp.bullets||[]).filter(b=>b?.trim()).forEach(b => {
          doc.fillColor('#444').font('Helvetica').fontSize(10)
             .text('•  '+b, 62, doc.y, { width:483, lineGap:2 });
        });
        doc.moveDown(0.35);
      });
    }

    // Education – right‑aligned dates
    if ((resume.education||[]).length) {
      sectionHead('Education');
      resume.education.forEach(ed => {
        if (doc.y > 720) doc.addPage();
        const dateStr  = [ed.startDate, ed.endDate].filter(Boolean).join(' - ');
        const degTitle = [ed.degree, ed.field].filter(Boolean).join(' in ');
        const gpaInfo  = detectGpaOrPercent(ed.gpa);

        doc.fillColor('#1a1a1a').font('Helvetica-Bold').fontSize(11)
           .text(degTitle||'', 50, doc.y, { width: 380 });
        if (dateStr) {
          doc.fillColor('#777').font('Helvetica').fontSize(9)
             .text(dateStr, 380, doc.y, { width: 165, align: 'right' });
        }
        doc.moveDown(0.2);
        let instLine = ed.institution||'';
        if (gpaInfo.value) instLine += `   —   ${gpaInfo.label}: ${gpaInfo.value}`;
        if (instLine) {
          doc.fillColor(ac).font('Helvetica').fontSize(10)
             .text(instLine, 50, doc.y);
        }
        doc.moveDown(0.35);
      });
    }

    // Projects – right‑aligned tech, no italic
    if ((resume.projects||[]).length) {
      sectionHead('Projects');
      resume.projects.forEach(pr => {
        if (doc.y > 720) doc.addPage();
        doc.fillColor('#1a1a1a').font('Helvetica-Bold').fontSize(11)
           .text(pr.name||'', 50, doc.y, { width: pr.tech ? 380 : 495 });
        if (pr.tech) {
          doc.fillColor(ac).font('Helvetica').fontSize(9)
             .text(pr.tech, 380, doc.y, { width: 165, align: 'right' });
        }
        doc.moveDown(0.15);
        if (pr.description) {
          doc.fillColor('#444').font('Helvetica').fontSize(10)
             .text(pr.description, 50, doc.y, { width: 495, lineGap: 2 });
        }
        if (pr.url) {
          doc.fillColor('#1a5eb8').font('Helvetica').fontSize(9)
             .text(pr.url, 50, doc.y);
        }
        doc.moveDown(0.35);
      });
    }

    // Certifications – right‑aligned date, no italic
    if ((resume.certifications||[]).length) {
      sectionHead('Certifications');
      resume.certifications.forEach(c => {
        if (doc.y > 720) doc.addPage();
        const certLine = [c.name, c.issuer].filter(Boolean).join(' — ');
        doc.fillColor('#1a1a1a').font('Helvetica-Bold').fontSize(10)
           .text(certLine, 50, doc.y, { width: 380 });
        if (c.date) {
          doc.fillColor('#777').font('Helvetica').fontSize(9)
             .text(c.date, 380, doc.y, { width: 165, align: 'right' });
        }
        doc.moveDown(0.25);
      });
    }

    doc.end();
  } catch (e) {
    console.error('PDF export error:', e);
    if (!res.headersSent) res.status(500).json({ message: e.message });
  }
});

// ── Database connection & index fix ────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/intern_management')
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Remove unique index on owner to allow multiple resumes per intern
    try {
      await mongoose.connection.db.collection('resumes').dropIndex('owner_1');
      console.log('✔️  Removed unique index on owner (multiple drafts allowed).');
    } catch (err) {
      if (err.code !== 27) console.log('Index drop note:', err.message);
    }

    // Seed admin user if not exists
    try {
      const exists = await User.findOne({ email: 'admin@internhub.com' });
      if (!exists) await User.create({ name:'Admin', email:'admin@internhub.com', password:'Admin@2024', role:'admin' });
    } catch(e) {}

    const PORT = process.env.PORT || 5004;
    app.listen(PORT, () => console.log(`🚀 Resume Builder API running on port ${PORT}`));
  })
  .catch(e => console.error('MongoDB connection failed:', e.message));