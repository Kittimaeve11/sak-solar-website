// app/not-found.js  ← ต้องอยู่ตำแหน่งนี้เท่านั้น

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        color: "#243865",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "4rem", fontWeight: "800" }}>404</h1>
      <p style={{ marginTop: "1rem" }}>ขออภัย ไม่พบหน้าที่คุณต้องการ</p>
      <Link
        href="/"
        style={{
          marginTop: "2rem",
          padding: "10px 24px",
          backgroundColor: "#E88534",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
        }}
      >
        กลับสู่หน้าหลัก
      </a>
    </div>
  );
}
