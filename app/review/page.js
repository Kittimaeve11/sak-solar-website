'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import '../../styles/review.css';
import { useLocale } from '../Context/LocaleContext';
import Image from 'next/image';
import { IoPlayCircleOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

// Env
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// Cache 10 นาที
let reviewCache = null;

/* ---------------- Helper ---------------- */
function extractVideoId(url) {
  if (!url) return null;
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function ThumbnailWithFallback({ videoId, alt }) {
  const [srcIndex, setSrcIndex] = useState(0);

  const urls = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  ];

  return (
    <Image
      src={urls[srcIndex]}
      alt={alt}
      width={374}
      height={210}
      className="thumbnail"
      onError={() => {
        if (srcIndex < urls.length - 1) setSrcIndex(srcIndex + 1);
      }}
      unoptimized
    />
  );
}

/* ---------------- Page ---------------- */
export default function ReviewPage() {
  const { locale } = useLocale();
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [ready, setReady] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;
  const topRef = useRef(null);

  /* =============== SINGLE EFFECT (เหมือน FAQ) =============== */
  useEffect(() => {

    /* ตรวจมือถือ */
    const updateDevice = () => setIsMobile(window.innerWidth <= 768);
    updateDevice();
    window.addEventListener("resize", updateDevice);

    /* SEO */
    document.title = "รีวิวของเรา | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด";

    let meta = document.querySelector(`meta[name="description"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = "รีวิวของเรา";

    const load = async () => {
      try {
        // Use cache
        if (reviewCache && Date.now() - reviewCache.timestamp < 10 * 60 * 1000) {
          setReviews(reviewCache.reviews);
          setBanners(reviewCache.banners);
          return;
        }

        // Fetch API
        const [reviewRes, bannerRes] = await Promise.all([
          fetch(`${baseUrl}/api/Reviewapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/branderIDapi/11`, { headers: { 'X-API-KEY': apiKey } })
        ]);

        const reviewJson = await reviewRes.json();
        const bannerJson = await bannerRes.json();

        const reviewList = reviewJson?.result?.data || [];
        const bannerList = Array.isArray(bannerJson?.data)
          ? bannerJson.data
          : [bannerJson.data];

        // Save cache
        reviewCache = {
          reviews: reviewList,
          banners: bannerList,
          timestamp: Date.now()
        };

        setReviews(reviewList);
        setBanners(bannerList);

      } finally {
        setLoading(false);
        setLoadingBanner(false);

        // ⭐ Trigger fade-in after DOM is ready
        setTimeout(() => setReady(true), 50);
      }
    };

    load();

    return () => window.removeEventListener("resize", updateDevice);
  }, [locale]);

  /* ---------------- Pagination ---------------- */
  const validReviews = reviews.filter(r => extractVideoId(r?.vedio_link));
  const totalPages = Math.ceil(validReviews.length / itemsPerPage) || 1;

  const paginated = validReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (p) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- Render ---------------- */
  return (
    <div ref={topRef} className="no-margin">

      {/* ---------------- Banner แบบ FAQ ---------------- */}
      {loadingBanner ? (
        <div className="skeleton skeleton-banner fade-in"></div>
      ) : (
        banners.map((b) => {
          const imgSrc = isMobile
            ? `${baseUrl}/${b.brander_pictureMoblie}`
            : `${baseUrl}/${b.brander_picturePC}`;

          return (
            <div key={b.brander_ID} className={`banner-container ${ready ? "fade-in" : ""}`}>
              <Image
                src={imgSrc}
                alt={b.brander_name}
                fill
                className="banner-image"
                unoptimized
                sizes="100vw"
              />
            </div>
          );
        })
      )}

      {/* ---------------- Content ---------------- */}
      <main className={`layout-review ${ready ? "fade-in" : ""}`}>

        <h1 className="headtitle">
          {locale === "en"
            ? "Customer Reviews on Our Solar Installations"
            : "รีวิวการติดตั้ง Solar จากลูกค้าของเรา"}
        </h1>

        <div className="video-grid">
          {loading ? (
            Array.from({ length: itemsPerPage }).map((_, i) => (
              <div key={i} className="skeleton-card skeleton fade-in">
                <div className="skeleton-image skeleton" />
                <div className="skeleton-title skeleton" />
                <div className="skeleton-line skeleton" />
              </div>
            ))
          ) : (
            paginated.map((review) => {
              const id = extractVideoId(review.vedio_link);
              if (!id) return null;

              const title =
                locale === "en"
                  ? review.nameEN_Vedio || review.nameTH_Vedio
                  : review.nameTH_Vedio || review.nameEN_Vedio;

              return (
                <Link
                  key={review.vedio_id}
                  href={review.vedio_link}
                  target="_blank"
                  className={`video-card ${ready ? "fade-in" : ""}`}
                >
                  <div className="thumbnail-placeholder">
                    <ThumbnailWithFallback videoId={id} alt={title} />
                    <IoPlayCircleOutline className="play-icon" />
                  </div>

                  <div className="info">
                    <div className="title">{title}</div>
                    <div className="date">
                      {new Date(review.vedio_creationdate).toLocaleDateString(
                        locale === "en" ? "en-US" : "th-TH",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination-controls">
            <div className="page-buttons">

              {currentPage > 1 && (
                <button className="btn-with-arrow" onClick={() => handlePageChange(currentPage - 1)}>
                  <IoIosArrowBack />
                </button>
              )}

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? "active-page" : ""}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              {currentPage < totalPages && (
                <button className="btn-with-arrow" onClick={() => handlePageChange(currentPage + 1)}>
                  <IoIosArrowForward />
                </button>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
