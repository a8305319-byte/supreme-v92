import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Building2, Eye, Calculator, Truck, LogOut, Fingerprint, UserPlus, Database
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, orderBy } from "firebase/firestore";

// --- 您的 Firebase 配置 (已校對) ---
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

  useEffect(() => {
    const q = query(collection(db, "drivers"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDrivers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAddDriver = async (name, phone) => {
    if(!name || !phone) return alert("請輸入完整資料");
    setIsSaving(true);
    const pwd = `0${phone.slice(-4)}`;
    try {
      await setDoc(doc(db, "drivers", phone), { name, phone, pwd, timestamp: new Date() });
      alert(`雲端同步成功！金鑰：${pwd}`);
    } catch (e) { alert("請確認 Firestore 規則已開啟。"); }
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
      <h1 className="text-4xl font-black mb-12 italic">在地物流 <span className="text-cyan-400">有限公司</span></h1>
      <div className="w-full max-w-sm space-y-4">
        <input type="text" placeholder="手機" className="w-full bg-white/10 p-5 rounded-2xl" onChange={e => setLoginInput({...loginInput, phone: e.target.value})} />
        <input type="password" placeholder="金鑰" className="w-full bg-white/10 p-5 rounded-2xl" onChange={e => setLoginInput({...loginInput, pwd: e.target.value})} />
        <button onClick={handleLogin} className="w-full py-5 rounded-2xl bg-cyan-500 font-black">啟動主權認證</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-32">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black italic tracking-widest uppercase">雲端大腦已連線</div>
        <button onClick={() => setView('login')}><LogOut size={16} /></button>
      </header>
      <main className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center">
          <h2 className="text-xl font-black italic">{role === 'sovereign' ? '指揮官中心' : '稽核中心'}</h2>
          <p className="text-[10px] opacity-30 mt-2 font-bold uppercase tracking-widest">目前雲端共存儲 {drivers.length} 名人員</p>
        </div>
        {(role === 'sovereign' || role === 'admin') && (
          <div className="bg-white/5 border border-cyan-500/20 rounded-[2rem] p-8 space-y-4">
            <h3 className="text-xs font-black text-cyan-400 flex items-center gap-2 uppercase tracking-widest"><UserPlus size={16}/> 錄入新進夥伴</h3>
            <input id="new_name" placeholder="人員姓名" className="w-full bg-black/40 p-5 rounded-2xl" />
            <input id="new_phone" placeholder="連絡電話" className="w-full bg-black/40 p-5 rounded-2xl" />
            <button onClick={() => handleAddDriver(document.getElementById('new_name').value, document.getElementById('new_phone').value)} className="w-full py-5 bg-cyan-600/20 border border-cyan-500/30 rounded-2xl font-black" disabled={isSaving}>{isSaving ? "同步中..." : "確認提交雲端"}</button>
          </div>
        )}
        <div className="space-y-3">
          {drivers.map(d => (
            <div key={d.phone} className="bg-white/5 p-5 rounded-2xl flex justify-between">
              <div><p className="font-black text-white/80">{d.name}</p><p className="text-[10px] opacity-30">{d.phone}</p></div>
              <p className="text-[10px] text-cyan-500/50 font-black">Key: {d.pwd}</p>
            </div>
          ))}
        </div>
      </main>
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-black/80 border border-white/10 backdrop-blur-3xl rounded-full p-2 flex justify-around">
        <button onClick={() => setRole('sovereign')} className="p-4"><Eye size={20} className={role === 'sovereign' ? 'text-cyan-400' : 'text-white/20'} /></button>
        <button onClick={() => setRole('admin')} className="p-4"><Calculator size={20} className={role === 'admin' ? 'text-amber-400' : 'text-white/20'} /></button>
        <button onClick={() => setRole('sentinel')} className="p-4"><Truck size={20} className={role === 'sentinel' ? 'text-emerald-400' : 'text-white/20'} /></button>
      </nav>
    </div>
  );
};

const container = document.getElementById('root');
if (container) { createRoot(container).render(<App />); }
