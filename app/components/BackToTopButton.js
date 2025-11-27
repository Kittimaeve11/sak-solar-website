'use client';
import { useState, useEffect } from 'react';
import { LuArrowUpToLine } from "react-icons/lu";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      const show = window.scrollY > 200;
      if (show !== visible) {
        setVisible(show);
        setShowAnimation(show);
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
        bottom: '100px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#367AF5',
        border: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',

        /* Animation */
        opacity: visible ? 1 : 0,
        transform: visible
          ? showAnimation
            ? 'translateY(0)'
            : 'translateY(20px)'
          : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <LuArrowUpToLine className="circle-shadow hover-wiggle" size={30} color="#FFFFFF" />
    </button>
  );
}
