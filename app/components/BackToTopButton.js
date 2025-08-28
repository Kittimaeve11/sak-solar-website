'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      const show = window.scrollY > 200;
      if (show !== visible) {
        setVisible(show);
        if (show) {
          // เลื่อนขึ้น animation เริ่มตอนแสดง
          setShowAnimation(true);
        } else {
          // ปิด animation ทันทีเมื่อซ่อน
          setShowAnimation(false);
        }
      }
    };

    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, [visible]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="กลับขึ้นบน"
      style={{
        position: 'fixed',
        bottom: '96px',
        right: '20px',
        background: 'none',
        border: 'none',
        padding: 0,
        zIndex: 1000,
        cursor: 'pointer',

        // animation style
        opacity: visible ? 1 : 0,
        transform: visible
          ? showAnimation
            ? 'translateY(0)'
            : 'translateY(20px)'
          : 'translateY(20px)',

        transition: 'opacity 0.4s ease, transform 0.4s ease',
        pointerEvents: visible ? 'auto' : 'none', // ปิดการคลิกเวลาซ่อน
      }}
    >
      <div className="circle-shadow hover-wiggle">
        <Image
          src="/images/icons/top.png"
          alt="กลับขึ้นบน"
          width={55}
          height={55}
          priority
        />
      </div>
    </button>
  );
}
