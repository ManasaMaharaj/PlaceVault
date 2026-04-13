const API = "https://placevault.onrender.com";
const ADMIN_EMAIL = "maharajmanasa@gmail.com";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, provider, signInWithPopup, signOut } from './firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [type, setType] = useState('fulltime');
  const [form, setForm] = useState({
    company: '', role: '', ctc: '', stipend: '', duration: '', ppo: false,
    cgpa: '', branch: '', year: '', skills: ''
  });
  const [message, setMessage] = useState('');
  const [placements, setPlacements] = useState([]);

  useEffect(() => {
    auth.onAuthStateChanged(u => setUser(u));
  }, []);

  useEffect(() => {
    if (page === 'insights') {
      axios.get('http://localhost:3001/api/placements')
        .then(res => setPlacements(res.data));
    }
  }, [page]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        type,
        ctc: Number(form.ctc),
        stipend: Number(form.stipend),
        cgpa: Number(form.cgpa),
        year: Number(form.year),
        skills: form.skills.split(',').map(s => s.trim())
      };
      await axios.post('http://localhost:3001/api/placements', data);
      setMessage('Submitted successfully! Pending approval.');
      setForm({ company: '', role: '', ctc: '', stipend: '', duration: '', ppo: false, cgpa: '', branch: '', year: '', skills: '' });
    } catch (err) {
      setMessage('Error submitting. Try again.');
    }
  };

  const fulltime = placements.filter(p => p.type === 'fulltime');
  const internships = placements.filter(p => p.type === 'internship');
  const companyData = fulltime.reduce((acc, p) => { acc[p.company] = (acc[p.company] || 0) + 1; return acc; }, {});
  const companyChartData = Object.entries(companyData).map(([name, count]) => ({ name, count }));
  const internshipData = internships.reduce((acc, p) => { acc[p.company] = (acc[p.company] || 0) + 1; return acc; }, {});
  const internshipChartData = Object.entries(internshipData).map(([name, count]) => ({ name, count }));
  const skillData = placements.reduce((acc, p) => { p.skills?.forEach(s => { acc[s] = (acc[s] || 0) + 1; }); return acc; }, {});
  const skillChartData = Object.entries(skillData).sort((a,b) => b[1]-a[1]).slice(0,8).map(([name, count]) => ({ name, count }));
  const ppoCount = internships.filter(p => p.ppo).length;

  if (!user) {
    return (
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Arial'}}>
        <h1 style={{color:'green'}}>🔒 PlaceVault</h1>
        <p style={{color:'#666', marginBottom:30}}>Anonymous placement & internship data for students</p>
        <button onClick={handleLogin}
          style={{padding:'12px 30px', background:'white', border:'2px solid #ddd', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:16, boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
          <img src="https://www.google.com/favicon.ico" width="20" alt="Google" />
          Sign in with Google
        </button>
        <p style={{color:'#999', marginTop:20, fontSize:12}}>No personal data stored. Login only to prevent fake submissions.</p>
      </div>
    );
  }

  return (
    <div style={{fontFamily:'Arial', maxWidth:800, margin:'0 auto', padding:20}}>
      <div style={{display:'flex', gap:20, marginBottom:30, borderBottom:'2px solid green', paddingBottom:10, alignItems:'center'}}>
        <h2 style={{margin:0, color:'green'}}>🔒 PlaceVault</h2>
        <button onClick={() => setPage('home')} style={{marginLeft:'auto', padding:'8px 16px', cursor:'pointer', background: page==='home'?'green':'white', color: page==='home'?'white':'green', border:'1px solid green', borderRadius:4}}>Submit</button>
        <button onClick={() => setPage('insights')} style={{padding:'8px 16px', cursor:'pointer', background: page==='insights'?'green':'white', color: page==='insights'?'white':'green', border:'1px solid green', borderRadius:4}}>Insights</button>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <img src={user.photoURL} width="30" style={{borderRadius:'50%'}} alt="user" />
          <button onClick={handleLogout} style={{padding:'6px 12px', cursor:'pointer', background:'#ff4444', color:'white', border:'none', borderRadius:4, fontSize:12}}>Logout</button>
        </div>
      </div>

      {page === 'home' && (
        <div>
          <h3>Submit your placement anonymously</h3>
          <p style={{color:'#666', fontSize:14}}>Logged in as {user.email} — your identity is NOT stored with submissions</p>
          <div style={{marginBottom:16}}>
            <label style={{marginRight:20}}>
              <input type="radio" value="fulltime" checked={type==='fulltime'} onChange={() => setType('fulltime')} />
              {' '}Full-time Placement
            </label>
            <label>
              <input type="radio" value="internship" checked={type==='internship'} onChange={() => setType('internship')} />
              {' '}Internship
            </label>
          </div>
          {['company','role','cgpa','branch','year'].map(field => (
            <input key={field} placeholder={field.toUpperCase()}
              style={{display:'block', width:'100%', margin:'8px 0', padding:'10px', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:4}}
              value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} />
          ))}
          {type === 'fulltime' && (
            <input placeholder="CTC (in LPA)"
              style={{display:'block', width:'100%', margin:'8px 0', padding:'10px', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:4}}
              value={form.ctc} onChange={e => setForm({...form, ctc: e.target.value})} />
          )}
          {type === 'internship' && (
            <>
              <input placeholder="Stipend (per month in rupees)"
                style={{display:'block', width:'100%', margin:'8px 0', padding:'10px', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:4}}
                value={form.stipend} onChange={e => setForm({...form, stipend: e.target.value})} />
              <input placeholder="Duration (e.g. 2 months, 6 months)"
                style={{display:'block', width:'100%', margin:'8px 0', padding:'10px', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:4}}
                value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
              <label style={{display:'block', margin:'8px 0'}}>
                <input type="checkbox" checked={form.ppo} onChange={e => setForm({...form, ppo: e.target.checked})} />
                {' '}Got PPO (Pre-Placement Offer)?
              </label>
            </>
          )}
          <input placeholder="SKILLS (comma separated: React, Node, Python)"
            style={{display:'block', width:'100%', margin:'8px 0', padding:'10px', boxSizing:'border-box', border:'1px solid #ddd', borderRadius:4}}
            value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} />
          <button onClick={handleSubmit} style={{padding:'10px 24px', background:'green', color:'white', border:'none', cursor:'pointer', borderRadius:4, fontSize:16}}>
            Submit
          </button>
          {message && <p style={{color:'green'}}>{message}</p>}
        </div>
      )}

      {page === 'insights' && (
        <div>
          <h3>📊 Placement Insights</h3>
          <div style={{display:'flex', gap:20, marginBottom:20}}>
            <div style={{padding:16, background:'#f0fff0', borderRadius:8, flex:1, textAlign:'center'}}>
              <h2 style={{margin:0, color:'green'}}>{fulltime.length}</h2>
              <p style={{margin:0}}>Full-time Placements</p>
            </div>
            <div style={{padding:16, background:'#f0f0ff', borderRadius:8, flex:1, textAlign:'center'}}>
              <h2 style={{margin:0, color:'blue'}}>{internships.length}</h2>
              <p style={{margin:0}}>Internships</p>
            </div>
            <div style={{padding:16, background:'#fff0f0', borderRadius:8, flex:1, textAlign:'center'}}>
              <h2 style={{margin:0, color:'red'}}>{ppoCount}</h2>
              <p style={{margin:0}}>PPO Conversions</p>
            </div>
          </div>
          <h4>Placement Companies</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={companyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis /><Tooltip />
              <Bar dataKey="count" fill="green" />
            </BarChart>
          </ResponsiveContainer>
          <h4>Internship Companies</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={internshipChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis /><Tooltip />
              <Bar dataKey="count" fill="blue" />
            </BarChart>
          </ResponsiveContainer>
          <h4>Top Skills</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={skillChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} /><Tooltip />
              <Bar dataKey="count" fill="orange" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default App;
