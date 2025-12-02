"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

let app = null;
let analytics = null;

// Firebase config แบบเขียนตรง ๆ (ปลอดภัย เพราะ public อยู่แล้ว)
const firebaseConfig = {
  apiKey: "AIzaSyCUP0PrLE9gdWhIcYp273DB1uKAIyvzvXk",
  authDomain: "sak-solar.firebaseapp.com",
  projectId: "sak-solar",
  storageBucket: "sak-solar.appspot.com", // แก้ให้ถูก (ต้องเป็น .appspot.com)
  messagingSenderId: "1068534688191",
  appId: "1:1068534688191:web:495063b1efb1f7e3c9190a",
  measurementId: "G-GRQS76P3XV",
};

export function initFirebase() {
  if (typeof window === "undefined") return null;

  if (!app) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log(" Firebase Analytics Ready");
      }
    });
  }

  return app;
}

export function pageview(url) {
  if (analytics) {
    logEvent(analytics, "page_view", { page_path: url });
  }
}

export function logEventCustom(eventName, params = {}) {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

export { analytics };
