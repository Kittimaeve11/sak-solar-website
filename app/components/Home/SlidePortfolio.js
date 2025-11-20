'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import './SlidePortfolio.css';
import { FaCalendar } from 'react-icons/fa';
import { HiPlusSm } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/app/Context/LocaleContext';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

const handleLogPortfolioClick = async (item) => {
  try {
    const logData = {
      actionType: '3',
      actionDetail: `หน้าหลัก รหัสผลงานการติดตั้ง: ${item.id ?? '0'} หมายเลขผลงานการติดตั้ง : ${item.num ?? '0'
        } ที่อยู่: ${item.title ?? '-'}`,
      typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
      datatype: 'ผลงานการติดตั้ง',
      dataID: item.id ?? '0',
      datatypeID: item.portfolio_typeID ?? '0',
      dataname: item.num ?? '0',
      brandtype: '0',
    };

    await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey || '',
      },
      body: JSON.stringify(logData),
    });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดตอนส่ง Log:', err);
  }
};

export default function SlidePortfolio() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  const sliderRef = useRef(null);
  const router = useRouter();
  const { locale } = useLocale();

  useEffect(() => {
    let isMounted = true;

    const updateSlidesToShow = () => {
      const width = window.innerWidth;
      if (width < 764) setSlidesToShow(1);
      else if (width < 1120) setSlidesToShow(2);
      else setSlidesToShow(3);
    };

    const loadPortfolioOnce = async () => {
      if (window.__PORTFOLIO_CACHE__) {
        setProjects(window.__PORTFOLIO_CACHE__);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${baseUrl}/api/portfoliomainpageapi`, {
          headers: { 'X-API-KEY': apiKey || '' },
        });
        const data = await res.json();

        if (isMounted && data?.status && Array.isArray(data.result)) {
          const mappedProjects = data.result.map((item) => ({
            id: item.portfolio_id,
            num: item.portfolio_num,
            title: item.adddressTH || '-',
            size: item.installationsize || '-',
            productType: item.TypeProduct_nameTH || '-',
            panelCount: item.panelsolarcout || 0,
            postDate: item.portfolio_datainstall,
            coverImage: item.portfolio_gallery
              ? JSON.parse(item.portfolio_gallery)[0]
              : '/images/placeholder.png',
            portfolio_typeID: item.portfolio_typeID || '0',
          }));

          window.__PORTFOLIO_CACHE__ = mappedProjects;
          setProjects(mappedProjects);
        }
      } catch (error) {
        console.error('❌ โหลดข้อมูลผลงานล้มเหลว:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    updateSlidesToShow();
    window.addEventListener('resize', updateSlidesToShow);
    loadPortfolioOnce();

    return () => {
      isMounted = false;
      window.removeEventListener('resize', updateSlidesToShow);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (locale === 'th') {
      const buddhistYear = date.getFullYear() + 543;
      const month = date.toLocaleDateString('th-TH', { month: 'long' });
      const day = date.getDate();
      return `${day} ${month} ${buddhistYear}`;
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const slidesPerGroup = slidesToShow;
  const totalGroups = projects.length
    ? Math.ceil(projects.length / slidesPerGroup)
    : 0;

  const handleDotClick = (index) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index * slidesPerGroup);
      setActiveGroup(index);
    }
  };

  const handleAfterChange = (current) => {
    const groupIndex = Math.floor(current / slidesPerGroup);
    setActiveGroup(groupIndex);
  };

  const CustomDots = () => (
    <div className="custom-dots">
      {Array.from({ length: totalGroups }).map((_, index) => (
        <div
          key={index}
          className={`dot-bar ${activeGroup === index ? 'active' : ''}`}
          onClick={() => handleDotClick(index)}
        />
      ))}
    </div>
  );

  return (
    <div className="portfolio-wrapperslide fade-in">
      <h1 className="headtitleone fade-in">ผลงานของเรา</h1>

      <div className="portfolio-headerslide fade-in">
        <Link href="/portfolio" className="view-all flex items-center gap-2">
          <HiPlusSm className="icon-view" />
          ดูทั้งหมด
        </Link>
      </div>

      {isLoading ? (
        <div className="skeleton-wrapper-portfolio">
          {Array.from({ length: slidesToShow }).map((_, index) => (
            <div key={index} className="skeleton-cardportfolio">
              <div className="skeleton-imageportfolio">
                <div className="skeleton-bannerportfolio">
                  <div className="skeleton-logo"></div>
                  <div className="skeleton-bannertext"></div>
                </div>
              </div>
              <div className="skeleton-contentportfolio">
                <div className="skeleton-titleportfolio"></div>
                <div className="skeleton-row">
                  <div className="skeleton-line-left"></div>
                  <div className="skeleton-line-right"></div>
                </div>
                <div className="skeleton-row">
                  <div className="skeleton-line-left"></div>
                  <div className="skeleton-line-right"></div>
                </div>
                <div className="skeleton-row">
                  <div className="skeleton-line-left"></div>
                  <div className="skeleton-line-right"></div>
                </div>
                <div className="skeleton-line-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <Slider
            key={slidesToShow}
            ref={sliderRef}
            dots={false}
            infinite={projects.length > slidesPerGroup}
            speed={500}
            slidesToShow={slidesToShow}
            slidesToScroll={1}
            swipeToSlide
            arrows={false}
            afterChange={handleAfterChange}
          >
            {projects.map((proj, i) => (
              <div
                key={proj.num || `proj-${i}`}
                className="slide-itemportfolio fade-in"
              >
                <div
                  className="portfolio-cardslide clickable"
                  onMouseDown={(e) => {
                    e.currentTarget.isDragging = false;
                  }}
                  onMouseMove={(e) => {
                    e.currentTarget.isDragging = true;
                  }}
                  onClick={async (e) => {
                    if (!e.currentTarget.isDragging && proj.num) {
                      await handleLogPortfolioClick(proj);
                      router.push(`/portfolio/${proj.num}`);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="portfolioslide-image-wrapper">
                    <Image
                      src={
                        proj.coverImage?.startsWith('http')
                          ? proj.coverImage
                          : `${baseUrl}/${proj.coverImage}`
                      }
                      alt={proj.title || 'ไม่ระบุ'}
                      className="portfolioslide-image"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      quality={75}
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="portfolio-bannerslide">
                      <Image
                        src="/images/logosak-solar.png"
                        alt="logo"
                        width={120}
                        height={40}
                        className="banner-logoslide"
                      />
                      <div className="banner-textslide">
                        ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด
                      </div>
                    </div>
                  </div>

                  <div className="portfolio-contentslide">
                    <h3 className="project-titleslide">{proj.title}</h3>
                    <ul className="project-detailsslide">
                      <li>
                        <strong>ขนาดติดตั้ง</strong>
                        <span>{proj.size}</span>
                      </li>
                      <li>
                        <strong>ประเภทผลิตภัณฑ์</strong>
                        <span>{proj.productType}</span>
                      </li>
                      <li>
                        <strong>จำนวนแผง</strong>
                        <span>{proj.panelCount} แผง</span>
                      </li>
                      <li className="date-postslide">
                        <FaCalendar />
                        <span>{formatDate(proj.postDate)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
          <CustomDots />
        </>
      )}
    </div>
  );
}
