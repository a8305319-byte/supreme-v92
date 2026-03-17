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

// --- Firebase 核心併網 ---
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
  sovereign: { phone: '0976017938', key: '8305319' }, // 指揮官 (老闆)
  admin: { phone: '0988128172', key: '08172' }      // 合規稽核 (會計)
};

const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    :root {
      --oled-black: #000000;
      --glass-bg: rgba(255, 255, 255, 0.03);
      --glass-border: rgba(255, 255, 255, 0.08);
      --neon-cyan: #22d3ee;
      --neon-rose: #f43f5e;
      --neon-amber: #fbbf24;
      --neon-emerald: #10b981;
    }
    body {
      background-color: var(--oled-black);
      color: #ffffff;
      overflow: hidden;
      font-family: 'Inter', "Microsoft JhengHei", sans-serif;
      user-select: none;
    }
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(25px);
      border: 1px solid var(--glass-border);
      box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.9);
      border-radius: 2.5rem;
    }
    .btn-tactile:active { transform: scale(0.94); filter: brightness(1.2); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    
    @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
    .scanner-active::after {
      content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--neon-cyan); box-shadow: 0 0 25px var(--neon-cyan);
      animation: scanline 3s linear infinite; opacity: 0.4; z-index: 50; pointer-events: none;
    }

    .switch-matrix { width: 48px; height: 26px; background: rgba(255,255,255,0.1); border-radius: 13px; position: relative; cursor: pointer; transition: 0.3s; }
    .switch-matrix.active { background: var(--neon-cyan); box-shadow: 0 0 12px rgba(34,211,238,0.5); }
    .knob { width: 22px; height: 22px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.3s; }
    .switch-matrix.active .knob { left: 24px; }

    .manual-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 0.8rem; font-family: 'JetBrains Mono', monospace; color: var(--neon-cyan); font-size: 1.25rem; font-weight: 900; width: 100%; text-align: center; outline: none; transition: all 0.3s; }
    .manual-input:focus { border-color: var(--neon-cyan); background: rgba(34, 211, 238, 0.05); }

    .alert-pulse { border: 2px solid var(--neon-rose) !important; animation: alert-glow 1.5s infinite; }
    @keyframes alert-glow { 0%, 100% { box-shadow: 0 0 10px rgba(244, 63, 94, 0.2); } 50% { box-shadow: 0 0 30px rgba(244, 63, 94, 0.5); } }
  ` }} />
);

// --- 實體撥盤組件 ---
const EmpireDial = ({ value, label, color, onChange, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef(null);
  const handleUpdate = (e) => {
    if (disabled || (!isDragging && e.type !== 'click')) return;
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches?.[0]?.clientX || 0);
    const clientY = e.clientY || (e.touches?.[0]?.clientY || 0);
    let angle = Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    onChange(Math.round((angle / 360) * 150));
  };
  return (
    <div className={`flex flex-col items-center gap-4 ${disabled ? 'opacity-20 pointer-events-none' : ''}`}>
      <div ref={dialRef} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 relative cursor-pointer active:scale-95 touch-none"
           style={{ borderColor: color, boxShadow: `0 0 20px ${color}33`, transform: `rotate(${(value / 150) * 360}deg)` }}
           onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseMove={handleUpdate}
           onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} onTouchMove={handleUpdate}>
        <div className="w-1.5 h-6 absolute top-1.5 rounded-full left-1/2 -translate-x-1/2" style={{ background: color }}></div>
      </div>
      <div className="flex flex-col items-center">
        <input type="number" value={value} readOnly={disabled} onChange={(e) => onChange(parseInt(e.target.value) || 0)}
               className="bg-transparent text-3xl font-black font-mono text-center w-24 outline-none" style={{ color }} />
        <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-1">{label}</span>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('splash');
  const [role, setRole] = useState('sentinel');
  const [loginInput, setLoginInput] = useState({ phone: '', pwd: '' });
  const [drivers, setDrivers] = useState([]);
  const [activeSentinel, setActiveSentinel] = useState(null);
  const [matrix, setMatrix] = useState({ admin_rate_edit: false, empire_dial: true, kill_switch: false });
  const [isAddingPersonnel, setIsAddingPersonnel] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', insured: true });
  const [eraserProgress, setEraserProgress] = useState(0);
  const [isEraserHolding, setIsEraserHolding] = useState(false);
  const [bulletin, setBulletin] = useState("歡迎回到在地物流系統，請保持安全駕駛。");

  // 1. 雲端大腦同步
  useEffect(() => {
    const q = query(collection(db, "drivers"), orderBy("timestamp", "desc"));
    const unsubDrivers = onSnapshot(q, (snap) => setDrivers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubMatrix = onSnapshot(doc(db, "system", "matrix"), (snap) => snap.exists() && setMatrix(snap.data()));
    return () => { unsubDrivers(); unsubMatrix(); };
  }, []);

  // 2. 二代健保精算引擎
  const calculateSalary = (d) => {
    if (!d) return { real_payout: '0', supplement: '0' };
    const pieceBonus = ((d.delivered || 0) * 1.0) + ((d.returned || 0) * 0.5);
    const gross = 45000 + pieceBonus;
    const supplement = gross >= 20000 ? Math.round(gross * 0.0211) : 0;
    return {
      real_payout: (gross - supplement).toLocaleString(),
      supplement: supplement.toLocaleString()
    };
  };

  // 3. 主權驗證邏輯
  const handleLogin = () => {
    const { phone, pwd } = loginInput;
    if (phone === SYSTEM_AUTH.sovereign.phone && pwd === SYSTEM_AUTH.sovereign.key) { setRole('sovereign'); setView('core'); }
    else if (phone === SYSTEM_AUTH.admin.phone && pwd === SYSTEM_AUTH.admin.key) { setRole('admin'); setView('core'); }
    else {
      const d = drivers.find(x => x.phone === phone && x.pwd === pwd);
      if (d) { setActiveSentinel(d); setRole('sentinel'); setView('core'); }
      else alert("身分驗證失敗，主權未授權。");
    }
  };

  // 4. 神經橡皮擦重置邏輯
  useEffect(() => {
    let interval;
    if (isEraserHolding) {
      interval = setInterval(() => {
        setEraserProgress(p => {
          if (p >= 100) { setView('login'); return 0; }
          return p + 4;
        });
      }, 100);
    } else setEraserProgress(0);
    return () => clearInterval(interval);
  }, [isEraserHolding]);

  useEffect(() => { setTimeout(() => setView('login'), 2500); }, []);

  if (view === 'splash') return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center scanner-active overflow-hidden">
      <Fingerprint size={80} className="text-cyan-400 animate-pulse mb-8" />
      <h2 className="text-2xl font-black tracking-[0.6em] text-white/90 uppercase italic">在地物流有限公司</h2>
      <p className="text-[10px] text-cyan-500/50 mt-4 font-mono uppercase tracking-[0.3em]">ALPHA CORE V3.0 DEPLOYING...</p>
    </div>
  );

  if (view === 'login') return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 text-white">
      <Building2 size={64} className="text-cyan-400 mb-12" />
      <div className="w-full max-w-sm space-y-5 bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-3xl">
        <input type="text" placeholder="主權認證手機" className="manual-input" onChange={e => setLoginInput({...loginInput, phone: e.target.value})} />
        <input type="password" placeholder="認證金鑰" className="manual-input tracking-widest" onChange={e => setLoginInput({...loginInput, pwd: e.target.value})} />
        <button onClick={handleLogin} className="w-full py-5 rounded-2xl bg-cyan-500 text-white font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">啟動主權驗證</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-40 overflow-y-auto no-scrollbar">
      <GlobalStyles />
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">ALPHA CORE v3.0 | 已併網</span>
        </div>
        <button onClick={() => setView('login')} className="p-2 bg-white/5 rounded-full"><LogOut size={18} /></button>
      </header>

      <main className="space-y-8">
        {/* 狀態卡片 */}
        <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-10 flex items-center justify-between shadow-2xl">
          <div>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold mb-2">雲端狀態: 已連網</p>
            <h2 className="text-3xl font-black italic">
              {role === 'sovereign' ? '指揮官中心' : role === 'admin' ? '稽核終端' : `哨兵: ${activeSentinel?.name}`}
            </h2>
          </div>
          {role === 'sovereign' ? <Eye size={36} className="text-cyan-400" /> : role === 'admin' ? <Calculator size={36} className="text-amber-400" /> : <Truck size={36} className="text-emerald-400" />}
        </div>

        {/* 建檔模組 */}
        {(role === 'sovereign' || role === 'admin') && (
           <div className={`bg-white/5 border border-cyan-500/20 rounded-[2.5rem] p-8 transition-all ${isAddingPersonnel ? 'h-auto' : 'h-24 overflow-hidden'}`}>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2"><UserPlus size={16}/> 人員錄入模組</h3>
                <button onClick={() => setIsAddingPersonnel(!isAddingPersonnel)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all active:scale-90">{isAddingPersonnel ? <X size={16}/> : <Plus size={16}/>}</button>
             </div>
             {isAddingPersonnel && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <input placeholder="人員姓名" className="manual-input !text-sm" onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
                  <input placeholder="手機號碼" className="manual-input !text-sm" onChange={e => setNewDriver({...newDriver, phone: e.target.value})} />
                  <button onClick={async () => {
                    if(!newDriver.name || !newDriver.phone) return alert("資料不全");
                    const pwd = `0${newDriver.phone.slice(-4)}`;
                    await setDoc(doc(db, "drivers", newDriver.phone), { name: newDriver.name, phone: newDriver.phone, pwd, timestamp: new Date(), delivered: 0, returned: 0 });
                    alert(`雲端同步成功！該員金鑰為：${pwd}`);
                    setIsAddingPersonnel(false);
                  }} className="w-full py-5 bg-cyan-600 rounded-2xl font-black uppercase tracking-widest">確認並同步雲端</button>
                </div>
             )}
           </div>
        )}

        {/* 權限控制 (老闆專屬) */}
        {role === 'sovereign' && (
          <div className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-8 space-y-6 shadow-2xl">
            <h3 className="text-xs font-black text-rose-500 uppercase flex items-center gap-2 border-b border-white/5 pb-4"><LockKeyhole size={16}/> 核心維度防禦矩陣</h3>
            {[ { k: 'admin_rate_edit', l: '授權稽核修改費率' }, { k: 'kill_switch', l: '啟動全系統熔斷' }, { k: 'empire_dial', l: '哨兵實體撥盤授權' } ].map(item => (
              <div key={item.k} className="flex justify-between items-center p-5 bg-black rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-white/80 tracking-widest uppercase">{item.l}</span>
                <div onClick={async () => { const v = !matrix[item.k]; setMatrix({...matrix, [item.k]: v}); await setDoc(doc(db, "system", "matrix"), {...matrix, [item.k]: v}); }} className={`switch-matrix ${matrix[item.k] ? 'active' : ''}`}><div className="knob"></div></div>
              </div>
            ))}
          </div>
        )}

        {/* 薪資精算 (會計端) */}
        {role === 'admin' && (
          <div className="bg-zinc-900 border border-amber-500/20 rounded-[2.5rem] p-8 space-y-6 relative">
             {(!matrix.admin_rate_edit) && (
               <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-rose-500 p-8 text-center">
                 <ShieldAlert size={48} className="mb-4 animate-bounce" />
                 <h3 className="font-black text-lg italic uppercase">主權已鎖定</h3>
                 <p className="text-xs tracking-widest mt-2 opacity-50 font-bold uppercase">請洽指揮官開啟修改權限</p>
               </div>
             )}
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <p className="text-[9px] text-white/30 uppercase mb-2">二代健保代扣</p>
                  <p className="text-2xl font-black text-rose-500 font-mono">-${calculateSalary(drivers[0]).supplement}</p>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <p className="text-[9px] text-white/30 uppercase mb-2">實領金額</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">${calculateSalary(drivers[0]).real_payout}</p>
                </div>
             </div>
          </div>
        )}

        {/* 司機端交互 (整合 EmpireDial) */}
        {role === 'sentinel' && activeSentinel && (
          <div className="space-y-6 animate-in fade-in duration-700">
            <div className="bg-zinc-900 border border-amber-500/20 rounded-[2rem] p-6 mb-4 flex items-center gap-4">
               <Bell size={20} className="text-amber-500 animate-bounce" />
               <p className="text-sm font-bold italic leading-relaxed font-mono">"{bulletin}"</p>
            </div>
            <div className="bg-zinc-900 p-12 rounded-[2.5rem] flex justify-center gap-10 shadow-2xl border border-white/5">
              <EmpireDial value={activeSentinel.delivered || 0} label="今日配送" color="#22d3ee" disabled={!matrix.empire_dial} onChange={(v) => {}} />
              <EmpireDial value={activeSentinel.returned || 0} label="回收件數" color="#fbbf24" disabled={!matrix.empire_dial} onChange={(v) => {}} />
            </div>
            <button onMouseDown={() => setIsEraserHolding(true)} onMouseUp={() => setIsEraserHolding(false)} 
                    className="w-full relative overflow-hidden py-5 rounded-2xl border border-rose-500/20 text-rose-500/60 font-black text-[10px] tracking-[0.5em] uppercase active:scale-95 transition-all mt-4">
              <div className="absolute left-0 top-0 h-full bg-rose-500/30 transition-all duration-100" style={{ width: `${eraserProgress}%` }}></div>
              <span className="relative z-10 flex items-center justify-center gap-2"><RefreshCcw size={14}/> 長按 3s 啟動安全重置</span>
            </button>
          </div>
        )}
      </main>

      {/* 物理級隔離導航列：僅老闆渲染 */}
      {role === 'sovereign' && (
        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-zinc-900/90 border border-white/10 backdrop-blur-3xl rounded-full p-2.5 flex justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in slide-in-from-bottom duration-500">
          {[
            { id: 'sovereign', icon: Eye, color: 'text-cyan-400', label: '指揮' },
            { id: 'admin', icon: Calculator, color: 'text-amber-400', label: '稽核' },
            { id: 'sentinel', icon: Truck, color: 'text-emerald-400', label: '哨兵' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setRole(tab.id)} className={`flex-1 py-4 rounded-full flex flex-col items-center gap-1 transition-all duration-300 ${role === tab.id ? 'bg-white/10 scale-100 opacity-100' : 'opacity-20 scale-90'}`}>
              <tab.icon size={22} className={role === tab.id ? 'text-white' : 'text-white/40'} />
              <span className={`text-[9px] font-black uppercase tracking-tighter ${role === tab.id ? 'opacity-100' : 'opacity-0'}`}>{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
