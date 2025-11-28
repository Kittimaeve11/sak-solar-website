'use client';

import React, { useRef, useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// Global Cache ใช้ร่วมกันทั้ง session
let bannerCache = {
  data: null,
  timestamp: 0,
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

// ป้องกัน Invalid URL
const safeURL = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://${url.replace(/^\/*/, "")}`;
};

export default function BannerSlider() {
  const sliderRef = useRef(null);
  const isDragging = useRef(false);

  const [banners, setBanners] = useState([]);
  const [loadedIndexes, setLoadedIndexes] = useState({});
  const [initialSlide, setInitialSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  //  ใช้ useEffect อันเดียว รวมทุกอย่าง
  useEffect(() => {
    let isMounted = true;

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    const loadBanners = async () => {
      try {
        const cacheAge = Date.now() - bannerCache.timestamp;
        if (bannerCache.data && cacheAge < 1000 * 60 * 10) {
          if (isMounted) {
            setBanners(bannerCache.data);
            setLoading(false);
          }
          return;
        }
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/branderhomeapi`, {
          headers: { "X-API-KEY": apiKey },
          cache: "no-store",
        });
        const data = await res.json();

        if (isMounted && data?.status && data.result) {
          setBanners(data.result);
          bannerCache = { data: data.result, timestamp: Date.now() };
        }
      } catch (err) {
        console.error("Error fetching banners:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const savedIndex = localStorage.getItem("bannerSlideIndex");
    if (savedIndex !== null) setInitialSlide(parseInt(savedIndex));

    loadBanners();

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* Slider Settings */
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

  const handleClick = (e, href) => {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    const finalURL = safeURL(href);
    if (finalURL) window.open(finalURL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full relative" style={{ lineHeight: 0 }}>
      {/* Skeleton โหลดตอนแรก */}
      {(loading || banners.length === 0) && (
        <div className="banner-skeleton">
          <div className="skeleton-overlay" />
        </div>
      )}

      {/* แสดง Slider */}
      {!loading && banners.length > 0 && (
        <Slider
          key={isMobile ? "mobile" : "desktop"}
          ref={sliderRef}
          {...settings}
        >
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
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    draggable={false}
                    style={{
                      objectFit: "cover",
                      opacity: isLoaded ? 1 : 0,
                      transition: "opacity 0.6s ease-in-out",
                      willChange: "opacity",
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
          overflow: hidden;
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
          min-height: min(60vh, 450px);
          position: relative;
          overflow: hidden;
        }
        @media (max-width: 767px) {
          .banner-skeleton {
            aspect-ratio: 768 / 1032;
          }
        }
        .skeleton-overlay {
          position: absolute;
          inset: 0;
          background: #e0e0e0;
          animation: pulse 1.5s infinite ease-in-out;
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
