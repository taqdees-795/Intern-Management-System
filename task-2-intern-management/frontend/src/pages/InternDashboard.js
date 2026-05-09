import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function InternDashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState('tasks');
  const [internTasks, setInternTasks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [submitModal, setSubmitModal] = useState(null);
  const [submitForm, setSubmitForm] = useState({ submissionLink: '', submissionNote: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try { const r = await axios.get('/api/interntasks'); setInternTasks(r.data); } catch(e) { setInternTasks([]); }
    try { const r = await axios.get(`/api/feedback/intern/${user._id}`); setFeedbacks(r.data); } catch(e) { setFeedbacks([]); }
    setLoading(false);
  };

  const submitTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/interntasks/${submitModal._id}/submit`, submitForm);
      setSubmitModal(null); setSubmitForm({ submissionLink: '', submissionNote: '' });
      fetchData();
    } catch(e) { alert('Submission failed: ' + (e.response?.data?.message || e.message)); }
  };

  const startTask = async (id) => {
    try { await axios.put(`/api/interntasks/${id}/start`); fetchData(); } catch(e) {}
  };

  const completed = internTasks.filter(it => it.status === 'approved').length;
  const totalPoints = internTasks.filter(it => it.status === 'approved').reduce((s, it) => s + (it.task?.points || 10), 0);
  const progress = internTasks.length ? Math.round((completed / internTasks.length) * 100) : 0;

  const r = 54, circ = 2 * Math.PI * r;
  const statusColor = (s) => ({ pending:'var(--mid)', 'in-progress':'var(--warning)', submitted:'var(--accent)', approved:'var(--success)', rejected:'var(--danger)' }[s] || 'var(--mid)');
  const priorityBorder = (p) => ({ high:'var(--danger)', medium:'var(--warning)', low:'var(--success)' }[p] || 'var(--mid)');

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Intern<span>Hub</span></div>
        <nav className="sidebar-nav">
          <div className="nav-section">My Workspace</div>
          {[{id:'tasks',label:'My Tasks',icon:'✓'},{id:'progress',label:'Progress',icon:'📈'},{id:'feedback',label:'Feedback',icon:'💬'}].map(n => (
            <div key={n.id} className={`nav-item ${view===n.id?'active':''}`} onClick={()=>setView(n.id)}>
              <span>{n.icon}</span> {n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.internshipType || 'Intern'}</div>
            </div>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </aside>

      <main className="main-content">

        {view === 'tasks' && (
          <>
            <div className="page-header">
              <h1 className="page-title">My Tasks</h1>
              <p className="page-subtitle">
                {user?.internshipType} · {internTasks.filter(it=>it.status==='pending').length} pending · {internTasks.filter(it=>it.status==='in-progress').length} in progress
              </p>
            </div>
            {loading ? (
              <div className="card" style={{textAlign:'center',padding:60,color:'var(--mid)'}}>Loading tasks...</div>
            ) : internTasks.length === 0 ? (
              <div className="card" style={{textAlign:'center',padding:60,color:'var(--mid)'}}>
                <div style={{fontSize:40,marginBottom:12}}>📋</div>
                <p>No tasks assigned yet. Your admin will assign tasks for {user?.internshipType} interns soon.</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {internTasks.map(it => {
                  const task = it.task;
                  if(!task) return null;
                  const isOverdue = new Date(task.deadline) < new Date() && !['approved','submitted'].includes(it.status);
                  return (
                    <div key={it._id} className="card" style={{borderLeft:`4px solid ${priorityBorder(task.priority)}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16}}>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                            <span style={{fontWeight:700,fontSize:15,color:'var(--light)'}}>{task.title}</span>
                            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                            <span className={`badge badge-${it.status}`}>{it.status}</span>
                            {isOverdue && <span className="badge" style={{background:'rgba(184,92,92,0.2)',color:'var(--danger)',border:'1px solid rgba(184,92,92,0.3)'}}>⚠ Overdue</span>}
                          </div>
                          <p style={{color:'var(--mid)',fontSize:13.5,lineHeight:1.55,marginBottom:12}}>{task.description}</p>
                          <div style={{display:'flex',gap:20,fontSize:12,color:'var(--mid)',flexWrap:'wrap'}}>
                            <span style={{color:isOverdue?'var(--danger)':'var(--mid)'}}>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                            <span>🏷 {task.category}</span>
                            <span>⭐ {task.points} pts</span>
                          </div>
                          {task.resources && <div style={{marginTop:8,fontSize:12}}><a href={task.resources} target="_blank" rel="noreferrer" style={{color:'var(--accent)'}}>📎 Resources →</a></div>}
                          {it.submissionLink && <div style={{marginTop:6,fontSize:12}}><a href={it.submissionLink} target="_blank" rel="noreferrer" style={{color:'var(--success)'}}>✓ View My Submission →</a></div>}
                          {it.adminNote && <div style={{marginTop:8,padding:'8px 12px',background:'rgba(200,169,110,0.08)',borderRadius:6,fontSize:12,color:'var(--accent)',borderLeft:'2px solid var(--accent)'}}>Admin note: {it.adminNote}</div>}
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:8,flexShrink:0}}>
                          {it.status === 'pending' && <button className="btn btn-sm btn-outline" onClick={()=>startTask(it._id)}>Start</button>}
                          {['pending','in-progress'].includes(it.status) && <button className="btn btn-sm btn-primary" onClick={()=>setSubmitModal(it)}>Submit</button>}
                          {it.status === 'approved' && <span style={{fontSize:20,textAlign:'center'}}>✅</span>}
                          {it.status === 'rejected' && <button className="btn btn-sm btn-primary" onClick={()=>setSubmitModal(it)}>Resubmit</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {view === 'progress' && (
          <>
            <div className="page-header"><h1 className="page-title">My Progress</h1></div>
            <div className="two-col">
              <div className="card" style={{display:'flex',flexDirection:'column',alignItems:'center',padding:40}}>
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(148,137,121,0.15)" strokeWidth="10"/>
                  <circle cx="75" cy="75" r={r} fill="none" stroke="var(--accent)" strokeWidth="10"
                    strokeDasharray={circ} strokeDashoffset={circ-(progress/100)*circ}
                    strokeLinecap="round" transform="rotate(-90 75 75)"
                    style={{transition:'stroke-dashoffset 0.8s ease'}}/>
                  <text x="75" y="72" textAnchor="middle" dominantBaseline="middle" fill="var(--light)" fontSize="26" fontWeight="700" fontFamily="Playfair Display,serif">{progress}%</text>
                  <text x="75" y="93" textAnchor="middle" fill="var(--mid)" fontSize="11" fontFamily="Inter,sans-serif">completion</text>
                </svg>
                <div style={{marginTop:20,textAlign:'center'}}>
                  <div style={{fontSize:13,color:'var(--mid)'}}>{completed} of {internTasks.length} tasks approved</div>
                  <div style={{fontSize:24,fontWeight:700,color:'var(--accent)',fontFamily:'Playfair Display',marginTop:10}}>⭐ {totalPoints} Points</div>
                </div>
              </div>
              <div className="card">
                <div className="section-title" style={{marginBottom:20}}>Task Breakdown</div>
                {[
                  {label:'Pending',     status:'pending',     color:'var(--mid)'},
                  {label:'In Progress', status:'in-progress', color:'var(--warning)'},
                  {label:'Submitted',   status:'submitted',   color:'var(--accent)'},
                  {label:'Approved',    status:'approved',    color:'var(--success)'},
                  {label:'Rejected',    status:'rejected',    color:'var(--danger)'},
                ].map(item => {
                  const cnt = internTasks.filter(it=>it.status===item.status).length;
                  const pct = internTasks.length ? (cnt/internTasks.length)*100 : 0;
                  return (
                    <div key={item.status} style={{marginBottom:16}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:13}}>
                        <span style={{color:'var(--mid)'}}>{item.label}</span>
                        <span style={{color:item.color,fontWeight:600}}>{cnt}</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`,background:item.color}}/></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {view === 'feedback' && (
          <>
            <div className="page-header">
              <h1 className="page-title">My Feedback</h1>
              <p className="page-subtitle">{feedbacks.length} received</p>
            </div>
            {feedbacks.length === 0 ? (
              <div className="card" style={{textAlign:'center',padding:60,color:'var(--mid)'}}>
                <div style={{fontSize:40,marginBottom:12}}>💬</div>
                <p>No feedback received yet.</p>
              </div>
            ) : feedbacks.map(fb => (
              <div key={fb._id} className="card" style={{marginBottom:12,borderLeft:`4px solid ${fb.type==='positive'?'var(--success)':fb.type==='constructive'?'var(--warning)':'var(--mid)'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontWeight:600}}>{fb.type}</span>
                  <span>{'⭐'.repeat(fb.rating||0)}</span>
                </div>
                <p style={{color:'var(--mid)',fontSize:13.5,lineHeight:1.5}}>{fb.message}</p>
                <div style={{marginTop:8,fontSize:12,color:'var(--dark)'}}>by {fb.admin?.name} · {new Date(fb.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </>
        )}
      </main>

      {submitModal && (
        <div className="modal-overlay" onClick={()=>setSubmitModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">Submit: {submitModal.task?.title}</div>
            <form onSubmit={submitTask}>
              <div className="form-group"><label className="form-label">Submission Link</label><input className="form-input" type="url" placeholder="https://github.com/..." value={submitForm.submissionLink} onChange={e=>setSubmitForm({...submitForm,submissionLink:e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Notes (optional)</label><textarea className="form-textarea" placeholder="Describe your work..." value={submitForm.submissionNote} onChange={e=>setSubmitForm({...submitForm,submissionNote:e.target.value})} /></div>
              <div style={{display:'flex',gap:12}}>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>Submit Work</button>
                <button type="button" className="btn btn-outline" onClick={()=>setSubmitModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
