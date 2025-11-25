'use client';

import { useEffect, useState, useRef } from 'react';
import '../../styles/review.css';
import { useLocale } from '../Context/LocaleContext';
import BannerSection from './components/BannerSection';
import VideoGrid from './components/VideoGrid';
import PaginationControls from './components/PaginationControls';
import { extractVideoId } from './components/ExtractVideoId';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function ReviewClient() {
  const { locale } = useLocale();

  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 18;
  const titleRef = useRef(null);

  useEffect(() => {
    const updateDevice = () => setIsMobile(window.innerWidth <= 768);
    updateDevice();

    const load = async () => {
      const [reviewRes, bannerRes] = await Promise.all([
        fetch(`${baseUrl}/api/Reviewapi?offset=1&limit=999`, {
          headers: { 'X-API-KEY': apiKey },
        }),
        fetch(`${baseUrl}/api/branderIDapi/11`, {
          headers: { 'X-API-KEY': apiKey },
        }),
      ]);

      setReviews((await reviewRes.json()).result.data || []);
      const bannerJson = await bannerRes.json();
      setBanners(Array.isArray(bannerJson?.data) ? bannerJson.data : [bannerJson.data]);

      setTimeout(() => setLoading(false), 300);
      setTimeout(() => setLoadingBanner(false), 400);
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

  /* 🔹 ตัวจัดการการเปลี่ยนหน้า พร้อม Scroll ขึ้น H1 */
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setCurrentPage(page);

    setTimeout(() => {
      if (titleRef.current) {
        const y = titleRef.current.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="no-margin">
      <BannerSection
        banners={banners}
        isMobile={isMobile}
        loadingBanner={loadingBanner}
        baseUrl={baseUrl}
      />

      <main className="layout-review">
        <h1 ref={titleRef} className="headtitle">
          {locale === 'en'
            ? 'Customer Reviews on Our Solar Installations'
            : 'รีวิวการติดตั้ง Solar จากลูกค้าของเรา'}
        </h1>

        <VideoGrid
          paginated={paginated}
          loading={loading}
          locale={locale}
          itemsPerPage={itemsPerPage}
        />

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}  // ✔ ใช้ฟังก์ชันนี้แทน setCurrentPage
          titleRef={titleRef}                  // ✔ ส่ง ref ให้ pagination
        />
      </main>
    </div>
  );
}
