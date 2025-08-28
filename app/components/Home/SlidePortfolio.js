'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendar } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { HiPlusSm } from "react-icons/hi";
import './SlidePortfolio.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function SlidePortfolio() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragging, setDragging] = useState(false);
  const sliderRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/portfolio?page=1')
      .then((res) => res.json())
      .then((data) => {
        // เพิ่ม delay เพื่อเห็น skeleton (ลบออกได้)
        setTimeout(() => {
          setProjects(data.projects);
          setIsLoading(false);
        }, 1000);
      });
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
      <h1 className="headersolarslide">ผลงานของเรา</h1>
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
                    src={proj?.coverImage || '/images/placeholder.png'}
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
