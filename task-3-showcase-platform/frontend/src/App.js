import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

// ── Global Styles ───────────────────────────
const style = document.createElement('style');
style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --bg:        #1c2130;--bg2:       #232a3a;--bg3:       #2a3244;
  --card:      #243040;--card2:     #2c3850;
  --light:     #e8dcc8;--light2:    #c4b89a;
  --mid:       #8a9aa0;--muted:     #5a6878;
  --gold:      #c8973a;--gold2:     #a87830;
  --gold-glow: rgba(200,151,58,0.18);--gold-soft: rgba(200,151,58,0.08);
  --teal:      #4a9a8a;--teal-soft: rgba(74,154,138,0.12);
  --success:   #5a9e7a;--danger:    #b85c5c;--warn:      #c8873a;
  --border:    rgba(140,160,180,0.12);--border2:   rgba(200,151,58,0.22);
  --radius:    10px;--radius-lg: 16px;
  --shadow:    0 4px 28px rgba(0,0,0,0.4);--shadow-lg: 0 12px 56px rgba(0,0,0,0.55);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--light);
  min-height: 100vh;
  background-image: radial-gradient(ellipse at 10% 0%, rgba(200, 151, 58, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 100%, rgba(74, 154, 138, 0.04) 0%, transparent 50%);
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: rgba(140, 160, 180, 0.2); border-radius: 3px; }

/* ── NAV ── */
.nav {
  background: rgba(26, 31, 44, 0.94);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding: 0 40px; height: 62px;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 100;
}
.nav::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 151, 58, 0.3), transparent);
}
.nav-logo {
  font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 900;
  color: var(--light); text-decoration: none; letter-spacing: -0.3px;
  display: flex; align-items: center; gap: 2px;
}
.nav-logo span { color: var(--gold); }
.nav-links { display: flex; align-items: center; gap: 4px; }
.nav-link {
  color: var(--mid); text-decoration: none; font-size: 13.5px; font-weight: 500;
  padding: 6px 12px; border-radius: 7px; transition: all 0.18s;
}
.nav-link:hover { color: var(--light); background: rgba(255, 255, 255, 0.05); }

/* ── BUTTONS ── */
.btn {
  padding: 9px 20px; border-radius: 9px; border: none; cursor: pointer;
  font-size: 13.5px; font-weight: 600; font-family: 'Inter', sans-serif;
  transition: all 0.18s; text-decoration: none; display: inline-flex;
  align-items: center; gap: 7px; white-space: nowrap; position: relative;
}
.btn-primary {
  background: linear-gradient(135deg, var(--gold), var(--gold2));
  color: #15100a; box-shadow: 0 2px 12px rgba(200, 151, 58, 0.25);
}
.btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 18px rgba(200, 151, 58, 0.35); }
.btn-outline {
  background: rgba(140, 160, 180, 0.08); border: 1px solid var(--border); color: var(--mid);
}
.btn-outline:hover { border-color: rgba(140, 160, 180, 0.3); color: var(--light); background: rgba(140, 160, 180, 0.12); }
.btn-teal { background: var(--teal-soft); border: 1px solid rgba(74, 154, 138, 0.3); color: var(--teal); }
.btn-teal:hover { background: rgba(74, 154, 138, 0.2); }
.btn-danger { background: rgba(184, 92, 92, 0.1); border: 1px solid rgba(184, 92, 92, 0.25); color: var(--danger); }
.btn-danger:hover { background: rgba(184, 92, 92, 0.2); }
.btn-sm { padding: 5px 14px; font-size: 12.5px; border-radius: 7px; }
.btn-ghost { background: transparent; border: none; color: var(--mid); }
.btn-ghost:hover { color: var(--light); }

/* ── PAGE ── */
.page { padding: 40px; max-width: 1220px; margin: 0 auto; }
.page-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; margin-bottom: 5px; }
.page-sub { color: var(--mid); font-size: 14px; margin-bottom: 28px; }

/* ── HERO ── */
.hero { position: relative; overflow: hidden; text-align: center; padding: 88px 32px 72px; background: linear-gradient(180deg, rgba(200, 151, 58, 0.04) 0%, transparent 100%); }
.hero::before { content: ''; position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(200, 151, 58, 0.1) 0%, transparent 70%); pointer-events: none; }
.hero-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); margin-bottom: 16px; display: inline-flex; align-items: center; gap: 8px; }
.hero-eyebrow::before, .hero-eyebrow::after { content: ''; display: block; width: 28px; height: 1px; background: var(--gold); opacity: 0.5; }
.hero-title { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 900; line-height: 1.08; margin-bottom: 18px; color: var(--light); letter-spacing: -1px; }
.hero-title .highlight { color: transparent; background: linear-gradient(135deg, var(--gold), #e8c070); -webkit-background-clip: text; background-clip: text; }
.hero-sub { color: var(--mid); font-size: 16.5px; max-width: 460px; margin: 0 auto 36px; line-height: 1.65; }
.hero-stats { display: flex; justify-content: center; gap: 40px; margin-top: 48px; padding-top: 36px; border-top: 1px solid var(--border); }
.hero-stat-num { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: var(--light); margin-bottom: 2px; }
.hero-stat-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; }

/* ── FILTER BAR ── */
.filter-bar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; align-items: center; padding: 14px 18px; background: rgba(36, 48, 64, 0.6); border: 1px solid var(--border); border-radius: 12px; }
.search-input { flex: 1; min-width: 200px; padding: 9px 15px; background: rgba(20, 26, 36, 0.7); border: 1px solid rgba(140, 160, 180, 0.15); border-radius: 8px; color: var(--light); font-size: 14px; font-family: 'Inter', sans-serif; }
.search-input:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-soft); }
.filter-tag { padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(140, 160, 180, 0.08); border: 1px solid rgba(140, 160, 180, 0.15); color: var(--mid); cursor: pointer; transition: all 0.18s; }
.filter-tag:hover { color: var(--light); border-color: rgba(200, 151, 58, 0.3); }
.filter-tag.active { background: var(--gold-glow); border-color: var(--border2); color: var(--gold); }

/* ── PROJECT CARDS ── */
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(308px, 1fr)); gap: 22px; }
.project-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: all 0.24s; cursor: pointer; position: relative; display: flex; flex-direction: column; }
.project-card:hover { transform: translateY(-5px); border-color: rgba(200, 151, 58, 0.25); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(200, 151, 58, 0.08); }
.project-card.featured { border-color: rgba(200, 151, 58, 0.35); background: linear-gradient(180deg, rgba(200, 151, 58, 0.04) 0%, var(--card) 100%); }
.featured-ribbon { position: absolute; top: 12px; right: 12px; z-index: 2; background: linear-gradient(135deg, var(--gold), var(--gold2)); color: #15100a; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.8px; text-transform: uppercase; }

.project-img-wrap { position: relative; overflow: hidden; height: 172px; flex-shrink: 0; }
.project-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.project-card:hover .project-img { transform: scale(1.04); }
.project-img-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; position: relative; overflow: hidden; }
.placeholder-Web { background: linear-gradient(135deg, #1e3a5a 0%, #243552 50%, #1a2a40 100%); }
.placeholder-Mobile { background: linear-gradient(135deg, #1e4a3a 0%, #243d35 50%, #1a2e28 100%); }
.placeholder-AIML { background: linear-gradient(135deg, #3a1e5a 0%, #2e1e4a 50%, #221530 100%); }
.placeholder-Data { background: linear-gradient(135deg, #2a3a1e 0%, #243018 50%, #1a2214 100%); }
.placeholder-DevOps { background: linear-gradient(135deg, #3a2a1e 0%, #302216 50%, #22180e 100%); }
.placeholder-Design { background: linear-gradient(135deg, #3a1e3a 0%, #2e1830 50%, #1e1024 100%); }
.placeholder-default { background: linear-gradient(135deg, #243040 0%, #1e2838 50%, #182030 100%); }
.placeholder-icon { font-size: 36px; line-height: 1; opacity: 0.85; }
.placeholder-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(232, 220, 200, 0.35); }
.project-img-wrap::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(22, 28, 40, 0.7) 100%); pointer-events: none; }

.project-body { padding: 18px; flex: 1; display: flex; flex-direction: column; }
.project-title { font-family: 'Playfair Display', serif; font-size: 15.5px; font-weight: 700; margin-bottom: 6px; line-height: 1.3; color: var(--light); }
.project-desc { color: var(--mid); font-size: 13px; line-height: 1.58; margin-bottom: 12px; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.project-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }
.project-tag { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; background: rgba(140, 160, 180, 0.1); border: 1px solid rgba(140, 160, 180, 0.14); color: var(--mid); }
.project-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid rgba(140, 160, 180, 0.08); }
.project-links { display: flex; gap: 10px; align-items: center; }
.project-link { font-size: 12px; color: var(--mid); text-decoration: none; display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; background: rgba(140, 160, 180, 0.07); border: 1px solid rgba(140, 160, 180, 0.12); transition: all 0.18s; }
.project-link:hover { color: var(--light); border-color: rgba(140, 160, 180, 0.25); }
.project-link.live:hover { color: var(--teal); border-color: rgba(74, 154, 138, 0.3); }
.project-author { font-size: 11.5px; color: var(--muted); margin-top: 10px; display: flex; align-items: center; gap: 6px; }
.author-dot { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, var(--bg3), var(--bg2)); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: var(--gold); flex-shrink: 0; }

/* ── LIKE BUTTON ── */
.like-btn { display: flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 7px; background: rgba(140, 160, 180, 0.07); border: 1px solid rgba(140, 160, 180, 0.12); color: var(--mid); cursor: pointer; font-size: 12.5px; font-weight: 600; font-family: 'Inter', sans-serif; transition: all 0.18s; }
.like-btn:hover, .like-btn.liked { color: #e05a6a; border-color: rgba(224, 90, 106, 0.3); background: rgba(224, 90, 106, 0.08); }

.action-row { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; }

/* ── FORM ── */
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 10.5px; font-weight: 700; color: var(--muted); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.6px; }
.form-input, .form-select, .form-textarea { width: 100%; padding: 9px 13px; background: rgba(18, 22, 32, 0.8); border: 1px solid rgba(140, 160, 180, 0.18); border-radius: 8px; color: var(--light); font-size: 13.5px; font-family: 'Inter', sans-serif; transition: border-color 0.18s; }
.form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-soft); }
.form-textarea { resize: vertical; min-height: 76px; }
.form-select option { background: #1a1e26; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* ── IMAGE UPLOAD (base64) ── */
.img-upload-zone { border: 2px dashed rgba(140, 160, 180, 0.2); border-radius: 10px; cursor: pointer; transition: all 0.2s; overflow: hidden; background: rgba(18, 22, 32, 0.5); position: relative; }
.img-upload-zone:hover { border-color: var(--gold); background: var(--gold-soft); }
.img-upload-zone.has-img { border-style: solid; border-color: rgba(200, 151, 58, 0.3); }
.img-upload-zone.dragging { border-color: var(--gold); background: var(--gold-soft); }
.img-upload-empty { padding: 26px 20px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.img-upload-icon { width: 46px; height: 46px; background: linear-gradient(135deg, rgba(200, 151, 58, 0.12), rgba(200, 151, 58, 0.06)); border: 1px solid rgba(200, 151, 58, 0.2); border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.img-upload-text { font-size: 13px; font-weight: 600; color: var(--light2); }
.img-upload-sub { font-size: 11.5px; color: var(--muted); }
.img-upload-preview { width: 100%; height: 156px; object-fit: cover; display: block; }
.img-upload-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.55); display: flex; align-items: center; justify-content: center; gap: 10px; opacity: 0; transition: opacity 0.2s; }
.img-upload-zone.has-img:hover .img-upload-overlay { opacity: 1; }

/* ── MODAL ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.72); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(6px); }
.modal { background: #1a2030; border: 1px solid rgba(140, 160, 180, 0.16); border-radius: 20px; padding: 32px 34px; width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
.modal-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; margin-bottom: 22px; display: flex; align-items: center; gap: 10px; }

/* ── SHARE BOX ── */
.share-box { background: linear-gradient(135deg, rgba(200, 151, 58, 0.1), rgba(200, 151, 58, 0.04)); border: 1px solid rgba(200, 151, 58, 0.25); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; margin-bottom: 32px; box-shadow: 0 0 15px rgba(200, 151, 58, 0.1); }
.share-link { flex: 1; font-size: 13px; color: var(--gold); word-break: break-all; font-weight: 500; }
.copy-btn { background: linear-gradient(135deg, var(--gold), var(--gold2)); color: #15100a; border: none; padding: 7px 16px; border-radius: 7px; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.18s; white-space: nowrap; }
.copy-btn:hover { filter: brightness(1.1); }

/* ── PORTFOLIO PAGE ── */
.portfolio-header { background: linear-gradient(135deg, var(--bg2), var(--bg3)); border: 1px solid var(--border); border-radius: 18px; padding: 36px 40px; margin-bottom: 32px; display: flex; gap: 24px; align-items: center; position: relative; overflow: hidden; }
.portfolio-header::before { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(200, 151, 58, 0.08) 0%, transparent 70%); pointer-events: none; }
.portfolio-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--bg3), var(--card2)); border: 2px solid rgba(200, 151, 58, 0.25); display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 900; font-family: 'Playfair Display', serif; color: var(--gold); flex-shrink: 0; box-shadow: 0 0 0 4px rgba(200, 151, 58, 0.08); }

/* ── STATS / ADMIN ── */
.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(148px, 1fr)); gap: 14px; margin-bottom: 28px; }
.stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 13px; padding: 18px 20px; position: relative; overflow: hidden; }
.stat-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(200, 151, 58, 0.3), transparent); }
.stat-label { font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
.stat-val { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; }
.stat-val.gold { color: var(--gold); }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.section-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; }

/* ── DATA TABLE ── */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 10px 14px; text-align: left; font-size: 10.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); font-weight: 700; }
.data-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid rgba(140, 160, 180, 0.05); vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: rgba(140, 160, 180, 0.03); }

/* ── LOGIN ── */
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(ellipse at 20% 50%, rgba(200, 151, 58, 0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(74, 154, 138, 0.04) 0%, transparent 50%); }
.login-card { background: rgba(28, 33, 46, 0.95); border: 1px solid rgba(140, 160, 180, 0.15); border-radius: 22px; padding: 48px; width: 100%; max-width: 400px; box-shadow: var(--shadow-lg); }
.login-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 800; margin-bottom: 8px; }
.login-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, var(--gold), var(--gold2)); color: #15100a; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: all 0.2s; }
.login-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
.error-msg { background: rgba(184, 92, 92, 0.08); border: 1px solid rgba(184, 92, 92, 0.25); color: var(--danger); padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
.success-msg { background: rgba(90, 158, 122, 0.08); border: 1px solid rgba(90, 158, 122, 0.25); color: var(--success); padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }

.chip { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: rgba(140, 160, 180, 0.1); border: 1px solid rgba(140, 160, 180, 0.15); color: var(--mid); }
.chip-gold { background: rgba(200, 151, 58, 0.1); border-color: rgba(200, 151, 58, 0.2); color: var(--gold); }
.chip-teal { background: var(--teal-soft); border-color: rgba(74, 154, 138, 0.25); color: var(--teal); }
.chip-danger { background: rgba(184, 92, 92, 0.08); border-color: rgba(184, 92, 92, 0.2); color: var(--danger); }

.tabs { display: flex; gap: 3px; margin-bottom: 24px; background: rgba(36, 48, 64, 0.5); padding: 5px; border-radius: 12px; width: fit-content; }
.tab { padding: 8px 20px; border-radius: 9px; border: none; background: transparent; color: var(--muted); font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.18s; display: flex; align-items: center; gap: 6px; }
.tab:hover { color: var(--light); }
.tab.active { background: rgba(200, 151, 58, 0.14); color: var(--light); }

.card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 26px; }
.card-inner { background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }

.empty { text-align: center; padding: 60px 20px; color: var(--muted); }
.empty-icon { font-size: 44px; margin-bottom: 12px; opacity: 0.7; }

@media (max-width: 700px) {
  .hero-title { font-size: 34px; }
  .hero-stats { gap: 20px; }
  .two-col { grid-template-columns: 1fr; }
  .page { padding: 20px; }
  .nav { padding: 0 16px; }
  .portfolio-header { flex-direction: column; align-items: flex-start; }
}
`;
document.head.appendChild(style);

// ── Auth Context ──────────────────────────────────────────
const AuthCtx = createContext();
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sc_token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(r => setUser(r.data))
        .catch(() => {
          localStorage.removeItem('sc_token');
          setToken(null);
          delete axios.defaults.headers.common['Authorization'];
        });
    }
  }, [token]);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('sc_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('sc_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

// ── Helpers ──────────────────────────────────────────────
const CAT_META = {
  'Web':          { icon: '🌐', cls: 'placeholder-Web' },
  'Mobile':       { icon: '📱', cls: 'placeholder-Mobile' },
  'AI/ML':        { icon: '🤖', cls: 'placeholder-AIML' },
  'Data Science': { icon: '📊', cls: 'placeholder-Data' },
  'DevOps':       { icon: '⚙️', cls: 'placeholder-DevOps' },
  'Design':       { icon: '🎨', cls: 'placeholder-Design' },
  'Other':        { icon: '🚀', cls: 'placeholder-default' },
};
const getMeta = cat => CAT_META[cat] || CAT_META['Other'];

// ── Image Upload Component (base64) ─────────────────────
function ImageUpload({ value, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef();

  const process = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = (e) => { onChange(e.target.result); setBusy(false); };
    reader.onerror = () => setBusy(false);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`img-upload-zone ${value ? 'has-img' : ''} ${dragging ? 'dragging' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); process(e.dataTransfer.files[0]); }}
      onClick={() => ref.current?.click()}
    >
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => process(e.target.files[0])} />
      {value ? (
        <>
          <img src={value} alt="preview" className="img-upload-preview" />
          <div className="img-upload-overlay">
            <button type="button" className="btn btn-sm btn-danger"
              onClick={e => { e.stopPropagation(); onChange(''); }}>🗑 Remove</button>
            <button type="button" className="btn btn-sm btn-primary"
              onClick={e => { e.stopPropagation(); ref.current?.click(); }}>✏️ Change</button>
          </div>
        </>
      ) : (
        <div className="img-upload-empty">
          <div className="img-upload-icon">{busy ? '⏳' : '🖼️'}</div>
          <div className="img-upload-text">{busy ? 'Uploading...' : 'Click or drag to upload'}</div>
          <div className="img-upload-sub">JPG, PNG, WEBP · max 5 MB</div>
        </div>
      )}
    </div>
  );
}

// ── Project Card ─────────────────────────────────────────
function ProjectCard({ project, onLike, onEdit, onDelete, showActions, showAdminActions }) {
  const meta = getMeta(project.category);
  const [liked, setLiked] = useState(project.likedByMe || false);
  const [likesCount, setLikesCount] = useState(project.likes || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await axios.post(`/api/projects/${project._id}/like`);
      setLikesCount(data.likes);
      setLiked(data.likedByMe);
    } catch { }
  };

  const authorId = project.owner?.shareId || project.owner?._id;

  return (
    <div className={`project-card ${project.featured ? 'featured' : ''}`}>
      {project.featured && <div className="featured-ribbon">⭐ Featured</div>}
      <div className="project-img-wrap">
        {project.coverImage
          ? <img src={project.coverImage} alt={project.title} className="project-img" />
          : <div className={`project-img-placeholder ${meta.cls}`}>
              <div className="placeholder-icon">{meta.icon}</div>
              <div className="placeholder-label">{project.category || 'Project'}</div>
            </div>}
      </div>
      <div className="project-body">
        <div className="project-title">{project.title}</div>
        <div className="project-desc">{project.description}</div>
        <div className="project-tags">
          {(project.tags || []).slice(0, 4).map(t => <span key={t} className="project-tag">{t}</span>)}
        </div>
        <div className="project-footer">
          <div className="project-links">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer"
                className="project-link live" onClick={e => e.stopPropagation()}>🌐 Live</a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer"
                className="project-link" onClick={e => e.stopPropagation()}>{'</>'} Code</a>
            )}
          </div>
          <div className="action-row">
            <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
              ♥ {likesCount}
            </button>
            {(showActions || showAdminActions) && (
              <>
                {showAdminActions && (
                  <button className="btn btn-sm btn-teal"
                    onClick={e => { e.stopPropagation(); onEdit?.(project); }}>
                    {project.featured ? '★ Unfeature' : '☆ Feature'}
                  </button>
                )}
                {showActions && (
                  <button className="btn btn-sm btn-outline"
                    onClick={e => { e.stopPropagation(); onEdit?.(project); }}>Edit</button>
                )}
                <button className="btn btn-sm btn-danger"
                  onClick={e => { e.stopPropagation(); onDelete?.(project._id); }}>Del</button>
              </>
            )}
          </div>
        </div>
        {project.owner && (
          <div className="project-author">
            <div className="author-dot">{project.owner.name?.[0]?.toUpperCase()}</div>
            <Link to={`/p/${authorId}`} style={{ color: 'var(--mid)', textDecoration: 'none' }}
              onClick={e => e.stopPropagation()}>{project.owner.name}</Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">Intern<span>Hub</span></Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Gallery</Link>
        {user && (
          <>
            {/* ✅ FIX: "My Portfolio" only shown to non-admin users */}
            {user.role !== 'admin' && (
              <Link to="/dashboard" className="nav-link">My Portfolio</Link>
            )}
            {/* ✅ "Admin" link only shown to admin users */}
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link">Admin</Link>
            )}
            <button className="btn btn-sm btn-outline" style={{ marginLeft: 4 }} onClick={logout}>
              Logout
            </button>
          </>
        )}
        {!user && (
          <Link to="/login" style={{ marginLeft: 4 }}>
            <button className="btn btn-sm btn-primary">Sign In</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

// ── Gallery ───────────────────────────────────────────────
function Gallery() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const allTags = [...new Set(projects.flatMap(p => p.tags || []))].slice(0, 12);

  useEffect(() => { fetchProjects(); }, [search, activeTag, activeCategory]);

  const fetchProjects = async () => {
    const params = {};
    if (search) params.q = search;
    if (activeTag) params.tag = activeTag;
    if (activeCategory) params.category = activeCategory;
    const { data } = await axios.get('/api/projects', { params });
    setProjects(data);
  };

  const totalLikes = projects.reduce((s, p) => s + (p.likes || 0), 0);

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">InternHub Platform</div>
        <h1 className="hero-title">Intern Project<br /><span className="highlight">Showcase</span></h1>
        <p className="hero-sub">Discover amazing projects built by our talented interns. Like, comment, and get inspired.</p>
        <Link to="/login">
          <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
            Share Your Work →
          </button>
        </Link>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">{projects.length}</div>
            <div className="hero-stat-label">Projects</div>
          </div>
          <div>
            <div className="hero-stat-num">{totalLikes}</div>
            <div className="hero-stat-label">Total Likes</div>
          </div>
          <div>
            <div className="hero-stat-num">{[...new Set(projects.map(p => p.owner?._id))].length}</div>
            <div className="hero-stat-label">Contributors</div>
          </div>
        </div>
      </div>
      <div className="page" style={{ paddingTop: 0 }}>
        <div className="filter-bar">
          <input className="search-input" placeholder="🔍  Search projects, tech, tags..."
            value={search} onChange={e => { setSearch(e.target.value); setActiveTag(''); }} />
          {['Web', 'Mobile', 'AI/ML', 'Data Science', 'Design', 'DevOps'].map(cat => (
            <span key={cat} className={`filter-tag ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}>{cat}</span>
          ))}
          {allTags.map(t => (
            <span key={t} className={`filter-tag ${activeTag === t ? 'active' : ''}`}
              onClick={() => { setActiveTag(activeTag === t ? '' : t); setActiveCategory(''); }}>{t}</span>
          ))}
        </div>
        {projects.length === 0
          ? <div className="empty"><div className="empty-icon">🚀</div><p>No projects found yet. Be the first!</p></div>
          : <div className="projects-grid">{projects.map(p => <ProjectCard key={p._id} project={p} />)}</div>}
      </div>
    </>
  );
}

// ── PUBLIC PORTFOLIO PAGE ─────────────────────────────────
function PublicPortfolioPage() {
  const { shareId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!shareId || shareId === 'undefined' || shareId === 'null') { setData(false); return; }
    axios.get(`/api/portfolio/${shareId}`)
      .then(r => setData(r.data))
      .catch(() => setData(false));
  }, [shareId]);

  if (data === null) return <div className="empty" style={{ paddingTop: 80 }}>Loading...</div>;
  if (data === false) return (
    <div className="empty" style={{ paddingTop: 80 }}>
      Portfolio not found.<br />The link may be invalid.
    </div>
  );

  return (
    <div className="page" style={{ paddingTop: 40 }}>
      <div className="portfolio-header">
        <div className="portfolio-avatar">{data.user.name[0]}</div>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
            {data.user.name}'s Portfolio
          </h1>
          {data.user.bio && (
            <p style={{ color: 'var(--mid)', marginBottom: 12, maxWidth: 500, fontSize: 14, lineHeight: 1.65 }}>
              {data.user.bio}
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {data.user.github && (
              <a href={data.user.github} target="_blank" rel="noreferrer"
                style={{ color: 'var(--mid)', fontSize: 13, textDecoration: 'none' }}>⌨ GitHub</a>
            )}
            {data.user.linkedin && (
              <a href={data.user.linkedin} target="_blank" rel="noreferrer"
                style={{ color: 'var(--mid)', fontSize: 13, textDecoration: 'none' }}>💼 LinkedIn</a>
            )}
            {(data.user.skills || []).slice(0, 6).map(s => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="section-title" style={{ marginBottom: 22 }}>
        Projects ({data.projects.length})
      </div>

      {data.projects.length === 0 ? (
        <div className="empty"><div className="empty-icon">🚀</div><p>No projects shared yet.</p></div>
      ) : (
        <div className="projects-grid">
          {data.projects.map(p => <ProjectCard key={p._id} project={p} />)}
        </div>
      )}
    </div>
  );
}

// ── Dashboard (interns only) ─────────────────────────────
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', longDescription: '',
    liveUrl: '', githubUrl: '', tags: '', category: 'Web', coverImage: ''
  });
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    // ✅ FIX 1: Redirect admin away from dashboard to /admin
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }
    fetchMine();
    fetchSubmissions();
  }, [user]);

  const fetchMine = async () => {
    const { data } = await axios.get('/api/projects/mine');
    setProjects(data);
  };
  const fetchSubmissions = async () => {
    try { const { data } = await axios.get('/api/submissions/mine'); setSubmissions(data); } catch { }
  };

  const openEdit = p => {
    setEditProject(p);
    setForm({ ...p, tags: (p.tags || []).join(', ') });
    setShowModal(true);
  };
  const openNew = () => {
    setEditProject(null);
    setForm({ title: '', description: '', longDescription: '', liveUrl: '', githubUrl: '', tags: '', category: 'Web', coverImage: '' });
    setShowModal(true);
  };

  const save = async e => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    if (editProject) await axios.put(`/api/projects/${editProject._id}`, payload);
    else await axios.post('/api/projects', payload);
    setShowModal(false);
    fetchMine();
  };

  const deleteProject = async id => {
    if (window.confirm('Delete this project?')) {
      await axios.delete(`/api/projects/${id}`);
      fetchMine();
    }
  };

  const importSub = async id => {
    if (!window.confirm('Add to showcase?')) return;
    await axios.post(`/api/submissions/${id}/showcase`);
    setShowImport(false);
    fetchMine();
  };

  const identifier = user?.shareId || user?._id;
  const shareUrl = identifier ? `${window.location.origin}/p/${identifier}` : '';

  const copyLink = () => {
    if (!shareUrl) { alert('Unable to generate share link. Please try logging out and back in.'); return; }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render nothing while redirect is happening
  if (!user || user.role === 'admin') return null;

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>My Portfolio</h1>
          <p className="page-sub" style={{ marginBottom: 0 }}>
            Welcome, {user?.name} — {projects.length} project{projects.length !== 1 ? 's' : ''} in your showcase
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {submissions.length > 0 && (
            <button className="btn btn-outline" onClick={() => setShowImport(true)}>
              + Import from Task 2
            </button>
          )}
          <button className="btn btn-primary" onClick={openNew}>+ Add Project</button>
        </div>
      </div>

      <div className="share-box">
        <div style={{ fontSize: 18 }}>🔗</div>
        <div className="share-link">{shareUrl || 'Link unavailable'}</div>
        <button className="copy-btn" onClick={copyLink}>{copied ? '✓ Copied!' : 'Copy Link'}</button>
        {shareUrl && (
          <a href={shareUrl} target="_blank" rel="noreferrer">
            <button className="btn btn-sm btn-outline">View Public</button>
          </a>
        )}
      </div>

      {projects.length === 0
        ? (
          <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🚀</div>
            <p>No projects yet. Add your first project!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(p => (
              <ProjectCard key={p._id} project={p}
                showActions onEdit={openEdit} onDelete={deleteProject} onLike={fetchMine} />
            ))}
          </div>
        )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editProject ? '✏️ Edit Project' : '🚀 Add New Project'}</div>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Cover Image</label>
                <ImageUpload value={form.coverImage} onChange={url => setForm(f => ({ ...f, coverImage: url }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="My Awesome Project" required />
              </div>
              <div className="form-group">
                <label className="form-label">Short Description *</label>
                <input className="form-input" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="One-line summary" required />
              </div>
              <div className="form-group">
                <label className="form-label">Full Description</label>
                <textarea className="form-textarea" value={form.longDescription}
                  onChange={e => setForm({ ...form, longDescription: e.target.value })}
                  placeholder="Tell the full story..." />
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label className="form-label">Live URL</label>
                  <input className="form-input" type="url" value={form.liveUrl}
                    onChange={e => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://" />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub URL</label>
                  <input className="form-input" type="url" value={form.githubUrl}
                    onChange={e => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/" />
                </div>
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" value={form.tags}
                    onChange={e => setForm({ ...form, tags: e.target.value })}
                    placeholder="React, Node, MongoDB" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    {['Web', 'Mobile', 'AI/ML', 'Data Science', 'DevOps', 'Design', 'Other'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editProject ? 'Save Changes' : 'Add Project'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="modal-overlay" onClick={() => setShowImport(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">📥 Import from Task 2</div>
            <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: 13 }}>
              Select a submission to add to your public showcase.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {submissions.map(sub => (
                <div key={sub._id} className="card-inner"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{sub.title || 'Untitled'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub.description?.slice(0, 60)}</div>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => importSub(sub._id)}>Import</button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowImport(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin Panel ───────────────────────────────────────────
function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchProjects();
    fetchStats();
    fetchUsers();
  }, [user]);

  const fetchProjects = async () => { const { data } = await axios.get('/api/admin/projects'); setProjects(data); };
  const fetchStats   = async () => { const { data } = await axios.get('/api/admin/stats');    setStats(data); };
  const fetchUsers   = async () => { const { data } = await axios.get('/api/admin/users');    setUsers(data); };

  const toggleFeature = async (id, current) => {
    await axios.put(`/api/admin/projects/${id}/feature`, { featured: !current });
    fetchProjects();
  };
  const deleteProject = async id => {
    if (window.confirm('Delete permanently?')) {
      await axios.delete(`/api/projects/${id}`);
      fetchProjects();
    }
  };

  const topLiked = [...projects].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);

  return (
    <div className="page">
      <div className="page-title">Admin Panel</div>
      <div className="page-sub">Moderate content · Manage interns · View analytics</div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Projects</div>
          <div className="stat-val gold">{projects.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Likes</div>
          <div className="stat-val">{projects.reduce((s, p) => s + (p.likes || 0), 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Featured</div>
          <div className="stat-val gold">{projects.filter(p => p.featured).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Contributors</div>
          <div className="stat-val">{[...new Set(projects.map(p => p.owner?._id))].length}</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'projects'  ? 'active' : ''}`} onClick={() => setTab('projects')}>📁 All Projects</button>
        <button className={`tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>📊 Analytics</button>
        <button className={`tab ${tab === 'users'     ? 'active' : ''}`} onClick={() => setTab('users')}>👥 Interns</button>
      </div>

      {tab === 'projects' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="section-title">All Projects ({projects.length})</div>
          </div>
          {projects.length === 0 ? (
            <div className="empty" style={{ padding: 50 }}><div className="empty-icon">📁</div><p>No projects yet</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Project</th><th>Author</th><th>Email</th><th>Category</th><th>Likes</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          {p.coverImage
                            ? <img src={p.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : getMeta(p.category).icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{(p.tags || []).slice(0, 2).join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.owner?.name || '—'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{p.owner?.email || '—'}</td>
                    <td><span className="chip">{p.category || '—'}</span></td>
                    <td><span style={{ color: 'var(--light)', fontWeight: 700 }}>♥ {p.likes || 0}</span></td>
                    <td>{p.featured ? <span className="chip chip-gold">⭐ Featured</span> : <span className="chip">Normal</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-teal" onClick={() => toggleFeature(p._id, p.featured)}>
                          {p.featured ? '★ Unfeature' : '☆ Feature'}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteProject(p._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>🔥 Most Liked Projects</div>
            {topLiked.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>No data yet</div>
            ) : (
              topLiked.map((p, i) => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: i < topLiked.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 18, fontFamily: 'Playfair Display', fontWeight: 800, color: 'var(--gold)', width: 24, textAlign: 'center' }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>by {p.owner?.name}</div>
                  </div>
                  <span style={{ color: 'var(--light)', fontWeight: 700, fontSize: 14 }}>♥ {p.likes || 0}</span>
                </div>
              ))
            )}
          </div>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>📊 Categories</div>
            {Object.entries(
              projects.reduce((acc, p) => {
                acc[p.category || 'Other'] = (acc[p.category || 'Other'] || 0) + 1;
                return acc;
              }, {})
            ).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{getMeta(cat).icon} {cat}</span>
                  <span style={{ color: 'var(--muted)' }}>{count}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(140,160,180,0.1)' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,var(--gold),var(--gold2))', width: `${(count / projects.length) * 100}%`, transition: 'width 0.4s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Interns</div>
          <table className="data-table">
            <thead>
              <tr><th>Intern</th><th>Email</th><th>Projects</th><th>Last Active</th><th>Activity</th></tr>
            </thead>
            <tbody>
              {users.map(u => {
                const portId = u.shareId || u._id;
                return (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{u.email}</td>
                    <td>{u.projectCount || 0}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {u.lastActivity ? new Date(u.lastActivity).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <Link to={`/p/${portId}`} className="btn btn-sm btn-outline">View Portfolio</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────
function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      // ✅ FIX 2: Admin goes to /admin, interns go to /dashboard
      const loggedInUser = await login(form.email, form.password);
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      setErr(e.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
          ◆ <span style={{ color: 'var(--gold)' }}>InternHub</span> Platform
        </div>
        <h1 className="login-title">Showcase</h1>
        <p style={{ color: 'var(--mid)', marginBottom: 28, fontSize: 13.5 }}>
          Sign in with your InternHub credentials
        </p>
        {err && <div className="error-msg">{err}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Email
            </label>
            <input className="form-input" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Password
            </label>
            <input className="form-input" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" required />
          </div>
          <button className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p style={{ marginTop: 24, fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.65 }}>
          New intern? Contact your administrator to get your account created.
        </p>
      </div>
    </div>
  );
}

// ── LAYOUT ────────────────────────────────────────────────
function AppRoutes() {
  const location = useLocation();

  // Public portfolio pages get no navbar
  if (location.pathname.startsWith('/p/')) {
    return (
      <Routes>
        <Route path="/p/:shareId" element={<PublicPortfolioPage />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Gallery />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin"     element={<AdminPanel />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}