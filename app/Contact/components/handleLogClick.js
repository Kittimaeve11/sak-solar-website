'use client';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/**
 * handleLogClick
 * บันทึก Log เมื่อผู้ใช้ส่งแบบฟอร์มสอบถามเพิ่มเติม (actionType = 7)
 */
export async function handleLogClick(formData) {
  try {
    const logData = {
      actionType: '7',
      actionDetail: `ส่งแบบฟอร์มสอบถามเพิ่มเติม | หัวข้อ: ${
        formData.topic || 'N/A'
      } | ชื่อ: ${formData.name || 'N/A'} | เบอร์โทร: ${
        formData.phone || 'N/A'
      } | อีเมล: ${formData.email || 'ไม่มี'} | ข้อความ: ${
        formData.message || 'ไม่มีข้อความ'
      }`,
      typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
      datatype: 'สอบถามเพิ่มเติม',
      dataID: '0',
      datatypeID: '0',
      brandtype: 'N/A',
      dataname: 'Contact Page Form',
    };

    const res = await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(logData),
    });

    const text = await res.text();
    console.log('Log contact saved:', text);
  } catch (err) {
    console.warn('log failed:', err?.message || err);
  }
}
