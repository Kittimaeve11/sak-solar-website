// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let analytics = null;

//  ป้องกันไม่ให้ initialize ในฝั่ง Server และ initialize แค่ครั้งเดียว
if (typeof window !== "undefined") {
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

    //  เช็กว่า analytics รองรับใน Browser นี้ไหม
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log(" Firebase Analytics is Ready:", analytics);
      } else {
        console.warn(" Firebase Analytics is not supported on this browser.");
      }
    });
  } catch (err) {
    console.error(" Firebase initialization error:", err);
  }
}

//  ฟังก์ชันส่ง PageView Event ไปยัง GA4
export function pageview(url) {
  if (analytics) {
    console.log(" Logging page_view:", url);
    logEvent(analytics, "page_view", { page_path: url });
  } else {
    console.warn(" Analytics not ready yet.");
  }
}

//  ฟังก์ชันส่ง Custom Event (ใช้ในปุ่ม, ฟอร์ม, ฯลฯ)
export function logEventCustom(eventName, params = {}) {
  if (analytics) {
    console.log(` Logging event: ${eventName}`, params);
    logEvent(analytics, eventName, params);
  } else {
    console.warn(` Analytics not ready for event: ${eventName}`);
  }
}

export { analytics };
