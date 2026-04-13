// eslint-disable-next-line
const API = 'https://placevault.onrender.com';
// eslint-disable-next-line
const ADMIN_EMAIL = 'maharajmanasa@gmail.com';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, provider, signInWithPopup, signOut } from './firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [type, setType] = useState('fulltime');
  const [form, setForm] = useState({ company: '', role: '', ctc: '', stipend: '', duration: '', ppo: false, cgpa: '', branch: '', year: '', skills: '' });
  const [message, setMessage] = useState('');
  const [placements, setPlacements] = useState([]);
  const [adminPlacements, setAdminPlacements] = useState([]);

  useEffect(() => { auth.onAuthStateChanged(u => setUser(u)); }, []);

  useEffect(() => {
    if (page === 'insights') axios.get(`${API}/api/placements`).then(res => setPlacements(res.data));
    if (page === 'admin' && user?.email === ADMIN_EMAIL) axios.get(`${API}/api/placements/admin?email=${user.email}`).then(res => setAdminPlacements(res.data));
  }, [page, user]);

  const handleLogin = async () => { try { await signInWithPopup(auth, provider); } catch (err) { console.error(err); } };
  const handleLogout = () => signOut(auth);

  const handleSubmit = async () => {
    try {
      const data = { ...form, type, ctc: Number(form.ctc), stipend: Number(form.stipend), cgpa: Number(form.cgpa), year: Number(form.year), skills: form.skills.split(',').map(s => s.trim()) };
      await axios.post(`${API}/api/placements`, data);
      setMessage('Submitted! Pending approval.');
      setForm({ company: '', role: '', ctc: '', stipend: '', duration: '', ppo: false, cgpa: '', branch: '', year: '', skills: '' });
    } catch (err) { setMessage('Error submitting.'); }
  };

  const handleApprove = async (id) => {
    await axios.put(`${API}/api/placements/admin/approve/${id}?email=${user.email}`);
    setAdminPlacements(adminPlacements.map(p => p._id === id ? {...p, approved: true} : p));
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/api/placements/admin/delete/${id}?email=${user.email}`);
    setAdminPlacements(adminPlacements.filter(p => p._id !== id));
  };

  const fulltime = placements.filter(p => p.type === 'fulltime');
  const internships = placements.filter(p => p.type === 'internship');
  const companyChartData = Object.entries(fulltime.reduce((acc, p) => { acc[p.company] = (acc[p.company] || 0) + 1; return acc; }, {})).map(([name, count]) => ({ name, count }));
  const internshipChartData = Object.entries(internships.reduce((acc, p) => { acc[p.company] = (acc[p.company] || 0) + 1; return acc; }, {})).map(([name, count]) => ({ name, count }));
  const skillChartData = Object.entries(placements.reduce((acc, p) => { p.skills?.forEach(s => { acc[s] = (acc[s] || 0) + 1; }); return acc; }, {})).sort((a,b) => b[1]-a[1]).slice(0,8).map(([name, count]) => ({ name, count }));
  const ppoCount = internships.filter(p => p.ppo).length;

  if (!user) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Arial'}}>
      <h1 style={{color:'green'}}>🔒 PlaceVault</h1>
      <p style={{color:'#666',marginBottom:30}}>Anonymous placement & internship data for students</p>
      <button onClick={handleLogin} style={{padding:'12px 30px',background:'white',border:'2px solid #ddd',borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',gap:10,fontSize:16,boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
        <img src="https://www.google.com/favicon.ico" width="20" alt="Google" /> Sign in with Google
      </button>
      <p style={{color:'#999',marginTop:20,fontSize:12}}>No personal data stored.</p>
    </div>
  );

  return (
    <div style={{fontFamily:'Arial',maxWidth:800,margin:'0 auto',padding:20}}>
      <div style={{display:'flex',gap:10,marginBottom:30,borderBottom:'2px solid green',paddingBottom:10,alignItems:'center',flexWrap:'wrap'}}>
        <h2 style={{margin:0,color:'green'}}>🔒 PlaceVault</h2>
        <button onClick={() => setPage('home')} style={{marginLeft:'auto',padding:'8px 16px',cursor:'pointer',background:page==='home'?'green':'white',color:page==='home'?'white':'green',border:'1px solid green',borderRadius:4}}>Submit</button>
        <button onClick={() => setPage('insights')} style={{padding:'8px 16px',cursor:'pointer',background:page==='insights'?'green':'white',color:page==='insights'?'white':'green',border:'1px solid green',borderRadius:4}}>Insights</button>
        {user.email === ADMIN_EMAIL && <button onClick={() => setPage('admin')} style={{padding:'8px 16px',cursor:'pointer',background:page==='admin'?'red':'white',color:page==='admin'?'white':'red',border:'1px solid red',borderRadius:4}}>Admin</button>}
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <img src={user.photoURL} width="30" style={{borderRadius:'50%'}} alt="user" />
          <button onClick={handleLogout} style={{padding:'6px 12px',cursor:'pointer',background:'#ff4444',color:'white',border:'none',borderRadius:4,fontSize:12}}>Logout</button>
        </div>
      </div>

      {page === 'home' && (
        <div>
          <h3>Submit your placement anonymously</h3>
          <p style={{color:'#666',fontSize:14}}>Logged in as {user.email} — your identity is NOT stored</p>
          <div style={{marginBottom:16}}>
            <label style={{marginRight:20}}><input type="radio" value="fulltime" checked={type==='fulltime'} onChange={() => setType('fulltime')} /> Full-time</label>
            <label><input type="radio" value="internship" checked={type==='internship'} onChange={() => setType('internship')} /> Internship</label>
          </div>
          {['company','role','cgpa','branch','year'].map(field => (
            <input key={field} placeholder={field.toUpperCase()} style={{display:'block',width:'100%',margin:'8px 0',padding:'10px',boxSizing:'border-box',border:'1px solid #ddd',borderRadius:4}} value={form[field]} onChange={e => setForm({...form,[field]:e.target.value})} />
          ))}
          {type==='fulltime' && <input placeholder="CTC (in LPA)" style={{display:'block',width:'100%',margin:'8px 0',padding:'10px',boxSizing:'border-box',border:'1px solid #ddd',borderRadius:4}} value={form.ctc} onChange={e => setForm({...form,ctc:e.target.value})} />}
          {type==='internship' && <>
            <input placeholder="Stipend (per month)" style={{display:'block',width:'100%',margin:'8px 0',padding:'10px',boxSizing:'border-box',border:'1px solid #ddd',borderRadius:4}} value={form.stipend} onChange={e => setForm({...form,stipend:e.target.value})} />
            <input placeholder="Duration" style={{display:'block',width:'100%',margin:'8px 0',padding:'10px',boxSizing:'border-box',border:'1px solid #ddd',borderRadius:4}} value={form.duration} onChange={e => setForm({...form,duration:e.target.value})} />
            <label style={{display:'block',margin:'8px 0'}}><input type="checkbox" checked={form.ppo} onChange={e => setForm({...form,ppo:e.target.checked})} /> Got PPO?</label>
          </>}
          <input placeholder="SKILLS (comma separated)" style={{display:'block',width:'100%',margin:'8px 0',padding:'10px',boxSizing:'border-box',border:'1px solid #ddd',borderRadius:4}} value={form.skills} onChange={e => setForm({...form,skills:e.target.value})} />
          <button onClick={handleSubmit} style={{padding:'10px 24px',background:'green',color:'white',border:'none',cursor:'pointer',borderRadius:4,fontSize:16}}>Submit</button>
          {message && <p style={{color:'green'}}>{message}</p>}
        </div>
      )}

      {page === 'insights' && (
        <div>
          <h3>📊 Placement Insights</h3>
          <div style={{display:'flex',gap:20,marginBottom:20}}>
            <div style={{padding:16,background:'#f0fff0',borderRadius:8,flex:1,textAlign:'center'}}><h2 style={{margin:0,color:'green'}}>{fulltime.length}</h2><p style={{margin:0}}>Full-time</p></div>
            <div style={{padding:16,background:'#f0f0ff',borderRadius:8,flex:1,textAlign:'center'}}><h2 style={{margin:0,color:'blue'}}>{internships.length}</h2><p style={{margin:0}}>Internships</p></div>
            <div style={{padding:16,background:'#fff0f0',borderRadius:8,flex:1,textAlign:'center'}}><h2 style={{margin:0,color:'red'}}>{ppoCount}</h2><p style={{margin:0}}>PPOs</p></div>
          </div>
          <h4>Placement Companies</h4>
          <ResponsiveContainer width="100%" height={200}><BarChart data={companyChartData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="count" fill="green"/></BarChart></ResponsiveContainer>
          <h4>Internship Companies</h4>
          <ResponsiveContainer width="100%" height={200}><BarChart data={internshipChartData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="count" fill="blue"/></BarChart></ResponsiveContainer>
          <h4>Top Skills</h4>
          <ResponsiveContainer width="100%" height={250}><BarChart data={skillChartData} layout="vertical"><CartesianGrid strokeDasharray="3 3"/><XAxis type="number"/><YAxis dataKey="name" type="category" width={80}/><Tooltip/><Bar dataKey="count" fill="orange"/></BarChart></ResponsiveContainer>
        </div>
      )}

      {page === 'admin' && user.email === ADMIN_EMAIL && (
        <div>
          <h3>🛡️ Admin Panel</h3>
          <p style={{color:'#666'}}>Total: {adminPlacements.length} | Pending: {adminPlacements.filter(p => !p.approved).length}</p>
          {adminPlacements.map(p => (
            <div key={p._id} style={{border:`2px solid ${p.approved?'green':'orange'}`,borderRadius:8,padding:16,marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <strong>{p.company}</strong> — {p.role} ({p.type})<br/>
                  <span style={{fontSize:13,color:'#666'}}>Branch: {p.branch} | Year: {p.year} | CGPA: {p.cgpa}</span><br/>
                  <span style={{fontSize:13,color:'#666'}}>{p.type==='fulltime'?`CTC: ${p.ctc} LPA`:`Stipend: ₹${p.stipend}/month`}</span><br/>
                  <span style={{fontSize:12,color:'#999'}}>Skills: {p.skills?.join(', ')}</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {!p.approved && <button onClick={() => handleApprove(p._id)} style={{padding:'6px 14px',background:'green',color:'white',border:'none',borderRadius:4,cursor:'pointer'}}>✅ Approve</button>}
                  {p.approved && <span style={{color:'green',fontWeight:'bold'}}>✅ Approved</span>}
                  <button onClick={() => handleDelete(p._id)} style={{padding:'6px 14px',background:'red',color:'white',border:'none',borderRadius:4,cursor:'pointer'}}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
          {adminPlacements.length === 0 && <p>No submissions yet!</p>}
        </div>
      )}
    </div>
  );
}

export default App;