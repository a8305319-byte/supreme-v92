import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Truck, Database, Eye, Calculator, LogOut, UserPlus, Plus, X, 
  LockKeyhole, Radio, Fingerprint, Building2, TrendingUp, History
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, orderBy } from "firebase/firestore";

// --- Firebase 核心連網配置 ---
const firebaseConfig = {
  apiKey: "AIzaSyDfasGmYqUso1SajNSs71ZjNf9R343QViI",
  authDomain: "supreme-v92.firebaseapp.com",
  projectId: "supreme-v92",
  storageBucket: "supreme-v92.firebasestorage.app",
  messagingSenderId: "485530156296",
  appId: "1:485530156296:web:6728c0ee08b98dedd800bd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SYSTEM_AUTH = {
  sovereign: { phone: '0976017938', key: '8305319' },
  admin: { phone: '0988128172', key: '08172' }
};

// --- 模組組件：物流實體撥盤 ---
const LogisticsDial = ({ value, label, color, onChange, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef(null);
  const handleUpdate = (e) => {
    if (disabled || (!isDragging && e.type !== 'click')) return;
    const rect = dialRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches?.[0]?.clientX || 0);
    const clientY = e.clientY || (e.touches?.[0]?.clientY || 0);
    let angle = Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    onChange(Math.round((angle / 360) * 100));
  };
  return (
    <div className={`flex flex-col items-center gap-4 ${disabled ? 'opacity-20 pointer-events-none' : ''}`}>
      <div ref={dialRef} className="w-32 h-32 rounded-full border-2 relative cursor-pointer active:scale-95 touch-none"
           style={{ borderColor: color, boxShadow: `0 0 20px ${color}33`, transform: `rotate(${(value / 100) * 360}deg)` }}
           onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseMove={handleUpdate}
           onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} onTouchMove={handleUpdate}>
        <div className="w-2 h-6 absolute top-1.5 rounded-full left-1/2 -translate-x-1/2" style={{ background: color }}></div>
      </div>
      <div className="text-center">
        <p className="text-3xl font-black font-mono" style={{ color }}>{value}</p>
        <span className="text-[10px] uppercase tracking-tighter opacity-40 font-bold">{label}</span>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('login');
  const [role, setRole] = useState('sentinel');
  const [activeTab, setActiveTab] = useState('sovereign');
  const [loginInput, setLoginInput] = useState({ phone: '', pwd: '' });
  const [drivers, setDrivers] = useState([]);
  const [activeSentinel, setActiveSentinel] = useState(null);
  const [matrix, setMatrix] = useState({ admin_rate_edit: true, kill_switch: false, empire_dial: true });
  const [isAdding, setIsAdding] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '' });

  useEffect(() => {
    const q = query(collection(db, "drivers"), orderBy("timestamp", "desc"));
    const unsubDrivers = onSnapshot(q, (snap) => setDrivers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubMatrix = onSnapshot(doc(db, "system", "matrix"), (snap) => snap.exists() && setMatrix(snap.data()));
    return () => { unsubDrivers(); unsubMatrix(); };
  }, []);

  const handleLogin = (e) => {
    e?.preventDefault();
    if (loginInput.phone === SYSTEM_AUTH.sovereign.phone && loginInput.pwd === SYSTEM_AUTH.sovereign.key) {
      setRole('sovereign'); setActiveTab('sovereign'); setView('core');
    } else if (loginInput.phone === SYSTEM_AUTH.admin.phone && loginInput.pwd === SYSTEM_AUTH.admin.key) {
      setRole('admin'); setActiveTab('admin'); setView('core');
    } else {
      const d = drivers.find(x => x.phone === loginInput.phone && x.pwd === loginInput.pwd);
      if (d) { setActiveSentinel(d); setRole('sentinel'); setActiveTab('sentinel'); setView('core'); }
      else alert("身分授權失敗");
    }
  };

  if (view === 'login') return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
        <Building2 size={64} className="text-cyan-400 mx-auto mb-12" />
        <input type="text" placeholder="手機號碼" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-cyan-400 font-bold outline-none" onChange={e => setLoginInput({...loginInput, phone: e.target.value})} />
        <input type="password" placeholder="驗證金鑰" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-cyan-400 font-bold outline-none" onChange={e => setLoginInput({...loginInput, pwd: e.target.value})} />
        <button type="submit" className="w-full py-5 rounded-2xl bg-cyan-500 text-black font-black uppercase tracking-widest active:scale-95">啟動主權驗證</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-40 no-scrollbar overflow-x-hidden">
      <header className="flex justify-between items-center mb-10 max-w-xl mx-auto">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Alpha Core v3.0 | Synced</span>
        </div>
        <button onClick={() => setView('login')} className="p-3 bg-white/5 border border-white/10 rounded-full"><LogOut size={18} /></button>
      </header>

      <main className="max-w-xl mx-auto space-y-8">
        {/* --- 模組 1：指揮官中心 (人員錄入) --- */}
        {activeTab === 'sovereign' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-white/60 uppercase">人員錄入系統</h3>
                <button onClick={() => setIsAdding(!isAdding)} className="p-2 bg-white/10 rounded-full">{isAdding ? <X size={16}/> : <Plus size={16}/>}</button>
              </div>
              {isAdding && (
                <div className="space-y-4 pt-4 animate-in zoom-in-95 duration-200">
                  <input placeholder="人員姓名" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl outline-none" onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
                  <input placeholder="連結電話" className="w-full bg-black/50 border border-white/10 p-4 rounded-xl outline-none" onChange={e => setNewDriver({...newDriver, phone: e.target.value})} />
                  <button onClick={async () => {
                    await setDoc(doc(db, "drivers", newDriver.phone), { name: newDriver.name, phone: newDriver.phone, pwd: `0${newDriver.phone.slice(-4)}`, timestamp: new Date(), delivered: 0 });
                    setIsAdding(false);
                  }} className="w-full py-4 bg-cyan-500 text-black font-black rounded-xl">同步到雲端大腦</button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">實時人員名單</h3>
              {drivers.map(d => (
                <div key={d.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center">
                  <div><p className="text-lg font-black">{d.name}</p><p className="text-[10px] opacity-40 font-mono">{d.phone}</p></div>
                  <div className="text-right">
                    <p className="text-xs font-black text-cyan-400">KEY: {d.pwd}</p>
                    <p className="text-[10px] opacity-40 italic">已同步</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 模組 2：稽核中心 (全系統開關 + 薪資計算) --- */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-zinc-900 border border-amber-500/20 p-10 rounded-[2.5rem]">
              <h2 className="text-3xl font-black italic text-amber-400 mb-8">維度防禦矩陣</h2>
              <div className="space-y-4">
                {Object.keys(matrix).map(k => (
                  <div key={k} className="flex justify-between items-center p-5 bg-black/40 rounded-3xl border border-white/5">
                    <span className="text-xs font-bold uppercase text-white/70">{k.replace(/_/g, ' ')}</span>
                    <button onClick={async () => {
                      const v = !matrix[k];
                      await setDoc(doc(db, "system", "matrix"), {...matrix, [k]: v});
                    }} className={`w-12 h-6 rounded-full relative transition-all ${matrix[k] ? 'bg-cyan-500 shadow-[0_0_15px_#22d3ee]' : 'bg-white/10'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${matrix[k] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-emerald-500/10">
              <h3 className="text-xs font-black text-emerald-400 mb-6 uppercase tracking-widest">實時結算 (費率: 12/件)</h3>
              {drivers.map(d => (
                <div key={d.id} className="flex justify-between items-center mb-4 p-4 bg-black/30 rounded-2xl border border-white/5">
                  <span className="font-bold">{d.name}</span>
                  <span className="font-mono text-emerald-400 font-black text-lg">${((d.delivered || 0) * 12).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 模組 3：物流端 (實體撥盤數據輸入) --- */}
        {activeTab === 'sentinel' && (
          <div className="space-y-12 animate-in fade-in duration-500 pt-10">
            <div className="flex flex-col items-center gap-16">
               <LogisticsDial value={activeSentinel?.delivered || 0} label="配送完成件數" color="#22d3ee" disabled={!matrix.empire_dial} 
                              onChange={async (v) => {
                                if (activeSentinel) {
                                  await setDoc(doc(db, "drivers", activeSentinel.phone), { ...activeSentinel, delivered: v });
                                }
                              }} />
            </div>
            <div className="p-8 bg-white/5 rounded-3xl text-center border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Alpha Sentinel Data Link Active</p>
            </div>
          </div>
        )}
      </main>

      {/* --- 導航列 --- */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-zinc-950/90 border border-white/10 backdrop-blur-3xl rounded-full p-2 flex justify-around shadow-2xl z-50">
        <button onClick={() => setActiveTab('sovereign')} className={`flex-1 py-4 rounded-full flex flex-col items-center gap-1 transition-all ${activeTab === 'sovereign' ? 'bg-white/10 opacity-100' : 'opacity-20'}`}><Eye size={20} className="text-cyan-400" /><span className="text-[8px] font-black">中心</span></button>
        <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 rounded-full flex flex-col items-center gap-1 transition-all ${activeTab === 'admin' ? 'bg-white/10 opacity-100' : 'opacity-20'}`}><Calculator size={20} className="text-amber-400" /><span className="text-[8px] font-black">稽核</span></button>
        <button onClick={() => setActiveTab('sentinel')} className={`flex-1 py-4 rounded-full flex flex-col items-center gap-1 transition-all ${activeTab === 'sentinel' ? 'bg-white/10 opacity-100' : 'opacity-20'}`}><Truck size={20} className="text-emerald-400" /><span className="text-[8px] font-black">物流</span></button>
      </nav>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
