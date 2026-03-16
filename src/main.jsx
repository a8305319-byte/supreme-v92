import React, { useState, useEffect } from 'https://esm.sh/react';
import ReactDOM from 'https://esm.sh/react-dom/client';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Firebase 連線配置 (填入您的真實資料)
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

// 2. 管家嚴謹判定：捕捉所有異常關鍵字
const isAlert = (status) => {
  const alertKeywords = ['車禍', '故障', '延遲', '異常', '沒電', '事故', '受傷'];
  return alertKeywords.some(key => status?.includes(key));
};

function App() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 五軍切換邏輯

  useEffect(() => {
    // 實時秒級監控
    const q = query(collection(db, "ClockOutRecords"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 3. 影子防禦：在渲染前徹底剔除敏感數據
  const cleanLogs = logs.filter(log => 
    !log.driver?.includes('MOMO') && 
    !log.status?.includes('MOMO')
  );

  // 4. 戰略分流邏輯
  const filteredLogs = filter === 'ALL' ? cleanLogs : cleanLogs.filter(log => log.driver?.includes(filter));

  // 5. 數據統計面板
  const alertCount = cleanLogs.filter(log => isAlert(log.status)).length;
  const activeCount = cleanLogs.filter(log => log.status === '配送中').length;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '15px', fontFamily: 'monospace' }}>
      <style>{`
        @keyframes pulse { 0% { opacity: 1; border-color: #f00; } 50% { opacity: 0.5; border-color: #300; } 100% { opacity: 1; border-color: #f00; } }
        .critical-card { animation: pulse 1s infinite; background: #200 !important; border: 1px solid #f00 !important; }
        .nav-btn { background: #111; color: #666; border: 1px solid #333; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; white-space: nowrap; }
        .nav-active { color: #0f0; border-color: #0f0; background: #020; }
      `}</style>
      
      {/* 上帝統計面板 (The Dashboard) */}
      <div style={{ borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ color: '#0f0', margin: 0, fontSize: '20px', letterSpacing: '1px' }}>ALPHA CORE v2.5</h2>
            <div style={{ fontSize: '9px', color: '#555' }}>SECURE COMMAND LINE // 2026-03-17</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: alertCount > 0 ? '#f00' : '#0f0', fontSize: '14px', fontWeight: 'bold' }}>
              {alertCount > 0 ? `⚠️ ALERTS: ${alertCount}` : '✓ STATUS: NOMINAL'}
            </div>
            <div style={{ fontSize: '10px', color: '#888' }}>ACTIVE_UNITS: {activeCount}</div>
          </div>
        </div>

        {/* 五軍切換器 (The Pentagon) */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '15px', overflowX: 'auto', paddingBottom: '8px' }}>
          {['ALL', '物流', '傢飾', '貿易', '餐飲', '分身'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`nav-btn ${filter === cat ? 'nav-active' : ''}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 數據流 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredLogs.length === 0 ? (
          <div style={{ color: '#333', textAlign: 'center', marginTop: '40px' }}>[ NO DATA ACCESSIBLE ]</div>
        ) : (
          filteredLogs.map(log => {
            const hasIssue = isAlert(log.status);
            return (
              <div key={log.id} className={hasIssue ? 'critical-card' : ''} style={{ 
                backgroundColor: '#111', padding: '15px', borderRadius: '4px', 
                borderLeft: hasIssue ? '6px solid #f00' : '4px solid #0f0',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#555', marginBottom: '8px' }}>
                  <span>{log.timestamp?.toDate().toLocaleString('zh-TW', { hour12: false })}</span>
                  <span>{hasIssue ? 'SIGNAL_DISTURBED' : 'SIGNAL_STABLE'}</span>
                </div>
                <div style={{ fontSize: '17px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><span style={{ color: '#0f0' }}>$</span> {log.driver}</span>
                  <span style={{ color: hasIssue ? '#ff4d4d' : '#eee', fontWeight: '500' }}>{log.status}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
