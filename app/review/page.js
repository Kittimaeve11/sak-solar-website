'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import '../../styles/review.css';
import { useLocale } from '../Context/LocaleContext';
import Image from 'next/image';
import { IoPlayCircleOutline } from 'react-icons/io5';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

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
      fill
      className="thumbnail"
      sizes="(max-width: 768px) 100vw, 330px"
      onError={() => srcIndex < urls.length - 1 && setSrcIndex(srcIndex + 1)}
      unoptimized
      priority
    />
  );
}

export default function ReviewPage() {
  const { locale } = useLocale();
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const mainRef = useRef(null);
  const titleRef = useRef(null);

  const itemsPerPage = 18;

  useEffect(() => {
    const updateDevice = () => setIsMobile(window.innerWidth <= 768);
    updateDevice();

    const load = async () => {
      try {
        const [reviewRes, bannerRes] = await Promise.all([
          fetch(`${baseUrl}/api/Reviewapi?offset=1&limit=999`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/branderIDapi/11`, { headers: { 'X-API-KEY': apiKey } }),
        ]);

        const reviewJson = await reviewRes.json();
        const bannerJson = await bannerRes.json();

        setReviews(reviewJson?.result?.data || []);
        setBanners(Array.isArray(bannerJson?.data) ? bannerJson.data : [bannerJson.data]);
      } finally {
        setTimeout(() => setLoading(false), 200);
        setTimeout(() => setLoadingBanner(false), 300);
      }
    };

    window.addEventListener('resize', updateDevice);
    load();

    return () => window.removeEventListener('resize', updateDevice);
  }, [locale]);

  const validReviews = reviews.filter((r) => extractVideoId(r?.vedio_link));
  const totalPages = Math.ceil(validReviews.length / itemsPerPage) || 1;
  const paginated = validReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🔹 แก้ตรงนี้ให้เลื่อนไปที่ตำแหน่งของ mainRef (ไม่ใช่แค่เลื่อนจนเห็น H1)
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);

    setTimeout(() => {
      if (mainRef.current) {
        const y = mainRef.current.offsetTop - 10; // 🎯 เลื่อนให้ H1 อยู่บนสุดจริง ๆ
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 80);
  };

  return (
    <div className="no-margin">

      {/* 🔸 Banner */}
      {loadingBanner ? (
        <div className="skeleton skeleton-banner fade-in"></div>
      ) : (
        banners.map((b) => {
          const imgSrc = isMobile
            ? `${baseUrl}/${b.brander_pictureMoblie}`
            : `${baseUrl}/${b.brander_picturePC}`;
          return (
            <div key={b.brander_ID} className="banner-container">
              <Image src={imgSrc} alt={b.brander_name} fill className="banner-image fade-in" unoptimized />
            </div>
          );
        })
      )}

      {/* 🔸 Main Content */}
      <main ref={mainRef} className="layout-review">
        <h1 ref={titleRef} className="headtitle">
          {locale === 'en'
            ? 'Customer Reviews on Our Solar Installations'
            : 'รีวิวการติดตั้ง Solar จากลูกค้าของเรา'}
        </h1>

        {/* 🔹 Video Grid */}
        <div className="video-grid">
          {loading
            ? Array.from({ length: itemsPerPage }).map((_, i) => (
                <div key={i} className="skeletonvideo-card skeleton fade-in">
                  <div className="skeletonvideo-image skeleton" />
                  <div className="skeletonvideo-title skeleton" />
                  <div className="skeletonvideo-line skeleton" />
                </div>
              ))
            : paginated.map((review) => {
                const id = extractVideoId(review.vedio_link);
                if (!id) return null;
                const title =
                  locale === 'en'
                    ? review.nameEN_Vedio || review.nameTH_Vedio
                    : review.nameTH_Vedio || review.nameEN_Vedio;
                return (
                  <Link key={review.vedio_id} href={review.vedio_link} target="_blank" className="video-card fade-in">
                    <div className="thumbnail-placeholder">
                      <ThumbnailWithFallback videoId={id} alt={title} />
                      <IoPlayCircleOutline className="play-icon" />
                    </div>
                    <div className="infovideo">
                      <div className="titlevideo">{title}</div>
                      <div className="datevideo">
                        {new Date(review.vedio_creationdate).toLocaleDateString(
                          locale === 'en' ? 'en-US' : 'th-TH',
                          { year: 'numeric', month: 'long', day: 'numeric' }
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>

        {/* 🔹 Pagination */}
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
                  className={currentPage === i + 1 ? 'active-page' : ''}
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
