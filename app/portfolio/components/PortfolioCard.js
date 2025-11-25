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
    Cache เก็บไว้ใน Memory ระหว่างเปลี่ยนหน้า
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
        ? new Intl.DateTimeFormat('th-TH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date)
        : new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
};
/* =========================================================
    🔹 ฟังก์ชันส่ง Log เมื่อคลิกดูผลงานการติดตั้ง
========================================================= */
const handleLogPortfolioClick = async (item) => {
    try {
        const logData = {
            actionType: "3",
            actionDetail: `หน้าผลงาน รหัสผลงานการติดตั้ง: ${item.portfolio_id ?? "0"} หมายเลขผลงานการติดตั้ง : ${item.portfolio_num ?? "0"} ที่อยู่: ${item.titleTH ?? "-"}`,
            typeUser: "ผู้เยี่ยมชมเว็บไซต์",
            datatype: "ผลงานการติดตั้ง",
            dataID: item.portfolio_id ?? "0",
            datatypeID: item.portfolio_typeID ?? "0",
            dataname: item.portfolio_num ?? "0",
            brandtype: "0", // ไม่มีส่งค่า 0
        };

        console.log("📤 ส่ง Log ผลงานการติดตั้ง:", logData);

        const res = await fetch(`${baseUrl}/api/logWebsitepageapi`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey,
            },
            body: JSON.stringify(logData),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("❌ Log API error:", errText);
        } else {
            console.log("✅ Log: บันทึกผลงานการติดตั้งสำเร็จ");
        }
    } catch (err) {
        console.error("💥 เกิดข้อผิดพลาดในการบันทึก Log:", err);
    }
};
function SkeletonCard() {
    return (
        <div className="portfolio-card skeletonportfolio-card">
            <div className="portfolio-image-wrapper">
                <div className="skeleton-portfoliobanner">
                    <div className="skeleton-logoportfolio"></div>
                    <div className="skeleton-bannertextportfolio"></div>
                </div>
                <div className="skeleton skeletonportfolio-image" />
            </div>
            <div className="portfolio-content">
                <div className="skeleton skeletonportfolio-title" />
                <div className="skeleton-rowportfolio">
                    <div className="skeleton-line-leftportfolio"></div>
                    <div className="skeleton-line-rightportfolio"></div>

                </div>
                <div className="skeleton-rowportfolio">
                    <div className="skeleton-line-leftportfolio"></div>
                    <div className="skeleton-line-rightportfolio"></div>

                </div>
                <div className="skeleton-rowportfolio">
                    <div className="skeleton-line-leftportfolio"></div>
                    <div className="skeleton-line-rightportfolio"></div>

                </div>

                <div className="skeleton-line-fullportfolio"></div>

            </div>
        </div>
    );
}

export default function PortfolioClient() {
    const { locale } = useLocale();

    const [projects, setProjects] = useState([]);
    const [types, setTypes] = useState([]);
    const [filter, setFilter] = useState('ทั้งหมด');
    const [currentPage, setCurrentPage] = useState(1);

    const [isLoading, setIsLoading] = useState(true);
    const [fadeIn, setFadeIn] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const [isScrollingUp, setIsScrollingUp] = useState(false);
    //  Banner
    const [brander, setBrander] = useState([]);
    const [loadingBanner, setLoadingBanner] = useState(true);

    const itemsPerPage = 18;
    const router = useRouter();
    const topRef = useRef(null);
    const [showContent, setShowContent] = useState(true);

    /* =========================================================
        useEffect เดียว (โหลดทั้งหมด + SEO + Responsive)
    ========================================================= */
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Mobile check
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        //  Cache อายุไม่เกิน 10 นาที
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

        //  โหลดใหม่ทั้งหมด
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
                    typesRes.ok ? typesRes.json() : { status: false },
                    projectsRes.ok ? projectsRes.json() : { status: false },
                    bannerRes.ok ? bannerRes.json() : { data: [] },
                ]);

                const typesList = typesData.status ? typesData.result : [];

                const projectList = projectsData.status
                    ? projectsData.result.data.map((item) => {
                        let gallery = [];
                        try {
                            gallery = item.portfolio_gallery
                                ? JSON.parse(item.portfolio_gallery)
                                : [];
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

                //  Save cache
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
        Banner Renderer
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
        Pagination
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
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;

        setShowContent(false); // ซ่อนก่อน
        setTimeout(() => {
            setCurrentPage(page); // เปลี่ยนหน้า
        }, 50);

        setTimeout(() => {
            setShowContent(true); // แสดงพร้อม fade-in
        }, 100);
    };


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
                        key={`page-${item}`}
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


    /* =========================================================
        UI
    ========================================================= */
    return (
        <div className="no-margin">
            {/*  Banner */}
            {renderBanner()}

            <main
                className={`layout-portfolio ${fadeIn ? 'fade-in' : ''}`}
                ref={topRef}
                style={{ minHeight: isLoading ? '100vh' : 'auto' }}
            >
                <div className="portfolio-page">
                    <h1 className="headtitleone">
                        {locale === 'th' ? 'ผลงานการติดตั้งโซลาร์เซลล์' : 'Solar Installation Portfolio'}
                    </h1>

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

                    <div
                        key={currentPage}
                        className={`portfolio-grid ${showContent ? 'fade-in' : ''}`}
                    >
                        {isLoading
                            ? Array.from({ length: itemsPerPage }).map((_, i) => (
                                <SkeletonCard key={`skeleton-${i}`} />
                            ))
                            : paginatedProjects.length === 0 ? (
                                <p className="no-data-text">
                                    {locale === 'th' ? 'ไม่พบข้อมูลผลงาน' : 'No projects found'}
                                </p>
                            ) : (
                                paginatedProjects.map((proj, i) => (
                                    <div
                                        key={`${proj?.id || 'proj'}-${i}`}
                                        className="portfolio-card"
                                        onClick={async () => {
                                            await handleLogPortfolioClick(proj); // ✅ บันทึก Log ก่อน
                                            router.push(`/portfolio/${proj?.id}`); // ✅ แล้วค่อยเปลี่ยนหน้า
                                        }}
                                    >
                                        <div className="portfolio-image-wrapper">
                                            <Image
                                                src={proj?.coverImage || "/images/placeholder.png"}
                                                alt={locale === 'th' ? proj?.titleTH : proj?.titleEN}
                                                className="portfolio-image"
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                quality={75}
                                                priority
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
                                            <h3
                                                className="project-title"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {locale === 'th' ? proj.titleTH : proj.titleEN}
                                            </h3>
                                            <ul className="project-details">
                                                <li>
                                                    <strong>
                                                        {locale === 'th'
                                                            ? 'ขนาดติดตั้ง'
                                                            : 'Installation Size'}
                                                    </strong>
                                                    <span>{proj.size}</span>
                                                </li>
                                                <li>
                                                    <strong>
                                                        {locale === 'th'
                                                            ? 'ประเภทผลิตภัณฑ์'
                                                            : 'Product Type'}
                                                    </strong>
                                                    <span>{proj.productTypeTH}</span>
                                                </li>
                                                <li>
                                                    <strong>
                                                        {locale === 'th'
                                                            ? 'จำนวนแผง'
                                                            : 'Panel Count'}
                                                    </strong>
                                                    <span>
                                                        {proj.panelCount}{' '}
                                                        {locale === 'th' ? 'แผง' : 'panels'}
                                                    </span>
                                                </li>
                                                <li className="date-post">
                                                    <strong><FaCalendar /></strong>
                                                    <span>{formatDate(proj.postDate, locale)}</span>
                                                </li>
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