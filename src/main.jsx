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

// 2. Alpha Core 監控介面
function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 監聽後台資料
    const q = query(collection(db, "ClockOutRecords"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh', 
      padding: '20px', fontFamily: 'sans-serif', letterSpacing: '0.5px' 
    }}>
      {/* 標題已去識別化 */}
      <h2 style={{ 
        color: '#00ff00', borderBottom: '1px solid #333', 
        paddingBottom: '15px', fontSize: '20px', fontWeight: '400' 
      }}>
        SUPREME-V92 | ALPHA CORE
      </h2>

      <div style={{ marginTop: '20px' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#444', textAlign: 'center', marginTop: '50px' }}>
            系統連線中...
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} style={{ 
              backgroundColor: '#262626', padding: '16px', borderRadius: '12px', 
              marginBottom: '15px', borderLeft: '4px solid #00ff00',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}>
              {/* 時間 */}
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                {log.timestamp?.toDate().toLocaleString('zh-TW', { 
                  year: 'numeric', month: '2-digit', day: '2-digit', 
                  hour: '2-digit', minute: '2-digit' 
                })}
              </div>
              
              {/* 狀態紀錄：敏感資訊已移除 */}
              <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                <strong style={{ color: '#00ff00', fontWeight: '600' }}>
                  {log.driver}
                </strong> 
                <span style={{ marginLeft: '12px', color: '#eee' }}>
                  {log.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
