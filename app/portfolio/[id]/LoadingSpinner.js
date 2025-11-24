'use client';
import { useEffect } from 'react';
import styles from './PortfolioDetail.module.css';

export default function LoadingSpinner() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className={styles.spinnerFullscreen}>
      <div className={styles.spinner}></div>
      <div className={styles.loadingText}>
        กำลังโหลดข้อมูล
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
      </div>
    </div>
  );
}
