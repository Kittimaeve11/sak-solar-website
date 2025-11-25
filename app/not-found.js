import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "sans-serif",
        background: "#f8f8f8",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#222" }}>
        404 - ไม่พบหน้าที่คุณต้องการ
      </h1>

      <p style={{ fontSize: "1.2rem", marginBottom: "1.5rem", color: "#555" }}>
        หน้าที่คุณค้นหาอาจถูกลบ ย้าย หรือไม่มีอยู่จริง
      </p>

      <Link
        href="/"
        style={{
          padding: "10px 20px",
          background: "#333",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "6px",
          fontSize: "1rem",
        }}
      >
        กลับสู่หน้าหลัก
      </Link>
    </div>
  );
}
