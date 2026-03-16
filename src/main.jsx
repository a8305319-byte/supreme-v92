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

// 影子過濾邏輯：徹底封殺特定字眼
const isAlert = (status) => {
  const alertKeywords = ['車禍', '故障', '延遲', '異常', '沒電', '事故', '受傷'];
  return alertKeywords.some(key => status?.includes(key));
};

function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 強制實時監聽，任何變動即刻推送
    const q = query(collection(db, "ClockOutRecords"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const alertCount = logs.filter(log => isAlert(log.status)).length;

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
      <style>{`
        @keyframes alert-pulse { 0% { background: #3d1a1a; } 50% { background: #600; } 100% { background: #3d1a1a; } }
        .critical { animation: alert-pulse 1s infinite; border: 1px solid #f00 !important; }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ color: '#0f0', margin: 0, fontSize: '18px' }}>SUPREME ALPHA CORE</h2>
          <div style={{ fontSize: '9px', color: '#555' }}>TIME-SYNC: REALTIME_ACTIVE</div>
        </div>
        <div style={{ textAlign: 'right', color: alertCount > 0 ? '#f00' : '#0f0' }}>
          {alertCount > 0 ? `[ ALERT: ${alertCount} ]` : '[ STATUS: NOMINAL ]'}
        </div>
      </div>

      <div>
        {logs.map(log => {
          const hasIssue = isAlert(log.status);
          // 彻底忘記宜蘭MOMO：如果資料包含該關鍵字則不渲染
          if (log.driver?.includes('MOMO') || log.status?.includes('MOMO')) return null;

          return (
            <div key={log.id} className={hasIssue ? 'critical' : ''} style={{ 
              backgroundColor: '#111', padding: '15px', borderRadius: '4px', 
              marginBottom: '10px', borderLeft: hasIssue ? '4px solid #f00' : '4px solid #0f0'
            }}>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '5px' }}>
                {/* 實時時間格式化 */}
                {log.timestamp?.toDate().toLocaleString('zh-TW', { hour12: false })}
              </div>
              <div style={{ fontSize: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#0f0' }}>▶</span> {log.driver}</span>
                <span style={{ color: hasIssue ? '#f00' : '#ddd' }}>{log.status}</span>
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
