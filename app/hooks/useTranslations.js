import { useState, useEffect } from 'react';
// นำเข้า useState และ useEffect จาก React สำหรับเก็บสถานะและจัดการ side effect

export function useTranslations(locale) {
  // สร้าง custom hook สำหรับดึงข้อความแปลตามภาษาที่ส่งเข้ามา

  const [messages, setMessages] = useState({});
  // สร้างสถานะเก็บข้อความแปล (เริ่มต้นเป็นว่าง)

  useEffect(() => {
    // ใช้ useEffect เพื่อโหลดข้อความแปลเมื่อ locale เปลี่ยน

    async function loadMessages() {
      // ฟังก์ชันโหลดข้อความแปลจากไฟล์ JSON

      try {
        const res = await fetch(`/locales/${locale}.json`);
        // ดึงไฟล์ JSON ของภาษาที่กำหนดจากโฟลเดอร์ /locales

        const data = await res.json();
        // แปลงข้อมูลเป็น JSON

        setMessages(data);
        // เก็บข้อความแปลลงในสถานะ
      } catch (error) {
        console.error('Error loading translation messages:', error);
        // หากโหลดข้อความแปลผิดพลาด ให้แสดง error ใน console
      }
    }

    loadMessages();
    // เรียกใช้ฟังก์ชันโหลดข้อความแปลทุกครั้งที่ locale เปลี่ยน
  }, [locale]);

  function t(key) {
    // ฟังก์ชันสำหรับดึงข้อความแปลจาก key ที่ส่งเข้ามา
    // หากไม่พบ key ให้แสดง key นั้นแทน
    return messages[key] || key;
  }

  return { t };
  // คืนค่าเป็น object ที่มีฟังก์ชัน t เพื่อให้ component อื่นใช้งานข้อความแปลได้ง่าย
}
