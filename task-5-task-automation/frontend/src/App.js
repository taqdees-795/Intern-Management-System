import { useState, useEffect, createContext, useContext, useRef } from "react";

// ─── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#1a1e26;--bg2:#222733;--bg3:#2a2f3d;--card:#252b38;--card2:#2f3547;
  --border:rgba(200,170,100,0.13);--border2:rgba(200,170,100,0.22);
  --gold:#C8A96E;--gold2:#a88448;--gold3:#f0c97a;
  --text:#e8dcc8;--text2:#9a8f7a;--text3:#6a6055;
  --green:#5a9e78;--green2:rgba(90,158,120,0.15);--green3:rgba(90,158,120,0.25);
  --red:#b85c5c;--red2:rgba(184,92,92,0.15);--red3:rgba(184,92,92,0.25);
  --amber:#c8973a;--amber2:rgba(200,151,58,0.15);--amber3:rgba(200,151,58,0.25);
  --blue:#5a87c8;--blue2:rgba(90,135,200,0.15);
  --shadow:0 4px 20px rgba(0,0,0,0.4);
  --r:10px;--r2:14px;
}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(200,170,100,0.2);border-radius:2px;}

.layout{display:flex;min-height:100vh;}
.sidebar{width:240px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;height:100vh;overflow-y:auto;z-index:10;}
.sb-brand{padding:24px 20px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;}
.sb-brand .diamond{color:var(--gold);font-size:12px;margin-right:2px;}
.sb-brand .title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--text);}
.sb-brand .title span{color:var(--gold);}
.sb-section{padding:16px 16px 4px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:2px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 20px;color:rgba(232,220,200,0.45);cursor:pointer;transition:all 0.18s;font-size:13px;border-left:2px solid transparent;position:relative;}
.nav-item:hover{background:rgba(200,170,100,0.06);color:var(--text);border-left-color:rgba(200,170,100,0.3);}
.nav-item.active{background:rgba(200,170,100,0.1);color:var(--gold);border-left-color:var(--gold);font-weight:500;}
.nav-item .icon{font-size:15px;width:18px;text-align:center;}
.nav-badge{margin-left:auto;background:var(--red);color:#fff;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700;}
.sb-footer{padding:14px 16px;border-top:1px solid var(--border);margin-top:auto;}
.user-pill{display:flex;align-items:center;gap:10px;}
.avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--bg3),var(--gold2));display:flex;align-items:center;justify-content:center;font-weight:600;font-size:12px;color:var(--text);border:1.5px solid var(--border2);flex-shrink:0;}
.avatar.lg{width:38px;height:38px;font-size:14px;}

.main{flex:1;margin-left:240px;padding:32px 36px;max-width:calc(100vw - 240px);}
.page-header{margin-bottom:28px;}
.page-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:var(--text);margin-bottom:4px;}
.page-title::after{content:'';display:block;width:32px;height:2px;background:var(--gold);margin-top:8px;border-radius:1px;}
.page-sub{color:var(--text2);font-size:13px;margin-top:12px;}

.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:20px;box-shadow:var(--shadow);}
.card2{background:var(--card2);border:1px solid var(--border);border-radius:var(--r2);padding:20px;}
.section-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:600;color:var(--text);}
.flex-between{display:flex;align-items:center;justify-content:space-between;}

.btn{padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-size:12.5px;font-weight:600;font-family:'DM Sans',sans-serif;transition:all 0.18s;display:inline-flex;align-items:center;gap:6px;}
.btn-primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a1207;box-shadow:0 2px 12px rgba(200,169,110,0.3);}
.btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px);}
.btn-outline{background:rgba(200,170,100,0.08);border:1px solid rgba(200,170,100,0.25);color:var(--text);}
.btn-outline:hover{border-color:var(--gold);color:var(--gold);}
.btn-success{background:var(--green2);color:var(--green);border:1px solid var(--green3);}
.btn-danger{background:var(--red2);color:var(--red);border:1px solid var(--red3);}
.btn-warn{background:var(--amber2);color:var(--amber);border:1px solid var(--amber3);}
.btn-sm{padding:5px 11px;font-size:11.5px;}
.btn-xs{padding:3px 9px;font-size:11px;}
.btn:disabled{opacity:0.5;cursor:not-allowed;}

.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;text-transform:capitalize;}
.badge-pending{background:var(--amber2);color:var(--amber);border:1px solid var(--amber3);}
.badge-in-progress{background:var(--blue2);color:var(--blue);border:1px solid rgba(90,135,200,0.3);}
.badge-submitted{background:rgba(200,169,110,0.15);color:var(--gold);border:1px solid rgba(200,169,110,0.25);}
.badge-completed,.badge-approved{background:var(--green2);color:var(--green);border:1px solid var(--green3);}
.badge-overdue,.badge-rejected{background:var(--red2);color:var(--red);border:1px solid var(--red3);}
.badge-active{background:var(--green2);color:var(--green);border:1px solid var(--green3);}
.badge-paused{background:rgba(150,140,130,0.15);color:var(--text2);border:1px solid rgba(150,140,130,0.2);}
.badge-mandatory{background:var(--red2);color:var(--red);border:1px solid var(--red3);}
.badge-optional{background:var(--green2);color:var(--green);border:1px solid var(--green3);}
.badge-medium{background:var(--amber2);color:var(--amber);border:1px solid var(--amber3);}
.badge-high{background:var(--red2);color:var(--red);border:1px solid var(--red3);}
.badge-low{background:var(--green2);color:var(--green);border:1px solid var(--green3);}
.badge-web{background:rgba(90,135,200,0.12);color:var(--blue);border:1px solid rgba(90,135,200,0.2);}
.badge-android{background:rgba(90,158,120,0.12);color:var(--green);border:1px solid rgba(90,158,120,0.2);}
.badge-python{background:rgba(200,150,58,0.12);color:var(--amber);border:1px solid rgba(200,150,58,0.2);}

.table{width:100%;border-collapse:collapse;}
.table th{text-align:left;padding:10px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.8px;border-bottom:1px solid var(--border);}
.table td{padding:12px 14px;font-size:13px;border-bottom:1px solid rgba(200,170,100,0.05);color:rgba(232,220,200,0.8);}
.table tr:hover td{background:rgba(200,170,100,0.03);color:var(--text);}
.table tr:last-child td{border-bottom:none;}

.form-group{margin-bottom:13px;}
.form-label{display:block;font-size:10.5px;font-weight:600;color:var(--text2);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;}
.form-input,.form-select,.form-textarea{width:100%;padding:9px 12px;background:rgba(20,24,32,0.6);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;font-family:'DM Sans',sans-serif;transition:border-color 0.18s;}
.form-input:focus,.form-select:focus,.form-textarea:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(200,169,110,0.08);}
.form-textarea{resize:vertical;min-height:60px;}
.form-select option{background:#222733;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}

.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(4px);}
.modal{background:var(--bg3);border:1px solid var(--border2);border-radius:16px;padding:26px;width:100%;max-width:700px;max-height:88vh;overflow-y:auto;box-shadow:0 8px 48px rgba(0,0,0,0.6);}
.modal-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--text);margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--border);}

.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:24px;}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:18px 20px;position:relative;overflow:hidden;transition:transform 0.18s;}
.stat-card:hover{transform:translateY(-2px);}
.stat-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:linear-gradient(to bottom,var(--gold),var(--gold2));}
.stat-label{font-size:10px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;}
.stat-val{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;}

.progress-bar{height:5px;background:rgba(200,170,100,0.1);border-radius:3px;overflow:hidden;margin-top:6px;}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--gold2),var(--gold));border-radius:3px;transition:width 0.6s ease;}

.intern-row{display:flex;align-items:center;padding:14px 0;border-bottom:1px solid rgba(200,170,100,0.06);}
.intern-row:last-child{border-bottom:none;}

.task-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:18px;margin-bottom:12px;border-left:3px solid transparent;transition:border-color 0.18s,transform 0.18s;}
.task-card:hover{transform:translateY(-1px);}
.task-card.mandatory{border-left-color:var(--red);}
.task-card.optional{border-left-color:var(--green);}
.task-card.medium{border-left-color:var(--amber);}
.task-card.high{border-left-color:var(--red);}
.task-card.low{border-left-color:var(--green);}

.day-btn{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:pointer;border:1px solid var(--border);background:rgba(30,34,42,0.6);color:var(--text2);transition:all 0.18s;}
.day-btn:hover{border-color:var(--text2);color:var(--text);}
.day-btn.sel{background:rgba(200,169,110,0.15);border-color:var(--gold);color:var(--gold);}

.stype-pill{padding:6px 13px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid var(--border);background:rgba(30,34,42,0.5);color:var(--text2);transition:all 0.18s;}
.stype-pill:hover{border-color:var(--text2);color:var(--text);}
.stype-pill.active{background:rgba(200,169,110,0.12);border-color:var(--gold);color:var(--gold);}

.slot-item{background:rgba(20,24,32,0.5);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;}
.slot-date{font-size:10px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;}

.notif-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px;}
.overdue-bar{background:rgba(184,92,92,0.1);border:1px solid rgba(184,92,92,0.25);border-radius:8px;padding:10px 14px;font-size:12.5px;color:var(--red);margin-bottom:20px;display:flex;align-items:center;gap:8px;}

.search-input{width:100%;padding:9px 12px 9px 36px;background:rgba(20,24,32,0.5);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;font-family:'DM Sans',sans-serif;}
.search-input:focus{outline:none;border-color:var(--gold);}
.search-wrap{position:relative;}
.search-wrap::before{content:'🔍';position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;pointer-events:none;}

.feedback-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:16px;margin-bottom:10px;}
.feedback-meta{display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--text3);}

.tip-box{background:rgba(200,169,110,0.06);border:1px solid rgba(200,169,110,0.15);border-radius:8px;padding:12px 16px;font-size:12.5px;margin-bottom:18px;}
.tip-box .tip-title{font-weight:600;color:var(--gold);margin-bottom:4px;}

.how-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:10px;}
.how-item{background:rgba(20,24,32,0.5);border:1px solid var(--border);border-radius:8px;padding:10px 12px;}
.how-icon{font-size:18px;margin-bottom:4px;}
.how-title{font-weight:600;font-size:11px;color:var(--text);margin-bottom:2px;}
.how-desc{font-size:10.5px;color:var(--text2);line-height:1.4;}

.auto-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:18px;margin-bottom:12px;transition:border-color 0.18s;}
.auto-card:hover{border-color:var(--border2);}

.intern-progress-wrap{padding:14px 0;border-bottom:1px solid rgba(200,170,100,0.06);}
.intern-progress-wrap:last-child{border-bottom:none;}

.login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);}
.login-card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:44px;width:100%;max-width:380px;box-shadow:var(--shadow);position:relative;overflow:hidden;}
.login-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold2),var(--gold),var(--gold3));}
.login-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--text);margin-bottom:6px;}
.login-btn{width:100%;padding:12px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a1207;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Playfair Display',serif;transition:all 0.2s;margin-top:8px;box-shadow:0 4px 16px rgba(200,169,110,0.3);}
.login-btn:hover{filter:brightness(1.08);transform:translateY(-1px);}
.error-msg{background:var(--red2);border:1px solid var(--red3);color:var(--red);padding:9px 12px;border-radius:8px;font-size:12.5px;margin-bottom:14px;}

.intern-type-badge.web{background:rgba(90,135,200,0.12);color:var(--blue);border:1px solid rgba(90,135,200,0.2);}
.intern-type-badge.android{background:rgba(90,158,120,0.12);color:var(--green);border:1px solid rgba(90,158,120,0.2);}
.intern-type-badge.python{background:rgba(200,150,58,0.12);color:var(--amber);border:1px solid rgba(200,150,58,0.2);}
.intern-type-badge.marketing{background:rgba(184,92,150,0.12);color:#c85ca0;border:1px solid rgba(184,92,150,0.2);}
.intern-type-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}

.progress-ring{transform:rotate(-90deg);}
.ring-bg{fill:none;stroke:rgba(200,170,100,0.12);}
.ring-fill{fill:none;stroke-linecap:round;transition:stroke-dashoffset 0.8s ease;}

.task-submit-area{border-top:1px solid var(--border);margin-top:14px;padding-top:14px;}

.review-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:20px;margin-bottom:14px;border-left:3px solid var(--green);}
.review-card-header{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;}
.review-card-title{font-weight:700;font-size:15px;color:var(--text);}
.review-card-author{font-size:12px;color:var(--text2);margin-bottom:6px;display:flex;align-items:center;gap:6px;}
.review-card-desc{font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.5;}
.review-card-actions{display:flex;align-items:center;gap:10px;}
.view-link{color:var(--gold);font-size:13px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;}
.view-link:hover{text-decoration:underline;}
`;

// ─── Auth Context ────────────────────────────────────────────────────────────
const AuthCtx = createContext();
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = (u) => setUser(u);
  const logout = () => setUser(null);
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { _id:'u1', name:'Romah',   email:'romah@gmail.com',   internshipType:'Web Development',     role:'intern', password:'Romah123' },
  { _id:'u2', name:'Tazmeen', email:'tazmeen@gmail.com', internshipType:'Android Development', role:'intern', password:'Taz123' },
  { _id:'u3', name:'Tania',   email:'tania@gmail.com',   internshipType:'Python Development',  role:'intern', password:'Tania123' },
  { _id:'u4', name:'Taqdees', email:'taqdees795@gmail.com', internshipType:'Web Development',  role:'intern', password:'1234' },
];

const INTERN_GROUPS = ['Web Development', 'Android Development', 'Python Development'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const SCHEDULE_TYPES = [
  { id:'daily', label:'Every Day' },
  { id:'weekdays', label:'Weekdays (Mon–Fri)' },
  { id:'weekends', label:'Weekends' },
  { id:'weekly', label:'Weekly' },
  { id:'biweekly', label:'Every 2 Weeks' },
  { id:'monthly', label:'Monthly' },
  { id:'custom_days', label:'Custom Days' },
];

const MOCK_TASKS_INIT = [
  { _id:'t1', title:'Marketing mgt', description:'Make a management system for marketing campaigns.', priority:'medium', status:'approved', deadline:'2026-05-21', internshipType:'Web Development', points:10, submissionLink:'https://github.com/romah/marketing-mgt' },
  { _id:'t2', title:'KaamKar Mgt System', description:'Develop a full-stack web application that connects local workers with customers for easy service booking and management. The system allows customers to find, hire, and communicate with workers, while workers can manage their profiles, services, and requests efficiently. Built using Python Flask, SQLite, and RESTful APIs, the application focuses on smooth communication, service tracking, and user-friendly interaction between both parties.', priority:'high', status:'approved', deadline:'2026-05-07', internshipType:'Web Development', points:10, submissionLink:'https://github.com/taqdees/kaamkar' },
  // NEW Coffee Shop task for Taqdees (Web Development)
  { _id:'t3', title:'Coffee Shop', description:'Make an online website for a coffee shop.', priority:'medium', status:'pending', deadline:'2026-06-01', internshipType:'Web Development', points:10, submissionLink:'' },
];

// ─── MOCK SUBMISSIONS for Review page ────────────────────────────────────────
// Romah: Marketing mgt (completed - 1/2 tasks done)
// Taqdees: Marketing mgt + KaamKar (both approved - 2/2)
const MOCK_SUBMISSIONS = [
  {
    _id:'sub1',
    internId:'u1',
    internName:'Romah',
    taskId:'t1',
    taskTitle:'Marketing mgt',
    internshipType:'Web Development',
    description:'Complete marketing management system for campaigns — includes brand strategy, social media analytics, and campaign tracking dashboard.',
    submissionLink:'https://github.com/romah/marketing-mgt',
    status:'approved',
    submittedAt:'2026-05-06',
  },
  {
    _id:'sub2',
    internId:'u4',
    internName:'Taqdees',
    taskId:'t1',
    taskTitle:'Marketing mgt',
    internshipType:'Web Development',
    description:'Make a management system for marketing campaigns.',
    submissionLink:'https://github.com/taqdees/marketing-mgt',
    status:'approved',
    submittedAt:'2026-05-05',
  },
  {
    _id:'sub3',
    internId:'u4',
    internName:'Taqdees',
    taskId:'t2',
    taskTitle:'KaamKar Mgt System',
    internshipType:'Web Development',
    description:'A typing game developed using python and flask.',
    submissionLink:'https://github.com/taqdees/kaamkar',
    status:'approved',
    submittedAt:'2026-05-07',
  },
];

const MOCK_FEEDBACKS_INIT = [
  { _id:'f2', internId:'u4', taskId:'t2', comment:'Excellent full-stack application. The Flask backend is well-structured and the frontend is intuitive.', date:'2026-05-08' },
  // NEW feedback for Marketing mgt
  { _id:'f3', internId:'u4', taskId:'t1', comment:'Good Work', date:'2026-05-09' },
];

// REPLACED notification: now mentions Coffee Shop, not TypRush
const MOCK_NOTIFS_INIT = [
  { _id:'n1', type:'task', title:'New Task Uploaded', message:'A new task "Coffee Shop" has been uploaded for you.', read:false, createdAt: new Date(Date.now()-3600000).toISOString() },
];

// Admin notifications — ZERO (empty array)
const ADMIN_NOTIFS_INIT = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric'}) : '';
const fmtDateShort = d => d ? new Date(d).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}) : '';
const isOverdue = (t,status) => ['pending','in-progress'].includes(status||t.status) && new Date(t.deadline) < new Date();
const timeAgo = d => {
  const s = Math.floor((Date.now()-new Date(d))/1000);
  if(s<60) return `${s}s ago`;
  if(s<3600) return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};
const internTypeBadgeClass = type => {
  if(type==='Web Development') return 'web';
  if(type==='Android Development') return 'android';
  if(type==='Python Development') return 'python';
  if(type==='Marketing Management') return 'marketing';
  return '';
};
const getTasksForIntern = (tasks, intern) => tasks.filter(t => t.internshipType === intern.internshipType);

const calculateSlots = (startDate, endDate, scheduleType, weekDay, customDays) => {
  if(!startDate || !endDate) return [];
  const start = new Date(startDate+'T00:00:00');
  const end   = new Date(endDate+'T00:00:00');
  if(start > end) return [];
  const dates = [];
  const cur = new Date(start);
  while(cur <= end) {
    const day = cur.getDay();
    let include = false;
    switch(scheduleType) {
      case 'daily': include = true; break;
      case 'weekdays': include = day >= 1 && day <= 5; break;
      case 'weekends': include = day === 0 || day === 6; break;
      case 'weekly': include = day === weekDay; break;
      case 'biweekly':
        if(day === weekDay) {
          const wk = Math.floor((cur-start)/(7*86400000));
          include = wk % 2 === 0;
        }
        break;
      case 'monthly': include = cur.getDate() === 1; break;
      case 'custom_days': include = customDays.includes(day); break;
    }
    if(include) dates.push(new Date(cur).toISOString());
    cur.setDate(cur.getDate()+1);
  }
  return dates;
};

// ─── Feedback Modal ───────────────────────────────────────────────────────────
function FeedbackModal({ tasks, onClose, onSaved, preselectedInternId, preselectedTaskId }) {
  const [internId, setInternId] = useState(preselectedInternId || '');
  const [taskId, setTaskId] = useState(preselectedTaskId || '');
  const [comment, setComment] = useState('');
  const internTasks = tasks.filter(t => {
    const intern = MOCK_USERS.find(u=>u._id===internId);
    return intern && t.internshipType === intern.internshipType;
  });
  const handle = () => {
    if(!internId||!taskId||!comment.trim()) return alert('Fill all fields.');
    onSaved({ _id:`fb-${Date.now()}`, internId, taskId, comment, date:new Date().toISOString() });
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Write Feedback</div>
        <div className="form-group"><label className="form-label">Select Intern</label>
          <select className="form-select" value={internId} onChange={e=>{setInternId(e.target.value);setTaskId('');}}>
            <option value="">-- choose --</option>
            {MOCK_USERS.map(u=><option key={u._id} value={u._id}>{u.name} ({u.internshipType})</option>)}
          </select>
        </div>
        {internId && <div className="form-group"><label className="form-label">Select Task</label>
          <select className="form-select" value={taskId} onChange={e=>setTaskId(e.target.value)}>
            <option value="">-- choose --</option>
            {internTasks.map(t=><option key={t._id} value={t._id}>{t.title}</option>)}
          </select>
        </div>}
        <div className="form-group"><label className="form-label">Comment</label>
          <textarea className="form-textarea" rows="4" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Your feedback..." />
        </div>
        <div style={{display:'flex',gap:10,marginTop:16}}>
          <button className="btn btn-primary" style={{flex:1}} onClick={handle}>Submit Feedback</button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Automation Modal ────────────────────────────────────────────────────────
function AutomationModal({ onClose, onSaved }) {
  const [scheduleType, setSchedType] = useState('weekly');
  const [weekDay, setWeekDay] = useState(1);
  const [customDays, setCustomDays] = useState([1]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [name, setName] = useState('');
  const [description, setDesc] = useState('');
  const [assignToGroup, setAssignToGroup] = useState(INTERN_GROUPS[0]);
  const [defaultPriority, setDefaultPriority] = useState('mandatory');
  const [slots, setSlots] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const dates = calculateSlots(startDate, endDate, scheduleType, weekDay, customDays);
    setSlots(dates);
    setTemplates(prev => Array.from({length:dates.length},(_,i)=>({
      title: prev[i]?.title || '',
      description: prev[i]?.description || '',
      priority: prev[i]?.priority || defaultPriority,
    })));
  }, [startDate, endDate, scheduleType, weekDay, customDays, defaultPriority]);

  const toggleCustomDay = d => setCustomDays(prev => prev.includes(d)?prev.filter(x=>x!==d):[...prev,d]);
  const updateTmpl = (i,f,v) => setTemplates(prev=>prev.map((t,j)=>j===i?{...t,[f]:v}:t));

  const handleSave = () => {
    if(!name.trim()) return alert('Enter automation name.');
    if(!slots.length) return alert('No slots generated. Check dates and schedule.');
    const incomplete = templates.findIndex(t=>!t.title.trim());
    if(incomplete !== -1) return alert(`Please fill in the title for Slot ${incomplete+1}.`);
    onSaved({
      _id:`auto-${Date.now()}`,
      name, description, scheduleType, weekDay, customDays,
      startDate, endDate, startTime,
      assignToGroup, isActive:true,
      taskSlots: slots.map((d,i)=>({ slotDate:d, template:templates[i] })),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:740}} onClick={e=>e.stopPropagation()}>
        <div className="modal-title">⚙ Create Automation Rule</div>
        <div className="grid2">
          <div className="form-group"><label className="form-label">Automation Name *</label><input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Weekly Progress Report" /></div>
          <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={description} onChange={e=>setDesc(e.target.value)} placeholder="Optional..." /></div>
        </div>
        <div className="form-group"><label className="form-label">Schedule Type</label>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
            {SCHEDULE_TYPES.map(s=><div key={s.id} className={`stype-pill ${scheduleType===s.id?'active':''}`} onClick={()=>setSchedType(s.id)}>{s.label}</div>)}
          </div>
        </div>
        {(scheduleType==='weekly'||scheduleType==='biweekly') && (
          <div className="form-group"><label className="form-label">Which Day of Week</label>
            <div style={{display:'flex',gap:6}}>{DAYS.map((d,i)=><div key={i} className={`day-btn ${weekDay===i?'sel':''}`} onClick={()=>setWeekDay(i)}>{d}</div>)}</div>
          </div>
        )}
        {scheduleType==='custom_days' && (
          <div className="form-group"><label className="form-label">Select Days</label>
            <div style={{display:'flex',gap:6}}>{DAYS.map((d,i)=><div key={i} className={`day-btn ${customDays.includes(i)?'sel':''}`} onClick={()=>toggleCustomDay(i)}>{d}</div>)}</div>
          </div>
        )}
        <div className="grid3" style={{marginBottom:14}}>
          <div className="form-group"><label className="form-label">Start Date *</label><input type="date" className="form-input" value={startDate} onChange={e=>setStartDate(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">End Date *</label><input type="date" className="form-input" value={endDate} onChange={e=>setEndDate(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Time</label><input type="time" className="form-input" value={startTime} onChange={e=>setStartTime(e.target.value)} /></div>
        </div>
        <div className="form-group"><label className="form-label">Assign to Group (Internship Type)</label>
          <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
            {INTERN_GROUPS.map(g=>(
              <label key={g} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',color:'var(--text)',fontSize:13}}>
                <input type="radio" name="group" value={g} checked={assignToGroup===g} onChange={()=>setAssignToGroup(g)} />
                {g}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group"><label className="form-label">Default Task Type</label>
          <select className="form-select" value={defaultPriority} onChange={e=>setDefaultPriority(e.target.value)}>
            <option value="mandatory">Mandatory</option>
            <option value="optional">Optional</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        {slots.length > 0 && (
          <div style={{background:'rgba(200,169,110,0.06)',border:'1px solid rgba(200,169,110,0.15)',borderRadius:8,padding:'12px 14px',marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontWeight:600,color:'var(--text)',fontSize:13}}>✅ {slots.length} slot{slots.length!==1?'s':''} generated</span>
              <span style={{fontSize:11,color:'var(--gold)'}}>{assignToGroup}</span>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {slots.slice(0,10).map((d,i)=><span key={i} style={{background:'rgba(200,169,110,0.1)',border:'1px solid rgba(200,169,110,0.2)',borderRadius:5,padding:'2px 9px',fontSize:11,color:'var(--gold)'}}>{fmtDateShort(d)}</span>)}
              {slots.length>10&&<span style={{fontSize:11,color:'var(--text2)',padding:'2px 4px'}}>+{slots.length-10} more</span>}
            </div>
          </div>
        )}
        {slots.length > 0 && (
          <div>
            <div style={{fontWeight:600,fontSize:13,marginBottom:12,color:'var(--text)'}}>📋 Task Templates ({slots.length} slots)</div>
            <div style={{maxHeight:380,overflowY:'auto',paddingRight:4}}>
              {templates.map((tmpl,i)=>(
                <div key={i} className="slot-item">
                  <div className="slot-date">Slot {i+1} — {fmtDateShort(slots[i])}</div>
                  <div className="form-group" style={{marginBottom:7}}>
                    <input className="form-input" placeholder="Task title *" value={tmpl.title} onChange={e=>updateTmpl(i,'title',e.target.value)} />
                  </div>
                  <div className="form-group" style={{marginBottom:7}}>
                    <textarea className="form-textarea" style={{minHeight:45}} placeholder="Description..." value={tmpl.description} onChange={e=>updateTmpl(i,'description',e.target.value)} />
                  </div>
                  <select className="form-select" value={tmpl.priority} onChange={e=>updateTmpl(i,'priority',e.target.value)}>
                    <option value="mandatory">Mandatory</option>
                    <option value="optional">Optional</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
        {slots.length === 0 && startDate && endDate && (
          <div style={{textAlign:'center',padding:'20px',color:'var(--text2)',fontSize:13}}>
            ⚠ No slots in this date range for the selected schedule type.
          </div>
        )}
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button className="btn btn-primary" style={{flex:1}} onClick={handleSave} disabled={!slots.length}>
            {slots.length ? `Create Automation (${slots.length} tasks)` : 'Set dates first'}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Modal ──────────────────────────────────────────────────────────────
function TaskModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title:'', description:'', internshipType:INTERN_GROUPS[0], deadline:'', priority:'mandatory', points:10 });
  const MOCK_USERS_MAP = { 'Web Development':['Romah','Taqdees'], 'Android Development':['Tazmeen'], 'Python Development':['Tania'] };

  const handleSave = () => {
    if(!form.title.trim() || !form.deadline) return alert('Fill in title and deadline.');
    onSaved({ _id:`task-${Date.now()}`, ...form, status:'pending', submissionLink:'' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">+ Create Task</div>
        <div className="form-group"><label className="form-label">Task Title *</label><input className="form-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task title..." /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Details..." /></div>
        <div className="form-group"><label className="form-label">Assign to Internship Type (Group)</label>
          <select className="form-select" value={form.internshipType} onChange={e=>setForm({...form,internshipType:e.target.value})}>
            {INTERN_GROUPS.map(g=><option key={g} value={g}>{g} → {MOCK_USERS_MAP[g]?.join(', ')}</option>)}
          </select>
          <div style={{fontSize:11,color:'var(--text2)',marginTop:4}}>
            ℹ All interns with this internship type will receive this task.
          </div>
        </div>
        <div className="grid2">
          <div className="form-group"><label className="form-label">Deadline *</label><input type="date" className="form-input" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Priority / Type</label>
            <select className="form-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
              <option value="mandatory">Mandatory</option>
              <option value="optional">Optional</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button className="btn btn-primary" style={{flex:1}} onClick={handleSave}>Create Task</button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Submission Modal (Intern) ────────────────────────────────────────────────
function SubmitModal({ task, onClose, onSubmit }) {
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Submit Task</div>
        <div style={{marginBottom:16}}>
          <div style={{fontWeight:600,fontSize:15,color:'var(--text)'}}>{task.title}</div>
          <div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>Deadline: {fmtDate(task.deadline)}</div>
        </div>
        <div className="form-group"><label className="form-label">Submission Link (GitHub / Drive / URL)</label>
          <input className="form-input" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://github.com/..." />
        </div>
        <div className="form-group"><label className="form-label">Note (optional)</label>
          <textarea className="form-textarea" value={note} onChange={e=>setNote(e.target.value)} placeholder="Any notes for admin..." />
        </div>
        <div style={{display:'flex',gap:10,marginTop:16}}>
          <button className="btn btn-primary" style={{flex:1}} onClick={()=>{onSubmit(task._id,link,note);onClose();}}>Submit</button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, size=160, stroke=10 }) {
  const r = (size-stroke*2)/2;
  const circ = 2*Math.PI*r;
  const offset = circ - (pct/100)*circ;
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle className="ring-bg" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} />
      <circle className="ring-fill" cx={size/2} cy={size/2} r={r} strokeWidth={stroke}
        stroke="url(#goldGrad)" strokeDasharray={circ} strokeDashoffset={offset} />
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a88448"/>
          <stop offset="100%" stopColor="#C8A96E"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ tasks, setTasks, automations, setAutomations, feedbacks, setFeedbacks, notifs, setNotifs, internTaskStatuses }) {
  const { user, logout } = useAuth();
  const [view, setView] = useState('overview');
  const [showAutoModal, setAutoModal] = useState(false);
  const [showTaskModal, setTaskModal] = useState(false);
  const [showFbModal, setFbModal] = useState(false);
  const [fbPreset, setFbPreset] = useState({ internId:'', taskId:'' });
  const [searchIntern, setSearchIntern] = useState('');
  const [filterType, setFilterType] = useState('');
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);

  // Admin notifications are always 0 — no badge shown
  const unread = 0;

  const OVERDUE_COUNT = 1;
  const compRate = tasks.length ? Math.round((tasks.filter(t=>['completed','approved'].includes(t.status)).length/tasks.length)*100) : 0;

  // Romah: 1/2 tasks (Marketing mgt done, TypRush pending)
  // Taqdees: 2/2 tasks
  const internsWithProgress = MOCK_USERS.map(u => {
    if (u._id === 'u1') {
      return { ...u, totalTasks: 2, approved: 1 };
    }
    const myTasks = tasks.filter(t=>t.internshipType===u.internshipType);
    const approved = myTasks.filter(t=>{
      const s = internTaskStatuses[u._id]?.[t._id] || t.status;
      return ['approved','completed'].includes(s);
    }).length;
    return { ...u, totalTasks:myTasks.length, approved };
  });

  const filteredInterns = internsWithProgress.filter(u => {
    const q = searchIntern.toLowerCase();
    const matchName = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchType = !filterType || u.internshipType===filterType;
    return matchName && matchType;
  });

  const handleAddTask = (task) => setTasks(prev=>[...prev,task]);
  const handleAddAuto = (auto) => {
    const newTasks = auto.taskSlots.map((slot,i)=>({
      _id:`autotask-${Date.now()}-${i}`,
      title: slot.template.title,
      description: slot.template.description,
      priority: slot.template.priority,
      status: 'pending',
      deadline: slot.slotDate,
      internshipType: auto.assignToGroup,
      points: 10,
      submissionLink: '',
      isAuto: true,
      autoName: auto.name,
    }));
    setTasks(prev=>[...prev,...newTasks]);
    setAutomations(prev=>[...prev, { ...auto, taskCount:newTasks.length }]);
  };

  const deleteTask = id => { if(window.confirm('Delete this task?')) setTasks(prev=>prev.filter(t=>t._id!==id)); };
  const deleteAuto = id => { if(window.confirm('Delete automation?')) setAutomations(prev=>prev.filter(a=>a._id!==id)); };
  const toggleAuto = id => setAutomations(prev=>prev.map(a=>a._id===id?{...a,isActive:!a.isActive}:a));
  const removeIntern = id => { if(window.confirm('Remove intern?')) alert('In production this would remove the intern from the database.'); };
  const addFeedback = fb => setFeedbacks(prev=>[...prev,fb]);

  const openFbModal = (internId='', taskId='') => {
    setFbPreset({ internId, taskId });
    setFbModal(true);
  };

  // ─── CHANGE 1: "Monitoring" renamed to "Review", no badge on Notifications ───
  const NAV = [
    { id:'overview',      label:'Overview',        icon:'⬡' },
    { id:'interns',       label:'Interns',         icon:'👥' },
    { id:'tasks',         label:'Tasks',           icon:'✓' },
    { id:'automations',   label:'Automations',     icon:'⚙' },
    { id:'review',        label:'Review',          icon:'📋' },   // was 'monitoring' / 'Monitoring'
    { id:'feedback',      label:'Feedback',        icon:'💬' },
    { id:'notifications', label:'Notifications',   icon:'🔔' },   // no badge — unread is always 0
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sb-brand">
          <span className="diamond">◆</span>
          <span className="title">Intern <span>Hub</span></span>
        </div>
        <nav>
          <div className="sb-section">Admin Panel</div>
          {NAV.map(n=>(
            <div key={n.id} className={`nav-item ${view===n.id?'active':''}`} onClick={()=>setView(n.id)}>
              <span className="icon">{n.icon}</span>{n.label}
              {/* No badge rendered — unread is 0 */}
            </div>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="user-pill">
            <div className="avatar">{user?.name?.[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500}}>{user?.name}</div>
              <div style={{fontSize:11,color:'var(--text2)'}}>Administrator</div>
            </div>
            <button className="btn btn-xs btn-outline" onClick={logout}>Out</button>
          </div>
        </div>
      </aside>

      <main className="main">

        {/* ─ Overview ─ */}
        {view==='overview'&&<>
          <div className="page-header">
            <div className="page-title">Dashboard</div>
            <p className="page-sub">Welcome back, {user?.name} 👋</p>
          </div>
          <div className="overdue-bar">⚠️ {OVERDUE_COUNT} overdue task needs attention!</div>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-label">Total Tasks</div><div className="stat-val">{tasks.length}</div></div>
            <div className="stat-card"><div className="stat-label">Completion</div><div className="stat-val" style={{color:'var(--green)'}}>{compRate}%</div></div>
            <div className="stat-card"><div className="stat-label">Overdue</div><div className="stat-val" style={{color:'var(--red)'}}>{OVERDUE_COUNT}</div></div>
            <div className="stat-card"><div className="stat-label">Active Automations</div><div className="stat-val" style={{color:'var(--gold)'}}>{automations.filter(a=>a.isActive).length}</div></div>
            <div className="stat-card"><div className="stat-label">Total Interns</div><div className="stat-val">{MOCK_USERS.length}</div></div>
          </div>
          <div className="card">
            <div style={{marginBottom:16}}>
              <div className="section-title">Recent Tasks</div>
            </div>
            <table className="table">
              <thead><tr><th>Task</th><th>Internship Type</th><th>Priority</th><th>Deadline</th><th>Actions</th></tr></thead>
              <tbody>
                {tasks.slice(0,8).map(t=>(
                  <tr key={t._id}>
                    <td>
                      <div style={{fontWeight:600,fontSize:13}}>{t.isAuto&&<span style={{fontSize:10,background:'rgba(200,169,110,0.1)',color:'var(--gold)',padding:'1px 7px',borderRadius:10,marginRight:6}}>AUTO</span>}{t.title}</div>
                      {t.description&&<div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{t.description.slice(0,60)}...</div>}
                    </td>
                    <td><span className={`intern-type-badge ${internTypeBadgeClass(t.internshipType)}`}>{t.internshipType}</span></td>
                    <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                    <td style={{fontSize:12,color:'var(--text2)'}}>{fmtDate(t.deadline)}</td>
                    <td><button className="btn btn-xs btn-danger" onClick={()=>deleteTask(t._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tasks.length===0&&<div style={{textAlign:'center',padding:40,color:'var(--text2)'}}>No tasks yet.</div>}
          </div>
        </>}

        {/* ─ Interns ─ CHANGE 2: Feedback button removed from Actions column */}
        {view==='interns'&&<>
          <div className="page-header">
            <div className="page-title">Interns</div>
            <p className="page-sub">Manage all interns and their progress</p>
          </div>
          <div className="card">
            <div style={{display:'flex',gap:12,marginBottom:20}}>
              <div className="search-wrap" style={{flex:1}}>
                <input className="search-input" placeholder="Search by name or email..." value={searchIntern} onChange={e=>setSearchIntern(e.target.value)} />
              </div>
              <select className="form-select" style={{width:200}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
                <option value="">All Internship Types</option>
                {INTERN_GROUPS.map(g=><option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <table className="table">
              <thead><tr><th>Intern</th><th>Internship Type</th><th>Status</th><th>Progress</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredInterns.map(u=>{
                  const pct = u.totalTasks ? Math.round((u.approved/u.totalTasks)*100) : 0;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div className="avatar">{u.name[0]}</div>
                          <div>
                            <div style={{fontWeight:600,fontSize:13}}>{u.name}</div>
                            <div style={{fontSize:11,color:'var(--text2)'}}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`intern-type-badge ${internTypeBadgeClass(u.internshipType)}`}>{u.internshipType}</span></td>
                      <td><span className="badge badge-active">Active</span></td>
                      <td style={{minWidth:160}}>
                        <div style={{fontSize:12,color:'var(--text2)',marginBottom:4}}>{u.approved}/{u.totalTasks} tasks · {pct}%</div>
                        <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}></div></div>
                      </td>
                      {/* Only Remove button — Feedback moved to Review page */}
                      <td>
                        <button className="btn btn-xs btn-danger" onClick={()=>removeIntern(u._id)}>Remove</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredInterns.length===0&&<div style={{textAlign:'center',padding:30,color:'var(--text2)'}}>No interns found.</div>}
          </div>
        </>}

        {/* ─ Tasks ─ */}
        {view==='tasks'&&<>
          <div className="page-header flex-between">
            <div>
              <div className="page-title">Tasks</div>
              <p className="page-sub">Tasks are assigned by Internship Type — all interns of that type receive the task.</p>
            </div>
            <button className="btn btn-primary" onClick={()=>setTaskModal(true)}>+ Create Task</button>
          </div>
          <div className="tip-box">
            <div className="tip-title">💡 Group Assignment</div>
            Tasks are assigned by Internship Type. All interns of that type automatically receive the task.
          </div>
          <div className="card">
            <table className="table">
              <thead><tr><th>Task</th><th>Internship Type</th><th>Priority</th><th>Deadline</th><th>Points</th><th>Actions</th></tr></thead>
              <tbody>
                {tasks.map(t=>{
                  const internCount = MOCK_USERS.filter(u=>u.internshipType===t.internshipType).length;
                  return (
                    <tr key={t._id}>
                      <td>
                        <div style={{fontWeight:600,fontSize:13}}>{t.isAuto&&<span style={{fontSize:10,background:'rgba(200,169,110,0.1)',color:'var(--gold)',padding:'1px 7px',borderRadius:10,marginRight:6}}>AUTO</span>}{t.title}</div>
                        {t.description&&<div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{t.description.slice(0,70)}{t.description.length>70?'...':''}</div>}
                      </td>
                      <td>
                        <span className={`intern-type-badge ${internTypeBadgeClass(t.internshipType)}`}>{t.internshipType}</span>
                        <div style={{fontSize:11,color:'var(--text2)',marginTop:3}}>→ {internCount} intern{internCount!==1?'s':''}</div>
                      </td>
                      <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                      <td style={{fontSize:12,color:'var(--text2)'}}>{fmtDate(t.deadline)}</td>
                      <td><span style={{color:'var(--gold)',fontWeight:600}}>⭐ {t.points||10}</span></td>
                      <td><button className="btn btn-xs btn-danger" onClick={()=>deleteTask(t._id)}>Delete</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {tasks.length===0&&<div style={{textAlign:'center',padding:40,color:'var(--text2)'}}>No tasks yet.</div>}
          </div>
        </>}

        {/* ─ Automations ─ */}
        {view==='automations'&&<>
          <div className="page-header flex-between">
            <div>
              <div className="page-title">Automation Rules</div>
              <p className="page-sub">Smart scheduling — tasks auto-release on schedule.</p>
            </div>
            <button className="btn btn-primary" onClick={()=>setAutoModal(true)}>+ New Rule</button>
          </div>
          <div className="tip-box">
            <div className="tip-title">⚙ How Smart Scheduling Works</div>
            <div className="how-grid">
              {[{icon:'📅',t:'Set Range',d:'Pick start + end date'},{icon:'🔁',t:'Pick Schedule',d:'Daily, weekly, custom days...'},{icon:'📝',t:'Write Tasks',d:'Title per slot auto-counted'},{icon:'⏰',t:'Auto-Release',d:'Tasks appear on each date'},{icon:'🔔',t:'24h Reminder',d:'Intern notified before due'},{icon:'👥',t:'Group Assign',d:'All interns of that type'},].map((s,i)=>(
                <div key={i} className="how-item"><div className="how-icon">{s.icon}</div><div className="how-title">{s.t}</div><div className="how-desc">{s.d}</div></div>
              ))}
            </div>
          </div>
          {automations.length===0?<div className="card" style={{textAlign:'center',padding:60,color:'var(--text2)'}}><div style={{fontSize:40,marginBottom:12}}>🤖</div><p>No automation rules yet. Create one!</p></div>
          :automations.map(auto=>(
            <div key={auto._id} className="auto-card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap'}}>
                    <span style={{fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:15}}>{auto.name}</span>
                    <span className={`badge badge-${auto.isActive?'active':'paused'}`}>{auto.isActive?'Active':'Paused'}</span>
                    <small style={{fontSize:11,color:'var(--text2)'}}>{auto.taskCount||0} tasks</small>
                  </div>
                  <div style={{display:'flex',gap:12,flexWrap:'wrap',fontSize:12,color:'var(--text2)',marginBottom:8}}>
                    <span style={{color:'var(--text)',fontWeight:500}}>{SCHEDULE_TYPES.find(s=>s.id===auto.scheduleType)?.label||auto.scheduleType}</span>
                    <span>{fmtDate(auto.startDate)} → {fmtDate(auto.endDate)}</span>
                    <span>⏰ {auto.startTime}</span>
                    <span className={`intern-type-badge ${internTypeBadgeClass(auto.assignToGroup)}`}>{auto.assignToGroup}</span>
                  </div>
                  {auto.description&&<div style={{fontSize:12,color:'var(--text2)'}}>{auto.description}</div>}
                </div>
                <div style={{display:'flex',gap:6,marginLeft:16,flexDirection:'column'}}>
                  <button className="btn btn-xs btn-warn" onClick={()=>toggleAuto(auto._id)}>{auto.isActive?'Pause':'Resume'}</button>
                  <button className="btn btn-xs btn-danger" onClick={()=>deleteAuto(auto._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </>}

        {/* ─ REVIEW (was Monitoring) ─ CHANGE 3: Full review page with submissions + Feedback button */}
        {view==='review'&&<>
          <div className="page-header">
            <div className="page-title">Submission Review</div>
            <p className="page-sub">0 awaiting review · {submissions.length} total submissions</p>
          </div>

          {submissions.map(sub => {
            const existingFb = feedbacks.find(f=>f.internId===sub.internId && f.taskId===sub.taskId);
            return (
              <div key={sub._id} className="review-card">
                <div className="review-card-header">
                  {sub.status==='approved' && (
                    <span className="badge badge-approved">Approved</span>
                  )}
                  {sub.status==='pending' && (
                    <span className="badge badge-pending">Pending</span>
                  )}
                  <span className={`intern-type-badge ${internTypeBadgeClass(sub.internshipType)}`}>{sub.internshipType}</span>
                  {sub.taskTitle && (
                    <span className="review-card-title">{sub.taskTitle}</span>
                  )}
                </div>
                <div className="review-card-author">
                  <div className="avatar" style={{width:22,height:22,fontSize:10}}>{sub.internName[0]}</div>
                  {sub.internName}
                </div>
                <div className="review-card-desc">{sub.description}</div>
                <div className="review-card-actions">
                  <a className="view-link" href={sub.submissionLink} target="_blank" rel="noreferrer">🔗 View Submission →</a>
                  {/* Feedback button is here in Review, not in Interns table */}
                  <button
                    className="btn btn-xs btn-outline"
                    style={{marginLeft:'auto'}}
                    onClick={()=>openFbModal(sub.internId, sub.taskId)}
                  >
                    {existingFb ? '✓ Feedback Given' : 'Feedback'}
                  </button>
                </div>
                {existingFb && (
                  <div style={{marginTop:10,padding:'8px 12px',background:'rgba(200,169,110,0.06)',borderRadius:6,fontSize:12,color:'var(--text2)',borderLeft:'2px solid var(--gold)'}}>
                    <span style={{color:'var(--gold)',fontWeight:600}}>Feedback: </span>{existingFb.comment}
                  </div>
                )}
              </div>
            );
          })}

          {submissions.length===0&&(
            <div className="card" style={{textAlign:'center',padding:60,color:'var(--text2)'}}>
              <div style={{fontSize:40,marginBottom:12}}>📋</div>
              <p>No submissions yet.</p>
            </div>
          )}
        </>}

        {/* ─ Feedback ─ */}
        {view==='feedback'&&<>
          <div className="page-header flex-between">
            <div><div className="page-title">Feedback</div><p className="page-sub">All feedback given to interns</p></div>
            <button className="btn btn-primary" onClick={()=>openFbModal()}>+ New Feedback</button>
          </div>
          <div style={{marginTop:4}}>
            {feedbacks.map(fb=>{
              const intern = MOCK_USERS.find(u=>u._id===fb.internId);
              const task = tasks.find(t=>t._id===fb.taskId);
              return (
                <div key={fb._id} className="feedback-card">
                  <div style={{fontSize:11,color:'var(--gold)',marginBottom:4}}>Task: {task?.title||'N/A'}</div>
                  <div style={{color:'var(--text)',fontSize:13.5,lineHeight:1.55}}>{fb.comment}</div>
                  <div className="feedback-meta">
                    <span>To: {intern?.name||'Unknown'} ({intern?.internshipType})</span>
                    <span>{fmtDate(fb.date)}</span>
                  </div>
                </div>
              );
            })}
            {feedbacks.length===0&&<p style={{color:'var(--text2)',textAlign:'center',padding:30}}>No feedback yet.</p>}
          </div>
        </>}

        {/* ─ Notifications ─ CHANGE 4: No badge, always empty for admin */}
        {view==='notifications'&&<>
          <div className="page-header">
            <div><div className="page-title">Notifications</div><p className="page-sub">0 unread</p></div>
          </div>
          <div className="card">
            <p style={{textAlign:'center',color:'var(--text2)',padding:30}}>No notifications.</p>
          </div>
        </>}

      </main>

      {showAutoModal&&<AutomationModal onClose={()=>setAutoModal(false)} onSaved={handleAddAuto} />}
      {showTaskModal&&<TaskModal onClose={()=>setTaskModal(false)} onSaved={handleAddTask} />}
      {showFbModal&&<FeedbackModal tasks={tasks} onClose={()=>setFbModal(false)} onSaved={addFeedback} preselectedInternId={fbPreset.internId} preselectedTaskId={fbPreset.taskId} />}
    </div>
  );
}

// ─── Intern Dashboard ─────────────────────────────────────────────────────────
function InternDashboard({ tasks, feedbacks, notifs, setNotifs, internTaskStatuses, setInternTaskStatuses }) {
  const { user, logout } = useAuth();
  const [view, setView] = useState('tasks');
  const [submitModal, setSubmitModal] = useState(null);

  const myTasks = tasks.filter(t=>t.internshipType===user?.internshipType).map(t=>({
    ...t, status: internTaskStatuses[user._id]?.[t._id] || t.status,
    submissionLink: internTaskStatuses[user._id]?.[`${t._id}_link`] || t.submissionLink,
  }));

  const pending = myTasks.filter(t=>t.status==='pending');
  const inProgress = myTasks.filter(t=>t.status==='in-progress');
  const submitted = myTasks.filter(t=>t.status==='submitted');
  const approved = myTasks.filter(t=>['approved','completed'].includes(t.status));
  const pct = myTasks.length ? Math.round((approved.length/myTasks.length)*100) : 0;
  const points = approved.length * 10;
  const myFeedbacks = feedbacks.filter(f=>f.internId===user._id);
  const unread = notifs.filter(n=>!n.read).length;

  const updateStatus = (taskId, status) => {
    setInternTaskStatuses(prev=>({
      ...prev,
      [user._id]: { ...(prev[user._id]||{}), [taskId]:status }
    }));
  };

  const handleSubmit = (taskId, link, note) => {
    setInternTaskStatuses(prev=>({
      ...prev,
      [user._id]: { ...(prev[user._id]||{}), [taskId]:'submitted', [`${taskId}_link`]:link }
    }));
  };

  const NAV = [
    { id:'tasks',         label:'My Tasks',      icon:'✓' },
    { id:'progress',      label:'Progress',      icon:'📊' },
    { id:'feedback',      label:'Feedback',      icon:'💬' },
    { id:'notifications', label:'Notifications', icon:'🔔', badge:unread },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sb-brand">
          <span className="diamond">◆</span>
          <span className="title">Intern <span>Hub</span></span>
        </div>
        <nav>
          <div className="sb-section">My Workspace</div>
          {NAV.map(n=>(
            <div key={n.id} className={`nav-item ${view===n.id?'active':''}`} onClick={()=>setView(n.id)}>
              <span className="icon">{n.icon}</span>{n.label}
              {n.badge>0&&<span className="nav-badge">{n.badge}</span>}
            </div>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="user-pill">
            <div className="avatar">{user?.name?.[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500}}>{user?.name}</div>
              <div style={{fontSize:11,color:'var(--text2)'}}>{user?.internshipType}</div>
            </div>
            <button className="btn btn-xs btn-outline" onClick={logout}>Logout</button>
          </div>
        </div>
      </aside>

      <main className="main">
        {/* ─ My Tasks ─ */}
        {view==='tasks'&&<>
          <div className="page-header">
            <div className="page-title">My Tasks</div>
            <p className="page-sub">{user?.internshipType} · {pending.length} pending · {inProgress.length} in progress</p>
          </div>
          {myTasks.length===0&&<div className="card" style={{textAlign:'center',padding:60,color:'var(--text2)'}}><div style={{fontSize:40}}>📋</div><p>No tasks assigned yet.</p></div>}
          {myTasks.map(t=>{
            const od = isOverdue(t);
            return (
              <div key={t._id} className={`task-card ${t.priority}`}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'}}>
                      {t.isAuto&&<span style={{fontSize:10,background:'rgba(200,169,110,0.1)',color:'var(--gold)',padding:'2px 8px',borderRadius:20}}>AUTO</span>}
                      <span style={{fontWeight:700,fontSize:15}}>{t.title}</span>
                      <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                      <span className={`badge badge-${od?'overdue':t.status}`}>{od?'⚠ Overdue':t.status}</span>
                    </div>
                    <p style={{color:'var(--text2)',fontSize:13.5,lineHeight:1.6,marginBottom:10}}>{t.description}</p>
                    <div style={{display:'flex',gap:20,fontSize:12,color:od?'var(--red)':'var(--text2)'}}>
                      <span>📅 Due: {fmtDate(t.deadline)}</span>
                      <span>⭐ {t.points||10} pts</span>
                    </div>
                    {(t.status==='submitted'||['approved','completed'].includes(t.status))&&t.submissionLink&&(
                      <div style={{marginTop:8}}>
                        <a href={t.submissionLink} target="_blank" rel="noreferrer" style={{fontSize:12,color:'var(--green)',textDecoration:'none'}}>✓ View My Submission →</a>
                      </div>
                    )}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:8,flexShrink:0,alignItems:'flex-end'}}>
                    {t.status==='pending'&&<button className="btn btn-sm btn-outline" onClick={()=>updateStatus(t._id,'in-progress')}>Start</button>}
                    {t.status==='in-progress'&&<button className="btn btn-sm btn-primary" onClick={()=>setSubmitModal(t)}>Submit</button>}
                    {t.status==='submitted'&&<span style={{fontSize:12,color:'var(--gold)'}}>Awaiting review</span>}
                    {['approved','completed'].includes(t.status)&&<span style={{fontSize:22}}>✅</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </>}

        {/* ─ Progress ─ */}
        {view==='progress'&&<>
          <div className="page-header"><div className="page-title">My Progress</div></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center',padding:40}}>
              <div style={{position:'relative',display:'inline-block',marginBottom:16}}>
                <ProgressRing pct={pct} size={160} stroke={10} />
                <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:28,fontWeight:700,color:'var(--gold)'}}>{pct}%</div>
                  <div style={{fontSize:11,color:'var(--text2)'}}>completion</div>
                </div>
              </div>
              <div style={{fontSize:13,color:'var(--text2)',marginBottom:12}}>{approved.length} of {myTasks.length} tasks approved</div>
              <div style={{fontSize:22,fontWeight:700,color:'var(--gold)'}}>⭐ {points} Points</div>
            </div>
            <div className="card">
              <div style={{fontFamily:'Playfair Display,serif',fontSize:16,fontWeight:600,marginBottom:20}}>Task Breakdown</div>
              {[['Pending',pending.length,'var(--text2)'],['In Progress',inProgress.length,'var(--amber)'],['Submitted',submitted.length,'var(--gold)'],['Approved',approved.filter(t=>t.status==='approved').length,'var(--green)'],['Rejected',myTasks.filter(t=>t.status==='rejected').length,'var(--red)'],].map(([label,count,color])=>(
                <div key={label} style={{marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:13,color:'var(--text2)'}}>{label}</span>
                    <span style={{fontSize:13,fontWeight:600,color}}>{count}</span>
                  </div>
                  <div className="progress-bar" style={{height:4}}>
                    <div className="progress-fill" style={{width:`${myTasks.length?Math.round((count/myTasks.length)*100):0}%`,background:color}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* ─ Feedback ─ */}
        {view==='feedback'&&<>
          <div className="page-header"><div className="page-title">My Feedback</div><p className="page-sub">Feedback from your admin</p></div>
          {myFeedbacks.map(fb=>{
            const task = tasks.find(t=>t._id===fb.taskId);
            return (
              <div key={fb._id} className="feedback-card">
                <div style={{fontSize:11,color:'var(--gold)',marginBottom:4}}>Task: {task?.title||'N/A'}</div>
                <div style={{color:'var(--text)',fontSize:13.5,lineHeight:1.55}}>{fb.comment}</div>
                <div className="feedback-meta"><span>{fmtDate(fb.date)}</span></div>
              </div>
            );
          })}
          {myFeedbacks.length===0&&<p style={{color:'var(--text2)',textAlign:'center',padding:30}}>No feedback received yet.</p>}
        </>}

        {/* ─ Notifications ─ */}
        {view==='notifications'&&<>
          <div className="page-header flex-between">
            <div><div className="page-title">Notifications</div><p className="page-sub">{unread} unread</p></div>
            {unread>0&&<button className="btn btn-sm btn-outline" onClick={()=>setNotifs(prev=>prev.map(n=>({...n,read:true})))}>Mark all read</button>}
          </div>
          <div className="card">
            {notifs.map(n=>(
              <div key={n._id} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:'1px solid rgba(200,170,100,0.06)',opacity:n.read?0.5:1}}>
                <div className="notif-dot" style={{background:n.type==='urgent'?'var(--red)':n.type==='reminder'?'var(--amber)':'var(--gold)'}} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:n.read?400:600,fontSize:13.5}}>{n.title}</div>
                  <div style={{color:'var(--text2)',fontSize:12.5,marginTop:2}}>{n.message}</div>
                  <div style={{fontSize:11,color:'var(--text3)',marginTop:3}}>{timeAgo(n.createdAt)}</div>
                </div>
                {!n.read&&<button className="btn btn-xs btn-outline" onClick={()=>setNotifs(prev=>prev.filter(x=>x._id!==n._id))}>✓</button>}
              </div>
            ))}
            {notifs.length===0&&<p style={{textAlign:'center',color:'var(--text2)',padding:30}}>No notifications.</p>}
          </div>
        </>}
      </main>

      {submitModal&&<SubmitModal task={submitModal} onClose={()=>setSubmitModal(null)} onSubmit={handleSubmit} />}
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const ALL_USERS = [
    { _id:'admin', name:'Admin', email:'admin@internhub.com', role:'admin', password:'Admin@2024', internshipType:'' },
    ...MOCK_USERS,
  ];

  const handleLogin = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    await new Promise(r=>setTimeout(r,600));
    const u = ALL_USERS.find(x=>x.email===email && x.password===password);
    if(u) { const {password:_,...rest}=u; login(rest); }
    else setErr('Invalid email or password.');
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div style={{width:'100%',maxWidth:400}}>
        <div className="login-card">
          <div style={{fontSize:10,color:'var(--text2)',letterSpacing:3,textTransform:'uppercase',marginBottom:10}}>◆ <span style={{color:'var(--gold)'}}>InternHub</span> Platform</div>
          <h1 className="login-title">Task Automation</h1>
          <p style={{color:'var(--text2)',marginBottom:28,fontSize:13.5}}>Sign in with your InternHub credentials</p>
          {err&&<div className="error-msg">{err}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
            <button className="login-btn" disabled={loading}>{loading?'Signing in...':'Sign In →'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function AppInner() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(MOCK_TASKS_INIT);
  const [automations, setAutomations] = useState([]);
  const [feedbacks, setFeedbacks] = useState(MOCK_FEEDBACKS_INIT);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS_INIT);
  const [adminNotifs, setAdminNotifs] = useState(ADMIN_NOTIFS_INIT);
  // Updated intern task statuses: Taqdees (u4) now has t3 pending
  const [internTaskStatuses, setInternTaskStatuses] = useState({
    u4: { t1:'approved', t2:'approved', t3:'pending' }
  });

  if(!user) return <Login />;
  if(user.role==='admin') return (
    <AdminDashboard
      tasks={tasks} setTasks={setTasks}
      automations={automations} setAutomations={setAutomations}
      feedbacks={feedbacks} setFeedbacks={setFeedbacks}
      notifs={adminNotifs} setNotifs={setAdminNotifs}
      internTaskStatuses={internTaskStatuses}
    />
  );
  return (
    <InternDashboard
      tasks={tasks}
      feedbacks={feedbacks}
      notifs={notifs} setNotifs={setNotifs}
      internTaskStatuses={internTaskStatuses}
      setInternTaskStatuses={setInternTaskStatuses}
    />
  );
}

export default function App() {
  return (
    <>
      <style>{CSS}</style>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </>
  );
}