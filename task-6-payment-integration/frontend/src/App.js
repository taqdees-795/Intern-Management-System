import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Load Stripe with publishable key
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51TUP0XGS8j1zDnIlDT0Efxdcse7JNCxoArctPLD42CzNEbghndHQHDzB171JqZ9PTYBvxTdTSKm3LNtkopo2d8cS0091S0pkxp'
);

// ── Styles (same as before) ─────────────────────────────
const style = document.createElement('style');
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
:root{
  --darkest:#1a1e26;--dark:#252b35;--mid:#7a8a7e;--light:#e8dcc8;
  --accent:#c9a96e;--accent2:#a8894e;--success:#5a9e7a;--warning:#c8973a;--danger:#b85c5c;
  --gold:#f0bc3a;--gold2:#c8973a;
  --card:#242a34;--sidebar:#1a1e26;
  --border:rgba(148,137,121,0.15);
  --font-display:'Playfair Display',serif;--font-body:'Inter',sans-serif;
  --radius:10px;--radius-lg:16px;
  --shadow:0 4px 24px rgba(0,0,0,0.35);--shadow-lg:0 12px 48px rgba(0,0,0,0.5);
  --blue-accent:#6ea8c7;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:var(--font-body);background:var(--darkest);color:var(--light);min-height:100vh;}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:rgba(148,137,121,0.25);border-radius:3px;}

.nav{background:rgba(22,27,36,0.96);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);padding:0 36px;height:62px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
.nav-logo{font-family:var(--font-display);font-size:21px;font-weight:800;color:var(--light);text-decoration:none;letter-spacing:-0.3px;}
.nav-logo span{color:var(--gold);}
.nav-links{display:flex;align-items:center;gap:6px;}
.nav-link{color:var(--mid);text-decoration:none;font-size:13.5px;font-weight:500;padding:6px 12px;border-radius:7px;transition:all 0.18s;}
.nav-link:hover{color:var(--light);background:rgba(255,255,255,0.05);}

.page{padding:40px;max-width:1200px;margin:0 auto;}
.page-title{font-family:var(--font-display);font-size:30px;font-weight:800;margin-bottom:6px;letter-spacing:-0.5px;}
.page-sub{color:var(--mid);font-size:14px;margin-bottom:32px;}

.btn{padding:9px 20px;border-radius:8px;border:none;cursor:pointer;font-size:13.5px;font-weight:600;font-family:var(--font-body);transition:all 0.18s;text-decoration:none;display:inline-flex;align-items:center;gap:6px;}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#111;}
.btn-primary:hover{filter:brightness(1.08);transform:translateY(-1px);}
.btn-gold{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#111;font-weight:700;}
.btn-gold:hover{filter:brightness(1.1);transform:translateY(-1px);}
.btn-success{background:rgba(90,158,122,0.18);color:var(--success);border:1px solid rgba(90,158,122,0.3);}
.btn-outline{background:transparent;border:1px solid rgba(148,137,121,0.28);color:var(--mid);}
.btn-outline:hover{border-color:var(--mid);color:var(--light);background:rgba(255,255,255,0.04);}
.btn-sm{padding:6px 14px;font-size:12.5px;}
.btn-danger{background:rgba(184,92,92,0.14);color:var(--danger);border:1px solid rgba(184,92,92,0.28);}
.btn-danger:hover{background:rgba(184,92,92,0.24);}

.premium-badge{background:rgba(240,188,58,0.15);border:1px solid rgba(240,188,58,0.3);color:var(--gold);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;}
.free-badge{background:rgba(90,158,122,0.15);border:1px solid rgba(90,158,122,0.28);color:var(--success);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.owned-badge{background:rgba(201,169,110,0.15);border:1px solid rgba(201,169,110,0.28);color:var(--accent);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.status-badge{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.status-completed{background:rgba(90,158,122,0.15);color:var(--success);}
.status-pending{background:rgba(200,151,58,0.15);color:var(--warning);}
.status-refunded{background:rgba(148,137,121,0.15);color:var(--mid);}
.status-failed{background:rgba(184,92,92,0.15);color:var(--danger);}
.tag-chip{background:rgba(57,62,70,0.5);color:var(--mid);padding:3px 10px;border-radius:20px;font-size:11px;}

.card{background:rgba(36,42,52,0.8);border:1px solid var(--border);border-radius:var(--radius-lg);padding:28px;}
.courses-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(295px,1fr));gap:22px;}
.course-card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:all 0.22s;cursor:pointer;}
.course-card:hover{transform:translateY(-5px);border-color:rgba(201,169,110,0.28);box-shadow:var(--shadow);}
.course-thumb{width:100%;height:160px;object-fit:cover;background:linear-gradient(135deg,var(--dark),var(--darkest));display:flex;align-items:center;justify-content:center;font-size:44px;position:relative;overflow:hidden;}
.course-thumb img{width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;}
.course-thumb-emoji{position:relative;z-index:1;}
.course-body{padding:18px;}
.course-title{font-family:var(--font-display);font-size:15.5px;font-weight:700;margin-bottom:6px;line-height:1.3;}
.course-desc{color:var(--mid);font-size:13px;line-height:1.55;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.course-meta{display:flex;gap:10px;font-size:11.5px;color:var(--mid);margin-bottom:12px;flex-wrap:wrap;}
.course-footer{display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid rgba(148,137,121,0.08);}
.price-tag{font-family:var(--font-display);font-size:21px;font-weight:800;}
.price-free{color:var(--success);}
.price-paid{color:var(--gold);}

.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:28px;}
.stat-card{background:rgba(36,42,52,0.7);border:1px solid var(--border);border-radius:12px;padding:20px;position:relative;overflow:hidden;}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
.stat-card.gold::before{background:linear-gradient(90deg,var(--gold),var(--accent));}
.stat-card.green::before{background:linear-gradient(90deg,var(--success),#3a8a5a);}
.stat-card.blue::before{background:linear-gradient(90deg,#4a7eb8,#2a5a8a);}
.stat-card.purple::before{background:linear-gradient(90deg,#7a5ab8,#5a3a8a);}
.stat-label{font-size:11px;color:var(--mid);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;}
.stat-val{font-family:var(--font-display);font-size:30px;font-weight:800;}

.form-group{margin-bottom:14px;}
.form-label{display:block;font-size:11px;font-weight:600;color:var(--mid);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;}
.form-input,.form-select,.form-textarea{width:100%;padding:9px 13px;background:rgba(20,24,32,0.8);border:1px solid rgba(148,137,121,0.2);border-radius:8px;color:var(--light);font-size:13.5px;font-family:var(--font-body);transition:border-color 0.18s;}
.form-input:focus,.form-select:focus,.form-textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(201,169,110,0.1);}
.form-textarea{resize:vertical;min-height:72px;}
.form-select option{background:#1a1e26;}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

.error-msg{background:rgba(184,92,92,0.1);border:1px solid rgba(184,92,92,0.28);color:var(--danger);padding:11px 14px;border-radius:8px;font-size:13px;margin-bottom:16px;}
.success-msg{background:rgba(90,158,122,0.1);border:1px solid rgba(90,158,122,0.28);color:var(--success);padding:14px;border-radius:8px;font-size:14px;margin-bottom:16px;text-align:center;}

.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(5px);}
.modal{background:#1e2430;border:1px solid rgba(148,137,121,0.18);border-radius:18px;padding:32px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;}
.modal-title{font-family:var(--font-display);font-size:21px;font-weight:700;margin-bottom:22px;}

.img-upload-area{border:2px dashed rgba(148,137,121,0.35);border-radius:10px;padding:20px;text-align:center;cursor:pointer;transition:border-color 0.2s, background 0.2s;margin-bottom:12px;display:block;}
.img-upload-area:hover{border-color:var(--accent);background:rgba(201,169,110,0.05);}
.img-preview{width:100%;height:120px;object-fit:cover;border-radius:8px;margin-top:8px;}

.course-detail-layout{display:grid;grid-template-columns:1fr 340px;gap:28px;align-items:start;}
.course-detail-sidebar{background:rgba(30,36,48,0.9);border:1px solid var(--border);border-radius:16px;padding:26px;position:sticky;top:80px;}
.video-wrapper{position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;}
.video-wrapper iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none;}

.enrolled-course-card{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;display:flex;transition:all 0.2s;}
.enrolled-course-card:hover{border-color:rgba(201,169,110,0.28);box-shadow:var(--shadow);}
.enrolled-thumb{width:130px;min-height:100px;display:flex;align-items:center;justify-content:center;font-size:34px;background:linear-gradient(135deg,var(--dark),var(--darkest));flex-shrink:0;position:relative;overflow:hidden;}
.enrolled-thumb img{width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;}

.admin-table{width:100%;border-collapse:collapse;}
.admin-table th{padding:10px 14px;text-align:left;font-size:11px;color:var(--mid);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid var(--border);}
.admin-table td{padding:13px 14px;font-size:13px;border-bottom:1px solid rgba(148,137,121,0.06);}
.admin-table tr:last-child td{border-bottom:none;}
.admin-table tr:hover td{background:rgba(255,255,255,0.02);}
.user-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#111;flex-shrink:0;}

.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.section-title{font-family:var(--font-display);font-size:18px;font-weight:700;}

/* ── Checkout – Professional Split Inputs ── */
.checkout-wrapper{max-width:520px;margin:0 auto;padding:40px 24px;}
.checkout-card{background:rgba(30,36,48,0.9);border:1px solid var(--border);border-radius:20px;padding:32px;box-shadow:var(--shadow-lg);border-top:3px solid var(--blue-accent);}
.checkout-card h2{font-family:var(--font-display);font-size:26px;font-weight:700;margin-bottom:24px;text-align:center;}

.input-group{margin-bottom:20px;}
.input-group label{display:block;font-size:12px;font-weight:600;color:var(--mid);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;}
.stripe-input{width:100%;padding:12px 16px;background:rgba(16,20,28,0.8);border:1.5px solid rgba(148,137,121,0.2);border-radius:10px;color:var(--light);font-size:15px;font-family:var(--font-body);transition:all 0.2s;}
.stripe-input:focus{outline:none;border-color:var(--blue-accent);box-shadow:0 0 0 3px rgba(110,168,199,0.2);}

.input-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;}

/* Wrapper for Stripe Elements to match custom input style */
.stripe-input-wrapper {
  padding: 12px 16px;
  background: rgba(16, 20, 28, 0.9);
  border: 1.5px solid rgba(148, 137, 121, 0.2);
  border-radius: 10px;
  transition: border-color 0.2s;
}
.stripe-input-wrapper:focus-within {
  border-color: var(--blue-accent);
  box-shadow: 0 0 0 3px rgba(110, 168, 199, 0.2);
}
.stripe-element {
  width: 100%;
}
/* Normalise Stripe's internal font size */
.StripeElement {
  font-size: 15px !important;
}

.pay-button{width:100%;padding:16px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#111;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:var(--font-body);display:flex;align-items:center;justify-content:center;gap:10px;transition:all 0.2s;margin-top:8px;}
.pay-button:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-2px);box-shadow:0 8px 24px rgba(240,188,58,0.4);}
.pay-button:disabled{opacity:0.65;cursor:not-allowed;}

/* Success Screen */
.success-screen{text-align:center;padding:20px 0;}
.success-screen .icon{font-size:56px;margin-bottom:12px;}
.success-screen h2{font-family:var(--font-display);font-size:26px;margin-bottom:8px;}
.success-screen p{color:var(--mid);font-size:14px;margin-bottom:24px;}
.transaction-id{background:rgba(16,20,28,0.7);border:1px solid var(--border);border-radius:8px;padding:8px 14px;display:inline-block;font-family:monospace;font-size:13px;color:var(--accent);margin-bottom:20px;}

/* Auto-redirect notice */
.auto-redirect-hint {
  color: var(--mid);
  font-size: 12px;
  margin-top: 14px;
}

.login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 20% 50%,rgba(57,62,70,0.4) 0,transparent 60%),radial-gradient(ellipse at 80% 50%,rgba(201,169,110,0.06) 0,transparent 50%);}
.login-card{background:rgba(36,42,52,0.9);border:1px solid var(--border);border-radius:20px;padding:48px;width:100%;max-width:400px;box-shadow:var(--shadow-lg);}
.login-title{font-family:var(--font-display);font-size:30px;font-weight:800;margin-bottom:8px;}
.login-btn{width:100%;padding:13px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#111;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;margin-top:8px;transition:all 0.2s;}
.login-btn:hover{filter:brightness(1.08);}

.admin-tab-bar{display:flex;gap:4px;margin-bottom:28px;background:rgba(20,24,32,0.5);border:1px solid var(--border);border-radius:12px;padding:6px;}
.admin-tab{padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;color:var(--mid);transition:all 0.18s;border:none;background:transparent;font-family:var(--font-body);}
.admin-tab.active{background:rgba(201,169,110,0.15);color:var(--accent);border:1px solid rgba(201,169,110,0.2);}
.admin-tab:hover:not(.active){color:var(--light);}

@keyframes spin{to{transform:rotate(360deg);}}
@media(max-width:900px){.course-detail-layout{grid-template-columns:1fr;}.checkout-grid{grid-template-columns:1fr;}}
@media(max-width:600px){.page{padding:20px;}.nav{padding:0 16px;}.checkout-form{padding:24px;}}
`;
document.head.appendChild(style);

// ── Auth Context ──────────────────────────────────────────
const AuthCtx = createContext();
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lms_token'));
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me').then(r => setUser(r.data)).catch(() => {
        localStorage.removeItem('lms_token'); setToken(null);
      });
    }
  }, [token]);
  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('lms_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token); setUser(data.user); return data.user;
  };
  const logout = () => {
    localStorage.removeItem('lms_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null); setUser(null);
  };
  const refreshUser = async () => {
    const { data } = await axios.get('/api/auth/me'); setUser(data);
  };
  return <AuthCtx.Provider value={{ user, login, logout, refreshUser }}>{children}</AuthCtx.Provider>;
}

// ── Helpers ──────────────────────────────────────────────
const EMOJIS = { 'Web Development':'🌐','React':'⚛️','Node.js':'🟢','Python':'🐍','Data Science':'📊','Design':'🎨','DevOps':'⚙️','AI/ML':'🤖','Default':'📚' };
const getEmoji = cat => EMOJIS[cat] || EMOJIS.Default;
function isOwned(user, courseId) {
  if (!user) return false;
  return (user.purchasedCourses || []).some(c => (c._id || c) === courseId);
}
function CourseThumb({ course, height = 160 }) {
  if (course.image) return <div className="course-thumb" style={{ height }}><img src={course.image} alt={course.title} /></div>;
  return <div className="course-thumb" style={{ height }}><span className="course-thumb-emoji">{getEmoji(course.category)}</span></div>;
}

// ── NavBar ───────────────────────────────────────────────
function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <Link to={user?.role === 'admin' ? '/admin' : '/courses'} className="nav-logo">Intern<span>Hub</span></Link>
      <div className="nav-links">
        <Link to="/courses" className="nav-link">Courses</Link>
        {user && user.role !== 'admin' && <Link to="/my-courses" className="nav-link">My Courses</Link>}
        {user?.role === 'admin' && <Link to="/admin" className="nav-link">Admin Panel</Link>}
        {user
          ? <button className="btn btn-sm btn-outline" style={{ marginLeft:6 }} onClick={logout}>Logout</button>
          : <Link to="/login"><button className="btn btn-sm btn-primary" style={{ marginLeft:6 }}>Sign In</button></Link>
        }
      </div>
    </nav>
  );
}

// ── CourseCard ────────────────────────────────────────────
function CourseCard({ course, owned, onEnroll }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const handleAction = () => {
    if (owned) navigate(`/courses/${course._id}`);
    else if (course.isPremium) navigate(`/checkout/${course._id}`);
    else if (!user) navigate('/login');
    else onEnroll(course._id);
  };
  return (
    <div className="course-card" onClick={() => navigate(`/courses/${course._id}`)}>
      <CourseThumb course={course} height={160} />
      <div className="course-body">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:9 }}>
          <span className={course.isPremium ? 'premium-badge' : 'free-badge'}>{course.isPremium ? '⭐ Premium' : '✓ Free'}</span>
          {owned && <span className="owned-badge">✓ Enrolled</span>}
        </div>
        <div className="course-title">{course.title}</div>
        <div className="course-desc">{course.description}</div>
        <div className="course-meta">
          <span>👤 {course.instructor || 'Instructor'}</span>
          <span>⏱ {course.duration || '8h'}</span>
          <span>📊 {course.level}</span>
          <span>⭐ {course.rating}</span>
        </div>
        <div className="course-footer" onClick={e => e.stopPropagation()}>
          <div className={`price-tag ${course.isPremium ? 'price-paid' : 'price-free'}`}>
            {course.isPremium ? `$${course.price}` : 'FREE'}
          </div>
          <button className={`btn btn-sm ${owned ? 'btn-success' : course.isPremium ? 'btn-gold' : 'btn-outline'}`} onClick={handleAction}>
            {owned ? '▶ Continue' : course.isPremium ? 'Buy Now' : 'Enroll Free'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CoursesPage (PUBLIC) ──────────────────────────────────
function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('all');
  const { user, refreshUser } = useAuth();

  useEffect(() => { axios.get('/api/courses').then(r => setCourses(r.data)); }, []);

  const enroll = async (courseId) => {
    try { await axios.post(`/api/courses/${courseId}/enroll`); await refreshUser(); }
    catch(e) { alert(e.response?.data?.message || 'Enroll failed'); }
  };

  const owned = id => isOwned(user, id);
  const filtered = filter === 'all' ? courses
    : filter === 'free' ? courses.filter(c => !c.isPremium)
    : filter === 'premium' ? courses.filter(c => c.isPremium)
    : courses.filter(c => owned(c._id));

  return (
    <div className="page">
      <div className="page-title">Course Catalog</div>
      <div className="page-sub">Expand your skills with our curated courses</div>
      <div style={{ display:'flex', gap:8, marginBottom:28, flexWrap:'wrap', alignItems:'center' }}>
        {['all','free','premium'].map(f => (
          <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-outline'}`} onClick={() => setFilter(f)}>
            {f==='all'?'All Courses':f==='free'?'Free':'Premium ⭐'}
          </button>
        ))}
        {user && user.role !== 'admin' && (
          <button className={`btn btn-sm ${filter==='owned'?'btn-primary':'btn-outline'}`} onClick={() => setFilter('owned')}>
            Enrolled
          </button>
        )}
        <span style={{ marginLeft:'auto', color:'var(--mid)', fontSize:13 }}>{filtered.length} course{filtered.length!==1?'s':''}</span>
      </div>
      <div className="courses-grid">
        {filtered.map(c => <CourseCard key={c._id} course={c} owned={owned(c._id)} onEnroll={enroll} />)}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:80, color:'var(--mid)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>📚</div><div>No courses found</div>
        </div>
      )}
    </div>
  );
}

// ── CourseDetailPage ──────────────────────────────────────
function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (id) axios.get(`/api/courses/${id}`).then(r => setCourse(r.data)).catch(() => navigate('/courses'));
  }, [id]);

  if (!course) return <div style={{ textAlign:'center', padding:80, color:'var(--mid)' }}>Loading…</div>;

  const owned = isOwned(user, course._id);
  const isAdmin = user?.role === 'admin';
  const getYoutubeId = url => {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? m[1] : null;
  };

  const enroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true);
    try { await axios.post(`/api/courses/${course._id}/enroll`); await refreshUser(); setMsg('🎉 Successfully enrolled!'); }
    catch(e) { setMsg(e.response?.data?.message || 'Enrollment failed'); }
    setEnrolling(false);
  };

  return (
    <div className="page">
      <div style={{ borderRadius:16, overflow:'hidden', marginBottom:28, position:'relative' }}>
        {course.image
          ? <img src={course.image} alt={course.title} style={{ width:'100%', height:280, objectFit:'cover', display:'block' }} />
          : <div style={{ width:'100%', height:200, display:'flex', alignItems:'center', justifyContent:'center', fontSize:80, background:'linear-gradient(135deg,var(--dark),var(--darkest))' }}>{getEmoji(course.category)}</div>
        }
        <div style={{ position:'absolute', top:16, left:16 }}>
          <span className={course.isPremium ? 'premium-badge' : 'free-badge'}>{course.isPremium ? '⭐ Premium' : '✓ Free'}</span>
        </div>
      </div>

      <div className="course-detail-layout">
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
            <span className="tag-chip">📊 {course.level}</span>
            <span className="tag-chip">⏱ {course.duration}</span>
            <span className="tag-chip">⭐ {course.rating}/5</span>
            {course.category && <span className="tag-chip">{getEmoji(course.category)} {course.category}</span>}
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, marginBottom:12 }}>{course.title}</h1>
          <p style={{ color:'var(--mid)', fontSize:14, lineHeight:1.75, marginBottom:14 }}>{course.description}</p>
          {course.instructor && (
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20, padding:'10px 14px', background:'rgba(201,169,110,0.07)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:8 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#111' }}>
                {course.instructor.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize:11, color:'var(--mid)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Instructor</div>
                <div style={{ fontSize:14, fontWeight:600 }}>{course.instructor}</div>
              </div>
            </div>
          )}
          {course.tags?.length > 0 && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
              {course.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
            </div>
          )}
          {msg && <div className={msg.startsWith('🎉') ? 'success-msg' : 'error-msg'}>{msg}</div>}

          {(owned || isAdmin) && (
            <div style={{ marginTop:8 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginBottom:16 }}>📖 Course Content</h3>
              {course.videoUrl && (
                <div style={{ marginBottom:20 }}>
                  {getYoutubeId(course.videoUrl)
                    ? <div className="video-wrapper"><iframe src={`https://www.youtube.com/embed/${getYoutubeId(course.videoUrl)}`} title={course.title} allowFullScreen /></div>
                    : <a href={course.videoUrl} target="_blank" rel="noreferrer" className="btn btn-gold">▶ Watch Course Video</a>
                  }
                </div>
              )}
              {course.resources && (
                <div style={{ background:'rgba(74,126,184,0.07)', border:'1px solid rgba(74,126,184,0.18)', borderRadius:12, padding:18, marginBottom:16 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--accent)', marginBottom:8 }}>📎 Resources & Notes</div>
                  <p style={{ fontSize:13, color:'var(--mid)', whiteSpace:'pre-wrap', lineHeight:1.7 }}>{course.resources}</p>
                </div>
              )}
              {!course.videoUrl && !course.resources && (
                <div style={{ background:'rgba(57,62,70,0.25)', border:'1px solid var(--border)', borderRadius:12, padding:24, textAlign:'center', color:'var(--mid)', fontSize:13 }}>
                  📚 Course content will be available soon.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="course-detail-sidebar">
          <div style={{ textAlign:'center', marginBottom:16 }}>
            {course.image
              ? <img src={course.image} alt={course.title} style={{ width:'100%', height:140, objectFit:'cover', borderRadius:10, marginBottom:12 }} />
              : <div style={{ fontSize:56, marginBottom:12 }}>{getEmoji(course.category)}</div>
            }
            <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, marginBottom:6 }}>{course.title}</div>
            <div style={{ marginBottom:16 }}>
              <span className={`price-tag ${course.isPremium ? 'price-paid' : 'price-free'}`} style={{ fontSize:30 }}>
                {course.isPremium ? `$${course.price}` : 'FREE'}
              </span>
            </div>
          </div>
          {isAdmin ? (
            <div style={{ textAlign:'center', color:'var(--mid)', fontSize:13, padding:14, background:'rgba(148,137,121,0.08)', borderRadius:10 }}>👁 Admin View</div>
          ) : owned ? (
            <div style={{ textAlign:'center', background:'rgba(90,158,122,0.08)', border:'1px solid rgba(90,158,122,0.2)', borderRadius:12, padding:18 }}>
              <div style={{ fontSize:28, marginBottom:6 }}>🎓</div>
              <div style={{ fontWeight:700, color:'var(--success)', marginBottom:4 }}>You're Enrolled!</div>
              <div style={{ fontSize:12, color:'var(--mid)' }}>Access all materials above</div>
            </div>
          ) : course.isPremium ? (
            <Link to={`/checkout/${course._id}`} className="btn btn-gold" style={{ width:'100%', justifyContent:'center', padding:14 }}>
              💳 Buy Now — ${course.price}
            </Link>
          ) : (
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:14 }} onClick={enroll} disabled={enrolling}>
              {enrolling ? 'Enrolling…' : '✓ Enroll for Free'}
            </button>
          )}
          <div style={{ marginTop:18, fontSize:13, color:'var(--mid)', lineHeight:2.2 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span>📊 Level</span><span style={{ color:'var(--light)' }}>{course.level}</span></div>
            <div style={{ borderTop:'1px solid var(--border)' }} />
            <div style={{ display:'flex', justifyContent:'space-between' }}><span>⏱ Duration</span><span style={{ color:'var(--light)' }}>{course.duration}</span></div>
            <div style={{ borderTop:'1px solid var(--border)' }} />
            <div style={{ display:'flex', justifyContent:'space-between' }}><span>👤 Instructor</span><span style={{ color:'var(--light)' }}>{course.instructor || 'TBA'}</span></div>
            <div style={{ borderTop:'1px solid var(--border)' }} />
            <div style={{ display:'flex', justifyContent:'space-between' }}><span>⭐ Rating</span><span style={{ color:'var(--light)' }}>{course.rating}/5</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MyCourses ──────────────────────────────────────────────
function MyCoursesPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  if (!user) return <Navigate to="/login" />;
  useEffect(() => {
    axios.get('/api/my-courses').then(r => { setCourses(r.data); setLoading(false); });
  }, [user]);

  const leaveCourse = async (courseId) => {
    if (!window.confirm('Do you really want to leave this course?')) return;
    try {
      await axios.delete(`/api/enrollments/${courseId}`);
      setCourses(prev => prev.filter(c => c._id !== courseId));
      await refreshUser();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to leave course');
    }
  };

  return (
    <div className="page">
      <div className="page-title">My Courses</div>
      <div className="page-sub">{courses.length} course{courses.length!==1?'s':''} enrolled</div>
      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--mid)' }}>Loading…</div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📚</div>
          <p style={{ color:'var(--mid)', marginBottom:20 }}>You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="btn btn-primary">Browse Courses →</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {courses.map(c => (
            <div key={c._id} className="enrolled-course-card">
              <div className="enrolled-thumb">
                {c.image ? <img src={c.image} alt={c.title} /> : <span style={{ position:'relative', zIndex:1 }}>{getEmoji(c.category)}</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ padding:'16px 18px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:15.5, fontWeight:700 }}>{c.title}</div>
                    <span className={c.isPremium ? 'premium-badge' : 'free-badge'}>{c.isPremium ? '⭐ Premium' : '✓ Free'}</span>
                  </div>
                  <div style={{ color:'var(--mid)', fontSize:13, lineHeight:1.55, marginBottom:8 }}>{c.description}</div>
                  <div style={{ display:'flex', gap:16, fontSize:12, color:'var(--mid)' }}>
                    <span>👤 {c.instructor || 'Instructor'}</span>
                    <span>⏱ {c.duration}</span>
                    <span>📊 {c.level}</span>
                    {c.videoUrl && <span style={{ color:'var(--success)' }}>▶ Video Available</span>}
                  </div>
                </div>
                <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
                  <button className="btn btn-success btn-sm" onClick={() => navigate(`/courses/${c._id}`)}>▶ Continue</button>
                  <button className="btn btn-sm btn-danger" onClick={() => leaveCourse(c._id)}>Leave Course</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Checkout Form (Split Stripe Elements + Cardholder Name) ──
function CheckoutForm({ course, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const { user } = useAuth();

  // Prefill name if user is logged in
  useEffect(() => {
    if (user?.name) setCardholderName(user.name);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/payments/stripe/create-intent', {
        courseId: course._id
      });

      if (data.demoMode) {
        await axios.post('/api/payments/stripe/complete', { paymentIntentId: data.paymentIntentId });
        onSuccess();
        return;
      }

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: cardholderName,
            address: {
              postal_code: postalCode,
            },
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        await axios.post('/api/payments/stripe/complete', {
          paymentIntentId: result.paymentIntent.id
        });
        onSuccess();
      } else {
        setError('Payment not completed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const elementStyles = {
    base: {
      color: '#e8dcc8',
      fontFamily: '"Inter", sans-serif',
      fontSize: '15px',
      '::placeholder': { color: '#7a8a7e' },
    },
    invalid: { color: '#b85c5c' },
  };

  const elementOptions = { style: elementStyles };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-msg">⚠ {error}</div>}

      {/* Cardholder Name */}
      <div className="input-group">
        <label>Cardholder Name</label>
        <input
          type="text"
          className="stripe-input"
          placeholder="Name on card"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label>Card Number</label>
        <div className="stripe-input-wrapper">
          <CardNumberElement options={elementOptions} className="stripe-element" />
        </div>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label>Expiry Date</label>
          <div className="stripe-input-wrapper">
            <CardExpiryElement options={elementOptions} className="stripe-element" />
          </div>
        </div>
        <div className="input-group">
          <label>CVC</label>
          <div className="stripe-input-wrapper">
            <CardCvcElement options={elementOptions} className="stripe-element" />
          </div>
        </div>
      </div>

      <div className="input-group">
        <label>Postal Code</label>
        <input
          className="stripe-input"
          type="text"
          placeholder="e.g. 12345"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
          required
        />
      </div>

      <button type="submit" className="pay-button" disabled={!stripe || loading}>
        {loading ? 'Processing…' : `Pay $${course.price}`}
      </button>
    </form>
  );
}

function CheckoutPageWrapper() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      axios.get(`/api/courses/${id}`)
        .then(r => setCourse(r.data))
        .catch(() => navigate('/courses'));
    }
  }, [id]);

  // Prevent instant redirect if success screen is showing
  useEffect(() => {
    if (user && course && isOwned(user, course._id) && !success) {
      navigate(`/courses/${course._id}`, { replace: true });
    }
  }, [user, course, navigate, success]);

  const handleSuccess = async () => {
    await refreshUser();
    setSuccess(true);
  };

  // Auto‑redirect after 3 seconds once success is displayed
  useEffect(() => {
    if (!success || !course) return;
    const timer = setTimeout(() => {
      navigate(`/courses/${course._id}`, { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [success, course, navigate]);

  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/courses" />;
  if (!course) return <div style={{ textAlign:'center', padding:80, color:'var(--mid)' }}>Loading…</div>;

  if (success) {
    return (
      <div className="checkout-wrapper">
        <div className="checkout-card" style={{ textAlign:'center' }}>
          <div className="success-screen">
            <div className="icon">🎉</div>
            <h2>Payment Successful!</h2>
            <p>You have unlocked <strong>{course.title}</strong></p>
            <button className="btn btn-gold" onClick={() => navigate(`/courses/${course._id}`)}>
              🚀 Go to Course
            </button>
            <p className="auto-redirect-hint">
              Automatically redirecting to your course in 3 seconds…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <div className="checkout-card">
        <h2>Secure Checkout</h2>
        <div style={{ marginBottom:25, padding:'16px 20px', background:'rgba(36,42,52,0.6)', borderRadius:10 }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, marginBottom:8 }}>{course.title}</div>
          <div style={{ display:'flex', justifyContent:'space-between', color:'var(--mid)', fontSize:14 }}>
            <span>Total Amount</span>
            <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--gold)' }}>${course.price}</span>
          </div>
        </div>
        <Elements stripe={stripePromise}>
          <CheckoutForm course={course} onSuccess={handleSuccess} />
        </Elements>
      </div>
    </div>
  );
}

// ── Admin Page (unchanged) ────────────────────────────────
function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState({ title:'', description:'', price:0, isPremium:false, category:'Web Development', level:'Beginner', duration:'4h', instructor:'', tags:'', videoUrl:'', resources:'', image:'' });
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchAll = () => {
    Promise.all([
      axios.get('/api/courses'),
      axios.get('/api/orders'),
      axios.get('/api/admin/stats'),
      axios.get('/api/admin/users'),
    ]).then(([c,o,s,u]) => {
      setCourses(c.data); setOrders(o.data); setStats(s.data); setUsers(u.data);
    });
  };

  useEffect(() => { if (user?.role === 'admin') fetchAll(); }, [user]);
  if (user?.role !== 'admin') return <Navigate to="/courses" />;

  const openCreate = () => {
    setEditCourse(null);
    setForm({ title:'', description:'', price:0, isPremium:false, category:'Web Development', level:'Beginner', duration:'4h', instructor:'', tags:'', videoUrl:'', resources:'', image:'' });
    setImagePreview(''); setShowModal(true);
  };
  const openEdit = c => {
    setEditCourse(c);
    setForm({ ...c, tags: Array.isArray(c.tags) ? c.tags.join(', ') : c.tags || '' });
    setImagePreview(c.image || ''); setShowModal(true);
  };
  const handleImageUpload = async e => {
    const file = e.target.files[0]; if (!file) return; setUploading(true);
    const fd = new FormData(); fd.append('image', file);
    try {
      const { data } = await axios.post('/api/upload', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      setForm(f => ({ ...f, image:data.url })); setImagePreview(data.url);
    } catch {
      const r = new FileReader();
      r.onload = ev => { setImagePreview(ev.target.result); setForm(f => ({ ...f, image:ev.target.result })); };
      r.readAsDataURL(file);
    }
    setUploading(false);
  };
  const saveCourse = async e => {
    e.preventDefault();
    const payload = { ...form, tags: typeof form.tags === 'string' ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : form.tags };
    if (editCourse) await axios.put(`/api/courses/${editCourse._id}`, payload);
    else await axios.post('/api/courses', payload);
    setShowModal(false); fetchAll();
  };
  const deleteCourse = async id => {
    if (window.confirm('Delete this course? This will also remove all enrollments.')) {
      try { await axios.delete(`/api/courses/${id}`); fetchAll(); }
      catch(e) { alert(e.response?.data?.message || 'Delete failed'); }
    }
  };
  const refund = async id => {
    if (window.confirm('Process refund for this enrollment?')) {
      try { await axios.put(`/api/orders/${id}/refund`); fetchAll(); }
      catch(e) { alert(e.response?.data?.message || 'Refund failed'); }
    }
  };
  const unenroll = async (order) => {
    if (!window.confirm(`Remove ${order.user?.name}'s enrollment in "${order.course?.title}"?`)) return;
    try {
      await axios.put(`/api/orders/${order._id}/unenroll`);
      fetchAll();
    } catch(e) {
      alert(e.response?.data?.message || 'Unenroll failed');
    }
  };

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div><div className="page-title">Admin Panel</div></div>
        {activeTab === 'courses' && <button className="btn btn-primary" onClick={openCreate}>+ Add Course</button>}
      </div>

      <div className="stat-grid">
        <div className="stat-card gold"><div className="stat-label">Total Revenue</div><div className="stat-val" style={{ color:'var(--gold)' }}>${stats.totalRevenue?.toFixed(2)||'0.00'}</div></div>
        <div className="stat-card green"><div className="stat-label">Enrollments</div><div className="stat-val" style={{ color:'var(--success)' }}>{stats.orderCount||0}</div></div>
        <div className="stat-card blue"><div className="stat-label">Courses</div><div className="stat-val" style={{ color:'#7aadcf' }}>{stats.courseCount||0}</div></div>
        <div className="stat-card purple"><div className="stat-label">Students</div><div className="stat-val" style={{ color:'#b07ad8' }}>{stats.userCount||0}</div></div>
      </div>

      <div className="admin-tab-bar">
        {[{ id:'courses', label:'📚 Courses' },{ id:'enrollments', label:'📦 Enrollments' },{ id:'users', label:'👥 Students' }].map(t => (
          <button key={t.id} className={`admin-tab ${activeTab===t.id?'active':''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'courses' && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">All Courses</div>
            <span style={{ fontSize:13, color:'var(--mid)' }}>{courses.length} total</span>
          </div>
          <table className="admin-table">
            <thead><tr><th>Course</th><th>Type</th><th>Price</th><th>Level</th><th>Video</th><th>Actions</th></tr></thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {c.image ? <img src={c.image} alt="" style={{ width:38, height:38, borderRadius:8, objectFit:'cover' }} /> : <div style={{ width:38, height:38, borderRadius:8, background:'var(--dark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{getEmoji(c.category)}</div>}
                      <div><div style={{ fontSize:13.5, fontWeight:600 }}>{c.title}</div><div style={{ fontSize:11, color:'var(--mid)' }}>{c.instructor}</div></div>
                    </div>
                  </td>
                  <td><span className={c.isPremium?'premium-badge':'free-badge'}>{c.isPremium?'⭐ Premium':'✓ Free'}</span></td>
                  <td style={{ color:'var(--gold)', fontWeight:700 }}>{c.isPremium?`$${c.price}`:'Free'}</td>
                  <td style={{ color:'var(--mid)', fontSize:12 }}>{c.level}</td>
                  <td>{c.videoUrl?<span style={{ color:'var(--success)', fontSize:12 }}>▶ Yes</span>:<span style={{ color:'var(--mid)', fontSize:12 }}>—</span>}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => navigate(`/courses/${c._id}`)}>View</button>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteCourse(c._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {courses.length===0 && <div style={{ textAlign:'center', padding:40, color:'var(--mid)' }}>No courses yet. Add your first course!</div>}
        </div>
      )}

      {activeTab === 'enrollments' && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">Enrollments</div>
            <span style={{ fontSize:13, color:'var(--mid)' }}>Revenue: <strong style={{ color:'var(--gold)' }}>${stats.totalRevenue?.toFixed(2)||'0.00'}</strong></span>
          </div>
          <table className="admin-table">
            <thead><tr><th>Course</th><th>Student</th><th>Method</th><th>Amount</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td style={{ fontWeight:600, fontSize:13 }}>{o.course?.title||'—'}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="user-avatar" style={{ width:28, height:28, fontSize:11 }}>{(o.user?.name||'?').charAt(0).toUpperCase()}</div>
                      <span style={{ fontSize:13 }}>{o.user?.name||'—'}</span>
                    </div>
                  </td>
                  <td><span style={{ fontSize:11, textTransform:'uppercase', background:'rgba(148,137,121,0.12)', padding:'2px 8px', borderRadius:4 }}>{o.paymentMethod==='stripe'?'💳 Stripe':o.paymentMethod==='free'?'✓ Free':o.paymentMethod}</span></td>
                  <td style={{ color:'var(--gold)', fontWeight:700 }}>{o.amount>0?`$${o.amount}`:'Free'}</td>
                  <td style={{ color:'var(--mid)', fontSize:12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      {o.status==='completed' && (
                        <>
                          {o.amount>0 && <button className="btn btn-sm btn-danger" onClick={() => refund(o._id)}>Refund</button>}
                          <button className="btn btn-sm btn-outline" onClick={() => unenroll(o)}>Unenroll</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length===0&&<div style={{ textAlign:'center', padding:40, color:'var(--mid)' }}>No enrollments yet.</div>}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">Students</div>
            <span style={{ fontSize:13, color:'var(--mid)' }}>{users.length} registered</span>
          </div>
          <table className="admin-table">
            <thead><tr><th>Student</th><th>Email</th><th>Courses Enrolled</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                      <div><div style={{ fontSize:13.5, fontWeight:600 }}>{u.name}</div><div style={{ fontSize:11, color:'var(--mid)' }}>{u.internshipType||'Intern'}</div></div>
                    </div>
                  </td>
                  <td style={{ color:'var(--mid)', fontSize:13 }}>{u.email}</td>
                  <td>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--accent)' }}>{(u.purchasedCourses||[]).length}</span>
                    <span style={{ fontSize:12, color:'var(--mid)', marginLeft:6 }}>{(u.purchasedCourses||[]).length===1?'course':'courses'}</span>
                  </td>
                  <td style={{ color:'var(--mid)', fontSize:12 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length===0&&<div style={{ textAlign:'center', padding:40, color:'var(--mid)' }}>No students yet.</div>}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editCourse ? 'Edit Course' : 'Add New Course'}</div>
            <form onSubmit={saveCourse}>
              <div className="form-group">
                <label className="form-label">Course Image</label>
                <label className="img-upload-area">
                  <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />
                  {imagePreview ? <img src={imagePreview} alt="preview" className="img-preview" /> : <div style={{ color:'var(--mid)', fontSize:13 }}>{uploading ? 'Uploading…' : '📸 Click to upload course image'}</div>}
                </label>
              </div>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              <div className="two-col">
                <div className="form-group"><label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    {['Web Development','React','Node.js','Python','Data Science','Design','DevOps','AI/ML'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Level</label>
                  <select className="form-select" value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>
                    {['Beginner','Intermediate','Advanced'].map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="two-col">
                <div className="form-group"><label className="form-label">Price ($)</label><input type="number" step="0.01" className="form-input" value={form.price} onChange={e=>setForm({...form,price:+e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Duration</label><input className="form-input" placeholder="8h" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">Instructor</label><input className="form-input" value={form.instructor} onChange={e=>setForm({...form,instructor:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Video URL (YouTube)</label><input className="form-input" placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={e=>setForm({...form,videoUrl:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Resources / Notes</label><textarea className="form-textarea" placeholder="Links, notes, PDFs for enrolled students…" value={form.resources} onChange={e=>setForm({...form,resources:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="react, hooks, frontend" /></div>
              <div className="form-group">
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:14, color:'var(--mid)' }}>
                  <input type="checkbox" checked={form.isPremium} onChange={e=>setForm({...form,isPremium:e.target.checked})} style={{ accentColor:'var(--accent)' }} />
                  Mark as Premium (paid) Course
                </label>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="submit" className="btn btn-primary" style={{ flex:1 }}>{editCourse ? 'Save Changes' : 'Create Course'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────
function LoginPage() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  if (user) return <Navigate to={user.role==='admin'?'/admin':'/courses'} />;
  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { const u = await login(form.email, form.password); navigate(u.role==='admin'?'/admin':'/courses'); }
    catch(e) { setErr(e.response?.data?.message || 'Invalid credentials.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ fontSize:10, color:'var(--mid)', letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>◆ <span style={{ color:'var(--accent)' }}>InternHub</span> Platform</div>
        <h1 className="login-title">InternHub LMS</h1>
        <p style={{ color:'var(--mid)', marginBottom:30, fontSize:13.5 }}>Sign in with your InternHub credentials</p>
        {err && <div className="error-msg">{err}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--mid)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px' }}>Email Address</label>
            <input className="form-input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="your@email.com" required />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--mid)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px' }}>Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" required />
          </div>
          <button className="login-btn" disabled={loading}>{loading?'Signing in…':'Sign In →'}</button>
        </form>
        <p style={{ marginTop:24, fontSize:12, color:'var(--mid)', textAlign:'center', lineHeight:1.7 }}>New intern? Contact your administrator for access.</p>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/courses" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/checkout/:id" element={<CheckoutPageWrapper />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/courses" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}