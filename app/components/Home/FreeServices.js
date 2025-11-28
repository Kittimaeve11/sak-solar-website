'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './FreeServices.module.css';
import dynamic from 'next/dynamic';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Image from 'next/image';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

export default function FreeServices({ contacts = [], locale, loading, baseUrl }) {
  const [windowWidth, setWindowWidth] = useState(0);
  const [loaded, setLoaded] = useState(false);

  /*  รวมทุก useEffect เป็นอันเดียว */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    /* =====================  Resize + Debounce ===================== */
    let resizeTimer = null;
    let lastWidth = window.innerWidth;
    setWindowWidth(lastWidth);

    const handleResize = () => {
      const w = window.innerWidth;
      if (Math.abs(w - lastWidth) < 50) return;
      lastWidth = w;

      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWindowWidth(w);
      }, 400);
    };

    window.addEventListener('resize', handleResize);

    /* =====================  Fade-in on loading complete ===================== */
    let fadeTimer = null;
    if (!loading) {
      fadeTimer = setTimeout(() => setLoaded(true), 150);
    } else {
      setLoaded(false);
    }

    /* =====================  Cleanup ===================== */
    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(fadeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [loading]);

  /* =====================  Layout Decision ===================== */
  const isSlider = windowWidth < 1490;

  /* =====================  Memoized Data ===================== */
  const limitedContacts = useMemo(() => contacts.slice(0, 8), [contacts]);

  const topContacts = useMemo(() => {
    if (limitedContacts.length <= 4) return limitedContacts;
    if (limitedContacts.length === 5) return limitedContacts.slice(0, 2);
    if (limitedContacts.length <= 7) return limitedContacts.slice(0, 3);
    return limitedContacts.slice(0, 4);
  }, [limitedContacts]);

  const bottomContacts = useMemo(() => {
    if (limitedContacts.length <= 4) return [];
    if (limitedContacts.length === 5) return limitedContacts.slice(2);
    if (limitedContacts.length <= 7) return limitedContacts.slice(3);
    return limitedContacts.slice(4);
  }, [limitedContacts]);

  /* ===================== ⚙ Slider Settings ===================== */
  const slidesToShow = windowWidth < 830 ? 1 : windowWidth < 1200 ? 2 : 3;
  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      arrows: windowWidth >= 830,
      speed: 600,
      slidesToShow,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      pauseOnHover: true,
      swipeToSlide: true,
    }),
    [windowWidth, slidesToShow]
  );

  /* =====================  Render Card ===================== */
  const renderCard = (item, index) => {
    const imgSrc = item.picture ? `${baseUrl}/${item.picture}` : '/images/fallback.png';
    const title = locale === 'th' ? item.titleTH : item.titleEN;
    const subtitle = locale === 'th' ? item.subtitleTH : item.subtitleEN;
    const details = (locale === 'th' ? item.detailTH : item.detailEN)?.split('/') || [];

    return (
      <div
        key={`service-${item.service_ID || index}`}
        className={`${styles.cardfree} ${loaded ? 'fade-in' : 'hiddenBeforeLoad'}`}
      >
        <div className={styles.iconWrapperfree}>
          <Image
            src={imgSrc}
            alt={title || 'Service'}
            width={90}
            height={90}
            className={styles.iconfree}
            draggable={false}
            unoptimized
            onError={(e) => (e.currentTarget.src = '/images/fallback.png')}
          />
        </div>
        <p className={styles.titlefree}>{title}</p>
        <p className={styles.subtitlefree}>{subtitle}</p>
        <ul className={styles.listfree}>
          {details.map((text, i) => (
            <li key={`detail-${item.service_ID || index}-${i}`} className={styles.textfree}>
              {text.trim()}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const showSkeleton = loading || !contacts || contacts.length === 0;

  return (
    <div className={styles.serviceSection}>
      <h1 className="headtitle">ข้อมูลบริการฟรี</h1>
      <h4 className={styles.headingfree}>
        <span className="keep-together">บริการครบครันตั้งแต่การปรึกษา</span>{' '}
        <span className="keep-together">ติดตั้งฟรี จนถึงการดูแลหลังการขาย</span>
      </h4>

      {showSkeleton ? (
        <div className={styles.skeletonGridfree}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className={styles.skeletonCardfree}>
              <div className={`skeleton ${styles.skeletonCirclefree}`} />
              <div className={`skeleton ${styles.skeletonLinefree}`} />
              <div className={`skeleton ${styles.skeletonmessagefree}`} />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={`skeleton-${i}-${j}`} className={`skeleton ${styles.skeletonmessagedetailsfree}`} />
              ))}
            </div>
          ))}
        </div>
      ) : isSlider ? (
        <div className={styles.responsiveSliderfree}>
          <Slider key={slidesToShow} {...sliderSettings}>
            {limitedContacts.map((item, index) => renderCard(item, index))}
          </Slider>
        </div>
      ) : (
        <div className={styles.desktopGridfree}>
          <div className={styles.gridWrapperfree}>
            <div className={styles.gridContainerfree}>
              {topContacts.map((item, index) => renderCard(item, index))}
            </div>
          </div>

          {bottomContacts.length > 0 && (
            <div className={styles.gridWrapperfree}>
              <div className={styles.gridContainerfree}>
                {bottomContacts.map((item, index) => renderCard(item, index))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
