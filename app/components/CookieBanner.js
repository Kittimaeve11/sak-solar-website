'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import styles from '../../styles/CookieBanner.module.css';
import { FaRegWindowClose } from "react-icons/fa";
const COOKIE_NAME = 'cookieConsentSettings';
import { pageview } from '../lib/firebase';

const defaultSettings = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const savedSettings = Cookies.get(COOKIE_NAME);
    if (!savedSettings) {
      setShowBanner(true);
    } else {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    Cookies.set(COOKIE_NAME, JSON.stringify(allAccepted), { expires: 365 });
    setSettings(allAccepted);
    setShowBanner(false);
    setShowSettings(false);

    // Trigger pageview
    pageview(window.location.pathname + window.location.search);
  };

  const saveSettings = () => {
    const toSave = { ...settings, necessary: true };
    Cookies.set(COOKIE_NAME, JSON.stringify(toSave), { expires: 365 });
    setSettings(toSave);
    setShowBanner(false);
    setShowSettings(false);

    if (toSave.analytics) {
      pageview(window.location.pathname + window.location.search);
    }
  };

  const rejectAll = () => {
    const rejected = { necessary: true, analytics: false, marketing: false };
    Cookies.set(COOKIE_NAME, JSON.stringify(rejected), { expires: 365 });
    setSettings(rejected);
    setShowBanner(false);
    setShowSettings(false);
  };


  const openSettings = () => {
    setShowSettings(true);
  };

  const toggleSetting = (key) => {
    if (key === 'necessary') return;
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSwitch = (key) => {
    const active = settings[key];
    const bgColor = key === 'necessary' ? '#ccc' : active ? '#0d6efd' : '#dc3545';
    const icon = key === 'necessary' ? '✓' : active ? '✓' : '✕';

    return (
      <div
        onClick={() => key !== 'necessary' && toggleSetting(key)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: active ? 'flex-end' : 'flex-start',
          width: '50px',
          height: '28px',
          backgroundColor: bgColor,
          borderRadius: '999px',
          padding: '2px',
          cursor: key === 'necessary' ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s, justify-content 0.3s',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: bgColor,
          }}
        >
          {icon}
        </div>
      </div>
    );
  };

  if (!showBanner && !showSettings) return null;

  return (
    <>
      {showBanner && (
        <section className={styles.banner}>
          <div className={styles.content}>
            <h2 className={styles.title}>นโยบายการใช้คุกกี้</h2>
            <p className={styles.description}>
              เว็บไซต์นี้ใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและปรับปรุงประสบการณ์การใช้งานของคุณ รวมถึงวิเคราะห์และปรับแต่งเนื้อหา{' '}
              คุณสามารถอ่านรายละเอียดเพิ่มเติมได้ที่{' '}
              <a href="/privacy-policy" target="_blank" className={styles.link}>
                นโยบายความเป็นส่วนตัว
              </a>
            </p>
            <div className={styles.actions}>
              <button className={styles.btnPrimary} onClick={acceptAll}>
                ยอมรับคุกกี้ทั้งหมด
              </button>
              <button className={styles.btnSecondary} onClick={openSettings}>
                ตั้งค่าคุกกี้
              </button>
            </div>
          </div>
        </section>
      )}

      {showSettings && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ position: 'relative' }}>
            {/* ปุ่มปิดมุมขวาบน */}
            <button
              onClick={() => setShowSettings(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: '#333',
                lineHeight: 1,
              }}
              aria-label="ปิดหน้าต่าง"
            >
              <FaRegWindowClose />
            </button>

            {/* เนื้อหา modal เดิมของคุณ */}
            <h2 className={styles.title}>ประเภทของคุกกี้ที่บริษัทใช้</h2>
            <p className={styles.description}>
              บริษัทจะใช้คุกกี้เมื่อท่านได้เข้าเยี่ยมชมเว็บไซต์ของบริษัท โดยการใช้งานคุกกี้ของเราแบ่งออกตามลักษณะของการใช้งานได้ดังนี้
            </p>

            <div className={styles.cookieRow}>
              <div className={styles.cookieLabel}>
                คุกกี้ที่จำเป็น (Strictly Necessary Cookies)
              </div>
              {renderSwitch('necessary')}
            </div>

            <div className={styles.cookieRow}>
              <div className={styles.cookieLabel}>
                คุกกี้เพื่อปรับเนื้อหาให้เข้ากับกลุ่มเป้าหมาย (Targeting Cookies)
              </div>
              {renderSwitch('marketing')}
            </div>

            <div className={styles.cookieRow}>
              <div className={styles.cookieLabel}>
                คุกกี้เพื่อช่วยในการใช้งาน (Functional Cookies)
              </div>
              {renderSwitch('analytics')}
            </div>

            <div className={styles.actions}>
              <button className={styles.btnPrimary} onClick={acceptAll}>ยอมรับคุกกี้ทั้งหมด</button>
              <button className={styles.btnSecondary} onClick={rejectAll}>ไม่ยอมรับคุกกี้ทั้งหมด</button>
              <button className={styles.btnSecondary} onClick={saveSettings}>ยืนยันตัวเลือกของฉัน</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
