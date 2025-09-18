'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './FreeServices.module.css';
import dynamic from 'next/dynamic';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from 'next/image';

const Slider = dynamic(() => import("react-slick"), { ssr: false });

export default function FreeServices({ contacts = [], locale, loading, baseUrl }) {
  const [windowWidth, setWindowWidth] = useState(1920);
  const [skeletonConfig, setSkeletonConfig] = useState({ rows: 1, cards: 2 });
  const [loaded, setLoaded] = useState(false);

  const calcSkeleton = useCallback((width) => {
    if (!width) return { rows: 1, cards: 2 };
    if (width >= 1490) return { rows: 2, cards: 4 };
    if (width >= 1123) return { rows: 1, cards: 3 };
    if (width >= 781) return { rows: 1, cards: 2 };
    return { rows: 1, cards: 1 };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setSkeletonConfig(calcSkeleton(width));
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    if (!loading) {
      const timer = setTimeout(() => setLoaded(true), 50);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateSize);
      };
    }

    return () => window.removeEventListener("resize", updateSize);
  }, [loading, calcSkeleton]);

  const isSlider = windowWidth < 1490;

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

  if (!contacts || contacts.length === 0) return null;

  const limitedContacts = contacts.slice(0, 8);
  let topContacts = [], bottomContacts = [];
  if (limitedContacts.length <= 4) topContacts = limitedContacts;
  else if (limitedContacts.length === 5) {
    topContacts = limitedContacts.slice(0, 2);
    bottomContacts = limitedContacts.slice(2);
  } else if (limitedContacts.length <= 7) {
    topContacts = limitedContacts.slice(0, 3);
    bottomContacts = limitedContacts.slice(3);
  } else {
    topContacts = limitedContacts.slice(0, 4);
    bottomContacts = limitedContacts.slice(4);
  }

  const renderCard = (item, index) => {
    const imgSrc = item.picture
      ? `${baseUrl}/${item.picture}`
      : "/images/fallback.png";

    return (
      <div
        key={item.service_ID || `service-${index}`}
        className={`${styles.cardfree} ${loaded ? styles.fadeIn : styles.hiddenBeforeLoad}`}
      >
        <div className={styles.iconWrapper}>
          <Image
            src={imgSrc}
            alt={locale === 'th' ? item.titleTH : (item.titleEN || 'Service')}
            width={90}
            height={90}
            className={styles.icon}
            draggable={false}
            unoptimized // ป้องกันปัญหา image optimization
            onError={(e) => { e.currentTarget.src = "/images/fallback.png"; }}
          />
        </div>
        <p className={styles.titlefree}>{locale === 'th' ? item.titleTH : item.titleEN}</p>
        <p className={styles.subtitlefree}>{locale === 'th' ? item.subtitleTH : item.subtitleEN}</p>
        <ul className={styles.listfree}>
          {(locale === 'th' ? item.detailTH : item.detailEN)?.split('/').map((text, i) => (
            <li key={`${item.service_ID || index}-detail-${i}`} className={styles.textfree}>
              {text.trim()}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const getSlidesToShow = () => {
    if (windowWidth < 830) return 1;
    if (windowWidth < 1200) return 2;
    return 3;
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    arrows: windowWidth >= 830,
    speed: 600,
    slidesToShow: getSlidesToShow(),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    swipeToSlide: true,
    centerMode: false,
    beforeChange: (_, next) => {
      const slides = document.querySelectorAll(".slick-slide");
      slides.forEach((slide, i) => {
        if (i === next) slide.removeAttribute("inert");
        else slide.setAttribute("inert", "");
      });
    },
    afterChange: (current) => {
      const slides = document.querySelectorAll(".slick-slide");
      slides.forEach((slide, i) => {
        if (i === current) slide.removeAttribute("inert");
        else slide.setAttribute("inert", "");
      });
    }
  };

  return (
    <div className={styles.serviceSection}>
      <h1 className="headtitle">ข้อมูลบริการฟรี</h1>
      <h4 className={styles.headingfree}>
        <span className="keep-together">บริการครบครันตั้งแต่การปรึกษา</span>{' '}
        <span className="keep-together">ติดตั้งฟรี จนถึงการดูแลหลังการขาย</span>
      </h4>

      {isSlider ? (
        <div className={styles.responsiveSlider}>
          <Slider key={getSlidesToShow()} {...sliderSettings}>
            {limitedContacts.map((item, index) => renderCard(item, index))}
          </Slider>
        </div>
      ) : (
        <div className={styles.desktopGrid}>
          <div className={styles.gridWrapper}>
            <div className={styles.gridContainer}>{topContacts.map((item, index) => renderCard(item, index))}</div>
          </div>
          {bottomContacts.length > 0 && (
            <div className={styles.gridWrapper}>
              <div className={styles.gridContainer}>{bottomContacts.map((item, index) => renderCard(item, index))}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
