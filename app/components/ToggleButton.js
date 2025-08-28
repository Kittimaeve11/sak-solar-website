'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

function ToggleButton({ isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'ซ่อนปุ่มติดต่อ' : 'แสดงปุ่มติดต่อ'}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: isOpen ? '#0051a2' : '#0070f3',
        color: '#fff',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        transition: 'background-color 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          display: 'block',
        }}
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

export default function FloatingButtons() {
  const [lineUrl, setLineUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showButtons, setShowButtons] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // Fetch data API
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();

        const line = data.socials.find((item) => item.id === 'line');
        if (line) setLineUrl(line.url);

        const phone = data.contacts.find((item) => item.SubjectTH === 'เบอร์โทรศัพท์');
        if (phone && phone.WorkforceTH) {
          const digits = phone.WorkforceTH.replace(/\D/g, '');
          if (digits) setPhoneNumber(digits);
        }
      } catch (err) {
        console.error('โหลดข้อมูล API ไม่สำเร็จ:', err);
      }
    };

    fetchData();

    // Scroll event for BackToTop visibility
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        userSelect: 'none',
        fontFamily: 'sans-serif',
      }}
    >
      {/* กล่องไอคอน + BackToTop เลื่อนซ้าย-ขวา */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#fff',
          padding: '10px 12px',
          borderRadius: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: showButtons ? 'translateX(0)' : 'translateX(150%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: '64px',
          justifyContent: 'center',
        }}
      >
        {/* BackToTop */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              zIndex: 1100,
            }}
            aria-label="กลับขึ้นบน"
          >
            <div className="circle-shadow hover-wiggle" style={{ width: 50, height: 50 }}>
              <Image
                src="/images/icons/top.png"
                alt="กลับขึ้นบน"
                width={50}
                height={50}
              />
            </div>
          </button>
        )}

        {/* ไลน์ */}
        {lineUrl && (
          <a href={lineUrl} target="_blank" rel="noopener noreferrer" >
            <div className="circle-shadow hover-wiggle" style={{ width: 50, height: 50 }}>
              <Image
                src="/images/icons/linecontact.png"
                alt="Line"
                width={50}
                height={50}
              />
            </div>
          </a>
        )}

        {/* โทรศัพท์ */}
        {phoneNumber && (
          <a href={`tel:${phoneNumber}`}>
            <div className="circle-shadow hover-wiggle" style={{ width: 50, height: 50 }}>
              <Image
                src="/images/icons/callcontact.png"
                alt="Phone"
                width={50}
                height={50}
              />
            </div>
          </a>
        )}
      </div>

      {/* ปุ่มซ่อน/แสดงเล็ก ๆ */}
      <ToggleButton
        isOpen={showButtons}
        onToggle={() => setShowButtons(!showButtons)}
      />
    </div>
  );
}
