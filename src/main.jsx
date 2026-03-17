import React, { useState, useEffect, useMemo, useRef } from 'react';
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

// --- Firebase 雲端通訊層 ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

/**
 * === 系統核心授權規範 ===
 * 帳號：手機號碼
 * 密碼：0 + 手機後四位
 */
const SYSTEM_AUTH = {
  sovereign: { phone: '0976017938', key: '8305319' }, // 指揮官固定金鑰
  admin: { phone: '0988128172', key: '08172' }      // 合規稽核
};

/**
 * === GPT PART 1: STYLES & THEME ===
 * 視覺遺產：OLED 純黑、25px 玻璃擬態、霓虹脈衝
 */
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
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid var(--glass-border);
      box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.9);
      border-radius: 2.5rem;
    }
    .btn-tactile {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .btn-tactile:active { transform: scale(0.94); filter: brightness(1.2); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    
    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    .scanner-active::after {
      content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--neon-cyan); box-shadow: 0 0 25px var(--neon-cyan);
      animation: scanline 3s linear infinite; opacity: 0.4; z-index: 50;
      pointer-events: none;
    }

    .switch-matrix {
      width: 48px; height: 26px; background: rgba(255,255,255,0.1);
      border-radius: 13px; position: relative; cursor: pointer; transition: 0.3s;
    }
    .switch-matrix.active { background: var(--neon-cyan); box-shadow: 0 0 12px rgba(34,211,238,0.5); }
    .knob {
      width: 22px; height: 22px; background: white; border-radius: 50%;
      position: absolute; top: 2px; left: 2px; transition: 0.3s;
    }
    .switch-matrix.active .knob { left: 24px; }

    .manual-input {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1rem;
      padding: 0.8rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--neon-cyan);
      font-size: 1.25rem;
      font-weight: 900;
      width: 100%;
      text-align: center;
      outline: none;
      transition: all 0.3s;
    }
    .manual-input:focus { border-color: var(--neon-cyan); background: rgba(34, 211, 238, 0.05); }

    .checkbox-custom {
      width: 18px; height: 18px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .checkbox-custom.active { background: var(--neon-cyan); border-color: var(--neon-cyan); }
    
    .alert-pulse { border: 2px solid var(--neon-rose) !important; animation: alert-glow 1.5s infinite; }
    @keyframes alert-glow {
      0%, 100% { box-shadow: 0 0 10px rgba(244, 63, 94, 0.2); }
      50% { box-shadow: 0 0 30px rgba(244, 63, 94, 0.5); }
    }
  ` }} />
);

// --- 子組件：EmpireDial 實體撥盤 ---
const EmpireDial = ({ value, label, color, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef(null);
  const handleUpdate = (e) => {
    if (!isDragging && e.type !== 'click') return;
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    let angle = Math.atan2(clientY - (rect.top + rect.height / 2), clientX - (rect.left + rect.width / 2)) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    onChange(Math.round((angle / 360) * 150));
  };
  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={dialRef} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 relative cursor-pointer active:scale-95 touch-none"
           style={{ borderColor: color, boxShadow: `0 0 20px ${color}33`, transform: `rotate(${(value / 150) * 360}deg)` }}
           onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} onMouseMove={handleUpdate}
           onTouchStart={() => setIsDragging(true)} onTouchEnd={() => setIsDragging(false)} onTouchMove={handleUpdate}>
        <div className="w-1.5 h-6 absolute top-1.5 rounded-full left-1/2 -translate-x-1/2" style={{ background: color }}></div>
      </div>
      <div className="flex flex-col items-center">
        <input type="number" value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)}
               className="bg-transparent text-3xl font-black font-mono text-center w-24 outline-none" style={{ color }} />
        <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold mt-1">{label}</span>
      </div>
    </div>
  );
};

/**
 * === GPT PART 2: CORE LOGIC ===
 */
const App = () => {
  const [view, setView] = useState('splash');
  const [role, setRole] = useState('sovereign');
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBulletinOpen, setIsBulletinOpen] = useState(false);
  
  const [bulletin, setBulletin] = useState("歡迎回到在地物流系統，請保持安全駕駛。");
  const [tempBulletin, setTempBulletin] = useState("");
  const [eraserProgress, setEraserProgress] = useState(0);
  const [isEraserHolding, setIsEraserHolding] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);
  const [auditLogs, setAuditLogs] = useState([]);

  // --- 登入狀態 (LocalStorage 記住我) ---
  const [loginInput, setLoginInput] = useState({ 
    phone: typeof window !== 'undefined' ? localStorage.getItem('remembered_phone') || '' : '', 
    pwd: '', 
    remember: typeof window !== 'undefined' ? !!localStorage.getItem('remembered_phone') : false 
  });

  // --- 核心數據流 (drivers 列表需同步至雲端) ---
  const [drivers, setDrivers] = useState([
    { id: 'D-882', name: '林智強', phone: '0912345678', pwd: '05678', stability: 92, has_photo: true, delivered: 124, returned: 12, history_avg: 120, is_insured: true, insurance_base: 30000, person_count: 1, piece_unit_delivered: 1.0, piece_unit_returned: 0.5 },
    { id: 'D-773', name: '陳志明', phone: '0987654321', pwd: '04321', stability: 85, has_photo: false, delivered: 156, returned: 5, history_avg: 110, is_insured: true, insurance_base: 45800, person_count: 2, piece_unit_delivered: 1.2, piece_unit_returned: 0.8 }
  ]);
  const [selectedDriverId, setSelectedDriverId] = useState('D-882');
  const activeDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];

  // --- 權限矩陣開關 ---
  const [matrix, setMatrix] = useState({
    admin_rate_edit: false, kill_switch: false, gps_tracking: true, snapshot_pro: true, 
    empire_dial: true, recruitment_portal: true, hsm_audit: true, log_sync: true
  });

  // --- Firebase 配置與同步 ---
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'supreme-v92-enterprise';
  const db = useMemo(() => {
    if (typeof __firebase_config === 'undefined') return null;
    const app = initializeApp(JSON.parse(__firebase_config));
    return getFirestore(app);
  }, []);

  useEffect(() => {
    if (!db) return;
    const initAuth = async () => {
      const auth = getAuth();
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    onAuthStateChanged(getAuth(), setUser);

    // 監聽全局配置與日誌
    const configUnsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'system_config'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.matrix) setMatrix(d.matrix);
        if (d.bulletin) setBulletin(d.bulletin);
        if (d.logs) setAuditLogs(d.logs);
      }
    });

    // 監聽司機列表
    const driversUnsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'drivers_registry'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.list) setDrivers(d.list);
      }
    });

    return () => { configUnsub(); driversUnsub(); };
  }, [db]);

  const logAction = async (action, details) => {
    const newEntry = { time: new Date().toLocaleTimeString(), action, details, id: Math.random() };
    const updatedLogs = [newEntry, ...auditLogs].slice(0, 12);
    setAuditLogs(updatedLogs);
    if (db) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'system_config'), { logs: updatedLogs }, { merge: true });
  };

  const updateDriverData = async (id, field, value) => {
    const newList = drivers.map(d => d.id === id ? { ...d, [field]: value } : d);
    setDrivers(newList);
    if (db) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'drivers_registry'), { list: newList }, { merge: true });
  };

  const handleMatrixToggle = async (key) => {
    const newState = { ...matrix, [key]: !matrix[key] };
    setMatrix(newState);
    logAction(`維度變更: ${key}`, `狀態改為: ${newState[key] ? '啟用' : '關閉'}`);
    if (db) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'system_config'), { matrix: newState }, { merge: true });
  };

  const metrics = useMemo(() => {
    const d = activeDriver;
    const pieceBonus = (d.delivered * d.piece_unit_delivered) + (d.returned * d.piece_unit_returned);
    const baseWage = 45000;
    const gross = baseWage + pieceBonus;
    const supplement = gross >= 20000 ? gross * 0.0211 : 0;
    const labor = d.is_insured ? (d.insurance_base * 0.06 * d.person_count) : 0;
    const nhi = d.is_insured ? (d.insurance_base * 0.0211 * d.person_count) : 0;
    const total_shadow = gross + labor + nhi + 3200;
    const deviation = d.history_avg > 0 ? (Math.abs(d.delivered - d.history_avg) / d.history_avg) : 0;
    return {
      net: gross.toLocaleString(),
      real_payout: Math.round(gross - supplement).toLocaleString(),
      shadow: Math.round(total_shadow).toLocaleString(),
      margin: Math.round(total_shadow * 0.23).toLocaleString(),
      supplement: Math.round(supplement).toLocaleString(),
      isAnomaly: deviation > 0.20,
      deviation_percent: (deviation * 100).toFixed(1)
    };
  }, [activeDriver]);

  // --- 真人幕僚系統 ---
  const [staffRole, setStaffRole] = useState('aide');
  const staffProfiles = {
    aide: { title: "指揮官特助", icon: UserCog, color: "var(--neon-cyan)", greeting: `長官好，今日數據已彙整。司機隊列共有 ${drivers.length} 人。`, actions: ["彙整營運週報", "同步防禦環境"] },
    recruiter: { title: "招募專員", icon: Briefcase, color: "var(--neon-emerald)", greeting: "長官好，正在維護人才庫。人員建檔模組已上線。", actions: ["新增司機建檔"] },
    dispatcher: { title: "調度專員", icon: Headset, color: "var(--neon-amber)", greeting: `你好 ${activeDriver.name}，路上平安。有狀況隨時回報。`, actions: ["回報車輛異常", "忘記登入金鑰"] },
    engineer: { title: "IT 工程師", icon: Monitor, color: "var(--neon-cyan)", greeting: "數據鏈路穩定。權限防禦盾已開啟。", actions: ["導出操作日誌", "洗滌快取"] },
    butler: { title: "行政管家", icon: Ghost, color: "var(--neon-rose)", greeting: "中心環境已優化。", actions: ["隱私遮蔽模式", "系統安全重置"] }
  };

  useEffect(() => {
    setChatHistory([]);
    if (role === 'sentinel') setStaffRole('dispatcher');
    else if (role === 'admin') setStaffRole(matrix.recruitment_portal ? 'recruiter' : 'engineer');
    else if (role === 'sovereign') setStaffRole('aide');
  }, [role, matrix.recruitment_portal]);

  const handleSendMessage = (text = chatInput) => {
    if (!text.trim()) return;
    setChatHistory(prev => [...prev, { sender: 'user', text }]);
    setChatInput("");
    setTimeout(() => {
      let reply = "";
      if (text.includes("金鑰") || text.includes("忘記密碼")) {
        reply = `好的。已識別您的帳號。已將您的安全金鑰重置為預設格式：0+手機後四碼。請重新登入。`;
        logAction('金鑰重置', `幕僚為手機 ${activeDriver.phone.slice(-4)} 司機執行重置`);
      } else if (staffRole === 'dispatcher') {
        reply = `收到！已幫你立案並通知調度組長。請注意行車安全。`;
      } else {
        reply = `已收到指令：「${text}」。我們正在為您處理...`;
      }
      setChatHistory(prev => [...prev, { sender: 'staff', text: reply }]);
    }, 1000);
  };

  const handleLogin = () => {
    if (loginInput.remember) localStorage.setItem('remembered_phone', loginInput.phone);
    else localStorage.removeItem('remembered_phone');

    if (loginInput.phone === SYSTEM_AUTH.sovereign.phone && loginInput.pwd === SYSTEM_AUTH.sovereign.key) {
      setView('core'); setRole('sovereign'); setIsVerified(false); logAction('身分驗證', '指揮官通過主權認證');
    } 
    else if (loginInput.phone === SYSTEM_AUTH.admin.phone && loginInput.pwd === SYSTEM_AUTH.admin.key) {
      setView('core'); setRole('admin'); setIsVerified(false); logAction('系統登入', '稽核人員已連線');
    }
    else {
      const driver = drivers.find(d => d.phone === loginInput.phone && d.pwd === loginInput.pwd);
      if (driver) {
        setSelectedDriverId(driver.id); setView('core'); setRole('sentinel'); setIsVerified(false);
        logAction('司機登入', `${driver.name} 已進入終端`);
      } else alert("識別碼或金鑰錯誤。");
    }
  };

  useEffect(() => {
    let interval;
    if (isEraserHolding) {
      interval = setInterval(() => {
        setEraserProgress(p => {
          if (p >= 100) { setView('login'); logAction('緊急重置', '系統權限與會話已強制銷毀'); return 0; }
          return p + 4;
        });
      }, 100);
    } else setEraserProgress(0);
    return () => clearInterval(interval);
  }, [isEraserHolding]);

  // --- 人員建檔組件 (雙端共享) ---
  const [isAddingPersonnel, setIsAddingPersonnel] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', id: '', insured: true });
  const handleAddPersonnel = async () => {
    if (!newDriver.name || !newDriver.phone || !newDriver.id) return alert("請輸入完整資料");
    const defaultPwd = '0' + newDriver.phone.slice(-4); 
    const driverObj = {
      id: newDriver.id, name: newDriver.name, phone: newDriver.phone, pwd: defaultPwd,
      stability: 90, status: 'active', has_photo: false, delivered: 0, returned: 0,
      history_avg: 0, is_insured: newDriver.insured, insurance_base: newDriver.insured ? 30000 : 0,
      person_count: newDriver.insured ? 1 : 0, piece_unit_delivered: 1.0, piece_unit_returned: 0.5
    };
    const newList = [...drivers, driverObj];
    setDrivers(newList);
    logAction('人員建檔', `${newDriver.name} 已錄入，預設金鑰: ${defaultPwd}`);
    if (db) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'drivers_registry'), { list: newList }, { merge: true });
    setIsAddingPersonnel(false);
    setNewDriver({ name: '', phone: '', id: '', insured: true });
  };

  const PersonnelRegistry = () => (
    <GlassCard className={`p-8 border-cyan-500/20 mb-6 transition-all ${isAddingPersonnel ? 'h-auto' : 'h-20 overflow-hidden'}`}>
       <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <UserPlus size={14}/> 系統新進人員建檔模組
          </h3>
          <button onClick={() => setIsAddingPersonnel(!isAddingPersonnel)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
             {isAddingPersonnel ? <X size={14}/> : <Plus size={14}/>}
          </button>
       </div>
       {isAddingPersonnel && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-in slide-in-from-top-4 duration-300">
             <input placeholder="姓名" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} className="manual-input !text-sm !text-left" />
             <input placeholder="手機" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} className="manual-input !text-sm !text-left" />
             <input placeholder="工號" value={newDriver.id} onChange={e => setNewDriver({...newDriver, id: e.target.value})} className="manual-input !text-sm !text-left" />
             <div className="flex items-center gap-3 px-4 bg-white/5 rounded-xl border border-white/10">
                <div onClick={() => setNewDriver({...newDriver, insured: !newDriver.insured})} className={`checkbox-custom ${newDriver.insured ? 'active' : ''}`}>
                  {newDriver.insured && <CheckCircle2 size={12} className="text-black" />}
                </div>
                <span className="text-[10px] font-black text-white/40 uppercase">保險精算</span>
             </div>
             <button onClick={handleAddPersonnel} className="bg-cyan-600 text-white rounded-xl font-black text-xs uppercase tracking-widest btn-tactile h-[50px]">完成建檔</button>
          </div>
       )}
    </GlassCard>
  );

  // ==========================================
  // 各端渲染器
  // ==========================================
  const renderSovereign = () => (
    <div className="space-y-6 animate-in fade-in duration-700 pb-32 pt-6 px-4">
      <div className="flex justify-between items-center text-rose-500 uppercase tracking-tighter">
        <h2 className="text-2xl font-black italic">主權指揮核心</h2>
        <button onClick={() => setIsBulletinOpen(true)} className="btn-tactile bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase"><Megaphone size={14} /> 廣播指令</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-white">
        <div className="glass-card p-6 border-l-4 border-l-cyan-500/50"><p className="text-[10px] text-white/30 uppercase mb-1 font-mono tracking-widest">本週利潤預計</p><div className="text-3xl font-black font-mono text-cyan-400">${metrics.margin}</div></div>
        <div className={`glass-card p-6 border-l-4 ${metrics.isAnomaly ? 'alert-pulse border-l-rose-500' : 'border-l-amber-500/50'}`}><p className="text-[10px] text-white/30 uppercase mb-1 font-mono tracking-widest">待查異常數</p><div className="text-3xl font-black font-mono text-rose-500">{metrics.isAnomaly ? '1' : '0'} <span className="text-xs text-white/20 italic">件</span></div></div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500/50"><p className="text-[10px] text-white/30 uppercase mb-1 font-mono tracking-widest">在線司機</p><div className="text-3xl font-black font-mono text-emerald-400">{drivers.length} <span className="text-xs text-white/20 italic">員</span></div></div>
      </div>
      <PersonnelRegistry />
      <div className="glass-card p-8">
         <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
             <div className="flex items-center gap-2 text-white"><Users size={14}/> 司機人事與費率控制矩陣</div>
             <select value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-cyan-400 outline-none">
                 {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
             </select>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-white">
            <div className="space-y-6">
                <div className={`flex justify-between items-center p-4 rounded-2xl bg-black/40 border transition-all ${activeDriver.is_insured ? 'border-white/5' : 'border-rose-500/20 shadow-xl'}`}>
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeDriver.is_insured ? 'bg-cyan-500/10 text-cyan-400' : 'bg-rose-500/10 text-rose-400'}`}>{activeDriver.is_insured ? <ShieldCheck size={18}/> : <ShieldX size={18}/>}</div>
                      <div><p className="text-sm font-bold text-white/90">{activeDriver.name}</p><p className="text-[9px] text-white/20 uppercase tracking-widest">{activeDriver.is_insured ? '勞健保已投報' : '未投報外包'}</p></div>
                   </div>
                   <div onClick={() => updateDriverData(activeDriver.id, 'is_insured', !activeDriver.is_insured)} className={`switch-matrix ${activeDriver.is_insured ? 'active' : ''}`}><div className="knob"></div></div>
                </div>
                <div className={`grid grid-cols-2 gap-4 ${!activeDriver.is_insured ? 'opacity-20 pointer-events-none' : ''}`}>
                    <div className="space-y-2"><label className="text-[9px] text-white/40 uppercase font-bold">投保月額 (手動)</label><input type="number" value={activeDriver.insurance_base} onChange={e => updateDriverData(selectedDriverId, 'insurance_base', parseInt(e.target.value))} className="manual-input" /></div>
                    <div className="space-y-2"><label className="text-[9px] text-white/40 uppercase font-bold">加保人數</label><input type="number" value={activeDriver.person_count} onChange={e => updateDriverData(selectedDriverId, 'person_count', parseInt(e.target.value))} className="manual-input" /></div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-8">
               <div className="space-y-2"><label className="text-[9px] text-white/40 uppercase font-bold">配送單價 ($/件)</label><input type="number" step="0.05" value={activeDriver.piece_unit_delivered} onChange={e => updateDriverData(selectedDriverId, 'piece_unit_delivered', parseFloat(e.target.value))} className="manual-input" /></div>
               <div className="space-y-2"><label className="text-[9px] text-white/40 uppercase font-bold">回收單價 ($/件)</label><input type="number" step="0.05" value={activeDriver.piece_unit_returned} onChange={e => updateDriverData(selectedDriverId, 'piece_unit_returned', parseFloat(e.target.value))} className="manual-input !text-orange-400" /></div>
            </div>
         </div>
      </div>
      <div className="glass-card p-8 text-white">
         <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Settings2 size={14}/> 全系統維度防禦矩陣 (截圖補回)</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(matrix).filter(k=>k!=='kill_switch').map(key => (
              <div key={key} className="flex justify-between items-center p-3 rounded-2xl bg-black/40 border border-white/5">
                <span className="text-[10px] font-bold text-white/60 uppercase">{key === 'admin_rate_edit' ? '授權會計修改設定' : key.replace(/_/g,' ')}</span>
                <div onClick={() => handleMatrixToggle(key)} className={`switch-matrix ${matrix[key] ? 'active' : ''}`}><div className="knob"></div></div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-6 animate-in fade-in duration-700 pb-32 pt-6 px-4">
      <div className="flex justify-between items-center uppercase tracking-tighter">
        <h2 className="text-2xl font-black text-white/80">合規稽核中樞</h2>
        <select value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-cyan-400 outline-none">
           {drivers.map(d => <option key={d.id} value={d.id} className="bg-black text-white">{d.name}</option>)}
        </select>
      </div>
      <PersonnelRegistry />
      <GlassCard className={`p-8 space-y-6 relative overflow-hidden transition-all text-white ${metrics.isAnomaly ? 'border-rose-500/40' : ''}`}>
        {!matrix.admin_rate_edit && (
          <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-[6px] flex flex-col items-center justify-center p-8 text-center">
             <LockKeyhole size={32} className="text-rose-500 mb-4" />
             <p className="text-rose-500 font-black uppercase text-xs tracking-widest leading-relaxed">人事與費率權限已由指揮官鎖定<br/><span className="text-[9px] opacity-60">需開啟「授權會計修改設定」</span></p>
          </div>
        )}
        <div className="flex justify-between items-center border-b border-white/5 pb-4"><p className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2"><Calculator size={12}/> 精算核銷明細</p>{metrics.isAnomaly && <span className="bg-rose-600 text-white px-2 py-0.5 rounded font-black animate-pulse uppercase text-[9px]">偏差警訊: {metrics.deviation_percent}%</span>}</div>
        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 text-center font-black">
           <div className="p-4 rounded-xl bg-black/20"><p className="text-[9px] text-white/20 uppercase mb-2 font-mono font-bold">二代健保代扣</p><p className="text-xl font-mono text-rose-500/80">-${metrics.supplement}</p></div>
           <div className="p-4 rounded-xl bg-black/20"><p className="text-[9px] text-white/20 uppercase mb-2 font-mono font-bold">核定實領總額</p><p className="text-xl font-mono text-emerald-400/80">${metrics.real_payout}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="p-5 rounded-xl bg-black/40 border border-white/5 text-center font-bold"><p className="text-[9px] text-white/30 uppercase mb-3">配送件數 (核定)</p><input type="number" value={activeDriver.delivered} onChange={e => updateDriverData(activeDriver.id, 'delivered', parseInt(e.target.value)||0)} className="manual-input" /></div>
           <div className="p-5 rounded-xl bg-black/40 border border-white/5 text-center font-bold"><p className="text-[9px] text-white/30 uppercase mb-3">回收件數 (核定)</p><input type="number" value={activeDriver.returned} onChange={e => updateDriverData(activeDriver.id, 'returned', parseInt(e.target.value)||0)} className="manual-input !text-orange-400" /></div>
        </div>
        <textarea placeholder="核銷備註 (此紀錄將同步至指揮官看板)..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs h-20 outline-none resize-none focus:border-cyan-500/50 text-white/80 font-bold" />
        <button disabled={!activeDriver.has_photo || matrix.kill_switch || metrics.isAnomaly} className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl btn-tactile ${(!activeDriver.has_photo || matrix.kill_switch || metrics.isAnomaly) ? 'bg-white/5 text-white/10' : 'bg-emerald-600 text-white'}`}>確認核銷並發放薪資</button>
      </GlassCard>
    </div>
  );

  const renderSentinel = () => (
    <div className="space-y-6 animate-in fade-in duration-700 pt-6 pb-32 px-4 text-white">
      <div className="glass-card p-6 border-l-4 border-amber-500 shadow-amber-900/10 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3 text-amber-400"><Bell size={16} className="animate-bounce" /><span className="text-[10px] font-black uppercase tracking-widest font-bold">總部公告與行車安全</span></div>
        <p className="text-sm font-bold text-white/95 leading-relaxed italic relative z-10 font-mono">"{bulletin}"</p>
      </div>
      <div className="text-center pt-4 uppercase italic tracking-widest"><h2 className="text-2xl font-black">哨兵結算終端</h2><p className="text-[10px] text-white/30 tracking-[0.4em] mt-2 font-mono">司機員：{activeDriver.name} ({activeDriver.phone})</p></div>
      <div className="glass-card p-12 flex justify-around items-center">
        {matrix.empire_dial ? (
          <div className="flex gap-4 sm:gap-12 text-center w-full justify-center">
             <EmpireDial value={activeDriver.delivered} label="配送完成數" color="#22d3ee" onChange={(v) => updateDriverData(activeDriver.id, 'delivered', v)} />
             <EmpireDial value={activeDriver.returned} label="逆物流回收" color="#fbbf24" onChange={(v) => updateDriverData(activeDriver.id, 'returned', v)} />
          </div>
        ) : (
          <div className="py-12 text-center opacity-40 flex flex-col items-center"><ShieldAlert size={64} className="text-rose-500 mb-6 animate-pulse" /><p className="text-rose-500 text-xs font-black uppercase tracking-widest font-bold">權限由中心鎖定</p></div>
        )}
      </div>
      <GlassCard className="p-6 bg-white/5 text-white">
         <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-4 font-bold"><Key size={14}/> 終端安全設定 (修改金鑰)</h3>
         <div className="flex gap-4">
            <input type="password" placeholder="輸入新安全金鑰" value={activeDriver.pwd} onChange={e => updateDriverData(activeDriver.id, 'pwd', e.target.value)} className="manual-input !text-sm !text-left !py-3" />
            <button className="px-6 bg-cyan-600/20 border border-cyan-500/30 rounded-xl text-[10px] font-black text-cyan-400 uppercase tracking-widest">更新</button>
         </div>
      </GlassCard>
      <button className="w-full btn-tactile py-6 rounded-2xl bg-cyan-600 text-white font-black text-xs uppercase tracking-[0.5em] shadow-xl">提交本日批次數據 (COMMIT)</button>
      <button onMouseDown={() => setIsEraserHolding(true)} onMouseUp={() => setIsEraserHolding(false)} onTouchStart={() => setIsEraserHolding(true)} onTouchEnd={() => setIsEraserHolding(false)} 
              className="w-full relative overflow-hidden py-4 rounded-2xl border border-rose-500/20 text-rose-500/60 font-black text-[10px] tracking-[0.5em] uppercase active:scale-95 mt-4">
          <div className="absolute left-0 top-0 h-full bg-rose-500/30 transition-all duration-100" style={{ width: `${eraserProgress}%` }}></div>
          <span className="relative z-10 flex items-center justify-center gap-2"><RefreshCcw size={12} className={isEraserHolding ? 'animate-spin' : ''} /> 長按 3s 安全重置</span>
      </button>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col no-scrollbar relative font-sans overflow-hidden">
      <GlobalStyles />
      {view === 'splash' && (
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center scanner-active overflow-hidden relative z-[200]">
          <Fingerprint size={80} className="text-cyan-400 animate-pulse mb-8" />
          <h2 className="text-2xl font-black tracking-[0.6em] text-white/90 uppercase italic text-center px-8">在地物流有限公司</h2>
          <p className="text-[10px] text-cyan-500/50 mt-4 font-mono uppercase tracking-[0.3em] font-bold">企業防禦核心部署中...</p>
        </div>
      )}

      {view === 'login' && (
        <div className="flex flex-col items-center justify-center h-screen px-8 space-y-12 animate-in fade-in duration-1000">
          <div className="text-center text-white">
             <Building2 size={64} className="text-cyan-400 mx-auto mb-6" />
             <h1 className="text-4xl font-black italic tracking-tighter uppercase">在地物流 <span className="text-cyan-400">有限公司</span></h1>
             <p className="text-[10px] text-white/20 tracking-[0.3em] mt-2 font-mono uppercase font-black">V3.0 Enterprise Secure Portal</p>
          </div>
          <div className="w-full max-w-sm space-y-5">
            <input type="text" placeholder="手機號碼 / 指揮官識別碼" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-cyan-500/50" value={loginInput.phone} onChange={e => setLoginInput({...loginInput, phone: e.target.value})} />
            <input type="password" placeholder="安全性認證金鑰" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-cyan-500/50" value={loginInput.pwd} onChange={e => setLoginInput({...loginInput, pwd: e.target.value})} />
            <div className="flex items-center gap-3 px-1">
               <div onClick={() => setLoginInput({...loginInput, remember: !loginInput.remember})} className={`checkbox-custom ${loginInput.remember ? 'active' : ''}`}>
                 {loginInput.remember && <CheckCircle2 size={12} className="text-black" />}
               </div>
               <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">記住我的手機帳號</span>
            </div>
            <button onClick={handleLogin} className="w-full btn-tactile py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest shadow-xl font-bold">啟動主權認證</button>
          </div>
        </div>
      )}

      {view === 'core' && (
        <React.Fragment>
          <header className="px-6 pt-12 pb-4 flex justify-between items-center z-50 bg-gradient-to-b from-black to-transparent">
            <div className="flex items-center gap-3"><Building2 size={18} className="text-cyan-400/60" /><span className="text-[10px] font-black tracking-widest uppercase text-white/40 italic font-bold">在地物流 v3.0 <span className="opacity-30 ml-2 italic tracking-tighter">82749921</span></span></div>
            <div className="flex items-center gap-4 text-white"><Fingerprint size={18} className={isVerified ? 'text-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'text-white/10'} /><button onClick={() => {setView('login'); setIsVerified(false);}} className="text-white/20 hover:text-rose-500 transition-colors"><LogOut size={16}/></button></div>
          </header>
          <main className="flex-1 overflow-y-auto no-scrollbar relative z-10 px-1">{role === 'sovereign' && renderSovereign()}{role === 'admin' && renderAdmin()}{role === 'sentinel' && renderSentinel()}</main>
          <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 animate-in slide-in-from-bottom duration-700 text-white"><div className="glass-card !rounded-full p-1.5 flex justify-between shadow-2xl bg-black/60 border-white/10 backdrop-blur-[40px]">{[ { id: 'sovereign', label: '指揮', icon: Eye }, { id: 'admin', label: '稽核', icon: Calculator }, { id: 'sentinel', label: '哨兵', icon: Truck } ].map(tab => (<button key={tab.id} onClick={() => setRole(tab.id as any)} className={`flex-1 py-3 rounded-full flex flex-col items-center gap-1 transition-all duration-300 btn-tactile ${role === tab.id ? 'bg-white text-black shadow-lg scale-100' : 'text-white/25 hover:text-white/40'}`}><tab.icon size={16} strokeWidth={role === tab.id ? 3 : 2} /><span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span></button>))}</div></nav>
        </React.Fragment>
      )}

      {/* 總部幕僚通訊 */}
      {view === 'core' && (
        <React.Fragment>
          <div onClick={() => setIsChatOpen(!isChatOpen)} className={`fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center z-[110] cursor-pointer shadow-2xl transition-all duration-500 ${isChatOpen ? 'bg-white text-black rotate-90 scale-90' : 'bg-cyan-500 text-white animate-bounce'}`}>{isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}</div>
          <div className={`fixed bottom-[110px] right-6 w-80 h-[520px] glass-card p-6 flex flex-col transition-all duration-500 origin-bottom-right z-[100] ${isChatOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-20 pointer-events-none'}`}>
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4 shrink-0"><div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div><span className="text-xs font-black uppercase tracking-widest text-cyan-400 font-bold">總部幕僚連線</span></div><div className="flex gap-1">{Object.keys(staffProfiles).map(p => { const isLocked = role !== 'sovereign' && p !== staffRole; return <button key={p} disabled={isLocked} title={staffProfiles[p].title} onClick={() => setStaffRole(p)} className={`p-2 rounded-lg transition-all ${staffRole === p ? 'bg-white/15 text-white shadow-inner' : 'text-white/20 hover:bg-white/5'} ${isLocked ? 'opacity-0 scale-0' : ''}`}><UserCog size={14} /></button>})}</div></div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pr-1 flex flex-col"><div className="bg-white/5 p-4 rounded-2xl text-[11px] leading-relaxed text-white/70 border border-white/5 shadow-inner shrink-0 font-bold"><p className="font-bold mb-2 flex items-center gap-2" style={{ color: staffProfiles[staffRole].color }}>[{staffProfiles[staffRole].title}]</p>{staffProfiles[staffRole].greeting}</div>{chatHistory.length === 0 && (<div className="grid grid-cols-1 gap-2 shrink-0">{staffProfiles[staffRole].actions.map(action => (<button key={action} onClick={() => handleSendMessage(action)} className="p-3 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black text-white/50 hover:text-cyan-400 transition-all uppercase tracking-widest text-left pl-4 flex items-center gap-3 font-mono font-bold"><Zap size={10} /> {action}</button>))}</div>)}{chatHistory.map((msg, idx) => (<div key={idx} className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%] shrink-0 shadow-lg font-bold ${msg.sender === 'user' ? 'bg-cyan-600/20 text-cyan-100 self-end ml-auto border border-cyan-500/20' : 'bg-white/5 text-white/70 border border-white/10 self-start'}`}>{msg.text}</div>))}<div ref={chatEndRef} className="shrink-0" /></div>
            <div className="mt-4 flex gap-2 shrink-0"><input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="輸入通訊或指令..." className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-cyan-500/50 text-white placeholder:text-white/20 font-bold" /><button onClick={() => handleSendMessage()} className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center btn-tactile shadow-lg text-white"><Send size={14} /></button></div>
          </div>
        </React.Fragment>
      )}

      {/* 公佈欄發布 Modal */}
      {isBulletinOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="glass-card max-w-sm w-full p-8 space-y-6 text-white"><h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3 text-amber-400 font-bold"><Megaphone /> 廣播系統公告</h3><textarea placeholder="輸入對司機端的最新公告內容..." value={tempBulletin} onChange={e => setTempBulletin(e.target.value)} className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none text-white focus:border-cyan-500/50 resize-none font-bold" /><div className="flex gap-4"><button onClick={() => setIsBulletinOpen(false)} className="flex-1 py-4 text-white/40 text-xs font-bold uppercase tracking-widest uppercase font-bold">取消</button><button onClick={() => { handleUpdateBulletin(); }} className="flex-[2] py-4 bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl btn-tactile uppercase font-bold">確認發布並同步 (SYNC)</button></div></div>
        </div>
      )}
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
    </div>
  );
};

export default App;
