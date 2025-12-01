// lib/firebase.js
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

// ตรวจว่าต้องใช้ Firebase หรือไม่ (ปิดได้ถ้า deploy ชั่วคราว)
const ENABLE_FIREBASE = true;

// ดึงค่าจาก env
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// ตัวแปรกลาง
let analytics = null;
let app = null;

//  ป้องกัน initialize Firebase ถ้า config ไม่ครบ
function isConfigValid(config) {
  return (
    config.apiKey &&
    config.projectId &&
    config.appId &&
    config.authDomain
  );
}

if (typeof window !== "undefined" && ENABLE_FIREBASE && isConfigValid(firebaseConfig)) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  } catch (error) {
    console.error(" Firebase init failed:", error);
  }
} else {
  console.warn("⚠ Firebase Analytics disabled (invalid config or server-side)");
}

//  ใช้ Track เมื่อเปลี่ยนหน้า
export function pageview(url) {
  if (analytics) {
    logEvent(analytics, "page_view", { page_path: url });
  }
}

// Export app และ analytics เผื่อใช้งาน
export { app, analytics };
