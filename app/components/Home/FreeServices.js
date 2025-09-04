'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './FreeServices.module.css';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// โหลด Slider แบบ dynamic ปิด SSR
const Slider = dynamic(() => import("react-slick"), { ssr: false });

export default function FreeServices({ contacts = [], locale, loading, baseUrl }) {
  // ---------------- Skeleton Config ---------------- //
  const calcSkeleton = useCallback((width) => {
    if (!width) return { rows: 1, cards: 3 };
    if (width > 1490) return { rows: 2, cards: 4 };
    if (width >= 1170) return { rows: 1, cards: 3 };
    if (width >= 830) return { rows: 1, cards: 2 };
    return { rows: 1, cards: 1 };
  }, []);

  const [skeletonConfig, setSkeletonConfig] = useState({ rows: 1, cards: 3 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setSkeletonConfig(calcSkeleton(window.innerWidth));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calcSkeleton]);

  // ---------------- Skeleton UI ---------------- //
  if (loading) {
    return (
      <div className={styles.serviceSection} aria-busy>
        <h1 className="headtitle">ข้อมูลบริการฟรี</h1>
        <h4
          className={styles.fadeIn}
          style={{
            textAlign: 'center',
            marginTop: -10,
            marginBottom: 20,
            fontWeight: 600,
            color: '#243865',
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
          }}
        >
          กำลังโหลดข้อมูลบริการ...
        </h4>

        {Array.from({ length: skeletonConfig.rows }).map((_, row) => (
          <div key={`row-${row}`} className={styles.gridWrapper}>
            <div className={styles.gridContainer}>
              {Array.from({ length: skeletonConfig.cards }).map((_, i) => (
                <div
                  key={`skeleton-${row}-${i}`}
                  className={`${styles.cardfree} ${styles.skeletonCard}`}
                >
                  <div className={`${styles.iconWrapper} ${styles.skeletonCircle}`} />
                  <div className={styles.skeletonLine} style={{ marginTop: 15, width: '70%', height: 18 }} />
                  <div className={styles.skeletonLine} style={{ marginTop: 15, width: '100%', height: 16 }} />
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div
                      key={`line-${i}-${j}`}
                      className={styles.skeletonLine}
                      style={{
                        marginTop: j === 0 ? 15 : 0,
                        alignSelf: 'flex-start',
                        width: '80%',
                        height: 16,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ---------------- ถ้าไม่มี contacts ---------------- //
  if (!contacts || contacts.length === 0) return null;

  // ---------------- แยก Contacts ---------------- //
  const limitedContacts = contacts.slice(0, 8);
  let topContacts = [];
  let bottomContacts = [];
  const len = limitedContacts.length;

  if (len <= 4) {
    topContacts = limitedContacts;
  } else if (len === 5) {
    topContacts = limitedContacts.slice(0, 2);
    bottomContacts = limitedContacts.slice(2);
  } else if (len === 6 || len === 7) {
    topContacts = limitedContacts.slice(0, 3);
    bottomContacts = limitedContacts.slice(3);
  } else if (len === 8) {
    topContacts = limitedContacts.slice(0, 4);
    bottomContacts = limitedContacts.slice(4);
  }

  // ---------------- Render Card ---------------- //
  const renderCard = (item, index) => (
    <div
      key={item.service_ID || `service-${index}`}
      className={`${styles.cardfree} ${styles.fadeIn}`}
    >
      <div className={styles.iconWrapper}>
        <Image
          src={`${baseUrl}/${item.picture}`}
          alt={locale === 'th' ? item.titleTH : (item.titleEN || 'Service')}
          width={90}
          height={90}
          className={styles.icon}
          draggable={false}
          onError={(e) => { e.currentTarget.src = "/images/fallback.png"; }}
        />
      </div>

      <p className={styles.titlefree}>
        {locale === 'th' ? item.titleTH : item.titleEN}
      </p>

      <p className={styles.subtitlefree}>
        {locale === 'th' ? item.subtitleTH : item.subtitleEN}
      </p>

      <ul className={styles.listfree}>
        {(locale === 'th' ? item.detailTH : item.detailEN)
          ?.split('/')
          .map((text, i) => (
            <li key={`${item.service_ID || index}-detail-${i}`} className={styles.textfree}>
              {text.trim()}
            </li>
          ))}
      </ul>
    </div>
  );

  // ---------------- Slider Settings ---------------- //
const sliderSettings = {
  dots: true,
  infinite: true,
  arrows: true,
  speed: 500,
  cssEase: "ease-in-out",
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  centerMode: false, //  ปิด centerMode จะจัดกึ่งกลางง่ายกว่า
  swipeToSlide: true,
  touchThreshold: 20,
  draggable: true,
  responsive: [
    { breakpoint: 1490, settings: { slidesToShow: 3 } },
    { breakpoint: 1170, settings: { slidesToShow: 2 } },
    { breakpoint: 830,  settings: { slidesToShow: 1, arrows: false } },
  ],
};


  // ---------------- Render จริง ---------------- //
  return (
    <div className={styles.serviceSection}>
      <h1 className="headtitle">ข้อมูลบริการฟรีAHHHHHHHHHHH</h1>
      <h4
        style={{
          textAlign: 'center',
          marginTop: -10,
          marginBottom: 20,
          fontWeight: 600,
          color: '#243865',
          fontSize: 'clamp(1rem, 3vw, 1.25rem)',
        }}
      >
        <span className="keep-together">บริการครบครันตั้งแต่การปรึกษา</span>{' '}
        <span className="keep-together">ติดตั้งฟรี จนถึงการดูแลหลังการขาย</span>
      </h4>

      {/* Desktop ≥1490px */}
      <div className={styles.desktopGrid}>
        <div className={styles.gridWrapper}>
          <div className={styles.gridContainer}>
            {topContacts.map((item, index) => renderCard(item, index))}
          </div>
        </div>
        {bottomContacts.length > 0 && (
          <div className={styles.gridWrapper}>
            <div className={styles.gridContainer}>
              {bottomContacts.map((item, index) => renderCard(item, index))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile <1490px */}
      <div className={styles.responsiveSlider}>
        <Slider {...sliderSettings}>
          {limitedContacts.map((item, index) => renderCard(item, index))}
        </Slider>
      </div>
    </div>
  );
}
