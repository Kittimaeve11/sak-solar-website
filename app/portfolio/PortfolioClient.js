'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/portfolio.css';
import { useLocale } from '@/app/Context/LocaleContext';

import BannerSection from './components/BannerSection';
import PortfolioFilters from './components/PortfolioFilters';
import PortfolioGrid from './components/PortfolioGrid';
import PaginationControls from './components/PaginationControls';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// 🚀 Cache in memory
let portfolioCache = {
  projects: null,
  types: null,
  brander: null,
  timestamp: 0,
};

export default function PortfolioClient() {
  const { locale } = useLocale();
  const router = useRouter();

  // 📌 State
  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [brander, setBrander] = useState([]);

  const [filter, setFilter] = useState('ทั้งหมด');
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showContent, setShowContent] = useState(true);

  const topRef = useRef(null);
  const itemsPerPage = 18;

  /* =========================================================
     โหลดข้อมูลครั้งแรก หรือใช้ Cache
  ========================================================= */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const cacheAge = Date.now() - portfolioCache.timestamp;

    if (portfolioCache.projects && cacheAge < 600000) {
      setProjects(portfolioCache.projects);
      setTypes(portfolioCache.types);
      setBrander(portfolioCache.brander);
      setIsLoading(false);
      setLoadingBanner(false);
      setFadeIn(true);
      return;
    }

    const load = async () => {
      try {
        const [typesRes, projectsRes, bannerRes] = await Promise.all([
          fetch(`${baseUrl}/api/portfoliotypepageapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/portfoliopageapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/branderIDapi/10`, { headers: { 'X-API-KEY': apiKey } }),
        ]);

        const typesData = await typesRes.json();
        const projectsData = await projectsRes.json();
        const bannerData = await bannerRes.json();

        const typesList = typesData.status ? typesData.result : [];

        const projectList =
          projectsData.status && Array.isArray(projectsData.result?.data)
            ? projectsData.result.data.map((item) => ({
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

                coverImage: item.portfolio_gallery
                  ? `${baseUrl}/${JSON.parse(item.portfolio_gallery)[0]}`
                  : '/images/placeholder.png',

                type: item.portfolio_typeID,
              }))
            : [];

        const bannerList = Array.isArray(bannerData.data)
          ? bannerData.data
          : bannerData.data
          ? [bannerData.data]
          : [];

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
          setIsLoading(false);
          setLoadingBanner(false);
          setFadeIn(true);
        }, 200);
      }
    };

    load();

    return () => window.removeEventListener('resize', checkMobile);
  }, [locale]);

  /* =========================================================
     Pagination Logic
  ========================================================= */
  const filteredProjects =
    filter === 'ทั้งหมด'
      ? projects
      : projects.filter((proj) => proj.type === filter);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* =========================================================
     Scroll on page change
  ========================================================= */
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    setShowContent(false);
    setTimeout(() => setCurrentPage(page), 50);
    setTimeout(() => {
      setShowContent(true);

      if (topRef.current) {
        const yOffset = -100;
        const y = topRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="no-margin">
      <BannerSection
        brander={brander}
        loadingBanner={loadingBanner}
        isMobile={isMobile}
        baseUrl={baseUrl}
      />

      <main className={`layout-portfolio ${fadeIn ? 'fade-in' : ''}`} ref={topRef}>
        <div className="portfolio-page">
          <h1 className="headtitleone">
            {locale === 'th'
              ? 'ผลงานการติดตั้งโซลาร์เซลล์'
              : 'Solar Installation Portfolio'}
          </h1>

          <PortfolioFilters
            locale={locale}
            filter={filter}
            setFilter={setFilter}
            types={types}
            setCurrentPage={setCurrentPage}
          />

          <div key={currentPage}>
            <PortfolioGrid
              isLoading={isLoading}
              paginatedProjects={paginatedProjects}
              locale={locale}
              baseUrl={baseUrl}
              apiKey={apiKey}
              itemsPerPage={itemsPerPage}
              showContent={showContent}
            />
          </div>

          {!isLoading && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}
