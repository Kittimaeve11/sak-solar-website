'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import styles from '../../styles/CookieBanner.module.css';
import { FaRegWindowClose } from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { pageview } from '../lib/firebase';

const COOKIE_NAME = 'cookieConsentSettings';

const defaultSettings = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [openSection, setOpenSection] = useState(null);

  // โหลดสถานะคุกกี้เมื่อเปิดหน้า
  useEffect(() => {
    const savedSettings = Cookies.get(COOKIE_NAME);
    if (!savedSettings) {
      setShowBanner(true);
    } else {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // ฟังก์ชันยอมรับทั้งหมด
  const acceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    Cookies.set(COOKIE_NAME, JSON.stringify(allAccepted), { expires: 365 });
    setSettings(allAccepted);
    setShowBanner(false);
    setShowSettings(false);
    pageview(window.location.pathname + window.location.search);
  };

  // ฟังก์ชันบันทึกการตั้งค่า
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

  // ฟังก์ชันไม่ยอมรับทั้งหมด
  const rejectAll = () => {
    const rejected = { necessary: true, analytics: false, marketing: false };
    Cookies.set(COOKIE_NAME, JSON.stringify(rejected), { expires: 365 });
    setSettings(rejected);
    setShowBanner(false);
    setShowSettings(false);
  };

  // ฟังก์ชันเปิด/ปิด toggle การตั้งค่าแต่ละประเภท
  const toggleSetting = (key) => {
    if (key === 'necessary') return;
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ฟังก์ชันเปิด/ปิด accordion ของแต่ละหัวข้อ
  const toggleSection = (key) => {
    setOpenSection(openSection === key ? null : key);
  };

  // สร้างปุ่ม switch toggle
  const renderSwitch = (key) => {
    const active = settings[key];
    const bgColor = key === 'necessary' ? '#ccc' : active ? '#0b5ed7' : '#dc3545';
    const icon = key === 'necessary' ? '✓' : active ? '✓' : '✕';

    const handleClick = (e) => {
      //  กันไม่ให้ไป trigger onClick ของ cookieRow (ไม่ให้เปิด/ปิดดรอปดาวน์)
      e.stopPropagation();
      if (key !== 'necessary') {
        toggleSetting(key);
      }
    };

    return (
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: active ? 'flex-end' : 'flex-start',
          width: '50px',
          height: '26px',
          backgroundColor: bgColor,
          borderRadius: '999px',
          padding: '2px',
          cursor: key === 'necessary' ? 'not-allowed' : 'pointer',
          transition: '0.3s ease',
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
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
      {/* ===== แถบแจ้งเตือนคุกกี้ด้านล่าง ===== */}
      {showBanner && (
        <section className={styles.banner}>
          <div className={styles.content}>
            <h2 className={styles.title}>นโยบายการใช้คุกกี้</h2>
            <p className={styles.description}>
              เว็บไซต์นี้ใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและปรับปรุงประสบการณ์การใช้งานของคุณ
              สามารถอ่านรายละเอียดเพิ่มเติมได้ที่{' '}
              <Link
                href="/policy/POL202507290"
                target="_blank"
                className={styles.link}
              >
                นโยบายความเป็นส่วนตัว
              </Link>
            </p>
            <div className={styles.actions}>
              <button className={styles.btnPrimary} onClick={acceptAll}>
                ยอมรับคุกกี้ทั้งหมด
              </button>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowSettings(true)}
              >
                ตั้งค่าคุกกี้
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ===== Modal การตั้งค่าคุกกี้ ===== */}
      {showSettings && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              onClick={() => setShowSettings(false)}
              className={styles.closeBtn}
              aria-label="ปิดหน้าต่าง"
            >
              <FaRegWindowClose />
            </button>

            <h2 className={styles.title}>ประเภทของคุกกี้ที่บริษัทใช้</h2>
            <p className={styles.description}>
              บริษัทจะใช้คุกกี้เมื่อท่านได้เข้าเยี่ยมชมเว็บไซต์ของบริษัท โดยการใช้งานคุกกี้ของเราแบ่งออกตามลักษณะของการใช้งานได้ดังนี้
            </p>

            {[
              {
                key: 'necessary',
                label: 'คุกกี้ที่จำเป็น (Strictly Necessary Cookies)',
                desc: 'คุกกี้ประเภทนี้มีความจำเป็นต่อการทำงานของเว็บไซต์ เพื่อให้เว็บไซต์สามารถทำงานได้เป็นปกติ มีความปลอดภัย และทำให้ท่านสามารถเข้าใช้เว็บไซต์ได้ เช่น การ log in เข้าสู่เว็บไซต์ การยืนยันตัวตน ทั้งนี้ ท่านไม่สามารถปิดการใช้งานของคุกกี้ประเภทนี้ผ่านระบบของเว็บไซต์ของบริษัทได้',
              },
              {
                key: 'marketing',
                label: 'คุกกี้เพื่อปรับเนื้อหาให้เข้ากับกลุ่มเป้าหมาย (Targeting Cookies)',
                desc: 'คุกกี้ประเภทนี้จะเก็บข้อมูลต่าง ๆ ซึ่งอาจรวมถึงข้อมูลส่วนบุคคลของท่านและสร้างโปรไฟล์เกี่ยวกับตัวท่าน เพื่อให้เราสามารถวิเคราะห์และนำเสนอเนื้อหา สินค้า/บริการ และ/หรือ โฆษณาที่เหมาะสมกับความสนใจของท่านได้ ทั้งนี้ หากท่านไม่ยินยอมให้เราใช้ คุกกี้ประเภทนี้ ท่านอาจได้รับข้อมูลและโฆษณาทั่วไปที่ไม่ตรงกับความสนใจของท่าน',
              },
              {
                key: 'analytics',
                label: 'คุกกี้เพื่อช่วยในการใช้งาน (Functional Cookies)',
                desc: 'คุกกี้ประเภทนี้จะช่วยจดจำข้อมูลคอมพิวเตอร์หรืออุปกรณ์อิเล็กทรอนิกส์ที่ท่านใช้เข้าชมเว็บไซต์ ข้อมูลการลงทะเบียนหรือ log in ข้อมูลการตั้งค่าหรือตัวเลือกที่ท่านเคยเลือกไว้บนเว็บไซต์ เช่น ภาษาที่แสดงบนเว็บไซต์ ที่อยู่สำหรับจัดส่งสินค้า เพื่อให้ท่านสามารถใช้งานเว็บไซต์ได้สะดวกยิ่งขึ้น โดยไม่ต้องให้ข้อมูลหรือตั้งค่าใหม่ทุกครั้งที่ท่านเข้าใช้เว็บไซต์ ทั้งนี้ หากท่านไม่ยินยอมให้เราใช้คุกกี้ประเภทนี้ ท่านอาจใช้งานเว็บไซต์ได้ไม่สะดวกและไม่เต็มประสิทธิภาพ',
              },
            ].map((item) => (
              <div
                key={item.key}
                className={`${styles.cookieBox} ${
                  openSection === item.key ? styles.open : ''
                }`}
              >
                <div
                  className={styles.cookieRow}
                  onClick={() => toggleSection(item.key)}
                >
                  <div className={styles.cookieLeft}>
                    {openSection === item.key ? (
                      <IoIosArrowUp size={20} className={styles.arrowIcon} />
                    ) : (
                      <IoIosArrowDown size={20} className={styles.arrowIcon} />
                    )}
                    <span className={styles.cookieLabel}>{item.label}</span>
                  </div>
                  <div className={styles.cookieRight}>
                    {renderSwitch(item.key)}
                  </div>
                </div>

                {openSection === item.key && (
                  <div className={styles.cookieDesc}>{item.desc}</div>
                )}
              </div>
            ))}

            {/* ปุ่มควบคุมซ้าย/ขวา */}
            <div className={styles.actionsRow}>
              <div className={styles.actionLeft}>
                <button className={styles.btnPrimary} onClick={acceptAll}>
                  ยอมรับคุกกี้ทั้งหมด
                </button>
                <button className={styles.btnSecondary} onClick={rejectAll}>
                  ไม่ยอมรับคุกกี้ทั้งหมด
                </button>
              </div>

              <div className={styles.actionRight}>
                <button className={styles.btnSecondary} onClick={saveSettings}>
                  ยืนยันตัวเลือกของฉัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
