import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const INTERNSHIP_TYPES = [
  'Web Development','Full Stack Development','Python Development',
  'Android Development','UI/UX Design','Data Science','DevOps','Machine Learning'
];
const COLORS = ['#C8A96E','#948979','#6aab8a','#c8973a','#b85c5c','#7B8FA1','#9B7EC8','#5C8A8A'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState('overview');
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [internTasks, setInternTasks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInternModal, setShowInternModal] = useState(false);
  const [showFbModal, setShowFbModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [customType, setCustomType] = useState('');
  const [taskForm, setTaskForm] = useState({
    title:'', description:'', internshipType:'Web Development',
    deadline:'', priority:'medium', category:'Task', points:10, resources:''
  });
  const [internForm, setInternForm] = useState({
    name:'', email:'', password:'', internshipType:'Web Development'
  });
  const [fbForm, setFbForm] = useState({ message:'', rating:5, type:'positive' });

  const fetchAll = useCallback(async () => {
    try { const r = await axios.get('/api/interns'); setInterns(r.data); } catch(e){}
    try { const r = await axios.get('/api/tasks'); setTasks(r.data); } catch(e){}
    try { const r = await axios.get('/api/interntasks'); setInternTasks(r.data); } catch(e){}
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.post('/api/tasks', taskForm);
      alert(`✅ Task assigned to ${r.data.assignedCount || 0} interns in "${taskForm.internshipType}"`);
      setShowTaskModal(false);
      setTaskForm({ title:'', description:'', internshipType:'Web Development', deadline:'', priority:'medium', category:'Task', points:10, resources:'' });
      fetchAll();
    } catch(e) { alert(e.response?.data?.message || 'Error creating task'); }
  };

  const createIntern = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', { ...internForm, role:'intern' });
      setShowInternModal(false);
      setInternForm({ name:'', email:'', password:'', internshipType:'Web Development' });
      fetchAll();
    } catch(e) { alert(e.response?.data?.message || 'Error'); }
  };

  const updateITStatus = async (id, status) => {
    await axios.put(`/api/interntasks/${id}/status`, { status });
    fetchAll();
  };

  const deleteIntern = async (id) => {
    if(window.confirm('Remove this intern?')) {
      await axios.delete(`/api/interns/${id}`); fetchAll();
    }
  };

  const deleteTask = async (id) => {
    if(window.confirm('Delete this task? It will be removed from all interns.')) {
      await axios.delete(`/api/tasks/${id}`); fetchAll();
    }
  };

  const openFeedback = (intern) => { setSelectedIntern(intern); setShowFbModal(true); };
  const submitFb = async (e) => {
    e.preventDefault();
    await axios.post('/api/feedback', { ...fbForm, intern: selectedIntern._id });
    setShowFbModal(false); setFbForm({ message:'', rating:5, type:'positive' });
  };

  const allTypes = [...new Set([...INTERNSHIP_TYPES, ...interns.map(i=>i.internshipType).filter(Boolean)])];

  // Stats
  const pendingReview = internTasks.filter(it => it.status === 'submitted');
  const approved = internTasks.filter(it => it.status === 'approved');
  const typeStats = allTypes.map(t => ({
    name: t.replace(' Development','').replace('Development','Dev'),
    interns: interns.filter(i => i.internshipType === t).length,
    tasks: tasks.filter(tk => tk.internshipType === t).length,
  })).filter(s => s.interns > 0 || s.tasks > 0);

  const filteredInterns = interns.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || i.internshipType === filterType;
    return matchSearch && matchType;
  });

  // ── Pie‑chart custom label (prevents overlap) ──
  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
    if (value === 0) return null;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="var(--light)"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
      >
        {`${name}: ${value}`}
      </text>
    );
  };

  const NAV = [
    { id:'overview', label:'Overview', icon:'⬡' },
    { id:'interns',  label:'Interns',  icon:'👥' },
    { id:'tasks',    label:'Tasks',    icon:'✓' },
    { id:'review',   label:'Review',   icon:'📋', badge: pendingReview.length },
    { id:'analytics',label:'Analytics',icon:'📊' },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Intern<span>Hub</span></div>
        <nav className="sidebar-nav">
          <div className="nav-section">Navigation</div>
          {NAV.map(n => (
            <div key={n.id} className={`nav-item ${view===n.id?'active':''}`} onClick={() => setView(n.id)}>
              <span style={{fontSize:15}}>{n.icon}</span> {n.label}
              {n.badge > 0 && <span style={{marginLeft:'auto',background:'var(--warning)',color:'#1a1a1a',borderRadius:10,padding:'1px 8px',fontSize:10,fontWeight:700}}>{n.badge}</span>}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{user?.name?.[0]}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Administrator</div>
            </div>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </div>
      </aside>

      <main className="main-content">

        {/* ── OVERVIEW ── */}
        {view === 'overview' && (
          <>
            <div className="page-header">
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Welcome back, {user?.name}</p>
            </div>
            <div className="stat-grid">
              {[
                { label:'Total Interns',   value: interns.length,          color:'var(--light)' },
                { label:'Active',          value: interns.filter(i=>i.status==='active').length, color:'var(--success)' },
                { label:'Total Tasks',     value: tasks.length,            color:'var(--light)' },
                { label:'Approved',        value: approved.length,         color:'var(--success)' },
                { label:'Pending Review',  value: pendingReview.length,    color:'var(--warning)' },
                { label:'Internship Types',value: [...new Set(interns.map(i=>i.internshipType))].length, color:'var(--accent)' },
              ].map((s,i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{color:s.color}}>{s.value}</div>
                </div>
              ))}
            </div>
            {pendingReview.length > 0 && (
              <div className="card" style={{marginBottom:24}}>
                <div className="section-header">
                  <div className="section-title">⚡ Submissions Awaiting Review</div>
                  <span style={{fontSize:12,color:'var(--mid)'}}>{pendingReview.length} pending</span>
                </div>
                {pendingReview.slice(0,6).map(it => (
                  <div key={it._id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid rgba(148,137,121,0.08)'}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:14}}>{it.task?.title}</div>
                      <div style={{fontSize:12,color:'var(--mid)',marginTop:2}}>
                        {it.intern?.name} · <span style={{color:'var(--accent)'}}>{it.intern?.internshipType}</span>
                      </div>
                      {it.submissionLink && <a href={it.submissionLink} target="_blank" rel="noreferrer" style={{fontSize:12,color:'var(--accent)'}}>View Submission →</a>}
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button className="btn btn-sm" style={{background:'rgba(106,171,138,0.15)',color:'var(--success)',border:'1px solid rgba(106,171,138,0.3)'}} onClick={() => updateITStatus(it._id,'approved')}>✓ Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => updateITStatus(it._id,'rejected')}>✗ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Internship type breakdown */}
            <div className="card">
              <div className="section-title" style={{marginBottom:16}}>Internship Type Breakdown</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
                {allTypes.map((t,i) => {
                  const cnt = interns.filter(x=>x.internshipType===t).length;
                  if(!cnt) return null;
                  return (
                    <div key={t} style={{background:'rgba(34,40,49,0.6)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px',borderLeft:`3px solid ${COLORS[i%COLORS.length]}`}}>
                      <div style={{fontSize:12,fontWeight:600,color:COLORS[i%COLORS.length],marginBottom:4}}>{t}</div>
                      <div style={{fontSize:22,fontWeight:700,fontFamily:'Playfair Display'}}>{cnt}</div>
                      <div style={{fontSize:11,color:'var(--mid)'}}>intern{cnt!==1?'s':''} · {tasks.filter(tk=>tk.internshipType===t).length} tasks</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── INTERNS ── */}
        {view === 'interns' && (
          <>
            <div className="page-header">
              <div className="section-header">
                <h1 className="page-title">Interns</h1>
                <button className="btn btn-primary" onClick={() => setShowInternModal(true)}>+ Onboard Intern</button>
              </div>
            </div>
            <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
              <input className="search-input" style={{flex:1,minWidth:200}} placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} />
              <select className="form-select" style={{width:220}} value={filterType} onChange={e=>setFilterType(e.target.value)}>
                <option value="">All Internship Types</option>
                {allTypes.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="card">
              <table className="data-table">
                <thead><tr><th>Intern</th><th>Internship Type</th><th>Status</th><th>Progress</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredInterns.map(intern => {
                    const pct = intern.taskCount ? Math.round((intern.completedCount/intern.taskCount)*100) : 0;
                    return (
                      <tr key={intern._id}>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <div className="user-avatar" style={{width:34,height:34,fontSize:13}}>{intern.name[0]}</div>
                            <div>
                              <div style={{fontWeight:600}}>{intern.name}</div>
                              <div style={{fontSize:11,color:'var(--mid)'}}>{intern.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span style={{background:'rgba(200,169,110,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,border:'1px solid rgba(200,169,110,0.2)'}}>{intern.internshipType}</span></td>
                        <td><span className={`badge badge-${intern.status}`}>{intern.status}</span></td>
                        <td style={{width:160}}>
                          <div style={{fontSize:11,color:'var(--mid)',marginBottom:4}}>{intern.completedCount||0}/{intern.taskCount||0} tasks · {pct}%</div>
                          <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
                        </td>
                        <td>
                          <div style={{display:'flex',gap:6}}>
                            <button className="btn btn-sm btn-outline" onClick={() => openFeedback(intern)}>Feedback</button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteIntern(intern._id)}>Remove</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredInterns.length === 0 && <div style={{textAlign:'center',padding:40,color:'var(--mid)'}}>No interns found</div>}
            </div>
          </>
        )}

        {/* ── TASKS ── */}
        {view === 'tasks' && (
          <>
            <div className="page-header">
              <div className="section-header">
                <h1 className="page-title">Tasks</h1>
                <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>+ Create Task</button>
              </div>
            </div>
            <div style={{background:'rgba(200,169,110,0.08)',border:'1px solid rgba(200,169,110,0.15)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'var(--mid)'}}>
              💡 <strong style={{color:'var(--accent)'}}>Group Assignment:</strong> Tasks are assigned by Internship Type. All interns of that type automatically receive the task.
            </div>
            <div className="card">
              <table className="data-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Task</th>
                    <th style={{ width: '22%' }}>Internship Type</th>
                    <th style={{ width: '12%' }}>Priority</th>
                    <th style={{ width: '14%' }}>Deadline</th>
                    <th style={{ width: '10%' }}>Points</th>
                    <th style={{ width: '14%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => {
                    const count = interns.filter(i=>i.internshipType===task.internshipType).length;
                    return (
                      <tr key={task._id}>
                        <td>
                          <div style={{fontWeight:600}}>{task.title}</div>
                          <div style={{fontSize:11,color:'var(--mid)',marginTop:2}}>{task.description?.slice(0,60)}...</div>
                        </td>
                        <td>
                          <span style={{background:'rgba(200,169,110,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,border:'1px solid rgba(200,169,110,0.2)'}}>{task.internshipType}</span>
                          <div style={{fontSize:10,color:'var(--mid)',marginTop:3}}>→ {count} intern{count!==1?'s':''}</div>
                        </td>
                        <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                        <td style={{fontSize:12,color: new Date(task.deadline)<new Date()?'var(--danger)':'var(--mid)'}}>{new Date(task.deadline).toLocaleDateString()}</td>
                        <td style={{color:'var(--accent)',fontWeight:600}}>⭐ {task.points}</td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => deleteTask(task._id)}>Delete</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {tasks.length===0 && <div style={{textAlign:'center',padding:40,color:'var(--mid)'}}>No tasks yet. Create one above!</div>}
            </div>
          </>
        )}

        {/* ── REVIEW ── */}
        {view === 'review' && (
          <>
            <div className="page-header">
              <h1 className="page-title">Submission Review</h1>
              <p className="page-subtitle">{pendingReview.length} awaiting review</p>
            </div>
            {internTasks.filter(it=>['submitted','approved','rejected'].includes(it.status)).map(it => (
              <div key={it._id} className="card" style={{marginBottom:12,borderLeft:`3px solid ${it.status==='approved'?'var(--success)':it.status==='rejected'?'var(--danger)':'var(--warning)'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:8,flexWrap:'wrap'}}>
                      <span style={{fontWeight:700,fontSize:15}}>{it.task?.title}</span>
                      <span className={`badge badge-${it.status}`}>{it.status}</span>
                      <span style={{background:'rgba(200,169,110,0.1)',color:'var(--accent)',padding:'2px 8px',borderRadius:20,fontSize:11}}>{it.intern?.internshipType}</span>
                    </div>
                    <div style={{fontSize:13,color:'var(--mid)',marginBottom:6}}>👤 {it.intern?.name}</div>
                    {it.submissionNote && <p style={{fontSize:13,color:'rgba(223,208,184,0.7)',marginBottom:8}}>{it.submissionNote}</p>}
                    {it.submissionLink && <a href={it.submissionLink} target="_blank" rel="noreferrer" style={{fontSize:13,color:'var(--accent)'}}>🔗 View Submission →</a>}
                  </div>
                  {it.status === 'submitted' && (
                    <div style={{display:'flex',gap:8,marginLeft:16,flexShrink:0}}>
                      <button className="btn btn-sm" style={{background:'rgba(106,171,138,0.15)',color:'var(--success)',border:'1px solid rgba(106,171,138,0.3)'}} onClick={() => updateITStatus(it._id,'approved')}>✓ Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => updateITStatus(it._id,'rejected')}>✗ Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {internTasks.filter(it=>['submitted','approved','rejected'].includes(it.status)).length===0 && (
              <div className="card" style={{textAlign:'center',padding:60,color:'var(--mid)'}}>No submissions yet</div>
            )}
          </>
        )}

        {/* ── ANALYTICS ── */}
        {view === 'analytics' && (
          <>
            <div className="page-header"><h1 className="page-title">Analytics</h1></div>
            <div className="two-col" style={{marginBottom:24}}>
              <div className="card">
                <div className="section-title" style={{marginBottom:16}}>Interns by Type</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={typeStats}>
                    <XAxis dataKey="name" stroke="var(--mid)" fontSize={11} />
                    <YAxis stroke="var(--mid)" fontSize={11} />
                    <Tooltip contentStyle={{background:'var(--modal-bg)',border:'1px solid var(--border)',borderRadius:8,color:'var(--light)'}} />
                    <Bar dataKey="interns" fill="var(--accent)" name="Interns" radius={[4,4,0,0]} />
                    <Bar dataKey="tasks"   fill="var(--mid)"   name="Tasks"   radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="section-title" style={{marginBottom:16}}>Task Status Overview</div>
                <ResponsiveContainer width="100%" height={300}>   {/* ← increased height */}
                  <PieChart margin={{ top: 20, bottom: 5 }}>     {/* ← extra space at top */}
                    <Pie
                      data={[
                        { name: 'Pending',   value: internTasks.filter(it => it.status === 'pending').length },
                        { name: 'Progress',  value: internTasks.filter(it => it.status === 'in-progress').length },
                        { name: 'Submitted', value: internTasks.filter(it => it.status === 'submitted').length },
                        { name: 'Approved',  value: internTasks.filter(it => it.status === 'approved').length },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={renderCustomLabel}
                      labelLine={{
                        stroke: 'var(--mid)',
                        strokeWidth: 1,
                      }}
                    >
                      {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span style={{ color: 'var(--light)', fontSize: 11, marginRight: 14 }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Create Task Modal ── */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">Create Group Task</div>
            <div style={{background:'rgba(200,169,110,0.08)',border:'1px solid rgba(200,169,110,0.15)',borderRadius:8,padding:'10px 14px',marginBottom:20,fontSize:13,color:'var(--mid)'}}>
              💡 This task will be auto-assigned to ALL interns of the selected internship type.
            </div>
            <form onSubmit={createTask}>
              <div className="form-group"><label className="form-label">Task Title</label><input className="form-input" value={taskForm.title} onChange={e=>setTaskForm({...taskForm,title:e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={taskForm.description} onChange={e=>setTaskForm({...taskForm,description:e.target.value})} required /></div>
              <div className="form-group">
                <label className="form-label">Internship Type (Assign To)</label>
                <select className="form-select" value={taskForm.internshipType} onChange={e=>setTaskForm({...taskForm,internshipType:e.target.value})}>
                  {allTypes.map(t=><option key={t}>{t}</option>)}
                  <option value="__custom__">+ Custom Type</option>
                </select>
                {taskForm.internshipType==='__custom__' && (
                  <input className="form-input" style={{marginTop:8}} placeholder="Enter custom internship type" value={customType} onChange={e=>{setCustomType(e.target.value);setTaskForm({...taskForm,internshipType:e.target.value});}} />
                )}
                <div style={{fontSize:11,color:'var(--mid)',marginTop:5}}>
                  {interns.filter(i=>i.internshipType===taskForm.internshipType).length} interns will receive this task
                </div>
              </div>
              <div className="two-col">
                <div className="form-group"><label className="form-label">Deadline</label><input type="date" className="form-input" value={taskForm.deadline} onChange={e=>setTaskForm({...taskForm,deadline:e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Priority</label>
                  <select className="form-select" value={taskForm.priority} onChange={e=>setTaskForm({...taskForm,priority:e.target.value})}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="two-col">
                <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={taskForm.category} onChange={e=>setTaskForm({...taskForm,category:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Points</label><input type="number" className="form-input" value={taskForm.points} onChange={e=>setTaskForm({...taskForm,points:+e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">Resources / Links (optional)</label><input className="form-input" placeholder="https://docs.example.com" value={taskForm.resources} onChange={e=>setTaskForm({...taskForm,resources:e.target.value})} /></div>
              <div style={{display:'flex',gap:12,marginTop:8}}>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>Assign to Group</button>
                <button type="button" className="btn btn-outline" onClick={()=>setShowTaskModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Onboard Intern Modal ── */}
      {showInternModal && (
        <div className="modal-overlay" onClick={()=>setShowInternModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">Onboard New Intern</div>
            <form onSubmit={createIntern}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={internForm.name} onChange={e=>setInternForm({...internForm,name:e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={internForm.email} onChange={e=>setInternForm({...internForm,email:e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" value={internForm.password} onChange={e=>setInternForm({...internForm,password:e.target.value})} required /></div>
              <div className="form-group">
                <label className="form-label">Internship Type</label>
                <select className="form-select" value={internForm.internshipType} onChange={e=>setInternForm({...internForm,internshipType:e.target.value})}>
                  {allTypes.map(t=><option key={t}>{t}</option>)}
                </select>
                <div style={{fontSize:11,color:'var(--mid)',marginTop:5}}>
                  {tasks.filter(t=>t.internshipType===internForm.internshipType).length} existing tasks will be auto-assigned
                </div>
              </div>
              <div style={{display:'flex',gap:12,marginTop:8}}>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>Onboard Intern</button>
                <button type="button" className="btn btn-outline" onClick={()=>setShowInternModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Feedback Modal ── */}
      {showFbModal && selectedIntern && (
        <div className="modal-overlay" onClick={()=>setShowFbModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-title">Feedback for {selectedIntern.name}</div>
            <form onSubmit={submitFb}>
              <div className="form-group"><label className="form-label">Feedback Message</label><textarea className="form-textarea" value={fbForm.message} onChange={e=>setFbForm({...fbForm,message:e.target.value})} required style={{minHeight:100}} /></div>
              <div className="two-col">
                <div className="form-group"><label className="form-label">Rating (1-5)</label><input type="number" min="1" max="5" className="form-input" value={fbForm.rating} onChange={e=>setFbForm({...fbForm,rating:+e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Type</label>
                  <select className="form-select" value={fbForm.type} onChange={e=>setFbForm({...fbForm,type:e.target.value})}>
                    <option value="positive">Positive</option><option value="constructive">Constructive</option><option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>
              <div style={{display:'flex',gap:12}}>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>Send Feedback</button>
                <button type="button" className="btn btn-outline" onClick={()=>setShowFbModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}