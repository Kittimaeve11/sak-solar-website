'use client';

import React, { useRef, useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// อ่านค่า environment
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// ✅ เพิ่ม cache เก็บข้อมูลใน memory ระหว่าง navigation
let bannerCache = {
  data: null,
  timestamp: 0, // เวลาเก็บ cache ล่าสุด
};

/* ปุ่มเลื่อนซ้าย */
function PrevArrow({ onClick }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: "50%",
        left: 20,
        transform: "translateY(-50%)",
        zIndex: 10,
        borderRadius: "50%",
        width: 36,
        height: 36,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <FaChevronLeft color="rgba(255, 255, 255, 0.6)" size={25} />
    </div>
  );
}

/* ปุ่มเลื่อนขวา */
function NextArrow({ onClick }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: "50%",
        right: 20,
        transform: "translateY(-50%)",
        zIndex: 10,
        borderRadius: "50%",
        width: 36,
        height: 36,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <FaChevronRight color="rgba(255, 255, 255, 0.6)" size={25} />
    </div>
  );
}

/* =============================
   Banner Slider Component
============================= */
export default function BannerSlider() {
  const sliderRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [loadedIndexes, setLoadedIndexes] = useState({});
  const [initialSlide, setInitialSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const isDragging = useRef(false);

  /* ตรวจสอบขนาดหน้าจอ */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const savedIndex = localStorage.getItem("bannerSlideIndex");
    if (savedIndex !== null) setInitialSlide(parseInt(savedIndex));

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ดึงข้อมูลแบนเนอร์ (ใช้ cache ป้องกันโหลดซ้ำ) */
  useEffect(() => {
    let isMounted = true;

    const fetchBanners = async () => {
      try {
        // ✅ ถ้ามี cache และอายุไม่เกิน 10 นาที ใช้ข้อมูลเดิมเลย
        const cacheAge = Date.now() - bannerCache.timestamp;
        if (bannerCache.data && cacheAge < 1000 * 60 * 10) {
          if (isMounted) {
            setBanners(bannerCache.data);
            setLoading(false);
          }
          return;
        }

        // ✅ โหลดใหม่จาก API
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/branderhomeapi`, {
          headers: { "X-API-KEY": apiKey },
          cache: "no-store",
        });
        const data = await res.json();

        if (isMounted && data.status && data.result) {
          setBanners(data.result);
          // ✅ เก็บ cache
          bannerCache = {
            data: data.result,
            timestamp: Date.now(),
          };
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  /* ตั้งค่า Slider */
  const settings = {
    dots: banners.length > 1,
    infinite: banners.length > 1,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: banners.length > 1,
    autoplaySpeed: 3500,
    arrows: banners.length > 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    initialSlide,
    afterChange: (current) => localStorage.setItem("bannerSlideIndex", current),
    beforeChange: () => (isDragging.current = true),
    onSwipe: () => (isDragging.current = true),
    onEdge: () => (isDragging.current = false),
  };

  /* คลิกแบนเนอร์ */
  const handleClick = (e, href) => {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    if (href) window.open(href, "_blank");
  };

  return (
    <div className="w-full relative" style={{ lineHeight: 0, fontSize: 0 }}>
      {/* Skeleton โหลดครั้งแรก */}
      {(loading || banners.length === 0) && (
        <div className="banner-skeleton">
          <div className="skeleton-overlay" />
        </div>
      )}

      {/* แสดง Slider */}
      {!loading && banners.length > 0 && (
        <Slider key={isMobile ? "mobile" : "desktop"} ref={sliderRef} {...settings}>
          {banners.map((banner, index) => {
            const imgSrc = isMobile
              ? `${baseUrl}/${banner.brander_pictureMoblie}`
              : `${baseUrl}/${banner.brander_picturePC}`;
            const isLoaded = loadedIndexes[index];

            return (
              <div key={banner.brander_ID}>
                <div
                  className="banner-container"
                  onClick={(e) => handleClick(e, banner.brander_link)}
                >
                  <Image
                    src={imgSrc}
                    alt={banner.brander_name || "banner"}
                    fill
                    priority={index === 0} // ✅ ปรับปรุง LCP
                    loading={index === 0 ? "eager" : "lazy"}
                    draggable={false}
                    unoptimized
                    style={{
                      objectFit: "cover",
                      opacity: isLoaded ? 1 : 0,
                      transition: "opacity 0.5s ease-in-out",
                    }}
                    onLoad={() =>
                      setLoadedIndexes((prev) => ({ ...prev, [index]: true }))
                    }
                  />

                  {!isLoaded && <div className="skeleton-overlay" />}
                </div>
              </div>
            );
          })}
        </Slider>
      )}

      {/* CSS */}
      <style jsx>{`
        .banner-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        @media (min-width: 768px) {
          .banner-container {
            aspect-ratio: 3840 / 1191;
          }
        }

        @media (max-width: 767px) {
          .banner-container {
            aspect-ratio: 768 / 1032;
          }
        }

        .banner-skeleton {
          width: 100%;
          aspect-ratio: 3840 / 1191;
          min-height: 400px;
          position: relative;
          overflow: hidden;
        }

        @media (max-width: 767px) {
          .banner-skeleton {
            aspect-ratio: 768 / 1032;
            min-height: 400px;
          }
        }

        .skeleton-overlay {
          position: absolute;
          inset: 0;
          background: #e0e0e0;
          animation: pulse 1.5s infinite ease-in-out;
          z-index: 2;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        :global(.slick-dots) {
          bottom: 15px;
        }
        :global(.slick-dots li button) {
          width: 9px;
          height: 9px;
          padding: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.27);
          border: 2px solid transparent;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        :global(.slick-dots li.slick-active button),
        :global(.slick-dots li button:hover) {
          background: rgba(255, 255, 255, 0.89);
        }
        :global(.slick-dots li button:before) {
          display: none;
        }
      `}</style>
    </div>
  );
}
