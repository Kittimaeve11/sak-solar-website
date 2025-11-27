'use client';

import { useEffect, useState, useRef } from 'react';
import EditorialGrid from './components/EditorialGrid';
import SkeletonEditorial from './components/SkeletonEditorial';
import FilterBar from './components/FilterBar';
import BannerList from './components/BannerList';
import Pagination from './components/Pagination';
import '@/styles/editorial.css';
import { useLocale } from '../Context/LocaleContext';

export default function EditorialClient({ articles, types, banners }) {
  const { locale } = useLocale();
  const [isMobile, setIsMobile] = useState(false);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const itemsPerPage = 18;

  const titleRef = useRef(null);

  /* 🔹 Detect Mobile */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* 🔹 Loading Animation */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  /* 🔹 Filter Articles */
  const filteredArticles =
    filter === 'ทั้งหมด'
      ? articles
      : articles.filter((a) => a.editoria_typeID === filter);

  /* 🔹 Pagination Logic */
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* 🔹 Scroll To Top */
  const scrollToTitle = () => {
    if (titleRef.current) {
      titleRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setCurrentPage(1);
    scrollToTitle();
  };

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setShouldAnimate(false);
    scrollToTitle();
    setTimeout(() => {
      setCurrentPage(page);
      setShouldAnimate(true);
    }, 200);
  };

  /*  Render */
  return (
    <div className="no-margin" >
      {/* Banner */}
      {loading ? (
        <div className="skeleton skeleton-banner fade-in"></div>
      ) : (
        <BannerList banners={banners} isMobile={isMobile} />
      )}

      <main className="layout-editorial">
        {/* Title */}
        <h1 ref={titleRef} className="headtitle">
          {locale === 'en' ? 'Editorials' : 'บทความ'}
        </h1>

        {/* Filter */}
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
