'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Link from 'next/link';
import Image from 'next/image';
import './SlideReview.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { HiPlusSm } from 'react-icons/hi';
import { IoPlayCircleOutline } from "react-icons/io5";
import { useLocale } from '@/app/Context/LocaleContext';

// ตัวแปรสำหรับ API Base URL และ Key
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* =========================================================
   ฟังก์ชันดึง videoId จาก URL ของ YouTube
   ========================================================= */
function extractVideoId(url) {
  if (!url) return null;
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/* =========================================================
   Component แสดง Thumbnail พร้อม fallback
   ========================================================= */
function ThumbnailWithFallback({ videoId, alt }) {
  const [srcIndex, setSrcIndex] = useState(0);
  const thumbnailUrls = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  ];

  return (
    <Image
      key={`${videoId}-${srcIndex}`}
      src={thumbnailUrls[srcIndex]}
      alt={alt}
      width={374}
      height={210}
      className="thumbnailslide"
      style={{ width: '100%', height: 'auto' }}
      onError={() => {
        if (srcIndex < thumbnailUrls.length - 1) setSrcIndex(srcIndex + 1);
      }}
      unoptimized
    />
  );
}

/* =========================================================
   Component หลัก: SlideReview
   ========================================================= */
export default function SlideReview() {
  const { locale } = useLocale(); // ดึงภาษาปัจจุบัน
  const [reviews, setReviews] = useState([]); // เก็บข้อมูลรีวิว
  const [isLoading, setIsLoading] = useState(true); // สถานะโหลด
  const [activeSlide, setActiveSlide] = useState(0); // index slide ปัจจุบัน
  const [dragging, setDragging] = useState(false); // ป้องกันคลิกระหว่างลาก
  const sliderRef = useRef(null); // อ้างอิง slider

  /* =========================================================
     ดึงข้อมูลรีวิวจาก API
     ========================================================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${baseUrl}/api/Reviewapi?offset=0&limit=10`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const data = await res.json();

        if (data.status && data.result?.data && Array.isArray(data.result.data)) {
          setReviews(data.result.data);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================================================
     จัดการสไลด์และ custom dots
     ========================================================= */
  const slidesPerGroup = 3;
  const totalGroups =
    reviews.length > 0 ? Math.ceil(reviews.length / slidesPerGroup) : 0;

  const handleDotClick = (index) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index * slidesPerGroup);
      setActiveSlide(index);
    }
  };

  const handleBeforeChange = () => setDragging(true);
  const handleAfterChange = (i) => {
    setActiveSlide(Math.floor(i / slidesPerGroup));
    setTimeout(() => setDragging(false), 50);
  };

  /* =========================================================
     Custom Dots (แท่งส้ม)
     ========================================================= */
  const CustomDots = () => (
    <div className="custom-dots">
      {Array.from({ length: totalGroups }).map((_, index) => (
        <div
          key={index}
          className={`dot-bar ${activeSlide === index ? 'active' : ''}`}
          onClick={() => handleDotClick(index)}
        />
      ))}
    </div>
  );

  /* =========================================================
     Skeleton Loading (โครงจำลองขณะโหลด)
     ========================================================= */
  const SkeletonCard = () => (
    <div className="slide-itemreview fade-in">
      <div className="skeleton-card">
        <div className="skeleton skeleton-image"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-line"></div>
      </div>
    </div>
  );

  /* =========================================================
     ส่วนแสดงผลหลัก
     ========================================================= */
  return (
    <div className="review-wrapperslide fade-in">
      <h1 className="headtitleone">
        {locale === 'en' ? 'Customer Reviews' : 'รีวิวจากลูกค้า'}
      </h1>

      {/* ปุ่มดูทั้งหมด */}
      <div className="review-header-linkslide">
        <Link href="/review" className="view-all flex items-center gap-2">
          <HiPlusSm className="icon-view" />
          {locale === 'en' ? 'View All' : 'ดูทั้งหมด'}
        </Link>
      </div>

      {/* แสดง Skeleton ระหว่างโหลด */}
      {isLoading ? (
        <div className="review-loading-grid">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* สไลด์รีวิวลูกค้า */}
          <Slider
            ref={sliderRef}
            dots={false}
            infinite={reviews.length > slidesPerGroup}
            speed={500}
            slidesToShow={3}
            slidesToScroll={1}
            swipeToSlide
            arrows={false}
            centerMode={false}
            beforeChange={handleBeforeChange}
            afterChange={handleAfterChange}
            responsive={[
              {
                breakpoint: 1024,
                settings: { slidesToShow: 2, slidesToScroll: 1, swipeToSlide: true },
              },
              {
                breakpoint: 640,
                settings: { slidesToShow: 1, slidesToScroll: 1, swipeToSlide: true },
              },
            ]}
          >
            {reviews.map((review, i) => {
              const videoId = extractVideoId(review.vedio_link);
              if (!videoId) return null;

              const title =
                locale === 'en'
                  ? review.nameEN_Vedio || review.nameTH_Vedio || 'No title'
                  : review.nameTH_Vedio || review.nameEN_Vedio || 'ไม่มีชื่อเรื่อง';

              const dateLocale = locale === 'en' ? 'en-US' : 'th-TH';
              const formattedDate = new Date(
                review.vedio_creationdate
              ).toLocaleDateString(dateLocale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div key={review.vedio_id || `rev-${i}`} className="slide-itemreview fade-in">
                  <div
                    className="video-cardslide"
                    onClick={() => !dragging && window.open(review.vedio_link, '_blank')}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* ส่วนภาพ Thumbnail */}
                    <div className="thumbnail-wrapperslide">
                      <ThumbnailWithFallback videoId={videoId} alt={title} />
                      <IoPlayCircleOutline className="play-icon" />
                    </div>

                    {/* เนื้อหาด้านล่าง (ชื่อ + วันที่) */}
                    <div className="infoslide">
                      <h3 className="titleslide">{title}</h3>
                      <p className="dateslide">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>

          {/* จุดเลื่อนด้านล่าง */}
          <CustomDots />
        </>
      )}
    </div>
  );
}
