'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import '../../styles/review.css';
import { useLocale } from '../Context/LocaleContext';
import Image from 'next/image';
import { IoPlayCircleOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

// ✅ อ่าน environment
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// ✅ สร้าง cache นอก component
let reviewCache = {
  reviews: null,
  brander: null,
  timestamp: 0,
};

/** ---------------- Helper ---------------- */
function extractVideoId(url) {
  if (!url) return null;
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

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
      className="thumbnail"
      onError={() => {
        if (srcIndex < thumbnailUrls.length - 1) {
          setSrcIndex(srcIndex + 1);
        }
      }}
      unoptimized
    />
  );
}

/** ---------------- Page ---------------- */
export default function ReviewPage() {
  const { locale } = useLocale();
  const [reviews, setReviews] = useState([]);
  const [brander, setBrander] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const topRef = useRef(null);

  /** ---------------- Fetch Data ---------------- */
  const fetchData = useCallback(async () => {
    setLoadingData(true);

    try {
      // ✅ ใช้ cache ถ้ามีข้อมูลไม่เกิน 10 นาที
      const cacheAge = Date.now() - reviewCache.timestamp;
      if (reviewCache.reviews && cacheAge < 1000 * 60 * 10) {
        setReviews(reviewCache.reviews);
        setBrander(reviewCache.brander);
        setLoadingData(false);
        return;
      }

      // ✅ โหลดใหม่จาก API
      const [reviewsRes, branderRes] = await Promise.all([
        fetch(`${baseUrl}/api/Reviewapi`, {
          headers: { 'X-API-KEY': apiKey },
        }),
        fetch(`${baseUrl}/api/branderIDapi/11`, {
          headers: { 'X-API-KEY': apiKey },
        }),
      ]);

      if (!reviewsRes.ok || !branderRes.ok)
        throw new Error("Fetch failed");

      const [reviewsData, branderData] = await Promise.all([
        reviewsRes.json(),
        branderRes.json(),
      ]);

      const reviewsResult = reviewsData?.result?.data || [];
      const branderArray = Array.isArray(branderData?.data)
        ? branderData.data
        : branderData?.data
        ? [branderData.data]
        : [];

      // ✅ เก็บ cache
      reviewCache = {
        reviews: reviewsResult,
        brander: branderArray,
        timestamp: Date.now(),
      };

      setReviews(reviewsResult);
      setBrander(branderArray);
    } catch (err) {
      console.error("Fetch error:", err);
      setReviews([]);
      setBrander([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  /** ---------------- Title + Meta + Fetch ---------------- */
  useEffect(() => {
    document.title =
      'รีวิวของเรา | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด';

    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'รีวิวของเรา';

    fetchData();
  }, [fetchData]);

  /** ---------------- ✅ Log Action (รีวิว) ---------------- */
  const logReviewAction = async (review) => {
    try {
      const payload = {
        actionType: "4",
        actionDetail: `หน้ารีวิว รหัสวิดีโอ: ${review.vedio_id ?? "0"}  ชื่อวิดีโอ : ${review.nameTH_Vedio ?? "-"}`,
        typeUser: "ผู้เยี่ยมชมเว็บไซต์",
        datatype: "รีวิว",
        dataID: review.vedio_id ?? "0",
        dataname: review.nameTH_Vedio ?? "-",
        datatypeID: "0", // ✅ ป้องกัน null
        brandtype: "0"   // ✅ ป้องกัน null
      };

      const res = await fetch(`${baseUrl}/api/logWebsitepageapi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("❌ Log API error:", await res.text());
      } else {
        console.log("✅ บันทึก Log รีวิวสำเร็จ");
      }
    } catch (err) {
      console.error("💥 Log รีวิว error:", err);
    }
  };

  /** ---------------- Pagination ---------------- */
  const validReviews = reviews.filter(r => extractVideoId(r?.vedio_link));
  const totalPages = Math.ceil(validReviews.length / itemsPerPage) || 1;
  const paginatedReviews = validReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    if (currentPage > 1) {
      pages.push(
        <button key="prev" onClick={() => handlePageChange(currentPage - 1)} className="btn-with-arrow">
          <IoIosArrowBack className="arrow-icon" />
        </button>
      );
    }

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={i === currentPage ? 'active-page' : ''}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button key="next" onClick={() => handlePageChange(currentPage + 1)} className="btn-with-arrow">
          <IoIosArrowForward className="arrow-icon" />
        </button>
      );
    }
    return pages;
  };

  /** ---------------- Render ---------------- */
  return (
    <div ref={topRef} className="no-margin">
      {/* ---------- Banner Section ---------- */}
      {brander.length === 0 || loadingData ? (
        <div className="skeleton-banner"></div>
      ) : (
        brander.map((item) => (
          <div className="banner-container fade-in" key={item.brander_ID}>
            <picture>
              <source
                srcSet={`${baseUrl.replace(/\/$/, '')}/${item.brander_pictureMoblie.replace(/^\//, '')}`}
                media="(max-width: 768px)"
              />
              <img
                src={`${baseUrl.replace(/\/$/, '')}/${item.brander_picturePC.replace(/^\//, '')}`}
                alt={item.brander_name || 'Banner Image'}
                className="banner-image"
              />
            </picture>
          </div>
        ))
      )}

      {/* ---------- Main Content ---------- */}
      <main className="layout-review">
        <h1 className="headtitle">
          {locale === 'en'
            ? 'Customer Reviews on Our Solar Installations'
            : 'รีวิวการติดตั้ง Solar จากลูกค้าของเรา'}
        </h1>

        <div className="video-grid">
          {loadingData ? (
            Array.from({ length: itemsPerPage }).map((_, i) => (
              <div key={i} className="skeleton-card skeleton fade-in">
                <div className="skeleton-image skeleton"></div>
                <div className="skeleton-title skeleton"></div>
                <div className="skeleton-line skeleton"></div>
              </div>
            ))
          ) : paginatedReviews.length === 0 ? (
            <p>{locale === 'en'
              ? 'No video reviews available at the moment.'
              : 'ไม่มีรีวิววิดีโอในขณะนี้'}
            </p>
          ) : (
            paginatedReviews.map((review) => {
              const videoId = extractVideoId(review.vedio_link);
              if (!videoId) return null;

              const videoTitle =
                locale === 'en'
                  ? review.nameEN_Vedio || review.nameTH_Vedio || 'No title'
                  : review.nameTH_Vedio || review.nameEN_Vedio || 'ไม่มีชื่อเรื่อง';

              const dateLocale = locale === 'en' ? 'en-US' : 'th-TH';

              return (
                <Link
                  key={review.vedio_id}
                  href={review.vedio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-card fade-in"
                  onClick={() => logReviewAction(review)}
                >
                  <div className="thumbnail-placeholder">
                    <ThumbnailWithFallback videoId={videoId} alt={videoTitle} />
                    <IoPlayCircleOutline className="play-icon" />
                  </div>
                  <div className="info">
                    <div className="title">{videoTitle}</div>
                    <div className="date">
                      {new Date(review.vedio_creationdate).toLocaleDateString(
                        dateLocale,
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* ✅ Pagination Controls */}
        {!loadingData && totalPages > 1 && (
          <div className="pagination-controls">
            <div className="page-buttons">{renderPagination()}</div>
          </div>
        )}
      </main>
    </div>
  );
}
