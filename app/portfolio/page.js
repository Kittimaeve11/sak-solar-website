'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '@/styles/portfolio.css';
import { IoIosArrowDown, IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { FaCalendar } from "react-icons/fa";
import { useLocale } from '../Context/LocaleContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* =========================================================
   ⭐ Cache เก็บไว้ใน Memory ระหว่างเปลี่ยนหน้า
========================================================= */
let portfolioCache = {
  projects: null,
  types: null,
  brander: null,
  timestamp: 0,
};

const formatDate = (dateString, locale = 'th') => {
  if (!dateString || dateString === '-') return '-';
  const date = new Date(dateString);
  return locale === 'th'
    ? new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
    : new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

export default function PortfolioPage() {
  const { locale } = useLocale();

  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ⭐ Banner
  const [brander, setBrander] = useState([]);
  const [loadingBanner, setLoadingBanner] = useState(true);

  const itemsPerPage = 15;
  const router = useRouter();
  const topRef = useRef(null);

  /* =========================================================
     ⭐ SkeletonCard (ต้องอยู่ก่อน return)
  ========================================================= */
  function SkeletonCard() {
    return (
      <div className="portfolio-card skeleton-card">
        <div className="portfolio-image-wrapper">
          <div className="skeleton skeleton-image" />
        </div>
        <div className="portfolio-content">
          <div className="skeleton skeleton-title" />
          <ul className="project-details">
            {[...Array(4)].map((_, i) => (
              <li key={i}>
                <div className="skeleton skeleton-line" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  /* =========================================================
     ⭐ useEffect เดียว (โหลดทั้งหมด + SEO + Responsive)
  ========================================================= */
  useEffect(() => {
    // mobile
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // SEO
    document.title =
      locale === 'th'
        ? 'ผลงานของเรา | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด'
        : 'Our Portfolio | Sak Siam Solar Energy Co., Ltd.';

    const meta = document.querySelector("meta[name='description']");
    const content = locale === 'th' ? 'ผลงานของเรา' : 'Our Portfolio';
    if (meta) meta.setAttribute('content', content);

    const savedPage = localStorage.getItem('portfolioCurrentPage');
    if (savedPage) setCurrentPage(Number(savedPage));

    // ⭐ Cache อายุไม่เกิน 10 นาที
    const cacheAge = Date.now() - portfolioCache.timestamp;
    if (portfolioCache.projects && cacheAge < 1000 * 60 * 10) {
      setProjects(portfolioCache.projects);
      setTypes(portfolioCache.types);
      setBrander(portfolioCache.brander);
      setLoadingBanner(false);
      setIsLoading(false);
      setFadeIn(true);
      return () => window.removeEventListener('resize', checkMobile);
    }

    // ⭐ โหลดใหม่ทั้งหมด
    const load = async () => {
      try {
        const [typesRes, projectsRes, bannerRes] = await Promise.all([
          fetch(`${baseUrl}/api/portfoliotypepageapi`, {
            headers: { 'X-API-KEY': apiKey },
          }),
          fetch(`${baseUrl}/api/portfoliopageapi`, {
            headers: { 'X-API-KEY': apiKey },
          }),
          fetch(`${baseUrl}/api/branderIDapi/10`, {
            headers: { 'X-API-KEY': apiKey },
          }),
        ]);

        const [typesData, projectsData, bannerData] = await Promise.all([
          typesRes.json(),
          projectsRes.json(),
          bannerRes.json(),
        ]);

        const typesList = typesData.status ? typesData.result : [];

        const projectList = projectsData.status
          ? projectsData.result.data.map((item) => {
              let gallery = [];
              try {
                gallery = item.portfolio_gallery
                  ? JSON.parse(item.portfolio_gallery)
                  : [];
              } catch {}

              return {
                portfolio_id: item.portfolio_id,
                portfolio_num: item.portfolio_num,
                portfolio_typeID: item.portfolio_typeID,
                id: item.portfolio_num,
                titleTH: item.adddressTH || '-',
                titleEN: item.adddressEN || '-',
                size: item.installationsize || '-',
                productTypeTH: item.TypeProduct_nameTH || '-',
                productTypeEN: item.TypeProduct_nameEN || '-',
                panelCount: item.panelsolarcout || '-',
                postDate: item.portfolio_datainstall || '-',
                coverImage:
                  gallery.length > 0
                    ? `${baseUrl}/${gallery[0]}`
                    : '/images/placeholder.png',
                type: item.portfolio_typeID,
              };
            })
          : [];

        const bannerList = Array.isArray(bannerData.data)
          ? bannerData.data
          : bannerData.data
          ? [bannerData.data]
          : [];

        // ⭐ Save cache
        portfolioCache = {
          projects: projectList,
          types: typesList,
          brander: bannerList,
          timestamp: Date.now(),
        };

        setProjects(projectList);
        setTypes(typesList);
        setBrander(bannerList);
      } finally {
        setTimeout(() => {
          setLoadingBanner(false);
          setIsLoading(false);
          setFadeIn(true);
        }, 150);
      }
    };

    load();

    return () => window.removeEventListener('resize', checkMobile);
  }, [locale]);

  /* =========================================================
     ⭐ Banner Renderer (เหมือน FAQ)
  ========================================================= */
  const renderBanner = () => {
    if (loadingBanner)
      return <div className="skeleton skeleton-banner fade-in"></div>;

    return brander.map((item) => {
      const src = isMobile
        ? `${baseUrl}/${item.brander_pictureMoblie}`
        : `${baseUrl}/${item.brander_picturePC}`;

      return (
        <div key={item.brander_ID} className="banner-container fade-in">
          <Image
            src={src}
            alt={item.brander_name || 'Banner'}
            fill
            className="banner-image"
            sizes="100vw"
            unoptimized
            priority
          />
        </div>
      );
    });
  };

  /* =========================================================
     ⭐ Pagination
  ========================================================= */
  const filteredProjects =
    filter === 'ทั้งหมด'
      ? projects
      : projects.filter((proj) => proj.type === filter);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginated = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    localStorage.setItem('portfolioCurrentPage', page.toString());
    topRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const renderPagination = () => {
    const pages = [];
    if (currentPage > 1) {
      pages.push(
        <button key="prev" className="btn-with-arrow" onClick={() => handlePageChange(currentPage - 1)}>
          <IoIosArrowBack />
        </button>
      );
    }

    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={i === currentPage ? 'active-page' : ''}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button key="next" className="btn-with-arrow" onClick={() => handlePageChange(currentPage + 1)}>
          <IoIosArrowForward />
        </button>
      );
    }

    return pages;
  };

  /* =========================================================
     ⭐ UI
  ========================================================= */

  return (
    <div className="no-margin">

      {/* ⭐ Banner เหมือน FAQ */}
      {renderBanner()}

      <main
        className={`layout-portfolio ${fadeIn ? 'fade-in' : ''}`}
        ref={topRef}
        style={{ minHeight: isLoading ? '100vh' : 'auto' }}
      >
        <div className="portfolio-page">
          <h1 className="headtitleone">
            {locale === 'th'
              ? 'ผลงานการติดตั้งโซลาร์เซลล์'
              : 'Solar Installation Portfolio'}
          </h1>

          {/* ⭐ Filter */}
          <div className="portfolio-filters">
            <label htmlFor="filter-select" className="filter-label">
              {locale === 'th' ? 'เลือกประเภทผลงาน :' : 'Select Portfolio Type:'}
            </label>
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
                  <option value="ทั้งหมด">
                    {locale === 'th' ? 'ผลงานทั้งหมด' : 'All Portfolios'}
                  </option>

                  {types.map((type) => (
                    <option key={type.portfoliotypeID} value={type.portfoliotypeID}>
                      {locale === 'th'
                        ? type.portfoliotypenameTH
                        : type.portfoliotypenameEN}
                    </option>
                  ))}
                </select>
                <IoIosArrowDown className="dropdown-icon" />
              </div>
            </div>
          </div>

          {/* ⭐ Projects */}
          <div className={`portfolio-grid ${!isLoading ? 'fade-in' : ''}`}>
            {isLoading
              ? Array.from({ length: itemsPerPage }).map((_, i) => (
                  <SkeletonCard key={`sk-${i}`} />
                ))
              : paginated.length === 0
              ? (
                <p className="no-data-text">
                  {locale === 'th' ? 'ไม่พบข้อมูลผลงาน' : 'No projects found'}
                </p>
              )
              : paginated.map((proj, i) => (
                  <div
                    key={`${proj.id}-${i}`}
                    className="portfolio-card"
                    onClick={() => router.push(`/portfolio/${proj.id}`)}
                  >
                    <div className="portfolio-image-wrapper">
                      <Image
                        src={proj.coverImage}
                        alt={proj.titleTH}
                        fill
                        className="portfolio-image"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="portfolio-banner">
                        <Image
                          src="/images/logosak-solar.png"
                          alt="logo"
                          width={120}
                          height={40}
                          className="banner-logo"
                        />
                        <div className="banner-text">
                          {locale === 'th'
                            ? 'ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด'
                            : 'Sak Siam Solar Energy Co., Ltd.'}
                        </div>
                      </div>
                    </div>

                    <div className="portfolio-content">
                      <h3 className="project-title">
                        {locale === 'th' ? proj.titleTH : proj.titleEN}
                      </h3>
                      <ul className="project-details">
                        <li>
                          <strong>{locale === 'th' ? 'ขนาดติดตั้ง' : 'Installation Size'}</strong>
                          <span>{proj.size}</span>
                        </li>
                        <li>
                          <strong>{locale === 'th' ? 'ประเภทผลิตภัณฑ์' : 'Product Type'}</strong>
                          <span>{proj.productTypeTH}</span>
                        </li>
                        <li>
                          <strong>{locale === 'th' ? 'จำนวนแผง' : 'Panel Count'}</strong>
                          <span>{proj.panelCount} {locale === 'th' ? 'แผง' : 'panels'}</span>
                        </li>
                        <li className="date-post">
                          <strong><FaCalendar /></strong>
                          <span>{formatDate(proj.postDate, locale)}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ))}
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
