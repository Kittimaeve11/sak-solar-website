'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import './SlideEditorial.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaArrowRightLong } from 'react-icons/fa6';
import { HiPlusSm } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/app/Context/LocaleContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ===================== Log ===================== */
const handleLogClick = async (item) => {
  try {
    const logData = {
      actionType: '2',
      actionDetail: `หน้าหลัก รหัสบทความ: ${item.editoria_id ?? '-'} หมายเลขบทความ: ${item.editoria_num ?? '-'} ชื่อบทความ: ${item.editoria_titieTH ?? '-'}`,
      typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
      datatype: 'บทความ',
      dataID: item.editoria_id ?? '0',
      datatypeID: item.editoria_typeID ?? '0',
      brandtype: '0',
      dataname: item.editoria_titieTH ?? '-',
    };

    await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey || '',
      },
      body: JSON.stringify(logData),
    });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการบันทึก Log:', err);
  }
};

/* ===================== Helpers ===================== */
function parseDescription(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/^"+|"+$/g, '')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\\n/g, '')
    .replace(/ style="[^"]*"/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function getImageUrl(galleryStr) {
  if (!galleryStr) return '/images/no-image.jpg';

  try {
    const arr = JSON.parse(galleryStr);
    const first = arr?.[0];
    if (!first) return '/images/no-image.jpg';

    const cleaned = String(first).replace(/\\/g, '/').replace(/\/{2,}/g, '/');
    return `${baseUrl}/${cleaned.replace(/^\//, '')}`;
  } catch {
    return '/images/no-image.jpg';
  }
}

function formatDate(dateString, locale) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  if (locale === 'th') {
    const buddhistYear = date.getFullYear() + 543;
    const month = date.toLocaleDateString('th-TH', { month: 'long' });
    const day = date.getDate();
    return `${day} ${month} ${buddhistYear}`;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ===================== Component ===================== */
export default function SlideEditorial() {
  const { locale } = useLocale();
  const [editorials, setEditorials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeGroup, setActiveGroup] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  const sliderRef = useRef(null);
  const router = useRouter();

  /* -------- โหลดข้อมูล + คำนวณ slidesToShow -------- */
  useEffect(() => {
    let isMounted = true;

    const updateSlidesToShow = () => {
      const width = window.innerWidth;
      if (width < 764) setSlidesToShow(1);
      else if (width < 1120) setSlidesToShow(2);
      else setSlidesToShow(3);
    };

    const loadEditorialOnce = async () => {
      if (window.__EDITORIAL_CACHE__) {
        setEditorials(window.__EDITORIAL_CACHE__);
        setIsLoading(false);
        return;
      }

      try {
        const API_ENABLED = false;

        if (!API_ENABLED) {
          setLoadingServices(false);
          setLoadingProducts(false);
          return;
        }
        const res = await fetch(`${baseUrl}/api/edittormainpageapi`, {
          headers: { 'X-API-KEY': apiKey || '' },
        });
        const data = await res.json();

        if (isMounted && data?.status && Array.isArray(data.result)) {
          const mapped = data.result.map((item) => ({
            ...item,
            id: item.editoria_num || item.editoria_id,
            image: getImageUrl(item.editoria_gallary),
            pin: Number(item.editoria_pin) || 0,
          }));

          mapped.sort((a, b) => b.pin - a.pin);

          window.__EDITORIAL_CACHE__ = mapped;
          setEditorials(mapped);
        }
      } catch (error) {
        // console.error(' Failed to fetch editorial:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    updateSlidesToShow();
    window.addEventListener('resize', updateSlidesToShow);
    loadEditorialOnce();

    return () => {
      isMounted = false;
      window.removeEventListener('resize', updateSlidesToShow);
    };
  }, []);

  /* -------- Dot Control -------- */
  const slidesPerGroup = slidesToShow;
  const totalGroups = editorials.length
    ? Math.ceil(editorials.length / slidesPerGroup)
    : 0;

  const handleDotClick = (index) => {
    if (sliderRef.current) sliderRef.current.slickGoTo(index * slidesPerGroup);
    setActiveGroup(index);
  };

  const handleAfterChange = (current) => {
    const groupIndex = Math.floor(current / slidesPerGroup);
    setActiveGroup(groupIndex);
  };

  const CustomDots = () => (
    <div className="custom-dots">
      {Array.from({ length: totalGroups }).map((_, index) => (
        <div
          key={index}
          className={`dot-bar ${activeGroup === index ? 'active' : ''}`}
          onClick={() => handleDotClick(index)}
        />
      ))}
    </div>
  );

  /* ===================== Render ===================== */
  return (
    <div className="editorial-wrapperslide fade-in">
      <h1 className="headtitleone">{locale === 'en' ? 'Editorials' : 'บทความ'}</h1>

      <div className="editorial-headerslide">
        <Link href="/editorial" className="view-all">
          <HiPlusSm className="icon-view" />
          {locale === 'en' ? 'View all' : 'ดูทั้งหมด'}
        </Link>
      </div>

      {/*  Skeleton Loading แบบ Dynamic ตาม slidesToShow */}
      {isLoading ? (
        <div className="skeleton-cardsilde-editorial-container">
          {Array.from({ length: slidesToShow }).map((_, index) => (
            <div key={index} className="skeleton-cardsilde-editorial">
              <div className="skeleton skeleton-imagesilde-editorial" />
              <div className="skeleton skeleton-titlesilde-editorial" />
              <div className="skeleton skeleton-datesilde-editorial" />
              <div className="skeleton skeleton-textsilde-editorial" />
              <div className="skeleton skeleton-textsilde-editorial" />

            </div>
          ))}
        </div>
      ) : (
        <>
          <Slider
            key={slidesToShow}
            ref={sliderRef}
            dots={false}
            infinite={editorials.length > slidesPerGroup}
            speed={500}
            slidesToShow={slidesToShow}
            slidesToScroll={1}
            swipeToSlide
            arrows={false}
            afterChange={handleAfterChange}
          >
            {editorials.map((item, i) => {
              const title =
                locale === 'en'
                  ? item.editoria_titieEN || item.editoria_titieTH
                  : item.editoria_titieTH || item.editoria_titieEN;

              const rawDesc =
                locale === 'en'
                  ? item.editoria_descriptionEN || item.editoria_descriptionTH
                  : item.editoria_descriptionTH || item.editoria_descriptionEN;

              const content = parseDescription(rawDesc);
              const snippet = content.length > 100 ? content.slice(0, 100) + '...' : content;

              const dateLabel = formatDate(item.editoria_creacteAt, locale);

              return (
                <div key={item.id || i} className="slide-itemeditorialslide fade-in">
                  <div
                    className="editorial-cardslide clickable"
                    onMouseDown={(e) => (e.currentTarget.isDragging = false)}
                    onMouseMove={(e) => (e.currentTarget.isDragging = true)}
                    onClick={async (e) => {
                      if (!e.currentTarget.isDragging) {
                        await handleLogClick(item);
                        router.push(`/editorial/${item.id}`);
                      }
                    }}
                  >
                    <div className="editorial-image-wrapperslide">
                      <Image
                        src={item.image}
                        alt={title}
                        fill
                        className="card-imageslide"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                    </div>

                    <div className="card-contentslide">
                      <h3 className="card-titleslide">{title}</h3>
                      <p className="editorial-dateslide">{dateLabel}</p>
                      <p className="card-snippetslide">{snippet}</p>
                      <p className="read-more">
                        {locale === 'en' ? 'Read more' : 'อ่านเพิ่มเติม'} <FaArrowRightLong />
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>

          <CustomDots />
        </>
      )}
    </div>
  );
}
