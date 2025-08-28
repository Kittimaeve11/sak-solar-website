'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RouteLoadingOverlay() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    router.events?.on('routeChangeStart', handleStart);
    router.events?.on('routeChangeComplete', handleStop);
    router.events?.on('routeChangeError', handleStop);

    return () => {
      router.events?.off('routeChangeStart', handleStart);
      router.events?.off('routeChangeComplete', handleStop);
      router.events?.off('routeChangeError', handleStop);
    };
  }, [router]);

  if (!loading) return null;

  return (
    <div style={overlayStyle}>
      <div className="spinner" />
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};
