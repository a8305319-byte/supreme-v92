import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Building2, Eye, Calculator, Truck, LogOut, Fingerprint, 
  UserPlus, Database, LockKeyhole, ShieldAlert,
  MapPin, Camera, Radio, TrendingUp, ChevronRight
} from 'lucide-react';

// --- Firebase 核心初始化 ---
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

// 核心主權與稽核金鑰
const SYSTEM_AUTH = {
  sovereign: { phone: '0976017938', key: '8305319' }, // 指揮官 (老闆)
  admin: { phone: '0988128172', key: '08172' }      // 稽核 (會計)
};

const App = () => {
  const [view, setView] = useState('login');
  const [role, setRole] = useState('sentinel'); 
  const [loginInput, setLoginInput] = useState({ phone: '', pwd: '' });
  const [drivers, setDrivers] = useState([]);
  const [activeSentinel, setActiveSentinel] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // 維度矩陣 states
  const [matrix, setMatrix] = useState({ admin_rate_edit: false, gps_tracking: true });

  // 1. 雲端大腦即時監聽
  useEffect(() => {
    const q = query(collection(db, "drivers"), orderBy("timestamp", "desc"));
    const unsubDrivers = onSnapshot(q, (snap) => {
      setDrivers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubMatrix = onSnapshot(doc(db, "system", "matrix"), (snap) => {
      if (snap.exists()) setMatrix(snap.data());
    });
    return () => { unsubDrivers(); unsubMatrix(); };
  }, []);

  // 2. 主權驗證引擎
  const handleLogin = () => {
    const { phone, pwd } = loginInput;
    if (phone === SYSTEM_AUTH.sovereign.phone && pwd === SYSTEM_AUTH.sovereign.key) {
      setRole('sovereign'); setView('core');
    } else if (phone === SYSTEM_AUTH.admin.phone && pwd === SYSTEM_AUTH.admin.key) {
      setRole('admin'); setView('core');
    } else {
      const d = drivers.find(x => x.phone === phone && x.pwd === pwd);
      if (d) { 
        setActiveSentinel(d);
        setRole('sentinel'); setView('core');
      } else {
        alert("驗證金鑰錯誤或主權身分未授權。");
      }
    }
  };

  // 3. 雲端資料寫入
  const handleAddDriver = async (name, phone) => {
    if(!name || !phone) return alert("請輸入完整資料");
    setIsSaving(true);
    const pwd = `0${phone.slice(-4)}`;
    try {
      await setDoc(doc(db, "drivers", phone), { name, phone, pwd, timestamp: new Date() });
      alert(`雲端同步成功！金鑰：${pwd}`);
    } catch (e) { alert("寫入失敗。"); }
    setIsSaving(false);
  };

  // --- 登入畫面 (OLED 玻璃擬態) ---
  if (view === 'login') return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-white font-sans overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 to-black pointer-events-none"></div>
      <div className="relative text-center z-10 w-full max-w-sm space-y-12">
        <div className="space-y-4">
          <Fingerprint size={80} className="text-cyan-400 mx-auto animate-pulse" />
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">在地物流 <span className="text-cyan-400">Alpha Core</span></h1>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.6em]">Sovereign Defense System v3.0</p>
        </div>
        <div className="space-y-5 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem]">
          <input type="text" placeholder="主權認證手機" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-cyan-500 text-cyan-200 text-sm font-mono" onChange={e => setLoginInput({...loginInput, phone: e.target.value})} />
          <input type="password" placeholder="認證金鑰" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-cyan-500 text-cyan-200 text-sm font-mono tracking-widest" onChange={e => setLoginInput({...loginInput, pwd: e.target.value})} />
          <button onClick={handleLogin} className="w-full py-5 rounded-2xl bg-cyan-500 text-white font-black uppercase tracking-widest shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all">啟動主權驗證</button>
        </div>
      </div>
    </div>
  );

  // --- 主介面 ---
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-40 font-sans overflow-y-auto no-scrollbar">
      <header className="flex justify-between items-center mb-10 pt-4 shrink-0">
        <div className="flex items-center gap-3">
          <Radio size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black italic tracking-[0.2em] uppercase text-white/40">ALPHA CORE v3.0 | 已連線到羅東端點</span>
        </div>
        <button onClick={() => setView('login')} className="p-3 bg-white/5 border border-white/10 rounded-full active:bg-white/10 transition-colors"><LogOut size={18} /></button>
      </header>

      <main className="space-y-8 animate-in fade-in duration-700">
        {/* 指揮官/稽核/哨兵 標頭卡片 */}
        <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 flex items-center justify-between shadow-2xl">
          <div>
            <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold mb-2">主權狀態：已併網同步</p>
            <h2 className="text-3xl font-black italic">
              {role === 'sovereign' ? '指揮官中心' : (role === 'admin' ? '稽核數據終端' : `哨兵: ${activeSentinel?.name}`)}
            </h2>
          </div>
          {role === 'sovereign' && <Eye size={36} className="text-cyan-400 opacity-80" />}
          {role === 'admin' && <Calculator size={36} className="text-amber-400 opacity-80" />}
          {role === 'sentinel' && <Truck size={36} className="text-emerald-400 opacity-80" />}
        </div>

        {/* 邏輯區域 1: 指揮官控制區 (僅 sovereign 渲染) */}
        {role === 'sovereign' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-white/10 rounded-[2rem] p-8">
              <h3 className="text-xs font-black text-rose-500 flex items-center gap-2.5 uppercase tracking-[0.2em] mb-6"><LockKeyhole size={18}/> 核心維度防禦矩陣</h3>
              <div className="flex justify-between items-center p-6 bg-black/60 rounded-3xl border border-white/5">
                <span className="text-sm font-bold text-white/80">授權會計(稽核)修改權限</span>
                <button 
                  onClick={async () => { const newVal = !matrix.admin_rate_edit; setMatrix({...matrix, admin_rate_edit: newVal}); await setDoc(doc(db, "system", "matrix"), {...matrix, admin_rate_edit: newVal}); }}
                  className={`w-14 h-7 rounded-full relative transition-all ${matrix.admin_rate_edit ? 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${matrix.admin_rate_edit ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] pl-4">雲端同步名冊 ({drivers.length})</h4>
              {drivers.map(d => (
                <div key={d.phone} className="bg-zinc-900/30 p-6 rounded-3xl border border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center font-black text-cyan-400">{d.name[0]}</div>
                    <div><p className="font-black text-lg text-white/90">{d.name}</p><p className="text-xs opacity-40 font-mono tracking-tighter">{d.phone}</p></div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Auth Key</p>
                    <p className="text-sm font-mono text-cyan-200">{d.pwd}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 邏輯區域 2: 稽核錄入區 (admin 可用, sovereign 也可用來輔助) */}
        {(role === 'admin' || role === 'sovereign') && (
          <div className={`transition-all duration-500 ${role === 'admin' ? 'block' : 'hidden'}`}>
            <div className="bg-zinc-900/50 border border-amber-500/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
               {role === 'admin' && !matrix.admin_rate_edit && (
                 <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                   <ShieldAlert size={48} className="text-rose-500 mb-4 animate-bounce" />
                   <h3 className="text-rose-500 font-black text-lg italic uppercase">主權已鎖定</h3>
                   <p className="text-white/40 text-xs mt-2 leading-relaxed tracking-widest">目前維度由指揮官控制<br/>稽核僅具備唯讀權限</p>
                 </div>
               )}
               <h3 className="text-xs font-black text-amber-400 flex items-center gap-2 uppercase tracking-widest"><Calculator size={16}/> 夥伴錄入程序</h3>
               <div className="space-y-4">
                  <input id="new_name" placeholder="人員姓名" className="w-full bg-black border border-white/5 p-5 rounded-2xl text-sm outline-none focus:border-amber-500/50 transition-all" />
                  <input id="new_phone" placeholder="連絡電話 (10碼)" className="w-full bg-black border border-white/5 p-5 rounded-2xl text-sm outline-none focus:border-amber-500/50 transition-all" />
                  <button onClick={() => handleAddDriver(document.getElementById('new_name').value, document.getElementById('new_phone').value)} className="w-full py-5 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-lg shadow-amber-500/20" disabled={isSaving}>{isSaving ? "同步雲端中..." : "確認提交存檔"}</button>
               </div>
            </div>
          </div>
        )}

        {/* 邏輯區域 3: 哨兵數據區 (sentinel 專用) */}
        {role === 'sentinel' && activeSentinel && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-zinc-900 p-8 rounded-[2rem] text-center border border-white/5">
                <p className="text-[10px] opacity-30 uppercase mb-2 tracking-widest font-bold">目前件數</p>
                <p className="text-4xl font-black text-emerald-400 font-mono italic">142</p>
              </div>
              <div className="bg-zinc-900 p-8 rounded-[2rem] text-center border border-white/5">
                <p className="text-[10px] opacity-30 uppercase mb-2 tracking-widest font-bold">預估利潤</p>
                <p className="text-4xl font-black text-cyan-400 font-mono italic">$1.2k</p>
              </div>
            </div>
            <div className="bg-zinc-900/50 border border-emerald-500/20 rounded-[2.5rem] p-10 flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-lg font-black italic">路上平安，{activeSentinel.name}</h4>
                <p className="text-xs text-white/30 tracking-tight">您的數據鏈路已由羅東中心加密連線。</p>
              </div>
              <TrendingUp size={40} className="text-emerald-500/30" />
            </div>
          </div>
        )}
      </main>

      {/* --- 權限隔離導航列：關鍵隔離點 --- */}
      {role === 'sovereign' && (
        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-zinc-900/90 border border-white/10 backdrop-blur-3xl rounded-full p-2.5 flex justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100]">
          {[
            { id: 'sovereign', icon: Eye, color: 'text-cyan-400', label: '指揮' },
            { id: 'admin', icon: Calculator, color: 'text-amber-400', label: '稽核' },
            { id: 'sentinel', icon: Truck, color: 'text-emerald-400', label: '哨兵' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setRole(tab.id)} className={`flex-1 py-4 rounded-full flex flex-col items-center gap-1 transition-all duration-300 ${role === tab.id ? 'bg-white/10 scale-100' : 'opacity-20 scale-90'}`}>
              <tab.icon size={22} className={role === tab.id ? tab.color : 'text-white'} />
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
