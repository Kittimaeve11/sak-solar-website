"use client";

import { useEffect, useState } from "react";

export default function ThemeModeWrapper({ initialMode }) {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    let isMounted = true;

    // ควบคุมเปิด/ปิด API ได้จากตรงนี้
    const API_ENABLED = false;   // ปิด API ชั่วคราว

    async function loadMode() {
      if (!API_ENABLED) return;  // ถ้า API ปิด → ไม่ fetch เลย

      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
        const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

        const res = await fetch(`${baseUrl}/api/website/theme-mode`, {
          headers: { "X-API-KEY": apiKey },
        });

        const data = await res.json();
        if (isMounted && data.mode) {
          setMode(data.mode);
        }
      } catch (e) {
        // console.log("Theme load failed  ใช้ค่าเดิม");
      }
    }

    // โหลดจาก API (ถ้าเปิด)
    loadMode();

    // อัปเดต Theme ใน DOM ทุกครั้งที่ mode เปลี่ยน
    document.documentElement.setAttribute("data-theme-mode", mode);

    return () => {
      isMounted = false;
    };
  }, [mode]);

  return null;
}
