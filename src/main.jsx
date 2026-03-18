import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShieldCheck, Truck, Activity, RefreshCcw, 
  BarChart3, AlertCircle, Database, CheckCircle2, Camera, 
  Key, Fingerprint, Lock, Eye, Zap, MessageSquare,
  Settings2, UserPlus, MapPin, Calculator, Send, X, Coins,
  ShieldAlert, LockKeyhole, UserCog, Headset, 
  Briefcase, Ghost, Monitor, LogOut, Users, Bell, Sparkles, Megaphone,
  Building2, BadgeDollarSign, ShieldX, ClipboardCheck, History, Radio, FileWarning,
  ChevronRight, TrendingUp, Plus, Trash2
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfasGmYqUso1SajNSs71ZjNf9R343QViI",
  authDomain: "supreme-v92.firebaseapp.com",
  projectId: "supreme-v92",
  storageBucket: "supreme-v92.firebasestorage.app",
  messagingSenderId: "485530156296",
  appId: "1:485530156296:web:6728c0ee08b98dedd800bd",
  measurementId: "G-JF36CHXE9Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SYSTEM_AUTH = {
  sovereign: { phone: '0976017938', key: '8305319' }, 
  admin: { phone: '0988128172', key: '08172' }
};

const App = () => {
  const [view, setView] = useState('splash');
  const [role, setRole] = useState('sentinel');
  const [activeTab, setActiveTab] = useState('sovereign'); 
  const [loginInput, setLoginInput] = useState({ phone: '', pwd: '' });
  const [drivers, setDrivers] = useState([]);
  const [matrix, setMatrix] = useState({ admin_rate_edit: true, kill_switch: false, empire_dial: true, ai_audit_active: true });
  const [isAddingPersonnel, setIsAddingPersonnel] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '' });

  useEffect(() => {
    const q = query(collection(db, "drivers"), orderBy("timestamp", "desc"));
    const unsubDrivers = onSnapshot(q, (snap) => setDrivers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubMatrix = onSnapshot(doc(db, "system", "matrix"), (snap) => snap.exists() && setMatrix(snap.data()));
    return () => { unsubDrivers(); unsubMatrix(); };
  }, []);

  const handleLogin = (e) => {
    e?.preventDefault();
    const { phone, pwd } = loginInput;
    if (phone === SYSTEM_AUTH.sovereign.phone && pwd === SYSTEM_AUTH.sovereign.key) { 
      setRole('sovereign'); setActiveTab('sovereign'); setView('core'); 
    } else if (phone === SYSTEM_AUTH.admin.phone && pwd === SYSTEM_AUTH.admin.key) { 
      setRole('admin'); setActiveTab('admin'); setView('core'); 
    } else {
      const d = drivers.find(x => x.phone === phone && x.pwd === pwd);
      if (d) { setRole('sentinel'); setActiveTab('sentinel'); setView('core'); }
      else alert("身分授權失敗。");
    }
  };

  useEffect(() => { setTimeout(() => setView('login'), 2000); }, []);

  if (view === 'splash') return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      <Fingerprint size={80} className="text-cyan-400 animate-pulse mb-8" />
      <h2 className="text-xl font-black tracking-[0.5em] text-white uppercase italic">在地物流 ALPHA CORE</h2>
    </div>
  );

  if (view === 'login') return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        <Building2 size={64} className="text-cyan-400 mx-auto mb-8" />
        <input type="text" placeholder="主權手機號碼" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-cyan-400 font-bold outline-none focus:border-cyan-500" onChange={e => setLoginInput({...loginInput, phone: e.target.value})} />
        <input type="password" placeholder="認證金鑰" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-cyan-400 font-bold outline-none focus:border-cyan-500" onChange={e => setLoginInput({...loginInput, pwd: e.target.value})} />
        <button type="submit" className="w-full py-5 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest active:scale-95 transition-all">啟動主權驗證</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-40 no-scrollbar overflow-x-hidden">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Alpha Core v3.0 | Synced</span>
        </div>
        <button onClick={() => setView('login')} className="p-3 bg-white/5 border border-white/10 rounded-full active:scale-90"><LogOut size={18} /></button>
      </header>

      <main className="max-w-xl mx-auto space-y-8">
        {/* --- 指揮官中心 --- */}
        {activeTab === 'sovereign' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-cyan-500/30 p-8 rounded-[2.5rem] flex items-center justify-between">
              <div><p className="text-[10px] text-cyan-400/50 uppercase tracking-widest font-bold">Authenticated</p><h2 className="text-3xl font-black italic">指揮官中心</h2></div>
              <Eye size={36} className="text-cyan-400" />
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-white/60 uppercase">錄入新夥伴</h3>
                <button onClick={() => setIsAddingPersonnel(!isAddingPersonnel)} className="p-2 bg-white/10 rounded-full">{isAddingPersonnel ? <X size={16}/> : <Plus size={16}/>}</button>
              </div>
              {isAddingPersonnel && (
                <div className="space-y-4 pt-4">
                  <input placeholder="人員姓名" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl outline-none" onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
                  <input placeholder="連結電話" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl outline-none" onChange={e => setNewDriver({...newDriver, phone: e.target.value})} />
                  <button onClick={async () => {
                    await setDoc(doc(db, "drivers", newDriver.phone), { name: newDriver.name, phone: newDriver.phone, pwd: `0${newDriver.phone.slice(-4)}`, timestamp: new Date(), delivered: 0, returned: 0 });
                    setIsAddingPersonnel(false);
                  }} className="w-full py-4 bg-cyan-500 text-black font-black rounded-xl uppercase">確認提交到雲端資料庫</button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">雲端人員名錄</h3>
              {drivers.map(d => (
                <div key={d.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center">
                  <div><p className="text-lg font-black">{d.name}</p><p className="text-[10px] opacity-40 font-mono">{d.phone}</p></div>
                  <div className="text-right">
                    <p className="text-xs font-black text-cyan-400">KEY: {d.pwd}</p>
                    <p className="text-[10px] opacity-40">已送: {d.delivered || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 稽核中心 (功能全開開關) --- */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-zinc-900 border border-amber-500/30 p-10 rounded-[2.5rem] flex items-center justify-between">
              <h2 className="text-3xl font-black italic text-amber-400">稽核中心</h2>
              <Calculator size={36} className="text-amber-400" />
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-xs font-black text-rose-500 uppercase flex items-center gap-2"><LockKeyhole size={18}/> 維度防禦矩陣</h3>
              {Object.keys(matrix).map(k => (
                <div key={k} className="flex justify-between items-center p-5 bg-black/40 rounded-3xl border border-white/5">
                  <span className="text-xs font-bold uppercase">{k.replace(/_/g, ' ')}</span>
                  <div onClick={async () => { const v = !matrix[k]; await setDoc(doc(db, "system", "matrix"), {...matrix, [k]: v}); }} 
                       className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${matrix[k] ? 'bg-cyan-500 shadow-[0_0_10px_#22d3ee]' : 'bg-white/10'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${matrix[k] ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-amber-500/10">
               <h3 className="text-xs font-black text-amber-400 mb-6 uppercase tracking-widest">實時薪資核算 (費率: 12/件)</h3>
               {drivers.map(d => (
                 <div key={d.id} className="flex justify-between items-center mb-4 p-4 bg-black/20 rounded-2xl">
                    <span className="font-bold">{d.name}</span>
                    <span className="font-mono text-amber-400 font-black">${((d.delivered || 0) * 12).toLocaleString()}</span>
                 </div>
               ))}
            </div>
          </div>
        )}
      </main>

      {/* --- 底部導航 (修正後的切換邏輯) --- */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-zinc-950/90 border border-white/10 backdrop-blur-3xl rounded-full p-2 flex justify-around shadow-2xl z-50">
        <button onClick={() => setActiveTab('sovereign')} className={`flex-1 py-4 rounded-full flex flex-col items-center gap-1 transition-all ${activeTab === 'sovereign' ? 'bg-white/10 opacity-100' : 'opacity-20'}`}><Eye size={20} className="text-cyan-400" /><span className="text-[8px] font-black uppercase tracking-widest">中心</span></button>
        <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 rounded-full flex flex-col items-center gap-1 transition-all ${activeTab === 'admin' ? 'bg-white/10 opacity-100' : 'opacity-20'}`}><Calculator size={20} className="text-amber-400" /><span className="text-[8px] font-black uppercase tracking-widest">稽核</span></button>
        <button onClick={() => setActiveTab('sentinel')} className={`flex-1 py-4 rounded-full flex flex-col items-center gap-1 transition-all ${activeTab === 'sentinel' ? 'bg-white/10 opacity-100' : 'opacity-20'}`}><Truck size={20} className="text-emerald-400" /><span className="text-[8px] font-black uppercase tracking-widest">物流</span></button>
      </nav>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
