'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import './SlidePortfolio.css';
import { FaCalendar } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { HiPlusSm } from "react-icons/hi";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function SlidePortfolio() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragging, setDragging] = useState(false);
  const sliderRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const res = await fetch(`${baseUrl}/api/portfoliomainpageapi`, {
          headers: { 'X-API-KEY': apiKey },
        });

        const data = await res.json();

        if (data?.status && Array.isArray(data.result)) {
          const mappedProjects = data.result.map((item) => ({
            id: item.portfolio_id,
            title: item.adddressTH, // ✅ ใช้ addressTH
            size: item.installationsize,
            productType: item.TypeProduct_nameTH,
            panelCount: item.panelsolarcout,
            postDate: item.portfolio_datainstall,
            coverImage: item.portfolio_gallery
              ? JSON.parse(item.portfolio_gallery)[0]
              : '/images/placeholder.png',
          }));

          setTimeout(() => {
            setProjects(mappedProjects);
            setIsLoading(false);
          }, 1000);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalGroups = Math.ceil(projects.length / 3);

  const handleDotClick = (index) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index * 3);
      setActiveSlide(index);
    }
  };

  const handleBeforeChange = () => setDragging(true);
  const handleAfterChange = (i) => {
    setActiveSlide(Math.floor(i / 3));
    setTimeout(() => setDragging(false), 50);
  };

  // ✅ Custom Dots (bar-style)
  const CustomDots = () => (
    <div className="custom-dots">
      {Array.from({ length: totalGroups }).map((_, index) => (
        <div
          key={index}
          className={`dot-bar ${activeSlide === index ? 'active' : ''}`}
          onClick={() => handleDotClick(index)}
        />
      ))}
      <style jsx>{`
        /* จุด slide แบบแทบส้ม */
        .custom-dots {
          display: flex;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .dot-bar {
          height: 4px;
          width: 24px;
          background-color: #ffe0b2;
          border-radius: 8px;
          margin: 0 4px;
          cursor: pointer;
          transition: width 0.5s ease-in-out, background-color 0.5s ease-in-out;
          position: relative;
          overflow: hidden;
        }

        .dot-bar.active {
          width: 40px;
          background-color: #ff6d00;
        }

        .slide-item {
          padding: 0 12px;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );

  const SkeletonCard = () => (
    <div className="slide-itemportfolio fade-in">
      <div className="skeleton-cardportfolio">
        <div className="skeleton skeleton-imageportfolio"></div>
        <div className="skeleton skeleton-titleportfolio"></div>
        <div className="skeleton skeleton-lineportfolio"></div>
        <div className="skeleton skeleton-lineportfolio"></div>
      </div>
    </div>
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipeToSlide: true,
    arrows: false,
    centerMode: false,
    beforeChange: handleBeforeChange,
    afterChange: handleAfterChange,
    appendDots: () => <CustomDots />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1, swipeToSlide: true } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1, swipeToSlide: true } },
    ],
  };

  return (
    <div className="portfolio-wrapperslide">
      <br />
      <h1 className="headtitleone">ผลงานของเรา</h1>
      <div className="portfolio-headerslide">
        <Link href="/portfolio" className="view-all flex items-center gap-2">
          <HiPlusSm className="icon-view" />
          ดูทั้งหมด
        </Link>
      </div>

      {isLoading ? (
        <div className="portfolio-loading-grid">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <Slider ref={sliderRef} {...settings}>
          {projects.map((proj, i) => (
            <div key={proj?.id || `proj-${i}`} className="slide-item">
              <div
                className="portfolio-cardslide"
                onClick={() => !dragging && router.push(`/portfolio/${proj?.id}`)}
              >
                <div className="portfolioslide-image-wrapper" style={{ position: 'relative', height: 200 }}>
                  <Image
                    src={`${baseUrl}/${proj?.coverImage}` || '/images/placeholder.png'}
                    alt={proj?.title || 'ไม่ระบุ'}
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
                    <div className="banner-textslide">ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด</div>
                  </div>
                </div>

                <div className="portfolio-contentslide">
                  <h3 className="project-titleslide" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'break-word',
                  }}>
                    {proj?.title || '-'}
                  </h3>

                  <ul className="project-detailsslide">
                    <li><strong>ขนาดติดตั้ง</strong><span>{proj?.size || '-'}</span></li>
                    <li><strong>ประเภทผลิตภัณฑ์</strong><span>{proj?.productType || '-'}</span></li>
                    <li><strong>จำนวนแผง</strong><span>{proj?.panelCount || '-'} แผง</span></li>
                    <li className="date-postslide">
                      <strong><FaCalendar /></strong>
                      <span>{proj?.postDate || '-'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
}
