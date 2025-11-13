"use client";

import { useEffect, useState } from "react";

export default function ThemeModeWrapper({ initialMode }) {
  const [mode, setMode] = useState(initialMode);

  // โหลดจาก API ฝั่ง Client เพื่ออัปเดตสด ๆ
  useEffect(() => {
    async function loadMode() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
        const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

        const res = await fetch(`${baseUrl}/api/website/theme-mode`, {
          headers: { 'X-API-KEY': apiKey }
        });

        const data = await res.json();
        setMode(data.mode);
      } catch (e) {
        console.log("Theme load failed → ใช้ค่าเดิม");
      }
    }

    loadMode();
  }, []);

  // อัปเดต DOM theme ทันทีที่ mode เปลี่ยน
  useEffect(() => {
    document.documentElement.setAttribute("data-theme-mode", mode);
  }, [mode]);

  return null;
}
