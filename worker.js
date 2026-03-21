export default {
  async fetch(request, env) {
    // 處理 CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      const {
        to_email,
        applicant_name,
        report_date,
        report_location,
        contact_person,
        contact_phone,
        onboarding_link,
      } = body;

      // 驗證必要欄位
      if (!to_email || !applicant_name) {
        return new Response(
          JSON.stringify({ error: '缺少必要欄位' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 呼叫 Resend API
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@你的網域.com', // 換成你的寄件信箱
          to: [to_email],
          subject: '【錄取通知】恭喜您通過面試！',
          html: `
            <!DOCTYPE html>
            <html lang="zh-TW">
            <head>
              <meta charset="UTF-8">
              <style>
                body {
                  font-family: 'Microsoft JhengHei', Arial, sans-serif;
                  background-color: #f5f5f5;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 40px auto;
                  background: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 40px 30px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                  letter-spacing: 2px;
                }
                .header p {
                  margin: 10px 0 0;
                  opacity: 0.9;
                  font-size: 16px;
                }
                .content {
                  padding: 40px 30px;
                  color: #333;
                  line-height: 1.8;
                }
                .content h2 {
                  color: #667eea;
                  font-size: 20px;
                  margin-bottom: 20px;
                }
                .info-box {
                  background: #f8f9ff;
                  border-left: 4px solid #667eea;
                  border-radius: 8px;
                  padding: 20px 25px;
                  margin: 25px 0;
                }
                .info-row {
                  display: flex;
                  align-items: center;
                  margin: 12px 0;
                  font-size: 15px;
                }
                .info-label {
                  font-weight: bold;
                  color: #555;
                  min-width: 100px;
                }
                .info-value {
                  color: #333;
                }
                .btn {
                  display: block;
                  width: fit-content;
                  margin: 30px auto;
                  padding: 15px 40px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white !important;
                  text-decoration: none;
                  border-radius: 50px;
                  font-size: 16px;
                  font-weight: bold;
                  text-align: center;
                  letter-spacing: 1px;
                }
                .footer {
                  background: #f5f5f5;
                  padding: 20px 30px;
                  text-align: center;
                  color: #999;
                  font-size: 13px;
                  border-top: 1px solid #eee;
                }
                .emoji {
                  font-size: 18px;
                  margin-right: 8px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <!-- Header -->
                <div class="header">
                  <h1>🎉 錄取通知</h1>
                  <p>恭喜您通過面試審核！</p>
                </div>

                <!-- Content -->
                <div class="content">
                  <h2>親愛的 ${applicant_name} 您好，</h2>
                  <p>
                    感謝您參加我們的面試，我們很高興地通知您，
                    經過審核後，您已<strong>正式通過面試</strong>！
                    歡迎加入我們的團隊 🎊
                  </p>

                  <!-- 報到資訊 -->
                  <div class="info-box">
                    <div class="info-row">
                      <span class="emoji">📅</span>
                      <span class="info-label">報到日期：</span>
                      <span class="info-value">${report_date}</span>
                    </div>
                    <div class="info-row">
                      <span class="emoji">📍</span>
                      <span class="info-label">報到地點：</span>
                      <span class="info-value">${report_location}</span>
                    </div>
                    <div class="info-row">
                      <span class="emoji">👤</span>
                      <span class="info-label">聯絡人：</span>
                      <span class="info-value">${contact_person}</span>
                    </div>
                    <div class="info-row">
                      <span class="emoji">📞</span>
                      <span class="info-label">聯絡電話：</span>
                      <span class="info-value">${contact_phone}</span>
                    </div>
                  </div>

                  <p>請點擊下方按鈕，填寫入職資料並設定您的帳號密碼：</p>

                  <!-- 按鈕 -->
                  <a href="${onboarding_link}" class="btn">
                    📝 填寫入職資料與設定帳號
                  </a>

                  <p style="color: #999; font-size: 13px; text-align: center;">
                    若按鈕無法點擊，請複製以下連結至瀏覽器：<br>
                    <a href="${onboarding_link}" style="color: #667eea;">${onboarding_link}</a>
                  </p>
                </div>

                <!-- Footer -->
                <div class="footer">
                  <p>此信件為系統自動發送，請勿直接回覆</p>
                  <p>如有任何問題請聯繫 ${contact_person}：${contact_phone}</p>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      const resendData = await resendResponse.json();

      if (!resendResponse.ok) {
        throw new Error(resendData.message || '發送失敗');
      }

      return new Response(
        JSON.stringify({ success: true, id: resendData.id }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
