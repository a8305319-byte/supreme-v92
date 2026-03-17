import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Building2, Eye, Calculator, Truck, LogOut, Fingerprint, 
  UserPlus, Database, Settings2, LockKeyhole, Zap, ShieldAlert,
  MapPin, Camera, Radio
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, orderBy } from "firebase/firestore";

/**
 * === 系統併網配置 (老闆金鑰) ===
 */
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
  const [view, setView] = useState('login');
  const [role, setRole] = useState('sovereign');
  const [loginInput, setLoginInput] = useState({ phone: '', pwd: '' });
  const [drivers, setDrivers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // --- 核心維度矩陣狀態 (從雲端讀取) ---
  const [matrix, setMatrix] = useState({
    admin_rate_edit: false,
    gps_tracking: true,
    recruitment_portal: true,
    camera_auth: false
  });

  // 監聽雲端數據與矩陣設定
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

  // 切換矩陣開關並同步雲端
  const toggleMatrix = async (key) => {
    const newMatrix = { ...matrix, [key]: !matrix[key] };
    setMatrix(newMatrix);
    await setDoc(doc(db, "system", "matrix"), newMatrix);
  };

  const handleAddDriver = async (name, phone) => {
    if(!name || !phone) return alert("請輸入完整資料");
    setIsSaving(true);
    const pwd = `0${phone.slice(-4)}`;
    try {
      await setDoc(doc(db, "drivers", phone), { name, phone, pwd, timestamp: new Date() });
      alert(`雲端同步成功！金鑰：${pwd}`);
    } catch (e) { alert("寫入失敗，請檢查 Firestore 權限。"); }
    setIsSaving(false);
  };

  const handleLogin = () => {
    if (loginInput.phone === SYSTEM_AUTH.sovereign.phone && loginInput.pwd === SYSTEM_AUTH.sovereign.key) {
      setView('core'); setRole('sovereign');
    } else if (loginInput.phone === SYSTEM_AUTH.admin.phone && loginInput.pwd === SYSTEM_AUTH.admin.key) {
      setView('core'); setRole('admin');
    } else {
      const d = drivers.find(x => x.phone === loginInput.phone && x.pwd === loginInput.pwd);
      if (d) { setView('core'); setRole('sentinel'); }
      else alert("驗證金鑰錯誤。");
    }
  };

  if (view === 'login') return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-white">
      <Building2 size={64} className="text-cyan-400 mb-6" />
      <h1 className="text-4xl font-black mb-12 italic tracking-tighter uppercase">在地物流 <span className="text-cyan-400">有限公司</span></h1>
      <div className="w-full max-w-sm space-y-4">
        <input type="text" placeholder="手機" className="w-full bg-white/10 p-5 rounded-2xl outline-none" onChange={e => setLoginInput({...loginInput, phone: e.target.value})} />
        <input type="password" placeholder="金鑰" className="w-full bg-white/10 p-5 rounded-2xl outline-none" onChange={e => setLoginInput({...loginInput, pwd: e.target.value})} />
        <button onClick={handleLogin} className="w-full py-5 rounded-2xl bg-cyan-500 font-black">啟動主權認證</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-40 font-sans overflow-y-auto">
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black italic tracking-widest uppercase">
          <Radio size={12} className="animate-pulse" /> 雲端防禦鏈路已連線
        </div>
        <button onClick={() => setView('login')} className="p-2 bg-white/5 rounded-full"><LogOut size={16} /></button>
      </header>

      <main className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center">
          <h2 className="text-xl font-black italic text-white/90">
            {role === 'sovereign' ? '指揮官中心' : (role === 'admin' ? '稽核中心' : '數據終端')}
          </h2>
          <p className="text-[10px] opacity-30 mt-2 font-bold uppercase tracking-widest italic">ALPHA CORE V3.0 DEPLOYMENT</p>
        </div>

        {/* 選項 2 核心：維度防禦矩陣 (僅老闆可見) */}
        {role === 'sovereign' && (
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
             <h3 className="text-xs font-black text-rose-500 flex items-center gap-2 uppercase tracking-widest">
               <Settings2 size={16}/> 系統維度防禦矩陣
             </h3>
             <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'admin_rate_edit', label: '授權會計修改設定', icon: LockKeyhole },
                  { key: 'gps_tracking', label: '啟動全域定位追蹤', icon: MapPin },
                  { key: 'recruitment_portal', label: '對外招募入口開放', icon: UserPlus },
                  { key: 'camera_auth', label: '強制開啟相機權限', icon: Camera }
                ].map(item => (
                  <div key={item.key} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className={matrix[item.key] ? 'text-cyan-400' : 'text-white/20'} />
                      <span className={`text-xs font-bold ${matrix[item.key] ? 'text-white' : 'text-white/40'}`}>{item.label}</span>
                    </div>
                    <button 
                      onClick={() => toggleMatrix(item.key)}
                      className={`w-12 h-6 rounded-full relative transition-all ${matrix[item.key] ? 'bg-cyan-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${matrix[item.key] ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* 稽核端介面：受矩陣控制 */}
        {role === 'admin' && (
          <div className="relative">
             {!matrix.admin_rate_edit && (
               <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center p-6 text-center">
                  <ShieldAlert size={32} className="text-rose-500 mb-2" />
                  <p className="text-rose-500 font-black text-xs uppercase tracking-widest leading-relaxed">權限已由指揮官鎖定<br/>目前僅供讀取</p>
               </div>
             )}
             <div className="bg-white/5 border border-cyan-500/20 rounded-[2rem] p-8 space-y-4">
                <h3 className="text-xs font-black text-cyan-400 flex items-center gap-2 uppercase tracking-widest"><UserPlus size={16}/> 夥伴錄入程序</h3>
                <input id="new_name" placeholder="人員姓名" className="w-full bg-black/40 p-5 rounded-2xl text-sm" disabled={!matrix.admin_rate_edit} />
                <input id="new_phone" placeholder="連絡電話" className="w-full bg-black/40 p-5 rounded-2xl text-sm" disabled={!matrix.admin_rate_edit} />
                <button onClick={() => handleAddDriver(document.getElementById('new_name').value, document.getElementById('new_phone').value)} className="w-full py-5 bg-cyan-600 text-white rounded-2xl font-black uppercase tracking-widest" disabled={!matrix.admin_rate_edit || isSaving}>確認提交</button>
             </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] pl-4">雲端名錄庫</h4>
          {drivers.map(d => (
            <div key={d.phone} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex justify-between">
              <div><p className="font-black text-white/80">{d.name}</p><p className="text-[10px] opacity-30">{d.phone}</p></div>
              <p className="text-[10px] text-cyan-500/50 font-black uppercase tracking-widest">Key: {d.pwd}</p>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-black/80 border border-white/10 backdrop-blur-3xl rounded-full p-2 flex justify-around shadow-2xl z-[100]">
        <button onClick={() => setRole('sovereign')} className="p-4"><Eye size={20} className={role === 'sovereign' ? 'text-cyan-400' : 'text-white/20'} /></button>
        <button onClick={() => setRole('admin')} className="p-4"><Calculator size={20} className={role === 'admin' ? 'text-amber-400' : 'text-white/20'} /></button>
        <button onClick={() => setRole('sentinel')} className="p-4"><Truck size={20} className={role === 'sentinel' ? 'text-emerald-400' : 'text-white/20'} /></button>
      </nav>
    </div>
  );
};

const container = document.getElementById('root');
if (container) { createRoot(container).render(<App />); }
