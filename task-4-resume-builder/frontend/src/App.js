import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ── Royal Theme Styles (unchanged) ─────────────────────────
const style = document.createElement('style');
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');
:root{
  --darkest:#1a1e24;--dark:#222831;--card:#2c3039;--sidebar:#1e2228;
  --mid:#948979;--light:#DFD0B8;--accent:#C8A96E;--accent2:#a8894e;
  --success:#6aab8a;--warning:#c8973a;--danger:#b85c5c;
  --border:rgba(148,137,121,0.18);
  --font-display:'Playfair Display',serif;
  --font-body:'Crimson Pro',serif;
  --shadow:0 4px 24px rgba(0,0,0,0.32);--shadow-lg:0 8px 40px rgba(0,0,0,0.44);
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:var(--font-body);background:var(--darkest);color:var(--light);min-height:100vh;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(148,137,121,0.3);border-radius:3px;}

/* NAV */
.nav{background:rgba(26,30,36,0.97);backdrop-filter:blur(14px);border-bottom:1px solid var(--border);padding:0 28px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
.nav-logo{font-family:var(--font-display);font-size:20px;font-weight:700;color:var(--light);}
.nav-logo span{color:var(--accent);}
.nav-right{display:flex;align-items:center;gap:10px;}

/* BUTTONS */
.btn{padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;font-family:var(--font-body);transition:all 0.2s;letter-spacing:0.2px;}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#1a1a1a;box-shadow:0 2px 12px rgba(200,169,110,0.25);}
.btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 4px 18px rgba(200,169,110,0.4);}
.btn-outline{background:rgba(148,137,121,0.1);border:1px solid rgba(148,137,121,0.3);color:var(--light);}
.btn-outline:hover{border-color:var(--mid);background:rgba(148,137,121,0.18);}
.btn-sm{padding:5px 12px;font-size:12px;}
.btn-danger{background:rgba(184,92,92,0.12);color:var(--danger);border:1px solid rgba(184,92,92,0.25);}
.btn-danger:hover{background:rgba(184,92,92,0.22);}

/* BUILDER LAYOUT */
.builder-layout{display:grid;grid-template-columns:340px 1fr;min-height:calc(100vh - 60px);}
.form-panel{background:var(--sidebar);border-right:1px solid var(--border);overflow-y:auto;height:calc(100vh - 60px);position:sticky;top:60px;display:flex;flex-direction:column;}
.preview-panel{background:var(--darkest);padding:32px;overflow-y:auto;}

/* TABS */
.tab-bar{display:flex;border-bottom:1px solid var(--border);background:rgba(20,24,30,0.9);overflow-x:auto;flex-shrink:0;}
.tab{padding:12px 10px;font-size:10.5px;font-weight:600;cursor:pointer;color:rgba(223,208,184,0.4);border-bottom:2px solid transparent;transition:all 0.2s;white-space:nowrap;text-transform:uppercase;letter-spacing:0.8px;font-family:var(--font-body);}
.tab:hover{color:var(--mid);}
.tab.active{color:var(--accent);border-bottom-color:var(--accent);background:rgba(200,169,110,0.05);}
.tab-content{padding:18px;flex:1;overflow-y:auto;}

/* FORMS */
.form-group{margin-bottom:13px;}
.form-label{display:block;font-size:10px;font-weight:600;color:var(--mid);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.7px;}
.form-input,.form-select,.form-textarea{width:100%;padding:8px 11px;background:rgba(26,30,36,0.85);border:1px solid var(--border);border-radius:7px;color:var(--light);font-size:13.5px;font-family:var(--font-body);transition:border-color 0.2s,box-shadow 0.2s;}
.form-input:focus,.form-select:focus,.form-textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(200,169,110,0.1);}
.form-textarea{resize:vertical;min-height:70px;}
.form-select option{background:#222831;}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px;}

/* RADIO LEVEL */
.level-radio-group{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px;}
.level-radio{position:relative;}
.level-radio input{position:absolute;opacity:0;width:0;height:0;}
.level-radio label{display:flex;align-items:center;justify-content:center;padding:7px 6px;border-radius:7px;border:1px solid var(--border);color:rgba(223,208,184,0.5);font-size:11px;font-weight:600;cursor:pointer;transition:all 0.18s;text-align:center;font-family:var(--font-body);letter-spacing:0.3px;}
.level-radio input:checked + label{border-color:var(--accent);background:rgba(200,169,110,0.12);color:var(--accent);}
.level-radio label:hover{border-color:rgba(200,169,110,0.4);color:var(--light);}

/* SKILL TYPE TOGGLE */
.skill-type-toggle{display:flex;gap:6px;margin-bottom:10px;}
.skill-type-btn{padding:5px 12px;border-radius:6px;border:1px solid var(--border);background:transparent;color:rgba(223,208,184,0.45);font-size:11px;font-weight:600;cursor:pointer;transition:all 0.18s;font-family:var(--font-body);}
.skill-type-btn.active{background:rgba(200,169,110,0.12);border-color:var(--accent);color:var(--accent);}

/* SECTION ENTRY */
.section-entry{background:rgba(26,30,36,0.7);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px;}
.entry-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.entry-title{font-size:12.5px;font-weight:600;color:var(--light);}
.add-btn{width:100%;padding:11px;background:transparent;border:1px dashed rgba(148,137,121,0.3);border-radius:9px;color:var(--mid);cursor:pointer;font-size:12.5px;font-family:var(--font-body);transition:all 0.2s;margin-top:4px;}
.add-btn:hover{border-color:var(--accent);color:var(--accent);background:rgba(200,169,110,0.05);}

/* PREVIEW PAPER */
.preview-paper{background:#f9f7f4;width:100%;max-width:794px;margin:0 auto;min-height:1060px;box-shadow:0 20px 60px rgba(0,0,0,0.55);border-radius:4px;overflow:hidden;}

/* DRAFTS PAGE */
.drafts-page{min-height:calc(100vh - 60px);padding:40px;max-width:1000px;margin:0 auto;}
.drafts-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;}
.drafts-title{font-family:var(--font-display);font-size:28px;font-weight:700;color:var(--light);}
.drafts-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;}
.draft-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;}
.draft-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:14px 14px 0 0;}
.draft-card:hover{border-color:rgba(200,169,110,0.4);transform:translateY(-2px);box-shadow:var(--shadow);}
.draft-card-name{font-family:var(--font-display);font-size:17px;font-weight:600;color:var(--light);margin-bottom:6px;}
.draft-card-meta{font-size:12px;color:var(--mid);margin-bottom:14px;}
.draft-card-actions{display:flex;gap:8px;}

/* STATUS PILL */
.status-pill{display:inline-flex;align-items:center;gap:5px;font-size:12px;padding:4px 10px;border-radius:20px;font-weight:600;}
.pill-success{background:rgba(106,171,138,0.12);color:var(--success);border:1px solid rgba(106,171,138,0.25);}
.pill-error{background:rgba(184,92,92,0.12);color:var(--danger);border:1px solid rgba(184,92,92,0.25);}
.pill-saving{background:rgba(200,169,110,0.12);color:var(--accent);border:1px solid rgba(200,169,110,0.25);}

/* COLOR SWATCHES */
.color-swatch{width:30px;height:30px;border-radius:50%;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;}
.color-swatch:hover{transform:scale(1.15);}
.color-swatch.active{box-shadow:0 0 0 3px #fff, 0 0 0 5px var(--accent);}

/* LOGIN */
.login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--darkest);background-image:radial-gradient(ellipse at 20% 30%,rgba(57,62,70,0.5) 0,transparent 55%),radial-gradient(ellipse at 80% 80%,rgba(200,169,110,0.06) 0,transparent 45%);}
.login-card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:48px 44px;width:100%;max-width:400px;box-shadow:var(--shadow-lg);position:relative;overflow:hidden;}
.login-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent2),var(--accent),var(--mid));}
.login-title{font-family:var(--font-display);font-size:28px;font-weight:700;color:var(--light);margin-bottom:6px;}
.login-btn{width:100%;padding:13px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#1a1a1a;border:none;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font-display);transition:all 0.2s;margin-top:8px;box-shadow:0 4px 16px rgba(200,169,110,0.3);}
.login-btn:hover{filter:brightness(1.08);transform:translateY(-1px);}
.error-msg{background:rgba(184,92,92,0.1);border:1px solid rgba(184,92,92,0.25);color:var(--danger);padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:16px;}

@media(max-width:900px){.builder-layout{grid-template-columns:1fr;}.preview-panel{display:none;}}
`;
document.head.appendChild(style);

// ── Auth ────────────────────────────────────────────────────
const AuthCtx = createContext();
const useAuth = () => useContext(AuthCtx);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rb_token'));
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me').then(r => setUser(r.data)).catch(() => {
        localStorage.removeItem('rb_token'); setToken(null);
      });
    }
  }, [token]);
  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('rb_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token); setUser(data.user);
  };
  const logout = () => {
    localStorage.removeItem('rb_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null); setUser(null);
  };
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

// ── Helpers (unchanged) ─────────────────────────────────────
const LEVEL_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', professional: 'Professional', master: 'Master' };

function detectGpaOrPercent(val) {
  if (!val) return { label: 'GPA', value: val };
  const s = String(val).trim();
  if (s.includes('%') || (parseFloat(s) > 10)) return { label: 'Percentage', value: s.replace('%','').trim() + '%' };
  return { label: 'GPA', value: s };
}

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ── Resume Preview (unchanged) ──────────────────────────────
function ResumePreview({ data, accentColor, template }) {
  const ac = accentColor || '#2D4A6B';
  const tpl = template || 'classic';
  const p = data.personal || {};
  const techSkills = (data.skills || []).filter(s => s.type !== 'soft');
  const softSkills = (data.skills || []).filter(s => s.type === 'soft');
  if (tpl === 'sidebar') return <SidebarTemplate data={data} ac={ac} p={p} techSkills={techSkills} softSkills={softSkills} />;
  if (tpl === 'minimal') return <MinimalTemplate data={data} ac={ac} p={p} techSkills={techSkills} softSkills={softSkills} />;
  return <ClassicTemplate data={data} ac={ac} p={p} techSkills={techSkills} softSkills={softSkills} />;
}

// ── Classic Template (unchanged) ────────────────────────────
function ClassicTemplate({ data, ac, p, techSkills, softSkills }) {
  return (
    <div className="preview-paper" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <div style={{ background: ac, padding: '36px 44px 28px', color: '#fff' }}>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.2, marginBottom: 4, fontFamily: "'Playfair Display', Georgia, serif" }}>
          {p.name || 'Your Full Name'}
        </div>
        {p.title && <div style={{ fontSize: 14, opacity: 0.88, fontStyle: 'italic', marginBottom: 6 }}>{p.title}</div>}
        {p.tagline && <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 14 }}>{p.tagline}</div>}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.25)', marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 11.5, opacity: 0.88 }}>
          {p.email    && <span>✉ {p.email}</span>}
          {p.phone    && <span>📞 {p.phone}</span>}
          {p.location && <span>📍 {p.location}</span>}
          {p.linkedin && <span>in {p.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//,'')}</span>}
          {p.github   && <span>⌨ {p.github.replace(/^https?:\/\/(www\.)?github\.com\//,'')}</span>}
          {p.website  && <span>🌐 {p.website.replace(/^https?:\/\/(www\.)?/,'')}</span>}
        </div>
      </div>
      <div style={{ padding: '26px 44px 32px', color: '#2a2a2a', background: '#f9f7f4' }}>
        {p.summary && (
          <PdfSection title="Professional Summary" color={ac}>
            <p style={{ fontSize: 12.5, lineHeight: 1.75, color: '#444' }}>{p.summary}</p>
          </PdfSection>
        )}
        {techSkills.length > 0 && (
          <PdfSection title="Technical Skills" color={ac}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px 22px' }}>
              {techSkills.map((sk, i) => <SkillItem key={i} sk={sk} ac={ac} />)}
            </div>
          </PdfSection>
        )}
        {softSkills.length > 0 && (
          <PdfSection title="Soft Skills & Languages" color={ac}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px' }}>
              {softSkills.map((sk, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${ac}14`, border: `1px solid ${ac}33`, borderRadius: 20, padding: '4px 12px', fontSize: 11.5 }}>
                  <span style={{ color: '#333', fontWeight: 500 }}>{sk.name}</span>
                  {sk.level && <span style={{ fontSize: 9, color: ac, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>· {LEVEL_LABELS[sk.level] || sk.level}</span>}
                </div>
              ))}
            </div>
          </PdfSection>
        )}
        {(data.experience || []).length > 0 && (
          <PdfSection title="Work Experience" color={ac}>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a' }}>{exp.role}</div>
                    <div style={{ fontSize: 12, color: ac, fontWeight: 600, marginTop: 1 }}>{exp.company}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#888', textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    {exp.startDate}{(exp.startDate || exp.endDate) ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}
                  </div>
                </div>
                {(exp.bullets || []).filter(b => b.trim()).length > 0 && (
                  <ul style={{ marginTop: 5, paddingLeft: 16 }}>
                    {exp.bullets.filter(b => b.trim()).map((b, j) => (
                      <li key={j} style={{ fontSize: 12, lineHeight: 1.65, color: '#555', marginBottom: 2 }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </PdfSection>
        )}
        {(data.education || []).length > 0 && (
          <PdfSection title="Education" color={ac}>
            {data.education.map((ed, i) => {
              const gpaInfo = detectGpaOrPercent(ed.gpa);
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a' }}>{[ed.degree, ed.field].filter(Boolean).join(' in ')}</div>
                    <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                      {ed.institution}
                      {gpaInfo.value ? <span style={{ color: ac, fontWeight: 600 }}> — {gpaInfo.label}: {gpaInfo.value}</span> : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#888', textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    {ed.startDate}{(ed.startDate || ed.endDate) ? ' – ' : ''}{ed.endDate}
                  </div>
                </div>
              );
            })}
          </PdfSection>
        )}
        {(data.projects || []).length > 0 && (
          <PdfSection title="Projects" color={ac}>
            {data.projects.map((pr, i) => (
              <div key={i} style={{ marginBottom: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a1a' }}>{pr.name}</div>
                  {pr.tech && <div style={{ fontSize: 11, color: ac, fontStyle: 'italic', fontWeight: 600, flexShrink: 0, marginLeft: 10 }}>{pr.tech}</div>}
                </div>
                {pr.description && <div style={{ fontSize: 12, color: '#555', marginTop: 3, lineHeight: 1.6 }}>{pr.description}</div>}
                {pr.url && <a href={pr.url} style={{ fontSize: 11, color: '#1a5eb8', marginTop: 2, display: 'block' }}>{pr.url}</a>}
              </div>
            ))}
          </PdfSection>
        )}
        {(data.certifications || []).length > 0 && (
          <PdfSection title="Certifications" color={ac}>
            {data.certifications.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 }}>
                <div style={{ fontSize: 12.5 }}><strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}</div>
                <div style={{ fontSize: 11, color: '#888', flexShrink: 0, marginLeft: 10 }}>{c.date}</div>
              </div>
            ))}
          </PdfSection>
        )}
      </div>
    </div>
  );
}

// ── Minimal Template (unchanged) ────────────────────────────
function MinimalTemplate({ data, ac, p, techSkills, softSkills }) {
  return (
    <div className="preview-paper" style={{ fontFamily: "'Georgia', serif" }}>
      <div style={{ padding: '40px 44px 24px', borderBottom: `3px solid ${ac}`, background: '#fff' }}>
        <div style={{ fontSize: 34, fontWeight: 700, color: '#111', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: -0.5 }}>
          {p.name || 'Your Full Name'}
        </div>
        {p.title && <div style={{ fontSize: 15, color: ac, fontWeight: 600, marginTop: 4 }}>{p.title}</div>}
        {p.tagline && <div style={{ fontSize: 12, color: '#888', marginTop: 3, fontStyle: 'italic' }}>{p.tagline}</div>}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 11.5, color: '#555', marginTop: 12 }}>
          {p.email && <span>✉ {p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>📍 {p.location}</span>}
          {p.linkedin && <span style={{ color: ac }}>LinkedIn</span>}
          {p.github && <span style={{ color: ac }}>GitHub</span>}
          {p.website && <span style={{ color: ac }}>Portfolio</span>}
        </div>
      </div>
      <div style={{ padding: '24px 44px 32px', background: '#fff', color: '#2a2a2a' }}>
        {p.summary && <PdfSection title="About" color={ac} minimal><p style={{ fontSize: 12.5, lineHeight: 1.75, color: '#444' }}>{p.summary}</p></PdfSection>}
        {techSkills.length > 0 && (
          <PdfSection title="Technical Skills" color={ac} minimal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px 20px' }}>
              {techSkills.map((sk, i) => <SkillItem key={i} sk={sk} ac={ac} minimal />)}
            </div>
          </PdfSection>
        )}
        {softSkills.length > 0 && (
          <PdfSection title="Soft Skills" color={ac} minimal>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {softSkills.map((sk, i) => (
                <span key={i} style={{ fontSize: 12, color: '#555', background: '#f0ede8', padding: '3px 10px', borderRadius: 4 }}>{sk.name}</span>
              ))}
            </div>
          </PdfSection>
        )}
        {(data.experience || []).length > 0 && (
          <PdfSection title="Experience" color={ac} minimal>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{exp.role}</span>
                    {exp.company && <span style={{ fontSize: 12, color: '#666' }}> · {exp.company}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>{exp.startDate}{(exp.startDate||exp.endDate)?' – ':''}{exp.current?'Present':exp.endDate}</div>
                </div>
                {(exp.bullets||[]).filter(b=>b.trim()).length > 0 && (
                  <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                    {exp.bullets.filter(b=>b.trim()).map((b,j) => <li key={j} style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </PdfSection>
        )}
        {(data.education || []).length > 0 && (
          <PdfSection title="Education" color={ac} minimal>
            {data.education.map((ed, i) => {
              const g = detectGpaOrPercent(ed.gpa);
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{[ed.degree, ed.field].filter(Boolean).join(' in ')}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{ed.institution}{g.value ? ` — ${g.label}: ${g.value}` : ''}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>{ed.startDate}{(ed.startDate||ed.endDate)?' – ':''}{ed.endDate}</div>
                </div>
              );
            })}
          </PdfSection>
        )}
        {(data.projects || []).length > 0 && (
          <PdfSection title="Projects" color={ac} minimal>
            {data.projects.map((pr, i) => (
              <div key={i} style={{ marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{pr.name}</span>
                  {pr.tech && <span style={{ fontSize: 11, color: ac, fontStyle: 'italic' }}>{pr.tech}</span>}
                </div>
                {pr.description && <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginTop: 2 }}>{pr.description}</div>}
              </div>
            ))}
          </PdfSection>
        )}
        {(data.certifications || []).length > 0 && (
          <PdfSection title="Certifications" color={ac} minimal>
            {data.certifications.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12.5 }}><strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}</span>
                <span style={{ fontSize: 11, color: '#999' }}>{c.date}</span>
              </div>
            ))}
          </PdfSection>
        )}
      </div>
    </div>
  );
}

// ── Sidebar Template (unchanged) ────────────────────────────
function SidebarTemplate({ data, ac, p, techSkills, softSkills }) {
  return (
    <div className="preview-paper" style={{ fontFamily: "'Georgia', serif", display: 'flex', minHeight: 1060 }}>
      <div style={{ width: 220, background: ac, color: '#fff', padding: '32px 22px', flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.2, marginBottom: 4 }}>
          {p.name || 'Your Name'}
        </div>
        {p.title && <div style={{ fontSize: 11, opacity: 0.85, fontStyle: 'italic', marginBottom: 4 }}>{p.title}</div>}
        {p.tagline && <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 14, lineHeight: 1.4 }}>{p.tagline}</div>}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.3)', marginBottom: 14 }} />
        <div style={{ fontSize: 10.5, opacity: 0.88, lineHeight: 2 }}>
          {p.email && <div>✉ {p.email}</div>}
          {p.phone && <div>📞 {p.phone}</div>}
          {p.location && <div>📍 {p.location}</div>}
          {p.linkedin && <div style={{ wordBreak: 'break-all' }}>in {p.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//,'')}</div>}
          {p.github && <div>⌨ {p.github.replace(/^https?:\/\/(www\.)?github\.com\//,'')}</div>}
          {p.website && <div style={{ wordBreak: 'break-all' }}>🌐 {p.website.replace(/^https?:\/\/(www\.)?/,'')}</div>}
        </div>
        {techSkills.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.65, marginBottom: 10 }}>Technical Skills</div>
            {techSkills.map((sk, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{sk.name}</div>
                {sk.level && <div style={{ fontSize: 9.5, opacity: 0.75, textTransform: 'capitalize' }}>{LEVEL_LABELS[sk.level]}</div>}
              </div>
            ))}
          </div>
        )}
        {softSkills.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.65, marginBottom: 8 }}>Soft Skills</div>
            {softSkills.map((sk, i) => (
              <div key={i} style={{ fontSize: 11, opacity: 0.88, marginBottom: 4 }}>· {sk.name}</div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: '32px 30px', background: '#f9f7f4', color: '#2a2a2a', minHeight: 1060 }}>
        {p.summary && <PdfSection title="About Me" color={ac}><p style={{ fontSize: 12.5, lineHeight: 1.75, color: '#444' }}>{p.summary}</p></PdfSection>}
        {(data.experience || []).length > 0 && (
          <PdfSection title="Work Experience" color={ac}>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{exp.role}</div>
                    <div style={{ fontSize: 11.5, color: ac, fontWeight: 600 }}>{exp.company}</div>
                  </div>
                  <div style={{ fontSize: 10.5, color: '#888', textAlign: 'right' }}>
                    {exp.startDate}{(exp.startDate||exp.endDate)?' – ':''}{exp.current?'Present':exp.endDate}
                  </div>
                </div>
                {(exp.bullets||[]).filter(b=>b.trim()).length > 0 && (
                  <ul style={{ paddingLeft: 14, marginTop: 4 }}>
                    {exp.bullets.filter(b=>b.trim()).map((b,j) => <li key={j} style={{ fontSize: 11.5, color: '#555', lineHeight: 1.6 }}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </PdfSection>
        )}
        {(data.education || []).length > 0 && (
          <PdfSection title="Education" color={ac}>
            {data.education.map((ed, i) => {
              const g = detectGpaOrPercent(ed.gpa);
              return (
                <div key={i} style={{ marginBottom: 11 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{[ed.degree, ed.field].filter(Boolean).join(' in ')}</div>
                      <div style={{ fontSize: 11.5, color: '#666' }}>{ed.institution}{g.value ? ` — ${g.label}: ${g.value}` : ''}</div>
                    </div>
                    <div style={{ fontSize: 10.5, color: '#888' }}>{ed.startDate}{(ed.startDate||ed.endDate)?' – ':''}{ed.endDate}</div>
                  </div>
                </div>
              );
            })}
          </PdfSection>
        )}
        {(data.projects || []).length > 0 && (
          <PdfSection title="Projects" color={ac}>
            {data.projects.map((pr, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{pr.name}</span>
                  {pr.tech && <span style={{ fontSize: 10.5, color: ac, fontStyle: 'italic' }}>{pr.tech}</span>}
                </div>
                {pr.description && <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginTop: 2 }}>{pr.description}</div>}
                {pr.url && <a href={pr.url} style={{ fontSize: 11, color: '#1a5eb8' }}>{pr.url}</a>}
              </div>
            ))}
          </PdfSection>
        )}
        {(data.certifications || []).length > 0 && (
          <PdfSection title="Certifications" color={ac}>
            {data.certifications.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12.5 }}><strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}</span>
                <span style={{ fontSize: 11, color: '#888' }}>{c.date}</span>
              </div>
            ))}
          </PdfSection>
        )}
      </div>
    </div>
  );
}

function PdfSection({ title, color, children, minimal }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {minimal ? (
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 2 }}>{title}</span>
          <div style={{ height: 1, background: `${color}44`, marginTop: 5 }} />
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 2 }}>{title}</div>
          <div style={{ height: 2, background: `linear-gradient(to right, ${color}, transparent)`, marginTop: 4 }} />
        </div>
      )}
      {children}
    </div>
  );
}

function SkillItem({ sk, ac }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #ebe8e3' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{sk.name}</div>
      {sk.level && (
        <div style={{ fontSize: 10.5, color: ac, fontWeight: 600, textTransform: 'capitalize', letterSpacing: 0.2, flexShrink: 0, marginLeft: 6 }}>
          {LEVEL_LABELS[sk.level] || sk.level}
        </div>
      )}
    </div>
  );
}

// ── Constants ────────────────────────────────────────────────
const emptyResume = {
  title: 'Untitled Resume',
  template: 'classic',
  accentColor: '#2D4A6B',
  personal: { name:'', title:'', tagline:'', email:'', phone:'', location:'', linkedin:'', github:'', website:'', summary:'' },
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: []
};

const ACCENT_COLORS = [
  '#2D4A6B','#393E46','#4A2D4A','#2D5A3D','#6B3D2D',
  '#C8A96E','#5A3D6B','#2D5A5A','#1a3a5c','#8B1a1a'
];

const TEMPLATES = [
  { id: 'classic', name: 'Classic' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'sidebar', name: 'Sidebar' },
];

// ── Drafts List Page (UPDATED) ─────────────────────────────
function DraftsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchDrafts();
    }
  }, [user, navigate]);

  const fetchDrafts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/api/resumes');
      setDrafts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load drafts. Please try again.');
      console.error(e);
    }
    setLoading(false);
  };

  const createNew = () => {
    navigate('/builder/new');
  };

  const duplicateDraft = async (e, draft) => {
    e.stopPropagation();
    const { _id, createdAt, updatedAt, ...copyData } = draft;
    const payload = { ...copyData, title: (copyData.title || 'Untitled') + ' (Copy)' };
    try {
      const { data } = await axios.post('/api/resumes', payload);
      navigate(`/builder/${data._id}`);
    } catch (e) {
      alert('Duplicate failed: ' + (e.response?.data?.message || e.message));
    }
  };

  const deleteDraft = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this draft?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/resumes/${id}`);
      setDrafts(d => d.filter(r => r._id !== id));
    } catch (e) {
      alert('Delete failed: ' + (e.response?.data?.message || e.message));
    }
    setDeleting(null);
  };

  return (
    <>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="nav-logo">Resume<span>Builder</span></span>
        </div>
        <div className="nav-right">
          <span style={{ fontSize: 13, color: 'var(--mid)' }}>👋 {user?.name}</span>
          <button className="btn btn-sm" style={{ background: 'rgba(148,137,121,0.1)', border: '1px solid rgba(148,137,121,0.2)', color: 'var(--mid)' }} onClick={logout}>Logout</button>
        </div>
      </nav>
      <div className="drafts-page">
        <div className="drafts-header">
          <div>
            <div className="drafts-title">My Resumes</div>
            <div style={{ fontSize: 13, color: 'var(--mid)', marginTop: 4 }}>{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</div>
          </div>
          <button className="btn btn-primary" onClick={createNew}>+ New Resume</button>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--mid)' }}>Loading drafts…</div>
        ) : (
          <div className="drafts-grid">
            {drafts.length === 0 && !loading && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--mid)', padding: 40 }}>
                No drafts yet. Click “+ New Resume” to create your first one.
              </div>
            )}
            {drafts.map(draft => (
              <div
                key={draft._id}
                className="draft-card"
                onClick={() => navigate(`/builder/${draft._id}`)}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: draft.accentColor || '#2D4A6B', borderRadius: '14px 14px 0 0' }} />
                <div style={{ height: 52, background: '#f0ede8', borderRadius: 6, marginBottom: 14, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: 16, background: draft.accentColor || '#2D4A6B' }} />
                  <div style={{ padding: '4px 8px' }}>
                    <div style={{ height: 2, background: '#ddd', borderRadius: 2, marginBottom: 2, width: '60%' }} />
                    <div style={{ height: 2, background: '#eee', borderRadius: 2, width: '80%' }} />
                  </div>
                </div>
                {/* Changed: show draft.title first */}
                <div className="draft-card-name">{draft.title || draft.personal?.name || 'Untitled'}</div>
                <div className="draft-card-meta">
                  {draft.personal?.title && <span style={{ color: 'var(--accent)', marginRight: 8 }}>{draft.personal.title}</span>}
                  <span>Updated {formatDate(draft.updatedAt)}</span>
                </div>
                <div className="draft-card-actions">
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                    onClick={e => { e.stopPropagation(); navigate(`/builder/${draft._id}`); }}>
                    ✏ Edit
                  </button>
                  <button className="btn btn-outline btn-sm"
                    onClick={e => duplicateDraft(e, draft)}
                    title="Duplicate this draft">
                    📋
                  </button>
                  <button className="btn btn-sm btn-danger"
                    disabled={deleting === draft._id}
                    onClick={e => deleteDraft(e, draft._id)}>
                    {deleting === draft._id ? '…' : '🗑'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Builder (UPDATED exportPDF) ─────────────────────────────
function Builder() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const pathParts = window.location.pathname.split('/');
  const resumeId = pathParts[pathParts.length - 1];

  const [resume, setResume] = useState(emptyResume);
  const [resumeDbId, setResumeDbId] = useState(null);
  const [tab, setTab] = useState('personal');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [skillTab, setSkillTab] = useState('technical');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (resumeId && resumeId !== 'new') {
      loadDraft(resumeId);
    } else if (resumeId === 'new') {
      setResume(emptyResume);
      setResumeDbId(null);
    }
  }, [user, resumeId, navigate]);

  const loadDraft = async (id) => {
    try {
      const { data } = await axios.get(`/api/resumes/${id}`);
      if (data.skills && typeof data.skills === 'string') {
        try { data.skills = JSON.parse(data.skills); } catch { data.skills = []; }
      }
      setResume(data);
      setResumeDbId(data._id);
    } catch (e) {
      console.error('Load error:', e);
      setError('Could not load draft. Returning to home.');
      navigate('/');
    }
  };

  const save = async () => {
    setSaveStatus('saving');
    setError('');
    try {
      const payload = {
        ...resume,
        skills: (resume.skills || []).map(s => ({
          name: s.name || '',
          level: s.level || '',
          type: s.type || 'technical',
        }))
      };

      if (resumeDbId) {
        const { data } = await axios.put(`/api/resumes/${resumeDbId}`, payload);
        setResume(prev => ({ ...prev, ...data }));
      } else {
        const { data } = await axios.post('/api/resumes', payload);
        setResumeDbId(data._id);
        window.history.replaceState({}, '', `/builder/${data._id}`);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (e) {
      console.error('Save error:', e);
      setSaveStatus('error');
      setError('Save failed: ' + (e.response?.data?.message || e.message));
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const exportPDF = async () => {
    await save();
    if (!resumeDbId) {
      alert('Please save the resume before exporting.');
      return;
    }
    try {
      const res = await axios.get(`/api/resumes/${resumeDbId}/export`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      // ✅ PDF filename uses draft title (resume.title)
      const fileName = (resume.title || resume.personal?.name || 'resume').replace(/\s+/g, '_') + '.pdf';
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed: ' + (e.response?.data?.message || e.message));
    }
  };

  const up      = (f, v)        => setResume(r => ({ ...r, [f]: v }));
  const upP     = (f, v)        => setResume(r => ({ ...r, personal: { ...r.personal, [f]: v } }));
  const addItem    = (f, item)  => up(f, [...(resume[f]||[]), item]);
  const removeItem = (f, i)     => up(f, (resume[f]||[]).filter((_,j) => j !== i));
  const updateItem = (f, i, patch) => up(f, (resume[f]||[]).map((item,j) => j===i ? {...item,...patch} : item));

  const TABS = ['personal','skills','experience','education','projects','certs','style'];

  const StatusPill = () => {
    if (saveStatus === 'saving') return <span className="status-pill pill-saving">⏳ Saving…</span>;
    if (saveStatus === 'saved')  return <span className="status-pill pill-success">✓ Saved</span>;
    if (saveStatus === 'error')  return <span className="status-pill pill-error">✕ Save failed</span>;
    return null;
  };

  return (
    <>
      <nav className="nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-sm btn-outline" onClick={() => navigate('/')} style={{ padding: '5px 10px' }}>← Drafts</button>
          <span className="nav-logo">Resume<span>Builder</span></span>
        </div>
        <div className="nav-right">
          <StatusPill />
          <input
            value={resume.title || ''}
            onChange={e => up('title', e.target.value)}
            style={{ background: 'rgba(148,137,121,0.1)', border: '1px solid rgba(148,137,121,0.2)', borderRadius: 7, color: 'var(--light)', padding: '5px 10px', fontSize: 12, width: 160, fontFamily: 'var(--font-body)' }}
            placeholder="Draft title…"
          />
          <button className="btn btn-outline btn-sm" onClick={save} disabled={saveStatus === 'saving'}>💾 Save</button>
          <button className="btn btn-primary btn-sm" onClick={exportPDF}>⬇ PDF</button>
          <button className="btn btn-sm" style={{ background: 'rgba(148,137,121,0.1)', border: '1px solid rgba(148,137,121,0.2)', color: 'var(--mid)' }} onClick={logout}>Logout</button>
        </div>
      </nav>

      {error && <div style={{ background: 'rgba(184,92,92,0.1)', border: '1px solid rgba(184,92,92,0.25)', color: 'var(--danger)', padding: '8px 16px', fontSize: 13, margin: '0 28px' }}>{error}</div>}

      <div className="builder-layout">
        <div className="form-panel">
          <div className="tab-bar">
            {TABS.map(t => (
              <div key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
                {t==='certs'?'Certs':t.charAt(0).toUpperCase()+t.slice(1)}
              </div>
            ))}
          </div>
          <div className="tab-content">
            {tab === 'personal' && (
              <div>
                <div style={{fontSize:11,color:'var(--mid)',marginBottom:14,lineHeight:1.5,background:'rgba(200,169,110,0.07)',border:'1px solid rgba(200,169,110,0.15)',borderRadius:8,padding:'10px 12px'}}>
                  Fill in your details. The live preview updates on the right.
                </div>
                {[
                  ['name','Full Name'],['title','Professional Title'],['tagline','Tagline'],
                  ['email','Email'],['phone','Phone'],['location','Location / City'],
                  ['linkedin','LinkedIn URL'],['github','GitHub URL or Username'],['website','Portfolio URL'],
                ].map(([f, l]) => (
                  <div className="form-group" key={f}>
                    <label className="form-label">{l}</label>
                    <input className="form-input" value={resume.personal[f]||''} onChange={e=>upP(f,e.target.value)} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Professional Summary</label>
                  <textarea className="form-textarea" style={{minHeight:88}} value={resume.personal.summary||''} onChange={e=>upP('summary',e.target.value)} placeholder="Write 2–3 sentences about your background and goals…" />
                </div>
              </div>
            )}
            {tab === 'skills' && (
              <div>
                <div style={{fontSize:11,color:'var(--mid)',marginBottom:12,lineHeight:1.5,background:'rgba(200,169,110,0.07)',border:'1px solid rgba(200,169,110,0.15)',borderRadius:8,padding:'10px 12px'}}>
                  Add Technical skills and Soft skills / Languages separately.
                </div>
                <div className="skill-type-toggle">
                  <button className={`skill-type-btn ${skillTab==='technical'?'active':''}`} onClick={()=>setSkillTab('technical')}>⚙ Technical</button>
                  <button className={`skill-type-btn ${skillTab==='soft'?'active':''}`} onClick={()=>setSkillTab('soft')}>✦ Soft / Languages</button>
                </div>
                {skillTab === 'technical' && (
                  <>
                    {(resume.skills||[]).map((sk, i) => sk.type === 'soft' ? null : (
                      <div key={i} className="section-entry">
                        <div className="entry-header">
                          <span className="entry-title">{sk.name || 'Technical Skill'}</span>
                          <button className="btn btn-sm btn-danger" onClick={()=>removeItem('skills',i)}>✕</button>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Skill Name</label>
                          <input className="form-input" value={sk.name||''} onChange={e=>updateItem('skills',i,{name:e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Proficiency Level</label>
                          <div className="level-radio-group">
                            {['beginner','intermediate','professional','master'].map(lvl => (
                              <div key={lvl} className="level-radio">
                                <input type="radio" name={`level-${i}`} id={`level-${i}-${lvl}`} value={lvl}
                                  checked={(sk.level||'beginner')===lvl}
                                  onChange={()=>updateItem('skills',i,{level:lvl})} />
                                <label htmlFor={`level-${i}-${lvl}`}>{lvl.charAt(0).toUpperCase()+lvl.slice(1)}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="add-btn" onClick={()=>addItem('skills',{name:'',level:'beginner',type:'technical'})}>+ Add Technical Skill</button>
                  </>
                )}
                {skillTab === 'soft' && (
                  <>
                    {(resume.skills||[]).map((sk, i) => sk.type !== 'soft' ? null : (
                      <div key={i} className="section-entry">
                        <div className="entry-header">
                          <span className="entry-title">{sk.name || 'Soft Skill'}</span>
                          <button className="btn btn-sm btn-danger" onClick={()=>removeItem('skills',i)}>✕</button>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Skill / Language Name</label>
                          <input className="form-input" value={sk.name||''} placeholder="e.g. English, Problem Solving" onChange={e=>updateItem('skills',i,{name:e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Level (optional)</label>
                          <div className="level-radio-group">
                            {['beginner','intermediate','professional','master'].map(lvl => (
                              <div key={lvl} className="level-radio">
                                <input type="radio" name={`slevel-${i}`} id={`slevel-${i}-${lvl}`} value={lvl}
                                  checked={(sk.level||'')===lvl}
                                  onChange={()=>updateItem('skills',i,{level:lvl})} />
                                <label htmlFor={`slevel-${i}-${lvl}`}>{lvl.charAt(0).toUpperCase()+lvl.slice(1)}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="add-btn" onClick={()=>addItem('skills',{name:'',level:'',type:'soft'})}>+ Add Soft Skill / Language</button>
                  </>
                )}
              </div>
            )}
            {tab === 'experience' && (
              <div>
                {(resume.experience||[]).map((exp,i) => (
                  <div key={i} className="section-entry">
                    <div className="entry-header">
                      <span className="entry-title">{exp.role||'Experience'}{exp.company?` @ ${exp.company}`:''}</span>
                      <button className="btn btn-sm btn-danger" onClick={()=>removeItem('experience',i)}>✕</button>
                    </div>
                    <div className="form-group"><label className="form-label">Job Title / Role</label><input className="form-input" value={exp.role||''} onChange={e=>updateItem('experience',i,{role:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Company</label><input className="form-input" value={exp.company||''} onChange={e=>updateItem('experience',i,{company:e.target.value})} /></div>
                    <div className="two-col">
                      <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" placeholder="Jan 2023" value={exp.startDate||''} onChange={e=>updateItem('experience',i,{startDate:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">End Date</label><input className="form-input" placeholder="Dec 2023" value={exp.endDate||''} onChange={e=>updateItem('experience',i,{endDate:e.target.value})} disabled={exp.current} /></div>
                    </div>
                    <div className="form-group">
                      <label style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:12,color:'var(--mid)'}}>
                        <input type="checkbox" checked={exp.current||false} onChange={e=>updateItem('experience',i,{current:e.target.checked})} style={{accentColor:'var(--accent)'}} />
                        Currently working here
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Key Achievements (one per line)</label>
                      <textarea className="form-textarea" value={(exp.bullets||[]).join('\n')} onChange={e=>updateItem('experience',i,{bullets:e.target.value.split('\n')})} placeholder="Built React dashboard reducing load time by 40%&#10;Led team of 3 interns…" />
                    </div>
                  </div>
                ))}
                <button className="add-btn" onClick={()=>addItem('experience',{role:'',company:'',startDate:'',endDate:'',current:false,bullets:[]})}>+ Add Experience</button>
              </div>
            )}
            {tab === 'education' && (
              <div>
                {(resume.education||[]).map((ed,i) => (
                  <div key={i} className="section-entry">
                    <div className="entry-header">
                      <span className="entry-title">{ed.institution||'Institution'}</span>
                      <button className="btn btn-sm btn-danger" onClick={()=>removeItem('education',i)}>✕</button>
                    </div>
                    {[['institution','Institution / University'],['degree','Degree (e.g. B.Sc, M.S.)'],['field','Field of Study']].map(([f,l]) => (
                      <div className="form-group" key={f}><label className="form-label">{l}</label><input className="form-input" value={ed[f]||''} onChange={e=>updateItem('education',i,{[f]:e.target.value})} /></div>
                    ))}
                    <div className="form-group">
                      <label className="form-label">GPA or Percentage</label>
                      <input className="form-input" placeholder="e.g. 3.80 or 94%" value={ed.gpa||''} onChange={e=>updateItem('education',i,{gpa:e.target.value})} />
                      {ed.gpa && (
                        <div style={{fontSize:11,color:'var(--accent)',marginTop:4}}>
                          Will display as: {detectGpaOrPercent(ed.gpa).label}: {detectGpaOrPercent(ed.gpa).value}
                        </div>
                      )}
                    </div>
                    <div className="two-col">
                      <div className="form-group"><label className="form-label">Start Year</label><input className="form-input" value={ed.startDate||''} onChange={e=>updateItem('education',i,{startDate:e.target.value})} /></div>
                      <div className="form-group"><label className="form-label">End Year</label><input className="form-input" value={ed.endDate||''} onChange={e=>updateItem('education',i,{endDate:e.target.value})} /></div>
                    </div>
                  </div>
                ))}
                <button className="add-btn" onClick={()=>addItem('education',{institution:'',degree:'',field:'',startDate:'',endDate:'',gpa:''})}>+ Add Education</button>
              </div>
            )}
            {tab === 'projects' && (
              <div>
                {(resume.projects||[]).map((pr,i) => (
                  <div key={i} className="section-entry">
                    <div className="entry-header">
                      <span className="entry-title">{pr.name||'Project'}</span>
                      <button className="btn btn-sm btn-danger" onClick={()=>removeItem('projects',i)}>✕</button>
                    </div>
                    {[['name','Project Name'],['tech','Tech Stack'],['description','Description'],['url','Project URL']].map(([f,l]) => (
                      <div className="form-group" key={f}>
                        <label className="form-label">{l}</label>
                        {f==='description'
                          ? <textarea className="form-textarea" value={pr[f]||''} onChange={e=>updateItem('projects',i,{[f]:e.target.value})} />
                          : <input className="form-input" value={pr[f]||''} onChange={e=>updateItem('projects',i,{[f]:e.target.value})} />
                        }
                      </div>
                    ))}
                  </div>
                ))}
                <button className="add-btn" onClick={()=>addItem('projects',{name:'',description:'',tech:'',url:''})}>+ Add Project</button>
              </div>
            )}
            {tab === 'certs' && (
              <div>
                {(resume.certifications||[]).map((c,i) => (
                  <div key={i} className="section-entry">
                    <div className="entry-header">
                      <span className="entry-title">{c.name||'Certification'}</span>
                      <button className="btn btn-sm btn-danger" onClick={()=>removeItem('certifications',i)}>✕</button>
                    </div>
                    {[['name','Certification Name'],['issuer','Issuing Organization'],['date','Date (e.g. Jan 2024)'],['url','Credential URL']].map(([f,l]) => (
                      <div className="form-group" key={f}><label className="form-label">{l}</label><input className="form-input" value={c[f]||''} onChange={e=>updateItem('certifications',i,{[f]:e.target.value})} /></div>
                    ))}
                  </div>
                ))}
                <button className="add-btn" onClick={()=>addItem('certifications',{name:'',issuer:'',date:'',url:''})}>+ Add Certification</button>
              </div>
            )}
            {tab === 'style' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Resume Template</label>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:8}}>
                    {TEMPLATES.map(tpl => (
                      <div key={tpl.id} onClick={()=>up('template',tpl.id)}
                        style={{ borderRadius:9, border:`2px solid ${resume.template===tpl.id?'var(--accent)':'var(--border)'}`, overflow:'hidden', cursor:'pointer', transition:'all 0.18s', background: resume.template===tpl.id?'rgba(200,169,110,0.08)':'rgba(26,30,36,0.5)' }}>
                        <div style={{height:64,background:'#f0ede8',position:'relative',overflow:'hidden'}}>
                          {tpl.id === 'classic' && (
                            <>
                              <div style={{height:20,background:resume.accentColor||'#2D4A6B'}} />
                              <div style={{padding:'4px 6px'}}>
                                <div style={{height:3,background:'#ddd',borderRadius:2,marginBottom:3,width:'70%'}} />
                                <div style={{height:2,background:'#eee',borderRadius:2,width:'90%'}} />
                              </div>
                            </>
                          )}
                          {tpl.id === 'minimal' && (
                            <div style={{padding:'6px 8px'}}>
                              <div style={{height:4,background:'#333',borderRadius:2,marginBottom:3,width:'60%'}} />
                              <div style={{height:2,background:resume.accentColor||'#2D4A6B',borderRadius:2,marginBottom:5,width:'40%'}} />
                              <div style={{height:1,background:'#ddd',marginBottom:4}} />
                              <div style={{height:2,background:'#eee',borderRadius:2,width:'85%'}} />
                            </div>
                          )}
                          {tpl.id === 'sidebar' && (
                            <div style={{display:'flex',height:'100%'}}>
                              <div style={{width:28,background:resume.accentColor||'#2D4A6B',flexShrink:0}} />
                              <div style={{padding:'5px 6px',flex:1}}>
                                <div style={{height:3,background:'#ccc',borderRadius:2,marginBottom:3,width:'70%'}} />
                                <div style={{height:2,background:'#eee',borderRadius:2,width:'90%'}} />
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{fontSize:10.5,fontWeight:600,color:resume.template===tpl.id?'var(--accent)':'var(--mid)',textAlign:'center',padding:'5px 4px',background:'rgba(26,30,36,0.7)'}}>
                          {tpl.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{marginTop:18}}>
                  <label className="form-label">Accent Color</label>
                  <div style={{display:'flex',gap:9,flexWrap:'wrap',marginTop:8}}>
                    {ACCENT_COLORS.map(c => (
                      <div key={c} className={`color-swatch ${resume.accentColor===c?'active':''}`}
                        onClick={()=>up('accentColor',c)} style={{background:c}} title={c} />
                    ))}
                  </div>
                </div>
                <div className="form-group" style={{marginTop:14}}>
                  <label className="form-label">Custom Color</label>
                  <input type="color" value={resume.accentColor||'#2D4A6B'} onChange={e=>up('accentColor',e.target.value)}
                    style={{width:'100%',height:44,border:'1px solid var(--border)',borderRadius:8,cursor:'pointer',background:'none',padding:2}} />
                </div>
                <div style={{marginTop:16,padding:'14px',background:'rgba(148,137,121,0.08)',borderRadius:10,fontSize:12,color:'var(--mid)',lineHeight:1.6}}>
                  💡 Accent color controls the header (Classic/Sidebar) or section headings (Minimal).
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="preview-panel">
          <ResumePreview data={resume} accentColor={resume.accentColor} template={resume.template} />
        </div>
      </div>
    </>
  );
}

// ── Login (unchanged) ────────────────────────────────────────
function LoginPage() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await login(form.email, form.password); navigate('/'); }
    catch(e) { setErr(e.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{fontSize:10,color:'var(--mid)',letterSpacing:3,textTransform:'uppercase',marginBottom:10}}>
          ◆ <span style={{color:'var(--accent)'}}>InternHub</span> Platform
        </div>
        <h1 className="login-title">Resume Builder</h1>
        <p style={{color:'var(--mid)',marginBottom:28,fontSize:13.5}}>Sign in to continue building</p>
        {err && <div className="error-msg">{err}</div>}
        <form onSubmit={submit}>
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'var(--mid)',marginBottom:5,textTransform:'uppercase',letterSpacing:0.5}}>Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'var(--mid)',marginBottom:5,textTransform:'uppercase',letterSpacing:0.5}}>Password</label>
            <input className="form-input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
          </div>
          <button className="login-btn" disabled={loading}>{loading ? 'Please wait…' : 'Sign In →'}</button>
        </form>
        <p style={{marginTop:20,fontSize:13,color:'var(--mid)',textAlign:'center'}}>
          New intern? Contact your administrator to get your account created.
        </p>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/"              element={<DraftsPage />} />
          <Route path="/builder/:id"   element={<Builder />} />
          <Route path="*"              element={<DraftsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}