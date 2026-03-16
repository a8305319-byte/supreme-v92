import React, { useState, useEffect } from 'https://esm.sh/react';
import ReactDOM from 'https://esm.sh/react-dom/client';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Firebase 連線配置
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

// 2. 管家異常判定邏輯
const isAlert = (status) => {
  const alertKeywords = ['車禍', '故障', '延遲', '異常', '沒電', '事故', '受傷'];
  return alertKeywords.some(key => status?.includes(key));
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

  // 管家統計：算出目前有幾筆異常
  const alertCount = logs.filter(log => isAlert(log.status)).length;

  return (
    <div style={{ backgroundColor: '#121212', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <style>{`
        @keyframes pulse { 0% { box-shadow: 0 0 0 0px rgba(255, 77, 77, 0.7); } 100% { box-shadow: 0 0 0 15px rgba(255, 77, 77, 0); } }
        .alert-active { animation: pulse 2s infinite; border: 1px solid #ff4d4d !important; background: linear-gradient(145deg, #3d1a1a, #262626) !important; }
      `}</style>
      
      {/* 上帝指揮中心狀態列 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#00ff00', margin: 0, fontSize: '22px', fontWeight: '600' }}>ALPHA CORE</h2>
          <div style={{ fontSize: '10px', color: '#666', letterSpacing: '2px' }}>SYSTEM STATUS: ONLINE</div>
        </div>
        
        {/* 管家回報區 */}
        <div style={{ textAlign: 'right', padding: '10px 15px', borderRadius: '8px', border: alertCount > 0 ? '1px solid #ff4d4d' : '1px solid #333' }}>
          <div style={{ fontSize: '10px', color: '#999' }}>WATCHMAN</div>
          <div style={{ fontSize: '16px', color: alertCount > 0 ? '#ff4d4d' : '#00ff00', fontWeight: 'bold' }}>
            {alertCount > 0 ? `⚠️ ${alertCount} 筆異常` : '✅ 全員正常'}
          </div>
        </div>
      </div>

      {/* 數據列表 */}
      <div>
        {logs.map(log => {
          const hasIssue = isAlert(log.status);
          return (
            <div key={log.id} className={hasIssue ? 'alert-active' : ''} style={{ 
              backgroundColor: '#1e1e1e', padding: '16px', borderRadius: '12px', 
              marginBottom: '15px', borderLeft: hasIssue ? '6px solid #ff4d4d' : '4px solid #00ff00',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{log.timestamp?.toDate().toLocaleString('zh-TW')}</span>
                {hasIssue && <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>CRITICAL</span>}
              </div>
              
              <div style={{ fontSize: '19px', fontWeight: '500' }}>
                <span style={{ color: hasIssue ? '#ff4d4d' : '#00ff00' }}>{log.driver}</span>
                <span style={{ marginLeft: '15px', color: '#ddd' }}>{log.status}</span>
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
