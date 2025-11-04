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
   🔍 ดึง videoId จาก URL
========================================================= */
function extractVideoId(url) {
  if (!url) return null;
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/* =========================================================
   🖼 แสดง Thumbnail พร้อม fallback
========================================================= */
function ThumbnailWithFallback({ videoId, alt }) {
  const [srcIndex, setSrcIndex] = useState(0);
  const urls = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  ];

  return (
    <Image
      key={`${videoId}-${srcIndex}`}
      src={urls[srcIndex]}
      alt={alt}
      width={374}
      height={210}
      className="thumbnailslide"
      style={{ width: '100%', height: 'auto' }}
      onError={() => srcIndex < urls.length - 1 && setSrcIndex(srcIndex + 1)}
      unoptimized
    />
  );
}

/* =========================================================
   🌟 Component หลัก: SlideReview
========================================================= */
export default function SlideReview() {
  const { locale } = useLocale();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [visibleCards, setVisibleCards] = useState(3);
  const sliderRef = useRef(null);

/* =========================================================
   ✅ ฟังก์ชันบันทึก Log “รีวิว” (แก้สมบูรณ์)
========================================================= */
const handleLogReviewClick = async (item) => {
  try {
    const logData = {
      actionType: "4",
      actionDetail: `หน้าหลัก รหัสวิดีโอ: ${item.vedio_id ?? "0"} ชื่อวิดีโอ : ${item.nameTH_Vedio ?? "-"}`,
      typeUser: "ผู้เยี่ยมชมเว็บไซต์",
      datatype: "รีวิว",
      dataID: item.vedio_id ?? "0",
      dataname: item.nameTH_Vedio ?? "-",
      datatypeID: "0",  // ✅ ต้องไม่ null
      brandtype: "0"    // ✅ ต้องไม่ null เช่นกัน
    };

    console.log("📤 ส่ง Log รีวิว:", logData);

    const res = await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(logData),
    });

    if (!res.ok) {
      console.error("❌ Log API error:", await res.text());
    } else {
      console.log("✅ Log รีวิวบันทึกสำเร็จ");
    }
  } catch (err) {
    console.error("💥 เกิดข้อผิดพลาดตอนส่ง Log รีวิว:", err);
  }
};

  /* =========================================================
     ✅ รวม useEffect เดียว: ตรวจขนาดจอ + โหลด API + cleanup
  ========================================================= */
  useEffect(() => {
    let isMounted = true;

    const updateVisibleCards = () => {
      const width = window.innerWidth;
      if (width < 764) setVisibleCards(1);
      else if (width < 1120) setVisibleCards(2);
      else setVisibleCards(3);
    };

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);

    async function loadReviews() {
      try {
        if (window.__REVIEW_CACHE__) {
          setReviews(window.__REVIEW_CACHE__);
          setIsLoading(false);
          return;
        }

        const res = await fetch(`${baseUrl}/api/Reviewapi?offset=0&limit=10`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const data = await res.json();

        if (isMounted && data.status && Array.isArray(data.result?.data)) {
          window.__REVIEW_CACHE__ = data.result.data;
          setReviews(data.result.data);
        }
      } catch (err) {
        console.error('❌ Error fetching reviews:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
      window.removeEventListener('resize', updateVisibleCards);
    };
  }, []);

  /* =========================================================
     ⚙️ Custom dots
  ========================================================= */
  const slidesPerGroup = 3;
  const totalGroups = Math.ceil(reviews.length / slidesPerGroup);

  const handleDotClick = (index) => {
    sliderRef.current?.slickGoTo(index * slidesPerGroup);
    setActiveSlide(index);
  };

  const handleBeforeChange = () => setDragging(true);
  const handleAfterChange = (index) => {
    setActiveSlide(Math.floor(index / slidesPerGroup));
    setTimeout(() => setDragging(false), 50);
  };

  const CustomDots = () => (
    <div className="custom-dots">
      {Array.from({ length: totalGroups }).map((_, i) => (
        <div
          key={i}
          className={`dot-bar ${activeSlide === i ? 'active' : ''}`}
          onClick={() => handleDotClick(i)}
        />
      ))}
    </div>
  );

  /* =========================================================
     💀 Skeleton Loading
  ========================================================= */
  const SkeletonCard = () => (
    <div className="skeleton-slide">
      <div className="skeleton-card">
        <div className="skeleton skeleton-image"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-line"></div>
      </div>
    </div>
  );

  /* =========================================================
     🖥 Render
  ========================================================= */
  return (
    <div className="review-wrapperslide fade-in">
      <h1 className="headtitleone">
        {locale === 'en' ? 'Customer Reviews' : 'รีวิวจากลูกค้า'}
      </h1>

      <div className="review-header-linkslide">
        <Link href="/review" className="view-all flex items-center gap-2">
          <HiPlusSm className="icon-view" />
          {locale === 'en' ? 'View All' : 'ดูทั้งหมด'}
        </Link>
      </div>

      {isLoading ? (
        <div className="skeleton-wrapper">
          {[...Array(visibleCards)].map((_, i) => (
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
            arrows={false}
            swipeToSlide
            beforeChange={handleBeforeChange}
            afterChange={handleAfterChange}
            responsive={[
              { breakpoint: 1120, settings: { slidesToShow: 2 } },
              { breakpoint: 764, settings: { slidesToShow: 1 } },
            ]}
          >
            {reviews.map((r, i) => {
              const id = extractVideoId(r.vedio_link);
              if (!id) return null;

              const title =
                locale === 'en'
                  ? r.nameEN_Vedio || r.nameTH_Vedio || 'No title'
                  : r.nameTH_Vedio || r.nameEN_Vedio || 'ไม่มีชื่อเรื่อง';

              const date = new Date(r.vedio_creationdate).toLocaleDateString(
                locale === 'en' ? 'en-US' : 'th-TH',
                { year: 'numeric', month: 'long', day: 'numeric' }
              );

              return (
                <div key={r.vedio_id || i} className="slide-itemreview fade-in">
                  <div
                    className="video-cardslide"
                    onClick={async () => {
                      if (!dragging) {
                        await handleLogReviewClick(r); // ✅ บันทึก Log ก่อน
                        window.open(r.vedio_link, '_blank'); // ✅ เปิดวิดีโอ
                      }
                    }}
                  >
                    <div className="thumbnail-wrapperslide">
                      <ThumbnailWithFallback videoId={id} alt={title} />
                      <IoPlayCircleOutline className="play-icon" />
                    </div>
                    <div className="infoslide">
                      <h3 className="titleslide">{title}</h3>
                      <p className="dateslide">{date}</p>
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
