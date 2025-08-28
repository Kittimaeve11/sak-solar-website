'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '../../styles/portfolio.css';
import { IoIosArrowDown, IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { FaCalendar } from "react-icons/fa";

export default function PortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [fadeIn, setFadeIn] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);

  const itemsPerPage = 15;
  const router = useRouter();
  const topRef = useRef(null);

  // Restore current page from localStorage
  useEffect(() => {
    const savedPage = localStorage.getItem('portfolioCurrentPage');
    if (savedPage) setCurrentPage(Number(savedPage));
  }, []);

  useEffect(() => {
    localStorage.setItem('portfolioCurrentPage', currentPage.toString());
  }, [currentPage]);

  // Reload on ChunkLoadError
  useEffect(() => {
    const handleChunkError = (e) => {
      if (e?.message?.includes('ChunkLoadError')) window.location.reload();
    };
    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, []);

  // Fetch portfolio data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/portfolio');
        const data = await res.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } catch {
        setProjects([]);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
          setFadeIn(true);
        }, 300); // Delay for fade-in effect
      }
    }

    fetchData();
  }, []);

  const filteredProjects = filter === 'ทั้งหมด'
    ? projects
    : projects.filter((proj) => proj?.type === filter);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    topRef.current?.scrollIntoView({ behavior: 'auto' });
    setIsScrollingUp(true);
  };

  useEffect(() => {
    if (isScrollingUp) {
      const timer = setTimeout(() => setIsScrollingUp(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isScrollingUp]);

  function renderPagination() {
    const pages = [];
    const siblings = 2;
    const range = [1];
    const start = Math.max(2, currentPage - siblings);
    const end = Math.min(totalPages - 1, currentPage + siblings);

    if (start > 2) range.push('start-ellipsis');
    for (let i = start; i <= end; i++) range.push(i);
    if (end < totalPages - 1) range.push('end-ellipsis');
    if (totalPages > 1) range.push(totalPages);

    if (currentPage > 1) {
      pages.push(
        <button className="btn-with-arrow" key="prev" onClick={() => handlePageChange(currentPage - 1)}>
          <IoIosArrowBack className="arrow-icon" />
        </button>
      );
    }

    range.forEach((item, idx) => {
      if (item === 'start-ellipsis' || item === 'end-ellipsis') {
        pages.push(<span key={item + idx} className="ellipsis">...</span>);
      } else {
        pages.push(
          <button
            key={item}
            className={currentPage === item ? 'active-page' : ''}
            onClick={() => handlePageChange(item)}
          >
            {item}
          </button>
        );
      }
    });

    if (currentPage < totalPages) {
      pages.push(
        <button className="btn-with-arrow" key="next" onClick={() => handlePageChange(currentPage + 1)}>
          <IoIosArrowForward className="arrow-icon" />
        </button>
      );
    }

    return pages;
  }

  function SkeletonCard() {
    return (
      <div className="portfolio-card skeleton-card" style={{ pointerEvents: 'none' }}>
        <div className="portfolio-image-wrapper">
          <div className="skeleton skeleton-image" />
        </div>
        <div className="portfolio-content">
          <div className="skeleton skeleton-title" />
          <ul className="project-details">
            {[...Array(4)].map((_, i) => (
              <li key={i}><div className="skeleton skeleton-line" /></li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="banner-container">
        {isLoading ? (
          <div className="skeleton-banner" />
        ) : (
          <picture className="fade-in">
            <source srcSet="/banner/Portfolio-Page/Portfolio-mobile1.jpg" media="(max-width: 768px)" />
            <img
              src="/banner/Portfolio-Page/Portfolio-pc1.jpg"
              alt="Contact Banner"
              className="banner-image"
            />
          </picture>
        )}
      </div>

      <main
        className={`layout-container ${fadeIn ? 'fade-in' : ''}`}
        ref={topRef}
        style={{ minHeight: isLoading ? '100vh' : 'auto' }}
      >
        <div className="portfolio-page">
          <h1 className="headtitleone">ผลงานการติดตั้งโซลาร์เซลล์</h1>

          <div className="portfolio-filters">
            <label htmlFor="filter-select" className="filter-label">เลือกประเภทผลงาน :</label>
            <div className="filter-row">
              <div className="select-wrapper">
                <select
                  id="filter-select"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-dropdown"
                >
                  <option value="ทั้งหมด">ผลงานทั้งหมด</option>
                  {[...new Set(projects.map((p) => p?.type))].map((type) =>
                    type ? <option key={type} value={type}>{type}</option> : null
                  )}
                </select>
                <IoIosArrowDown className="dropdown-icon" />
              </div>
            </div>
          </div>

          <div className={`portfolio-grid ${!isLoading ? 'fade-in' : ''}`}>
            {isLoading
              ? Array.from({ length: itemsPerPage }).map((_, i) => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))
              : paginatedProjects.length === 0 ? (
                <p className="no-data-text">ไม่พบข้อมูลผลงาน</p>
              ) : (
                paginatedProjects.map((proj, i) => (
                  <div
                    key={proj?.id || `proj-${i}`}
                    className="portfolio-card"
                    onClick={() => router.push(`/portfolio/${proj?.id}`)}
                  >
                    <div className="portfolio-image-wrapper">
                      <Image
                        src={proj?.coverImage || '/images/placeholder.png'}
                        alt={proj?.title || 'ไม่ระบุ'}
                        className="portfolio-image"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        quality={75}
                      />
                      <div className="portfolio-banner">
                        <Image
                          src="/images/logosak-solar.png"
                          alt="logo"
                          width={120}
                          height={40}
                          className="banner-logo"
                        />
                        <div className="banner-text">ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด</div>
                      </div>
                    </div>
                    <div className="portfolio-content">
                      <h3 className="project-title" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word',
                      }}>
                        {proj?.title || '-'}
                      </h3>
                      <ul className="project-details">
                        <li><strong>ขนาดติดตั้ง</strong><span>{proj?.size || '-'}</span></li>
                        <li><strong>ประเภทผลิตภัณฑ์</strong><span>{proj?.productType || '-'}</span></li>
                        <li><strong>จำนวนแผง</strong><span>{proj?.panelCount || '-'} แผง</span></li>
                        <li className="date-post"><strong><FaCalendar /></strong><span>{proj?.postDate || '-'}</span></li>
                      </ul>
                    </div>
                  </div>
                ))
              )}
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="pagination-controls">
              <div className="page-buttons">{renderPagination()}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}