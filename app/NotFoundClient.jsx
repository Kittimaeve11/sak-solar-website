// app/not-found.js
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function NotFound() {
    // 🔒 ล็อกการเลื่อนหน้า
    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2147483647,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background:
                    'radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)',
                color: '#f9fafb',
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
                        color: '#f9fafb',

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

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginTop: '0.5rem',
                    }}
                >
                    <Link
                        href="/"
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '999px',
                            border: '1px solid #E88534',
                            background:
                                'linear-gradient(135deg, #ec8734ff 0%, #E88534 45%, #E88534 100%)',
                            color: '#0f172a',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            textDecoration: 'none',
                            boxShadow: '0 10px 30px rgba(234, 113, 8, 0.35)',
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
