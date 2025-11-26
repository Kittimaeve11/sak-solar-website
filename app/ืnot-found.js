import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return (
    <div
      style={{
        position: 'fixed',     // 🔒 ล็อกเต็มจอ
        inset: 0,
        zIndex: 9999,          // อยู่บนสุด ทับ navbar/footer
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)',
        color: '#f9fafb',
        textAlign: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={{ maxWidth: '480px' }}>
        <p
          style={{
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            opacity: 0.7,
            marginBottom: '0.75rem',
          }}
        >
          Error 404
        </p>

        <h1
          style={{
            fontSize: '2.4rem',
            lineHeight: 1.1,
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          ไม่พบหน้าที่คุณต้องการ
        </h1>

        <p
          style={{
            fontSize: '0.98rem',
            opacity: 0.8,
            marginBottom: '1.8rem',
          }}
        >
          ลิงก์ที่คุณเข้าถึงอาจถูกย้ายหรือลบออกจากระบบแล้ว
          <br />
          คุณสามารถกลับไปที่หน้าแรกของเว็บไซต์เพื่อเริ่มต้นใหม่ได้
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              border: '1px solid #eab308',
              background:
                'linear-gradient(135deg, #facc15 0%, #eab308 45%, #ca8a04 100%)',
              color: '#0f172a',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 10px 30px rgba(234, 179, 8, 0.35)',
              cursor: 'pointer',
              minWidth: '180px',
            }}
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
