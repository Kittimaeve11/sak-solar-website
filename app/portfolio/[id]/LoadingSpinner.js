'use client';

import { useEffect } from "react";

export default function LoadingSpinner() {

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className="spinner-fullscreen"
      data-next-scroll-ignore   // 🛑 บอก Next.js ว่าอย่าพยายาม scroll focus element นี้
    >
      <div className="spinner"></div>
      <div className="loading-text">
        กำลังโหลดข้อมูล
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </div>
    </div>
  );
}
