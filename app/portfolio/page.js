'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/portfolio.css';

import BannerList from './BannerList';
import FilterBar from './FilterBar';
import PortfolioCard from './PortfolioCard';
import SkeletonCard from './SkeletonCard';
import Pagination from './Pagination';

import { portfolioCache, baseUrl, apiKey } from './utils';
import { useLocale } from '../Context/LocaleContext';

export default function PortfolioPage() {
  const { locale } = useLocale();

  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [brander, setBrander] = useState([]);

  const [filter, setFilter] = useState('ทั้งหมด');
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  const itemsPerPage = 18;
  const router = useRouter();
  const topRef = useRef(null);

  /* ============================
      โหลดข้อมูล + Responsive
  ============================ */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const cacheAge = Date.now() - portfolioCache.timestamp;
    if (portfolioCache.projects && cacheAge < 1000 * 60 * 10) {
      setProjects(portfolioCache.projects);
      setTypes(portfolioCache.types);
      setBrander(portfolioCache.brander);
      setIsLoading(false);
      setLoadingBanner(false);
      setFadeIn(true);
      return;
    }

    const loadData = async () => {
      try {
        const [typesRes, projectsRes, bannerRes] = await Promise.all([
          fetch(`${baseUrl}/api/portfoliotypepageapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/portfoliopageapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/branderIDapi/10`, { headers: { 'X-API-KEY': apiKey } }),
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
                gallery = item.portfolio_gallery ? JSON.parse(item.portfolio_gallery) : [];
              } catch {
                gallery = [];
              }
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
                coverImage: gallery[0] ? `${baseUrl}/${gallery[0]}` : '/images/placeholder.png',
                type: item.portfolio_typeID,
              };
            })
          : [];

        const bannerList = Array.isArray(bannerData.data)
          ? bannerData.data
          : bannerData.data
          ? [bannerData.data]
          : [];

        portfolioCache.projects = projectList;
        portfolioCache.types = typesList;
        portfolioCache.brander = bannerList;
        portfolioCache.timestamp = Date.now();

        setProjects(projectList);
        setTypes(typesList);
        setBrander(bannerList);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
          setLoadingBanner(false);
          setFadeIn(true);
        }, 150);
      }
    };

    loadData();

    return () => window.removeEventListener('resize', checkMobile);
  }, [locale]);

  /* ============================
      Pagination Logic
  ============================ */
  const filteredProjects =
    filter === 'ทั้งหมด'
      ? projects
      : projects.filter((proj) => proj.type === filter);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setShouldAnimate(false);
    scrollToTop();
    setTimeout(() => setCurrentPage(page), 10);
    setTimeout(() => setShouldAnimate(true), 20);
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ============================
      UI Render
  ============================ */
  return (
    <div className="no-margin">
      <BannerList brander={brander} loadingBanner={loadingBanner} isMobile={isMobile} />

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

          <FilterBar types={types} filter={filter} setFilter={setFilter} setCurrentPage={setCurrentPage} />

          <div key={currentPage} className={`portfolio-grid ${shouldAnimate ? 'fade-in' : ''}`}>
            {isLoading
              ? Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
              : paginatedProjects.length === 0
              ? <p className="no-data-text">{locale === 'th' ? 'ไม่พบข้อมูลผลงาน' : 'No projects found'}</p>
              : paginatedProjects.map((proj, i) => (
                  <PortfolioCard key={`${proj.id}-${i}`} proj={proj} router={router} />
                ))}
          </div>

          {!isLoading && totalPages > 1 && (
            <div className="pagination-controls">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
