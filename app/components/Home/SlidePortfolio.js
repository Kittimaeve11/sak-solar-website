'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import './SlidePortfolio.css';
import { FaCalendar } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { HiPlusSm } from 'react-icons/hi';
import { useLocale } from '@/app/Context/LocaleContext';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// ตัวแปรเก็บค่าฐาน URL และ API Key จากไฟล์ .env
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* =========================================================
   Component หลัก: SlidePortfolio
   แสดงผลงานในรูปแบบสไลด์ (react-slick)
   ========================================================= */
export default function SlidePortfolio() {
  // State เก็บข้อมูลผลงาน
  const [projects, setProjects] = useState([]);
  // State สำหรับสถานะโหลดข้อมูล
  const [isLoading, setIsLoading] = useState(true);
  // State สำหรับ slide ปัจจุบัน
  const [activeSlide, setActiveSlide] = useState(0);
  // State ป้องกันคลิกระหว่างลากสไลด์
  const [dragging, setDragging] = useState(false);

  // อ้างอิงตัวสไลด์
  const sliderRef = useRef(null);
  // ใช้เปลี่ยนหน้าแบบ Next.js
  const router = useRouter();
  // ดึง locale (ภาษา) จาก Context
  const { locale } = useLocale();

  /* =========================================================
     ดึงข้อมูลผลงานจาก API
     ========================================================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // เรียก API พร้อมส่ง header X-API-KEY
        const res = await fetch(`${baseUrl}/api/portfoliomainpageapi`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const data = await res.json();

        // ตรวจสอบว่าผลลัพธ์ถูกต้องและเป็น Array
        if (data?.status && Array.isArray(data.result)) {
          // แปลงข้อมูลให้อยู่ในรูปแบบที่ใช้ใน UI
          const mappedProjects = data.result.map((item) => ({
            id: item.portfolio_id,
            title: item.adddressTH,
            size: item.installationsize,
            productType: item.TypeProduct_nameTH,
            panelCount: item.panelsolarcout,
            postDate: item.portfolio_datainstall,
            coverImage: item.portfolio_gallery
              ? JSON.parse(item.portfolio_gallery)[0]
              : '/images/placeholder.png',
          }));

          // เพิ่มดีเลย์เพื่อให้เห็นเอฟเฟกต์ skeleton
          setTimeout(() => {
            setProjects(mappedProjects);
            setIsLoading(false);
          }, 1000);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================================================
     ฟังก์ชันแปลงวันที่ให้แสดงตามภาษา
     ========================================================= */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);

    if (locale === 'th') {
      const buddhistYear = date.getFullYear() + 543;
      const month = date.toLocaleDateString('th-TH', { month: 'long' });
      const day = date.getDate();
      return `${day} ${month} ${buddhistYear}`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  /* =========================================================
     ตั้งค่าการแบ่งสไลด์ (กลุ่มละ 3 การ์ด)
     ========================================================= */
  const slidesPerGroup = 3;
  const totalGroups =
    projects.length > 0 ? Math.ceil(projects.length / slidesPerGroup) : 0;

  const handleDotClick = (index) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index * slidesPerGroup);
      setActiveSlide(index);
    }
  };

  // จัดการสถานะก่อน-หลังเปลี่ยนสไลด์
  const handleBeforeChange = () => setDragging(true);
  const handleAfterChange = (i) => {
    setActiveSlide(Math.floor(i / slidesPerGroup));
    setTimeout(() => setDragging(false), 50);
  };

  /* =========================================================
     Custom Dots (แถบเลื่อนด้านล่าง)
     ========================================================= */
  const CustomDots = () => (
    <div className="custom-dots">
      {Array.from({ length: totalGroups }).map((_, index) => (
        <div
          key={index}
          className={`dot-bar ${activeSlide === index ? 'active' : ''}`}
          onClick={() => handleDotClick(index)}
        />
      ))}
    </div>
  );

  /* =========================================================
     Skeleton Loader (แสดงขณะโหลดข้อมูล)
     ========================================================= */
  const SkeletonCard = () => (
    <div className="slide-itemportfolio fade-in">
      <div className="skeleton-cardportfolio">
        <div className="skeleton skeleton-imageportfolio"></div>
        <div className="skeleton skeleton-titleportfolio"></div>
        <div className="skeleton skeleton-titleportfolio"></div>
        <div className="skeleton skeleton-lineportfolio"></div>
        <div className="skeleton skeleton-lineportfolio"></div>
      </div>
    </div>
  );

  /* =========================================================
     ส่วนแสดงผลหลักของ Component
     ========================================================= */
  return (
    <div className="portfolio-wrapperslide">
      <br />
      <h1 className="headtitleone">ผลงานของเรา</h1>

      {/* ปุ่มดูทั้งหมด */}
      <div className="portfolio-headerslide">
        <Link href="/portfolio" className="view-all flex items-center gap-2">
          <HiPlusSm className="icon-view" />
          ดูทั้งหมด
        </Link>
      </div>

      {/* หากกำลังโหลดให้แสดง Skeleton */}
      {isLoading ? (
        <div className="portfolio-loading-grid">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* สไลด์ผลงาน */}
          <Slider
            ref={sliderRef}
            dots={false}
            infinite={projects.length > slidesPerGroup}
            speed={500}
            slidesToShow={3}
            slidesToScroll={1}
            swipeToSlide
            arrows={false}
            centerMode={false}
            beforeChange={handleBeforeChange}
            afterChange={handleAfterChange}
            responsive={[
              {
                breakpoint: 1024,
                settings: { slidesToShow: 2, slidesToScroll: 1, swipeToSlide: true },
              },
              {
                breakpoint: 640,
                settings: { slidesToShow: 1, slidesToScroll: 1, swipeToSlide: true },
              },
            ]}
          >
            {/* วนลูปแสดงแต่ละการ์ดผลงาน */}
            {projects.map((proj, i) => (
              <div key={proj?.id || `proj-${i}`} className="slide-itemportfolio">
                <div
                  className="portfolio-cardslide"
                  onClick={() =>
                    !dragging && router.push(`/portfolio/${proj?.id}`)
                  }
                >
                  {/* ส่วนรูปภาพ */}
                  <div className="portfolioslide-image-wrapper">
                    <Image
                      src={`${baseUrl}/${proj?.coverImage}` || '/images/placeholder.png'}
                      alt={proj?.title || 'ไม่ระบุ'}
                      className="portfolioslide-image"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      quality={75}
                      style={{ objectFit: 'cover' }}
                    />

                    {/* แถบโลโก้บริษัทซ้ายบน */}
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

                  {/* เนื้อหาด้านล่างของการ์ด */}
                  <div className="portfolio-contentslide">
                    <h3
                      className="project-titleslide"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word',
                      }}
                    >
                      {proj?.title || '-'}
                    </h3>

                    <ul className="project-detailsslide">
                      <li>
                        <strong>ขนาดติดตั้ง</strong>
                        <span>{proj?.size || '-'}</span>
                      </li>
                      <li>
                        <strong>ประเภทผลิตภัณฑ์</strong>
                        <span>{proj?.productType || '-'}</span>
                      </li>
                      <li>
                        <strong>จำนวนแผง</strong>
                        <span>{proj?.panelCount || '-'} แผง</span>
                      </li>
                      <li className="date-postslide">
                        <strong>
                          <FaCalendar />
                        </strong>
                        <span>{formatDate(proj?.postDate)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </Slider>

          {/* แถบจุดเลื่อน (Custom Dots) */}
          <CustomDots />
        </>
      )}
    </div>
  );
}
