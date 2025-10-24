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
   Thumbnail พร้อม fallback ถ้าภาพโหลดไม่ได้
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
  const { locale } = useLocale();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragging, setDragging] = useState(false);
  const sliderRef = useRef(null);

  /* ---------------------------------------------------------
     ดึงข้อมูลจาก API
     --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     คำนวณจำนวน group สำหรับ custom dots
     --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     Custom Dots
     --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     Skeleton Loading
     --------------------------------------------------------- */
  const SkeletonCard = () => (
    <div className="slide-item fade-in">
      <div className="skeleton-card">
        <div className="skeleton skeleton-image"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-line"></div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------
     แสดงผลหลัก
     --------------------------------------------------------- */
  return (
    <div className="review-wrapperslide fade-in">
      <h1 className="headtitleone">
        {locale === 'en' ? 'Customer Reviews' : 'รีวิวจากลูกค้า'}
      </h1>

      <div className="review-header-linkslide">
        <Link href="/review" className="view-all">
          <HiPlusSm className="icon-view" />
          {locale === 'en' ? 'View All' : 'ดูทั้งหมด'}
        </Link>
      </div>

      {isLoading ? (
        <div className="review-loading-grid">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
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
                <div key={review.vedio_id || `rev-${i}`} className="slide-item fade-in">
                  <div
                    className="video-cardslide"
                    onClick={() => !dragging && window.open(review.vedio_link, '_blank')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className="thumbnail-wrapperslide"
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16/9',
                        overflow: 'hidden',
                        borderRadius: '12px',
                      }}
                    >
                      <ThumbnailWithFallback videoId={videoId} alt={title} />
                      <IoPlayCircleOutline className="play-icon" />
                    </div>

                    <div className="infoslide">
                      <h3 className="titleslide">{title}</h3>
                      <p className="dateslide">{formattedDate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>

          {/* custom dots แบบแท่งส้ม */}
          <CustomDots />
        </>
      )}
    </div>
  );
}
