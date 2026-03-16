import React, { useState, useEffect } from 'https://esm.sh/react';
import ReactDOM from 'https://esm.sh/react-dom/client';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Firebase 連線配置 (請確保填入您的真實資料)
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

// 2. 管家邏輯：判斷是否為異常狀態
const isAlert = (status) => {
  const alertKeywords = ['車禍', '故障', '延遲', '異常', '沒電', '事故', '受傷'];
  return alertKeywords.some(key => status.includes(key));
};

function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "ClockOutRecords"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <style>{`
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .alert-card { animation: blink 1.5s infinite; border-left: 6px solid #ff4d4d !important; background-color: #3d1a1a !important; }
      `}</style>
      
      <h2 style={{ color: '#00ff00', borderBottom: '1px solid #333', paddingBottom: '15px', fontSize: '20px', fontWeight: '400' }}>
        SUPREME-V92 | ALPHA CORE <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>WATCHMAN ACTIVE</span>
      </h2>

      <div style={{ marginTop: '20px' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#444', textAlign: 'center', marginTop: '50px' }}>系統連線中...</div>
        ) : (
          logs.map(log => {
            const hasIssue = isAlert(log.status);
            return (
              <div key={log.id} className={hasIssue ? 'alert-card' : ''} style={{ 
                backgroundColor: '#262626', padding: '16px', borderRadius: '12px', 
                marginBottom: '15px', borderLeft: '4px solid #00ff00',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: '0.3s'
              }}>
                <div style={{ fontSize: '11px', color: hasIssue ? '#ffcccc' : '#666', marginBottom: '8px' }}>
                  {log.timestamp?.toDate().toLocaleString('zh-TW')}
                </div>
                
                <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ color: hasIssue ? '#ff4d4d' : '#00ff00', fontWeight: '600' }}>{log.driver}</strong> 
                    <span style={{ marginLeft: '12px', color: '#eee' }}>{log.status}</span>
                  </div>
                  {hasIssue && <span style={{ color: '#ff4d4d', fontSize: '12px', fontWeight: 'bold' }}>⚠️ 異常警告</span>}
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
