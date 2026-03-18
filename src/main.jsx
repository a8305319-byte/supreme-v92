import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Eye, Calculator, Truck, ShieldAlert, Megaphone, 
  UserPlus, Radio, LockKeyhole, X, Plus, TrendingUp, ChevronRight
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, orderBy } from "firebase/firestore";

// --- Firebase 核心連網 ---
const firebaseConfig = { apiKey: "AIzaSyDfasGmYqUso1SajNSs71ZjNf9R343QViI", authDomain: "supreme-v92.firebaseapp.com", projectId: "supreme-v92", storageBucket: "supreme-v92.firebasestorage.app", messagingSenderId: "485530156296", appId: "1:485530156296:web:6728c0ee08b98dedd800bd" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 物理級 UI 組件 ---
const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-[#111] bg-opacity-40 backdrop-blur-xl border border-white border-opacity-10 rounded-[2.5rem] shadow-2xl p-8 ${className}`}>
    {children}
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('admin'); 
  const [matrix, setMatrix] = useState({ kill_switch: false, empire_dial: true });
  const [drivers, setDrivers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '' });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system", "matrix"), (snap) => snap.exists() && setMatrix(snap.data()));
    const q = query(collection(db, "drivers"), orderBy("timestamp", "desc"));
    const unsubDrivers = onSnapshot(q, (snap) => setDrivers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    return () => { unsub(); unsubDrivers(); };
  }, []);

  return (
    <div className="min-h-screen bg-[#000] text-white p-6 pb-40 font-sans">
      {/* 頂部指令列 */}
      <header className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]" />
          <h1 className="text-xs font-black tracking-[0.4em] opacity-30 italic">SUPREME V92 CORE</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 bg-white/5 border border-red-500/20 text-red-400 rounded-full text-[10px] font-black uppercase">緊急熔斷</button>
          <button className="px-5 py-2 bg-cyan-500 text-black rounded-full text-[10px] font-black uppercase shadow-[0_0_15px_#22d3ee]">廣播指令</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* 決策數據核心：利潤/件數/穩定度 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="border-l-4 border-l-cyan-500">
            <p className="text-[10px] text-white/30 font-bold mb-1 uppercase tracking-widest">本週利潤預估</p>
            <div className="flex items-end gap-2">
              <h2 className="text-4xl font-black text-cyan-400">$11,675</h2>
              <TrendingUp size={16} className="text-cyan-400 mb-2" />
            </div>
          </GlassCard>
          <GlassCard className="border-l-4 border-l-amber-500">
            <p className="text-[10px] text-white/30 font-bold mb-1 uppercase tracking-widest">數據偏差案件</p>
            <h2 className="text-4xl font-black text-amber-500">0 <span className="text-xs opacity-20">待查</span></h2>
          </GlassCard>
          <GlassCard className="border-l-4 border-l-emerald-500">
            <p className="text-[10px] text-white/30 font-bold mb-1 uppercase tracking-widest">人事穩定度</p>
            <h2 className="text-4xl font-black text-emerald-400">92%</h2>
          </GlassCard>
        </section>

        {/* 核心內容切換區 */}
        {activeTab === 'admin' ? (
          <GlassCard className="border border-white/5">
            <div className="flex items-center gap-3 mb-10">
              <LockKeyhole className="text-cyan-400" size={24} />
              <h2 className="text-2xl font-black italic">決策核心 / 費率控制矩陣</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* 名錄與開關區 */}
              <div className="space-y-4">
                {drivers.map(d => (
                  <div key={d.id} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-white/20">USR</div>
                      <div>
                        <p className="font-black text-lg">{d.name}</p>
                        <p className="text-[10px] opacity-30 uppercase tracking-widest">勞健保已掛載</p>
                      </div>
                    </div>
                    {/* 實體發光開關 */}
                    <div onClick={async () => {
                      const v = !matrix.kill_switch;
                      await setDoc(doc(db, "system", "matrix"), {...matrix, kill_switch: v});
                    }} className={`w-14 h-7 rounded-full relative transition-all cursor-pointer ${matrix.kill_switch ? 'bg-cyan-500 shadow-[0_0_15px_#22d3ee]' : 'bg-white/10'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${matrix.kill_switch ? 'left-8' : 'left-1'}`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* 費率撥桿區 */}
              <div className="space-y-6">
                <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5">
                  <p className="text-[10px] font-black opacity-30 mb-6 uppercase tracking-widest">全局參數設定</p>
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2"><span className="text-xs font-bold">配送報價算</span><span className="text-cyan-400 font-mono">1.0</span></div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full"><div className="h-full w-[70%] bg-cyan-500 rounded-full shadow-[0_0_10px_#22d3ee]" /></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2"><span className="text-xs font-bold">回收報價算</span><span className="text-amber-500 font-mono">0.5</span></div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full"><div className="h-full w-[40%] bg-amber-500 rounded-full" /></div>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-cyan-500/5 border border-cyan-500/20 rounded-[2.5rem] flex justify-between items-center">
                  <div><p className="text-xs font-black">投保月額設定</p><p className="text-2xl font-black text-cyan-400">30000</p></div>
                  <ChevronRight className="opacity-20" />
                </div>
              </div>
            </div>
          </GlassCard>
        ) : (
          /* 指標分頁：人員錄入 */
          <div className="space-y-6 animate-in fade-in duration-500">
             <GlassCard>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black text-white/50 uppercase flex items-center gap-2"><UserPlus size={18}/> 錄入新夥伴</h3>
                  <button onClick={() => setIsAdding(!isAdding)} className="p-2 bg-white/5 rounded-full">{isAdding ? <X size={16}/> : <Plus size={16}/>}</button>
                </div>
                {isAdding && (
                  <div className="space-y-4 pt-4">
                    <input placeholder="人員姓名" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-cyan-400" onChange={e => setNewDriver({...newDriver, name: e.target.value})} />
                    <input placeholder="連結電話" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-cyan-400" onChange={e => setNewDriver({...newDriver, phone: e.target.value})} />
                    <button onClick={async () => {
                      await setDoc(doc(db, "drivers", newDriver.phone), { name: newDriver.name, phone: newDriver.phone, pwd: `0${newDriver.phone.slice(-4)}`, timestamp: new Date(), delivered: 0 });
                      setIsAdding(false);
                    }} className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl uppercase tracking-widest shadow-[0_0_20px_#22d3ee]">確認同步到雲端大腦</button>
                  </div>
                )}
             </GlassCard>
          </div>
        )}
      </main>

      {/* 底部導航列：膠囊設計 */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-zinc-950/80 border border-white/10 backdrop-blur-3xl rounded-full p-2.5 flex justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
        {[
          { id: 'sovereign', icon: Eye, label: '決策指標' },
          { id: 'admin', icon: Calculator, label: '合規稽核' },
          { id: 'sentinel', icon: Truck, label: '哨兵終端' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                  className={`flex-1 py-4 rounded-full flex flex-col items-center gap-1 transition-all duration-500 ${activeTab === tab.id ? 'bg-white text-black scale-100' : 'opacity-20 scale-90'}`}>
            <tab.icon size={20} />
            <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
