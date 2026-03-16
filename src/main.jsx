import React, { useState, useEffect } from 'https://esm.sh/react';
import ReactDOM from 'https://esm.sh/react-dom/client';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "您的_API_KEY", 
  authDomain: "supreme-v92.firebaseapp.com",
  projectId: "supreme-v92",
  storageBucket: "supreme-v92.appspot.com",
  messagingSenderId: "您的_SENDER_ID",
  appId: "您的_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const isAlert = (status) => {
  const alertKeywords = ['車禍', '故障', '延遲', '異常', '沒電', '事故', '受傷'];
  return alertKeywords.some(key => status?.includes(key));
};

function App() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 戰略分層功能

  useEffect(() => {
    const q = query(collection(db, "ClockOutRecords"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 1. 影子過濾：徹底抹除不該出現的字眼
  const cleanLogs = logs.filter(log => !log.driver?.includes('MOMO') && !log.status?.includes('MOMO'));

  // 2. 戰略分層：根據公司/分類過濾 (假設司機名稱帶有公司首字)
  const filteredLogs = filter === 'ALL' ? cleanLogs : cleanLogs.filter(log => log.driver?.includes(filter));

  // 3. 統計面板數據
  const alertCount = cleanLogs.filter(log => isAlert(log.status)).length;
  const activeCount = cleanLogs.filter(log => log.status === '配送中').length;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '15px', fontFamily: 'monospace' }}>
      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .critical { animation: pulse 1s infinite; border: 1px solid #f00 !important; background: #200 !important; }
        .nav-btn { background: #111; color: #666; border: 1px solid #333; padding: 5px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; }
        .nav-active { color: #0f0; border-color: #0f0; }
      `}</style>
      
      {/* 頂部戰報看板 (The Dashboard) */}
      <div style={{ borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ color: '#0f0', margin: 0, fontSize: '20px' }}>ALPHA CORE v2.5</h2>
            <div style={{ fontSize: '9px', color: '#555' }}>REALTIME COMMAND CENTER</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: alertCount > 0 ? '#f00' : '#0f0', fontSize: '14px', fontWeight: 'bold' }}>
              {alertCount > 0 ? `⚠️ CRITICAL: ${alertCount}` : '✓ STATUS: NOMINAL'}
            </div>
            <div style={{ fontSize: '10px', color: '#888' }}>ACTIVE_UNITS: {activeCount}</div>
          </div>
        </div>

        {/* 五軍切換器 (The Pentagon) */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
          {['ALL', '物流', '傢飾', '貿易', '餐飲', '老闆'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`nav-btn ${filter === cat ? 'nav-active' : ''}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 數據即時流 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredLogs.map(log => {
          const hasIssue = isAlert(log.status);
          return (
            <div key={log.id} className={hasIssue ? 'critical' : ''} style={{ 
              backgroundColor: '#111', padding: '12px', borderRadius: '4px', 
              borderLeft: hasIssue ? '5px solid #f00' : '5px solid #0f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginBottom: '5px' }}>
                <span>{log.timestamp?.toDate().toLocaleString('zh-TW', { hour12: false })}</span>
                <span>SECURED_LINE</span>
              </div>
              <div style={{ fontSize: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><span style={{ color: '#0f0' }}>$</span> {log.driver}</span>
                <span style={{ color: hasIssue ? '#f00' : '#ddd', fontSize: '14px' }}>{log.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
