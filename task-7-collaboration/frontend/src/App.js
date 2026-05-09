import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

  :root {
    --bg:      #1a1f27;
    --bg2:     #222831;
    --bg3:     #2a2f38;
    --surface: #393E46;
    --surface2:#3f454e;
    --border:  rgba(148,137,121,0.14);
    --border2: rgba(148,137,121,0.28);
    --text:    #DFD0B8;
    --text2:   #948979;
    --text3:   #5a5248;
    --accent:  #C8A96E;
    --accent2: #a8894e;
    --accent-bg: rgba(200,169,110,0.1);
    --accent-border: rgba(200,169,110,0.25);
    --green:   #6aab8a;
    --green-bg:rgba(106,171,138,0.1);
    --amber:   #c8973a;
    --amber-bg:rgba(200,151,58,0.1);
    --red:     #b85c5c;
    --red-bg:  rgba(184,92,92,0.1);
    --blue:    #5a8fb5;
    --blue-bg: rgba(90,143,181,0.1);
    --font-display:'Playfair Display',serif;
    --font-body:'DM Sans',sans-serif;
    --r:8px; --r-lg:14px; --r-xl:20px;
    --sh:0 4px 20px rgba(0,0,0,0.35);
    --sh-lg:0 12px 48px rgba(0,0,0,0.5);
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:var(--font-body);background:var(--bg);color:var(--text);overflow-x:hidden;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(148,137,121,0.25);border-radius:2px;}

  @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
  @keyframes slideUp {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse   {0%,100%{opacity:1}50%{opacity:0.45}}
  @keyframes cardIn  {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  /* Navbar */
  .nav{
    background:rgba(26,31,39,0.97);backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border);
    padding:0 32px;height:60px;
    display:flex;align-items:center;justify-content:space-between;
    position:sticky;top:0;z-index:100;
  }
  .nav-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
  .nav-logo{
    width:32px;height:32px;border-radius:8px;
    background:linear-gradient(135deg,var(--accent),var(--accent2));
    display:flex;align-items:center;justify-content:center;
    font-size:15px;font-weight:800;color:#1a1a1a;font-family:var(--font-display);
  }
  .nav-name{font-family:var(--font-display);font-size:17px;color:var(--text);}
  .nav-name span{color:var(--accent);}
  .nav-right{display:flex;align-items:center;gap:10px;}

  .btn{
    padding:7px 16px;border-radius:var(--r);border:none;cursor:pointer;
    font-size:13px;font-weight:600;font-family:var(--font-body);
    transition:all 0.18s;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;
  }
  .btn:disabled{opacity:0.4;cursor:not-allowed;}
  .btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#1a1a1a;}
  .btn-primary:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px);}
  .btn-ghost{background:transparent;border:1px solid var(--border2);color:var(--text2);}
  .btn-ghost:hover:not(:disabled){border-color:var(--text2);color:var(--text);}
  .btn-danger{background:var(--red-bg);color:var(--red);border:1px solid rgba(184,92,92,0.25);}
  .btn-danger:hover:not(:disabled){background:rgba(184,92,92,0.18);}
  .btn-success{background:var(--green-bg);color:var(--green);border:1px solid rgba(106,171,138,0.25);}
  .btn-success:hover:not(:disabled){background:rgba(106,171,138,0.18);}
  .btn-amber{background:var(--amber-bg);color:var(--amber);border:1px solid rgba(200,151,58,0.25);}
  .btn-sm{padding:4px 11px;font-size:12px;}
  .btn-xs{padding:2px 8px;font-size:11px;border-radius:6px;}

  .badge{padding:2px 9px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;}
  .badge-admin {background:var(--accent-bg);color:var(--accent);border:1px solid var(--accent-border);}
  .badge-intern{background:var(--green-bg);color:var(--green);border:1px solid rgba(106,171,138,0.2);}

  .form-group{margin-bottom:13px;}
  .form-label{display:block;font-size:10.5px;font-weight:700;color:var(--text2);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;}
  .form-input,.form-select,.form-textarea{
    width:100%;padding:9px 12px;
    background:rgba(255,255,255,0.03);border:1px solid var(--border);
    border-radius:var(--r);color:var(--text);font-size:13px;
    font-family:var(--font-body);transition:border-color 0.18s,background 0.18s;
  }
  .form-input:focus,.form-select:focus,.form-textarea:focus{
    outline:none;border-color:var(--accent);background:rgba(200,169,110,0.04);
  }
  .form-input::placeholder{color:var(--text3);}
  .form-textarea{resize:vertical;min-height:72px;}
  .form-select option{background:var(--bg2);color:var(--text);}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .btn-row{display:flex;gap:10px;margin-top:18px;}

  .alert{padding:10px 14px;border-radius:var(--r);font-size:13px;margin-bottom:14px;display:flex;align-items:flex-start;gap:8px;}
  .alert-error  {background:var(--red-bg);border:1px solid rgba(184,92,92,0.25);color:var(--red);}
  .alert-info   {background:var(--blue-bg);border:1px solid rgba(90,143,181,0.2);color:var(--blue);}
  .alert-warn   {background:var(--amber-bg);border:1px solid rgba(200,151,58,0.2);color:var(--amber);}
  .alert-success{background:var(--green-bg);border:1px solid rgba(106,171,138,0.2);color:var(--green);}

  .login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:radial-gradient(ellipse 60% 50% at 50% -10%,rgba(200,169,110,0.08) 0%,transparent 60%),var(--bg);}
  .login-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-xl);padding:44px 40px;width:100%;max-width:400px;box-shadow:var(--sh-lg);animation:slideUp 0.3s ease;position:relative;overflow:hidden;}
  .login-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--accent2),var(--accent),var(--text2));}
  .login-heading{font-family:var(--font-display);font-size:27px;font-weight:700;color:var(--text);margin-bottom:6px;}
  .login-sub{color:var(--text2);font-size:13px;margin-bottom:28px;line-height:1.5;}
  .login-btn{width:100%;padding:11px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#1a1a1a;border:none;border-radius:var(--r);font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:all 0.2s;}
  .login-btn:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-1px);}
  .login-btn:disabled{opacity:0.5;cursor:not-allowed;}

  .page-wrap{padding:36px 40px;max-width:1160px;margin:0 auto;}
  .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;}
  .page-title{font-family:var(--font-display);font-size:26px;margin-bottom:4px;}
  .page-sub{color:var(--text2);font-size:13px;}

  .projects-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(286px,1fr));gap:16px;}
  .project-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-lg);padding:22px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;}
  .project-card-bar{position:absolute;top:0;left:0;right:0;height:3px;}
  .project-card:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:var(--sh);}
  .project-title{font-family:var(--font-display);font-size:16px;margin-bottom:5px;}
  .project-desc{font-size:12.5px;color:var(--text2);margin-bottom:12px;line-height:1.55;}

  .av-stack{display:flex;}
  .av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;}
  .av-xs{width:22px;height:22px;font-size:8px;border:2px solid var(--bg2);margin-left:-6px;}
  .av-xs:first-child{margin-left:0;}

  .board-wrap{display:flex;height:calc(100vh - 60px);overflow:hidden;}
  .board-sidebar{width:260px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;}
  .sidebar-top{padding:16px 15px 0;flex-shrink:0;}
  .sidebar-proj-name{font-family:var(--font-display);font-size:15px;line-height:1.3;margin-bottom:5px;}
  .sidebar-type{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;background:var(--accent-bg);color:var(--accent);border:1px solid var(--accent-border);margin-bottom:10px;}
  .sb-tabs{display:flex;border-bottom:1px solid var(--border);flex-shrink:0;}
  .sb-tab{flex:1;padding:9px 0;text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;cursor:pointer;color:var(--text3);border-bottom:2px solid transparent;transition:all 0.18s;}
  .sb-tab.active{color:var(--text);border-bottom-color:var(--accent);}
  .sb-body{flex:1;overflow-y:auto;}
  .sb-section{padding:12px 13px;}

  .presence-pill{margin:8px 13px 0;padding:6px 10px;background:var(--green-bg);border:1px solid rgba(106,171,138,0.18);border-radius:var(--r);display:flex;align-items:center;gap:6px;font-size:12px;}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;flex-shrink:0;}

  .act-empty{color:var(--text3);font-size:12px;text-align:center;padding:20px 0;}
  .act-item{display:flex;gap:9px;padding:8px 0;border-bottom:1px solid rgba(148,137,121,0.05);}
  .act-item:last-child{border-bottom:none;}
  .act-left{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;padding-top:2px;}
  .act-pip{width:5px;height:5px;border-radius:50%;background:var(--accent);flex-shrink:0;}
  .act-line-v{width:1px;background:rgba(148,137,121,0.12);flex:1;min-height:10px;}
  .act-body{flex:1;min-width:0;}
  .act-text{font-size:12px;color:var(--text2);line-height:1.5;}
  .act-text strong{color:var(--text);font-weight:600;}
  .act-text em{color:var(--accent);font-style:normal;font-weight:500;}
  .act-time{font-size:10px;color:var(--text3);margin-top:2px;}

  .ms-item{background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:var(--r);padding:11px 12px;margin-bottom:8px;}
  .ms-title{font-size:13px;font-weight:600;margin-bottom:3px;}
  .ms-due{font-size:11px;color:var(--text3);margin-bottom:7px;}
  .ms-bar{height:3px;background:var(--border);border-radius:2px;overflow:hidden;}
  .ms-fill{height:100%;border-radius:2px;transition:width 0.4s;}

  .member-row{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid rgba(148,137,121,0.05);}
  .member-row:last-child{border-bottom:none;}
  .member-name{font-size:12.5px;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .online-txt{font-size:10.5px;color:var(--green);}
  .offline-txt{font-size:10.5px;color:var(--text3);}

  .board-main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
  .board-topbar{
    padding:12px 18px;border-bottom:1px solid var(--border);
    display:flex;align-items:center;justify-content:space-between;
    background:var(--bg2);flex-shrink:0;
  }
  .board-topbar-title{font-family:var(--font-display);font-size:15px;}
  .board-stats{display:flex;gap:14px;font-size:12px;color:var(--text2);align-items:center;}

  .cols-wrap{
    flex:1;overflow-x:auto;overflow-y:hidden;
    padding:14px 16px;display:flex;gap:12px;align-items:flex-start;
  }

  .k-col{
    width:265px;flex-shrink:0;
    background:rgba(34,40,49,0.65);border:1px solid var(--border);
    border-radius:var(--r-lg);display:flex;flex-direction:column;
    max-height:calc(100vh - 118px);transition:border-color 0.2s,background 0.2s;
  }
  .k-col.drag-over{background:rgba(200,169,110,0.05);border-color:var(--accent);}
  .k-col-head{
    padding:11px 12px 9px;display:flex;align-items:center;justify-content:space-between;
    border-bottom:1px solid var(--border);flex-shrink:0;
  }
  .k-col-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.9px;display:flex;align-items:center;gap:7px;}
  .col-pip{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
  .k-count{background:rgba(255,255,255,0.05);color:var(--text2);border-radius:10px;padding:1px 8px;font-size:10.5px;font-weight:700;}
  .k-cards{flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:7px;}
  .k-add-wrap{padding:0 8px 8px;flex-shrink:0;}
  .add-task-btn{
    width:100%;padding:7px;background:transparent;
    border:1px dashed rgba(148,137,121,0.16);border-radius:var(--r);
    color:var(--text3);cursor:pointer;font-size:12px;font-family:var(--font-body);
    transition:all 0.18s;display:flex;align-items:center;justify-content:center;gap:5px;
  }
  .add-task-btn:hover{border-color:var(--border2);color:var(--text2);}

  .k-card{
    background:var(--surface);border:1px solid var(--border);
    border-radius:var(--r);padding:11px 11px 9px;cursor:pointer;
    transition:all 0.18s;user-select:none;
    animation:cardIn 0.25s ease;
  }
  .k-card:hover{border-color:var(--border2);transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,0.28);}
  .k-card.dragging{opacity:0.3;transform:rotate(1deg) scale(0.97);}
  .k-card-top{display:flex;gap:7px;margin-bottom:7px;}
  .p-pip{width:5px;height:5px;border-radius:50%;flex-shrink:0;margin-top:5px;}
  .p-high  {background:var(--red);}
  .p-medium{background:var(--amber);}
  .p-low   {background:var(--green);}
  .k-card-title{font-size:13px;font-weight:600;line-height:1.42;color:var(--text);flex:1;}
  .k-labels{display:flex;gap:3px;flex-wrap:wrap;margin-bottom:7px;}
  .k-label{padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700;}
  .k-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:5px;}
  .k-due{font-size:11px;color:var(--text3);display:flex;align-items:center;gap:3px;}
  .k-due.overdue{color:var(--red);}
  .k-avs{display:flex;}
  .k-av{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;border:1.5px solid var(--surface);margin-left:-5px;}
  .k-av:first-child{margin-left:0;}

  .submitted-badge{
    display:inline-flex;align-items:center;gap:3px;
    padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700;
    background:var(--green-bg);color:var(--green);border:1px solid rgba(106,171,138,0.2);
    margin-top:6px;
  }

  .move-btns{display:flex;gap:4px;flex-wrap:wrap;margin-top:7px;}
  .move-btn{
    padding:2px 7px;border-radius:5px;font-size:10px;font-weight:600;
    background:transparent;border:1px solid;cursor:pointer;font-family:var(--font-body);
    transition:opacity 0.15s;
  }
  .move-btn:hover{opacity:0.7;}

  .overlay{
    position:fixed;inset:0;background:rgba(0,0,0,0.7);
    display:flex;align-items:center;justify-content:center;
    z-index:200;backdrop-filter:blur(6px);animation:fadeIn 0.18s ease;
  }
  .modal{
    background:var(--bg2);border:1px solid var(--border);
    border-radius:var(--r-xl);padding:26px 28px;
    width:100%;max-width:520px;max-height:90vh;overflow-y:auto;
    box-shadow:var(--sh-lg);animation:slideUp 0.22s ease;
  }
  .modal-lg{max-width:650px;}
  .modal-title{font-family:var(--font-display);font-size:19px;margin-bottom:20px;}
  .modal-divider{border:none;border-top:1px solid var(--border);margin:14px 0;}
  .section-label{font-size:10.5px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;}

  .comment-row{display:flex;gap:8px;margin-bottom:11px;}
  .comment-bubble{flex:1;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:var(--r);padding:9px 11px;}
  .comment-author{font-size:12px;font-weight:700;margin-bottom:3px;color:var(--text);}
  .comment-body{font-size:13px;color:var(--text2);line-height:1.55;}

  .submission-panel{
    background:rgba(106,171,138,0.06);border:1px solid rgba(106,171,138,0.2);
    border-radius:var(--r);padding:14px 15px;margin-bottom:14px;
  }
  .submission-panel h4{font-size:11px;font-weight:700;color:var(--green);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;}
  .sub-field{font-size:12.5px;color:var(--text2);margin-bottom:6px;}
  .sub-field strong{color:var(--text);}
  .sub-link{color:var(--accent);text-decoration:none;font-size:12.5px;word-break:break-all;}
  .sub-link:hover{text-decoration:underline;}

  .empty{text-align:center;padding:56px 28px;color:var(--text3);border:1px dashed rgba(148,137,121,0.12);border-radius:var(--r-lg);}
  .empty-icon{font-size:32px;margin-bottom:11px;}
  .empty p{font-size:13px;line-height:1.6;}

  .toast-container{position:fixed;bottom:20px;right:20px;z-index:999;display:flex;flex-direction:column;gap:7px;pointer-events:none;}
  .toast{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
    padding:10px 14px;font-size:13px;box-shadow:var(--sh);min-width:230px;
    animation:slideUp 0.22s ease;pointer-events:auto;
  }
  .toast-green{border-left:3px solid var(--green);}
  .toast-amber{border-left:3px solid var(--amber);}
  .toast-red  {border-left:3px solid var(--red);}
  .swatches{display:flex;gap:7px;flex-wrap:wrap;}
  .swatch{width:22px;height:22px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:border 0.2s;}
  .swatch.sel{border-color:var(--text);}
  .swatch:hover{border-color:var(--text2);}
`;
document.head.appendChild(style);

// ── Constants ─────────────────────────────────────────────────────────────────
const COL_META = {
  'To Do':       { pip: '#948979' },
  'In Progress': { pip: '#c8973a' },
  'Review':      { pip: '#C8A96E' },
  'Done':        { pip: '#6aab8a' },
};
const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];
const PROJECT_COLORS = ['#C8A96E','#6aab8a','#c8973a','#5a8fb5','#b85c5c','#9b73a5','#5aab9b','#a87850'];

// ── Auth Context ──────────────────────────────────────────────────────────────
const AuthCtx = createContext();
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ih_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(r => setUser(r.data))
        .catch(() => { localStorage.removeItem('ih_token'); setToken(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('ih_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token); setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('ih_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null); setUser(null);
  };

  return <AuthCtx.Provider value={{ user, token, login, logout, loading }}>{children}</AuthCtx.Provider>;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const ToastCtx = createContext();
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'green') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={{ add }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = d => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const isAdmin = u => u?.role === 'admin';

// ── Avatar ────────────────────────────────────────────────────────────────────
function Av({ name = '?', color, size = 28, cls = '', style: s = {} }) {
  return (
    <div className={`av ${cls}`}
      style={{ width: size, height: size, fontSize: Math.floor(size * 0.38), background: color || 'var(--surface2)', ...s }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

// ── Quick Review Modal (just GitHub URL) ──────────────────────────────────────
function QuickReviewModal({ card, onClose, onSubmit }) {
  const [githubLink, setGithubLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!githubLink.trim()) return;
    setSubmitting(true);
    await onSubmit({ githubLink, notes: '', attachments: [] });
    setSubmitting(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Submit for Review</div>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>
          Paste your GitHub / work link to submit <strong>"{card.title}"</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">GitHub / Drive URL</label>
            <input className="form-input" type="url" placeholder="https://github.com/..." value={githubLink} onChange={e => setGithubLink(e.target.value)} required />
          </div>
          <div className="btn-row">
            <button type="submit" className="btn btn-success" style={{ flex: 1 }} disabled={submitting}>{submitting ? 'Submitting...' : '✓ Submit for Review'}</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Kanban Card ───────────────────────────────────────────────────────────────
function KanbanCard({ card, onMove, onOpen, isAdminUser, onQuickReview, onDelete, onApprove }) {
  const overdue = card.dueDate && new Date(card.dueDate) < new Date() && card.column !== 'Done';
  const hasSubmission = card.submission?.submittedAt;

  const internMoves = (() => {
    if (isAdminUser) return [];
    if (card.column === 'In Progress') return ['To Do'];
    if (card.column === 'To Do') return ['In Progress'];
    return [];
  })();

  return (
    <div
      className="k-card"
      draggable={!isAdminUser && internMoves.length > 0}
      onDragStart={e => {
        if (isAdminUser) return;
        e.dataTransfer.setData('cardId', card._id);
        e.dataTransfer.setData('fromCol', card.column);
        e.currentTarget.classList.add('dragging');
      }}
      onDragEnd={e => e.currentTarget.classList.remove('dragging')}
      onClick={() => onOpen(card)}
    >
      <div className="k-card-top">
        <div className={`p-pip p-${card.priority || 'medium'}`} />
        <div className="k-card-title">{card.title}</div>
      </div>

      {(card.labels || []).length > 0 && (
        <div className="k-labels">
          {card.labels.map((l, i) => (
            <span key={i} className="k-label" style={{ background: `${l.color}22`, color: l.color }}>{l.text}</span>
          ))}
        </div>
      )}

      {hasSubmission && <div className="submitted-badge">✓ Submitted for Review</div>}

      <div className="k-card-foot">
        {card.dueDate
          ? <span className={`k-due ${overdue ? 'overdue' : ''}`}>{overdue ? '⚠ ' : '📅 '}{new Date(card.dueDate).toLocaleDateString()}</span>
          : <span />}
        {(card.assignees || []).length > 0 && (
          <div className="k-avs">
            {card.assignees.slice(0, 3).map(a => <Av key={a._id} name={a.name} color={a.color} size={20} cls="k-av" />)}
          </div>
        )}
      </div>

      {/* Move buttons for intern */}
      {!isAdminUser && internMoves.length > 0 && (
        <div className="move-btns" onClick={e => e.stopPropagation()}>
          {internMoves.map(col => (
            <button key={col} className="move-btn" style={{ color: COL_META[col].pip, borderColor: `${COL_META[col].pip}55` }}
              onClick={() => onMove(card._id, col, card.column)}>→ {col}</button>
          ))}
          {card.column === 'In Progress' && !hasSubmission && (
            <button className="move-btn" style={{ color: COL_META['Review'].pip, borderColor: `${COL_META['Review'].pip}55` }}
              onClick={() => onQuickReview(card)}>→ Review</button>
          )}
        </div>
      )}

      {/* Admin actions */}
      {isAdminUser && (
        <div className="move-btns" onClick={e => e.stopPropagation()}>
          {card.column === 'To Do' && (
            <button className="move-btn" style={{ color: 'var(--red)', borderColor: 'rgba(184,92,92,0.3)' }}
              onClick={() => onDelete(card._id)}>🗑 Delete</button>
          )}
          {card.column === 'Review' && hasSubmission && (
            <button className="move-btn" style={{ color: 'var(--green)', borderColor: 'rgba(106,171,138,0.3)' }}
              onClick={() => onApprove(card._id)}>✓ Approve & Done</button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Board Page ────────────────────────────────────────────────────────────────
function BoardPage() {
  const { projectId } = useParams();
  const { user, token } = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();
  const adminUser  = isAdmin(user);

  const [project, setProject]   = useState(null);
  const [cards, setCards]       = useState([]);
  const [activities, setActivities] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [internCollaborators, setInternCollaborators] = useState([]);
  const [sidebarTab, setSidebarTab]   = useState('activity');
  const [dragOverCol, setDragOverCol] = useState(null);

  const [showCardModal, setShowCardModal] = useState(false);
  const [showMsModal, setShowMsModal]     = useState(false);
  const [selectedCard, setSelectedCard]   = useState(null);
  const [quickReviewCard, setQuickReviewCard] = useState(null);

  const [cardForm, setCardForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignees: [], labels: '' });
  const [msForm, setMsForm]     = useState({ title: '', description: '', dueDate: '', progress: 0 });
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  const socketRef       = useRef(null);
  const socketConnected = useRef(false);

  useEffect(() => {
    if (!user || !token || socketConnected.current) return;

    const socket = io('http://localhost:5006', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });
    socketRef.current    = socket;
    socketConnected.current = true;

    socket.on('connect', () => socket.emit('join-project', projectId));
    socket.on('reconnect', () => socket.emit('join-project', projectId));

    // ✅ FILTER: only add/update card if user is admin or assigned
    socket.on('card-created', card => {
      if (!adminUser && !card.assignees?.some(a => a._id === user._id)) return;
      setCards(prev => {
        if (prev.some(c => c._id === card._id)) return prev.map(c => c._id === card._id ? card : c);
        return [...prev, card];
      });
    });

    socket.on('card-updated', card => {
      if (!adminUser && !card.assignees?.some(a => a._id === user._id)) {
        // If the card was removed from assignees, remove it from local state
        setCards(prev => prev.filter(c => c._id !== card._id));
        setSelectedCard(prev => prev?._id === card._id ? null : prev);
        return;
      }
      setCards(prev => prev.map(c => c._id === card._id ? card : c));
      setSelectedCard(prev => prev?._id === card._id ? card : prev);
    });

    socket.on('card-deleted', id => {
      setCards(prev => prev.filter(c => c._id !== id));
      setSelectedCard(prev => prev?._id === id ? null : prev);
    });

    socket.on('presence-update', users => setOnlineUsers(users));
    socket.on('activity', act => setActivities(prev => [act, ...prev.slice(0, 49)]));
    socket.on('new-comment', comment => setComments(prev => [...prev, comment]));
    socket.on('new-comment-notify', ({ cardTitle, author }) => {
      if (author.name !== user.name) toast.add(`${author.name} commented on "${cardTitle}"`, 'amber');
    });
    socket.on('milestone-created', ms => {
      setMilestones(prev => [...prev, ms].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
    });

    return () => { socket.disconnect(); socketConnected.current = false; };
  }, [user, token, projectId, adminUser]);

  const fetchAll = useCallback(async () => {
    try {
      const [projRes, cardsRes, actRes, msRes, collabRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get(`/api/projects/${projectId}/cards`),
        axios.get(`/api/projects/${projectId}/activity`),
        axios.get(`/api/projects/${projectId}/milestones`),
        axios.get(`/api/projects/${projectId}/collaborators`),
      ]);
      const proj = projRes.data.find(p => p._id === projectId);
      if (!proj) { navigate('/'); return; }
      setProject(proj);
      setCards(cardsRes.data);   // already filtered by backend for intern
      setActivities(actRes.data);
      setMilestones(msRes.data);
      setInternCollaborators(collabRes.data);
    } catch (err) {
      if (err.response?.status === 403) navigate('/');
    }
  }, [projectId, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const moveCard = async (cardId, toCol, fromCol) => {
    setCards(prev => prev.map(c => c._id === cardId ? { ...c, column: toCol } : c));
    try {
      await axios.put(`/api/projects/${projectId}/cards/${cardId}`, { column: toCol });
    } catch (err) {
      setCards(prev => prev.map(c => c._id === cardId ? { ...c, column: fromCol } : c));
      toast.add(err.response?.data?.message || 'Move failed', 'red');
    }
  };

  const submitWork = async (cardId, submissionData) => {
    try {
      await axios.put(`/api/projects/${projectId}/cards/${cardId}`, { submission: submissionData });
      toast.add('Work submitted for review ✓', 'green');
      setQuickReviewCard(null);
      setSelectedCard(null);
    } catch (err) {
      toast.add(err.response?.data?.message || 'Submit failed', 'red');
    }
  };

  const createCard = async e => {
    e.preventDefault();
    try {
      const labels = cardForm.labels.split(',').map(t => t.trim()).filter(Boolean).map(t => ({ text: t, color: '#C8A96E' }));
      await axios.post(`/api/projects/${projectId}/cards`, { ...cardForm, column: 'To Do', labels });
      setShowCardModal(false);
      setCardForm({ title: '', description: '', priority: 'medium', dueDate: '', assignees: [], labels: '' });
      toast.add('Task created ✓', 'green');
    } catch (err) {
      toast.add(err.response?.data?.message || 'Failed to create task', 'red');
    }
  };

  const deleteCard = async id => {
    if (!window.confirm('Delete this task permanently?')) return;
    try {
      await axios.delete(`/api/projects/${projectId}/cards/${id}`);
      toast.add('Task deleted', 'amber');
    } catch { toast.add('Delete failed', 'red'); }
  };

  const openCard = async card => {
    setSelectedCard(card);
    try {
      const { data } = await axios.get(`/api/cards/${card._id}/comments`);
      setComments(data);
      socketRef.current?.emit('join-card', card._id);
    } catch { setComments([]); }
  };

  const closeCard = () => {
    if (selectedCard) socketRef.current?.emit('leave-card', selectedCard._id);
    setSelectedCard(null);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post(`/api/cards/${selectedCard._id}/comments`, { text: commentText });
      setCommentText('');
    } catch { toast.add('Comment failed', 'red'); }
  };

  const approveCard = async (cardId) => {
    if (!adminUser) return;
    try {
      await axios.put(`/api/projects/${projectId}/cards/${cardId}`, { column: 'Done' });
      toast.add('Task approved ✓', 'green');
      setSelectedCard(null);
    } catch (err) {
      toast.add(err.response?.data?.message || 'Approve failed', 'red');
    }
  };

  const createMilestone = async e => {
    e.preventDefault();
    try {
      await axios.post(`/api/projects/${projectId}/milestones`, msForm);
      setShowMsModal(false);
      setMsForm({ title: '', description: '', dueDate: '', progress: 0 });
      toast.add('Milestone added', 'green');
    } catch { toast.add('Failed', 'red'); }
  };

  const handleQuickReview = (card) => {
    setQuickReviewCard(card);
  };

  if (!project) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }}>Loading board...</div>;

  const cardsByCol = col => cards.filter(c => c.column === col);
  const totalDone  = cards.filter(c => c.column === 'Done').length;
  const inReview   = cards.filter(c => c.column === 'Review').length;

  return (
    <div className="board-wrap">
      <aside className="board-sidebar">
        <div className="sidebar-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
            <div className="sidebar-proj-name">{project.name}</div>
          </div>
          {project.internshipType && <div className="sidebar-type">🎓 {project.internshipType}</div>}
          <div style={{ fontSize: 11.5, color: 'var(--text3)', marginBottom: 8 }}>
            {cards.length > 0 ? `${totalDone} done · ${inReview} in review · ${cards.length} total` : 'No tasks yet'}
          </div>
        </div>

        {onlineUsers.length > 0 && (
          <div className="presence-pill">
            <div className="live-dot" />
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>{onlineUsers.length} online</span>
            <div style={{ display: 'flex', marginLeft: 'auto' }}>
              {onlineUsers.slice(0, 5).map(u => (
                <Av key={u.id} name={u.name} color={u.color} size={20} style={{ border: '2px solid var(--bg2)', marginLeft: -5 }} />
              ))}
            </div>
          </div>
        )}

        <div className="sb-tabs" style={{ marginTop: 10 }}>
          {['activity', 'milestones', 'members'].map(t => (
            <div key={t} className={`sb-tab ${sidebarTab === t ? 'active' : ''}`} onClick={() => setSidebarTab(t)}>{t}</div>
          ))}
        </div>

        <div className="sb-body">
          {sidebarTab === 'activity' && (
            <div className="sb-section">
              {activities.length === 0
                ? <div className="act-empty">No activity yet</div>
                : activities.slice(0, 20).map((a, idx) => (
                  <div key={a._id} className="act-item">
                    <div className="act-left">
                      <div className="act-pip" />
                      {idx < activities.slice(0, 20).length - 1 && <div className="act-line-v" />}
                    </div>
                    <div className="act-body">
                      <div className="act-text">
                        <strong>{a.user?.name}</strong>
                        {a.user?.role === 'admin' && <span className="act-admin-tag">admin</span>}
                        {' '}{a.action}{' '}
                        <em>"{a.entityName}"</em>
                      </div>
                      <div className="act-time">{timeAgo(a.createdAt)}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {sidebarTab === 'milestones' && (
            <div className="sb-section">
              {adminUser && (
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginBottom: 10 }}
                  onClick={() => setShowMsModal(true)}>+ Add Milestone</button>
              )}
              {milestones.map(ms => (
                <div key={ms._id} className="ms-item">
                  <div className="ms-title">{ms.title}</div>
                  {ms.dueDate && <div className="ms-due">Due {new Date(ms.dueDate).toLocaleDateString()}</div>}
                  <div className="ms-bar">
                    <div className="ms-fill" style={{ width: `${ms.progress}%`, background: ms.progress === 100 ? 'var(--green)' : 'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {sidebarTab === 'members' && (
            <div className="sb-section">
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
                Intern Members{project.internshipType ? ` · ${project.internshipType}` : ''}
              </div>
              {(project.members || []).map(m => {
                const online = onlineUsers.some(u => u.id === m._id);
                return (
                  <div key={m._id} className="member-row">
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Av name={m.name} color={m.color} size={28} />
                      {online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--bg2)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="member-name">{m.name}</div>
                      <div className={online ? 'online-txt' : 'offline-txt'}>{online ? '● Online' : '○ Offline'}</div>
                    </div>
                    <span className="badge badge-intern">intern</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <div className="board-main">
        <div className="board-topbar">
          <div className="board-topbar-title">Task Board</div>
          <div className="board-stats">
            {adminUser && inReview > 0 && (
              <span style={{ color: 'var(--amber)', fontWeight: 600 }}>⏳ {inReview} awaiting review</span>
            )}
            <span>{cards.length} tasks · {totalDone} done</span>
          </div>
        </div>

        <div className="cols-wrap">
          {COLUMNS.map(col => {
            const colCards = cardsByCol(col);
            return (
              <div key={col}
                className={`k-col ${dragOverCol === col ? 'drag-over' : ''}`}
                onDragOver={e => {
                  e.preventDefault();
                  if (!isAdminUser && col !== 'Review' && col !== 'Done') setDragOverCol(col);
                }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => {
                  e.preventDefault(); setDragOverCol(null);
                  const cardId  = e.dataTransfer.getData('cardId');
                  const fromCol = e.dataTransfer.getData('fromCol');
                  if (!cardId || col === fromCol) return;
                  if (col === 'Done' || col === 'Review') {
                    toast.add('Use the Submit button to send work for review', 'amber');
                    return;
                  }
                  const allowed = (fromCol === 'To Do' && col === 'In Progress') || (fromCol === 'In Progress' && col === 'To Do');
                  if (!allowed) {
                    toast.add(`Cannot move from "${fromCol}" to "${col}"`, 'amber');
                    return;
                  }
                  moveCard(cardId, col, fromCol);
                }}>
                <div className="k-col-head">
                  <div className="k-col-title">
                    <div className="col-pip" style={{ background: COL_META[col].pip }} />
                    {col}
                  </div>
                  <span className="k-count">{colCards.length}</span>
                </div>

                <div className="k-cards">
                  {colCards.map(card => (
                    <KanbanCard key={card._id} card={card}
                      onMove={moveCard} onOpen={openCard}
                      isAdminUser={adminUser}
                      onQuickReview={handleQuickReview}
                      onDelete={deleteCard}
                      onApprove={approveCard}
                    />
                  ))}
                </div>

                {adminUser && col === 'To Do' && (
                  <div className="k-add-wrap">
                    <button className="add-task-btn" onClick={() => {
                      setCardForm({ title: '', description: '', priority: 'medium', dueDate: '', assignees: [], labels: '' });
                      setShowCardModal(true);
                    }}>+ Add Task</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCard && (
        <div className="overlay" onClick={closeCard}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div className={`p-pip p-${selectedCard.priority || 'medium'}`} style={{ width: 7, height: 7 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: COL_META[selectedCard.column]?.pip, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{selectedCard.column}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, lineHeight: 1.3 }}>{selectedCard.title}</div>
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                {adminUser && selectedCard.column === 'To Do' && (
                  <button className="btn btn-sm btn-danger" onClick={() => { deleteCard(selectedCard._id); closeCard(); }}>Delete</button>
                )}
                <button className="btn btn-sm btn-ghost" onClick={closeCard}>✕</button>
              </div>
            </div>

            {selectedCard.description && (
              <p style={{ color: 'var(--text2)', fontSize: 13.5, marginBottom: 13, lineHeight: 1.6 }}>{selectedCard.description}</p>
            )}

            <div style={{ display: 'flex', gap: 13, fontSize: 12, color: 'var(--text2)', marginBottom: 13 }}>
              {selectedCard.dueDate && <span>📅 {new Date(selectedCard.dueDate).toLocaleDateString()}</span>}
              <span>⚡ {selectedCard.priority || 'medium'} priority</span>
            </div>

            {(selectedCard.labels || []).length > 0 && (
              <div className="k-labels" style={{ marginBottom: 13 }}>
                {selectedCard.labels.map((l, i) => (
                  <span key={i} className="k-label" style={{ background: `${l.color}22`, color: l.color }}>{l.text}</span>
                ))}
              </div>
            )}

            {(selectedCard.assignees || []).length > 0 && (
              <div style={{ marginBottom: 15 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 7 }}>Assigned Interns</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {selectedCard.assignees.map(a => (
                    <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '4px 10px' }}>
                      <Av name={a.name} color={a.color} size={22} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</span>
                      <span className="badge badge-intern">intern</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCard.submission?.submittedAt && (
              <div className="submission-panel">
                <h4>✓ Work Submitted for Review</h4>
                {selectedCard.submission.githubLink && (
                  <div className="sub-field">
                    <strong>Link: </strong>
                    <a href={selectedCard.submission.githubLink} target="_blank" rel="noreferrer" className="sub-link">{selectedCard.submission.githubLink}</a>
                  </div>
                )}
                {selectedCard.submission.notes && (
                  <div className="sub-field">
                    <strong>Explanation:</strong>
                    <div className="sub-notes">{selectedCard.submission.notes}</div>
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
                  Submitted {timeAgo(selectedCard.submission.submittedAt)} by {selectedCard.submission.submittedBy?.name || 'intern'}
                </div>
                {adminUser && selectedCard.column === 'Review' && (
                  <button className="btn btn-success btn-sm" style={{ marginTop: 12 }}
                    onClick={() => approveCard(selectedCard._id)}>
                    ✓ Approve & Mark as Done
                  </button>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              {!adminUser && selectedCard.column === 'In Progress' && !selectedCard.submission?.submittedAt && (
                <button className="btn btn-success btn-sm" onClick={() => setQuickReviewCard(selectedCard)}>✓ Submit Work for Review</button>
              )}
              {!adminUser && selectedCard.column === 'In Progress' && (
                <button className="btn btn-ghost btn-sm" style={{ color: COL_META['To Do'].pip, borderColor: `${COL_META['To Do'].pip}55` }}
                  onClick={() => { moveCard(selectedCard._id, 'To Do', 'In Progress'); setSelectedCard(p => ({ ...p, column: 'To Do' })); }}>← Back to To Do</button>
              )}
              {!adminUser && selectedCard.column === 'To Do' && (
                <button className="btn btn-amber btn-sm"
                  onClick={() => { moveCard(selectedCard._id, 'In Progress', 'To Do'); setSelectedCard(p => ({ ...p, column: 'In Progress' })); }}>→ Start Working</button>
              )}
            </div>

            <hr className="modal-divider" />
            <div className="section-label">Comments ({comments.length})</div>
            <div style={{ maxHeight: 210, overflowY: 'auto', marginBottom: 13 }}>
              {comments.map(c => (
                <div key={c._id} className="comment-row">
                  <Av name={c.author?.name || '?'} color={c.author?.color} size={26} style={{ flexShrink: 0 }} />
                  <div className="comment-bubble">
                    <div className="comment-author">
                      {c.author?.name}
                      {c.author?.role === 'admin' && <span style={{ color: 'var(--accent)', fontSize: 10, fontWeight: 700, marginLeft: 6 }}>Admin</span>}
                      <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: 10, marginLeft: 6 }}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <div className="comment-body">{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={submitComment}>Post</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Review Modal */}
      {quickReviewCard && (
        <QuickReviewModal
          card={quickReviewCard}
          onClose={() => setQuickReviewCard(null)}
          onSubmit={(data) => submitWork(quickReviewCard._id, data)}
        />
      )}

      {/* Add Task Modal (admin only) */}
      {showCardModal && adminUser && (
        <div className="overlay" onClick={() => setShowCardModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">New Task</div>
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              <span>ℹ</span>
              <span>Task will be added to <strong>To Do</strong>.</span>
            </div>
            <form onSubmit={createCard}>
              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={cardForm.title} onChange={e => setCardForm({ ...cardForm, title: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={cardForm.description} onChange={e => setCardForm({ ...cardForm, description: e.target.value })} /></div>
              <div className="two-col">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={cardForm.priority} onChange={e => setCardForm({ ...cardForm, priority: e.target.value })}>
                    <option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🔴 High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={cardForm.dueDate} onChange={e => setCardForm({ ...cardForm, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign Interns</label>
                {internCollaborators.length === 0
                  ? <div className="alert alert-info">No matching interns.</div>
                  : <select className="form-select" multiple size={4} value={cardForm.assignees} onChange={e => setCardForm({ ...cardForm, assignees: [...e.target.selectedOptions].map(o => o.value) })}>
                      {internCollaborators.map(u => <option key={u._id} value={u._id}>{u.name} · {u.internshipType}</option>)}
                    </select>
                }
              </div>
              <div className="form-group"><label className="form-label">Labels</label><input className="form-input" placeholder="Bug, Feature, UI" value={cardForm.labels} onChange={e => setCardForm({ ...cardForm, labels: e.target.value })} /></div>
              <div className="btn-row">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Task</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCardModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMsModal && adminUser && (
        <div className="overlay" onClick={() => setShowMsModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Milestone</div>
            <form onSubmit={createMilestone}>
              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={msForm.title} onChange={e => setMsForm({ ...msForm, title: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={msForm.description} onChange={e => setMsForm({ ...msForm, description: e.target.value })} /></div>
              <div className="two-col">
                <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-input" value={msForm.dueDate} onChange={e => setMsForm({ ...msForm, dueDate: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Progress %</label><input type="number" min="0" max="100" className="form-input" value={msForm.progress} onChange={e => setMsForm({ ...msForm, progress: +e.target.value })} /></div>
              </div>
              <div className="btn-row">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Milestone</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowMsModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Projects Page ─────────────────────────────────────────────────────────────
function ProjectsPage() {
  const { user } = useAuth();
  const toast    = useToast();
  const [projects, setProjects]   = useState([]);
  const [allInterns, setAllInterns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '#C8A96E', internshipType: '', members: [] });
  const [formError, setFormError] = useState('');
  const navigate   = useNavigate();
  const adminUser  = isAdmin(user);

  useEffect(() => {
    if (!user) return;
    const reqs = [axios.get('/api/projects')];
    if (adminUser) reqs.push(axios.get('/api/users'));
    Promise.all(reqs).then(([p, u]) => {
      setProjects(p.data);
      if (u) setAllInterns(u.data.filter(usr => usr.role === 'intern'));
    });
  }, [user, adminUser]);

  const create = async e => {
    e.preventDefault(); setFormError('');
    try {
      const { data } = await axios.post('/api/projects', form);
      setProjects(p => [data, ...p]);
      setShowModal(false);
      setForm({ name: '', description: '', color: '#C8A96E', internshipType: '', members: [] });
      toast.add('Project created ✓', 'green');
    } catch (err) { setFormError(err.response?.data?.message || 'Failed to create project'); }
  };

  const deleteProject = async id => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    await axios.delete(`/api/projects/${id}`);
    setProjects(p => p.filter(pr => pr._id !== id));
    toast.add('Project deleted', 'amber');
  };

  const internshipTypes = [...new Set(allInterns.map(u => u.internshipType).filter(Boolean))];
  const eligibleInterns = form.internshipType ? allInterns.filter(u => u.internshipType === form.internshipType) : allInterns;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-sub">
            {adminUser
              ? `${projects.length} project${projects.length !== 1 ? 's' : ''} · Create and assign tasks to your intern teams`
              : `Your assigned projects · ${user?.internshipType || 'Intern'}`}
          </div>
        </div>
        {adminUser && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>}
      </div>

      {!adminUser && (
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          <span>💡</span>
          <span><strong>Workflow:</strong> To Do → drag to In Progress → Submit your work → Admin reviews and marks Done.</span>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🚀</div>
          <p>{adminUser ? 'No projects yet. Create your first project.' : 'No projects assigned yet. Contact your administrator.'}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p._id} className="project-card" onClick={() => navigate(`/board/${p._id}`)}>
              <div className="project-card-bar" style={{ background: p.color }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                <div className="project-title">{p.name}</div>
                {p.internshipType && (
                  <span style={{ fontSize: 10, background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>{p.internshipType}</span>
                )}
              </div>
              {p.description && <div className="project-desc">{p.description}</div>}
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>👥 {(p.members || []).length} intern{(p.members || []).length !== 1 ? 's' : ''}</div>
              {(p.members || []).length > 0 && (
                <div className="av-stack" style={{ marginTop: 9 }}>
                  {p.members.slice(0, 5).map(m => <Av key={m._id} name={m.name} color={m.color} size={22} cls="av-xs" />)}
                  {p.members.length > 5 && <div className="av av-xs" style={{ background: 'var(--surface)', color: 'var(--text2)', fontSize: 9 }}>+{p.members.length - 5}</div>}
                </div>
              )}
              <div style={{ display: 'flex', gap: 7, marginTop: 13 }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/board/${p._id}`)}>Open Board →</button>
                {adminUser && <button className="btn btn-danger btn-sm" onClick={() => deleteProject(p._id)}>Delete</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && adminUser && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create New Project</div>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={create}>
              <div className="form-group"><label className="form-label">Project Name *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group">
                <label className="form-label">Internship Type</label>
                <select className="form-select" value={form.internshipType} onChange={e => setForm({ ...form, internshipType: e.target.value, members: [] })}>
                  <option value="">— All types —</option>
                  {internshipTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Project Color</label>
                <div className="swatches" style={{ marginTop: 6 }}>
                  {PROJECT_COLORS.map(c => (
                    <div key={c} className={`swatch ${form.color === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Invite Interns</label>
                {eligibleInterns.length === 0
                  ? <div className="alert alert-info">No interns found.</div>
                  : <select className="form-select" multiple size={5} value={form.members} onChange={e => setForm({ ...form, members: [...e.target.selectedOptions].map(o => o.value) })}>
                      {eligibleInterns.map(u => <option key={u._id} value={u._id}>{u.name} · {u.email}</option>)}
                    </select>
                }
              </div>
              <div className="btn-row">
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Project</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [err, setErr]       = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await login(form.email, form.password); navigate('/'); }
    catch (ex) { setErr(ex.response?.data?.message || 'Invalid credentials.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-heading">Collaboration</div>
        <div className="login-sub">Sign in with your InternHub credentials</div>
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@internhub.com" required />
          </div>
          <div className="form-group" style={{ marginBottom: 22 }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
          </div>
          <button className="login-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In →'}</button>
        </form>
        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>Contact your administrator to get access.</p>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        <div className="nav-logo">I</div>
        <div className="nav-name">Intern<span>Hub</span></div>
      </Link>
      <div className="nav-right">
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Av name={user.name || '?'} color={user.color} size={28} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user.role === 'admin' ? 'Administrator' : user.internshipType || 'Intern'}</div>
              </div>
            </div>
            <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-intern'}`}>{user.role}</span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
          </>
        ) : null}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/board/:projectId" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}