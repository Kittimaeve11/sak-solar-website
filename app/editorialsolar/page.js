'use client';

import { useEffect, useState, useRef } from 'react';
import EditorialGrid from './EditorialGrid';
import SkeletonEditorial from './SkeletonEditorial';
import FilterBar from './FilterBar';
import BannerList from './BannerList';
import Pagination from './Pagination';
import '@/styles/editorial.css';
import { useLocale } from '../Context/LocaleContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

let editorialCache = { articles: null, types: null, banners: null, timestamp: 0 };

export default function EditorialListPage() {
  const { locale } = useLocale();
  const [articles, setArticles] = useState([]);
  const [types, setTypes] = useState([]);
  const [banners, setBanners] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [currentPage, setCurrentPage] = useState(1);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const itemsPerPage = 18;

  const titleRef = useRef(null);

  /* =========================================================
     📌 Fetch + Setup Device
  ========================================================= */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDevice = () => setIsMobile(window.innerWidth <= 768);
    updateDevice();
    window.addEventListener('resize', updateDevice);

    const load = async () => {
      const cacheAge = Date.now() - editorialCache.timestamp;
      if (
        editorialCache.articles &&
        editorialCache.types &&
        editorialCache.banners &&
        cacheAge < 10 * 60 * 1000
      ) {
        setArticles(editorialCache.articles);
        setTypes(editorialCache.types);
        setBanners(editorialCache.banners);
      } else {
        const [resType, resArticle, resBanner] = await Promise.all([
          fetch(`${baseUrl}/api/edittorTypepageapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/edittorpageapi?limit=1000`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/branderIDapi/15`, { headers: { 'X-API-KEY': apiKey } }),
        ]);

        const t = await resType.json();
        const a = await resArticle.json();
        const b = await resBanner.json();

        editorialCache = {
          articles: a?.result?.data || [],
          types: t?.result || [],
          banners: Array.isArray(b?.data) ? b.data : [b.data],
          timestamp: Date.now(),
        };

        setArticles(editorialCache.articles);
        setTypes(editorialCache.types);
        setBanners(editorialCache.banners);
      }

      setLoading(false);
      setLoadingBanner(false);
      setTimeout(() => setShouldAnimate(true), 50);
    };

    load();
    return () => {
      window.removeEventListener('resize', updateDevice);
    };
  }, [locale]);

  /* =========================================================
     📌 Prepare Data After Filter + Pagination
  ========================================================= */
  const filteredArticles =
    filter === 'ทั้งหมด'
      ? articles
      : articles.filter((a) => a.editoria_typeID === filter);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage) || 1;

  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* =========================================================
     📌 Handle Filter Change (Reset Page + Scroll)
  ========================================================= */
  const handleFilterChange = (value) => {
    setFilter(value);
    setCurrentPage(1);
    scrollToTitle();
  };

  /* =========================================================
     📌 Handle Page Change
  ========================================================= */
  const scrollToTitle = () => {
    if (titleRef.current) {
      titleRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setShouldAnimate(false);
    scrollToTitle();
    setTimeout(() => {
      setCurrentPage(page);
      setTimeout(() => setShouldAnimate(true), 30);
    }, 50);
  };

  /* =========================================================
      Render Page
  ========================================================= */
  return (
    <div className="no-margin">
      {/*  Banner */}
      {loadingBanner ? (
        <div className="skeleton skeleton-banner fade-in"></div>
      ) : (
        <BannerList banners={banners} baseUrl={baseUrl} isMobile={isMobile} />
      )}

      <main className="layout-editorial">
        {/*  Title */}
        <h1 ref={titleRef} className="headtitle">
          {locale === 'en' ? 'Editorials' : 'บทความ'}
        </h1>

        {/*  Filter */}
        <FilterBar
          types={types}
          filter={filter}
          setFilter={handleFilterChange}
          locale={locale}
        />

        {/* Grid */}
        {loading ? (
          <SkeletonEditorial count={itemsPerPage} />
        ) : (
          <EditorialGrid
            paginatedArticles={paginatedArticles}
            shouldAnimate={shouldAnimate}
            locale={locale}
          />
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}
