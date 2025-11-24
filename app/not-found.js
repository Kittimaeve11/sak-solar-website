export default function NotFound() {
  return (
    <html>
      <body style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        background: '#f8f8f8'
      }}>
        <h1>404 - ไม่พบหน้าที่คุณต้องการ</h1>
        <p>หน้าที่คุณค้นหาอาจถูกลบ ย้าย หรือไม่มีอยู่จริง</p>
        <a href="/" style={{
          marginTop: '20px',
          padding: '10px 16px',
          background: '#333',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>กลับสู่หน้าหลัก</a>
      </body>
    </html>
  );
}
