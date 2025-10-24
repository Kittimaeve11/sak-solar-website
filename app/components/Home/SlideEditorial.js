'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import './SlideEditorial.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaArrowRightLong } from 'react-icons/fa6';
import { HiPlusSm } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* =========================================================
   🧩 ฟังก์ชันล้างข้อความจาก description
   ========================================================= */
function parseDescription(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/^"+|"+$/g, '')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\\n/g, '')
    .replace(/ style="[^"]*"/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/* =========================================================
   🗓 ฟังก์ชันจัดการวันที่
   ========================================================= */
function safeDateString(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return isNaN(d.getTime())
    ? '-'
    : d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
}

/* =========================================================
   📰 Component หลัก: SlideEditorial
   ========================================================= */
export default function SlideEditorial() {
  const [editorials, setEditorials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragging, setDragging] = useState(false);
  const sliderRef = useRef(null);
  const router = useRouter();

  /* ---------------------------------------------------------
     📡 ดึงข้อมูลจาก API
     --------------------------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${baseUrl}/api/edittormainpageapi`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const data = await res.json();

        if (data.status && Array.isArray(data.result)) {
          const formatted = data.result.map((item) => {
            let imageUrl = '/images/no-image.jpg';
            try {
              const galleryArr = JSON.parse(item.editoria_gallary);
              if (Array.isArray(galleryArr) && galleryArr.length > 0) {
                imageUrl = `${baseUrl}/${galleryArr[0]}`;
              }
            } catch {
              console.warn('Invalid gallery format:', item.editoria_gallary);
            }

            return {
              id: item.editoria_num || item.editoria_id,
              title:
                item.editoria_titieTH ||
                item.editoria_titieEN ||
                'ไม่มีชื่อเรื่อง',
              content: parseDescription(
                item.editoria_descriptionTH ||
                  item.editoria_descriptionEN ||
                  ''
              ),
              date: safeDateString(item.editoria_creacteAt),
              image: imageUrl,
              pin: Number(item.editoria_pin) || 0,
            };
          });

          formatted.sort((a, b) => b.pin - a.pin);
          setEditorials(formatted);
        }
      } catch (error) {
        console.error('❌ Failed to fetch editorial:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------------------------------------------------
     📊 จัดการ custom dots
     --------------------------------------------------------- */
  const slidesPerGroup = 3;
  const totalGroups =
    editorials.length > 0 ? Math.ceil(editorials.length / slidesPerGroup) : 0;

  const handleDotClick = (index) => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(index * slidesPerGroup);
      setActiveSlide(index);
    }
  };

  const handleBeforeChange = () => setDragging(true);
  const handleAfterChange = (i) => {
    setActiveSlide(Math.floor(i / slidesPerGroup));
    setTimeout(() => setDragging(false), 50);
  };

  /* ---------------------------------------------------------
     ⚙️ Custom Dots Component
     --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     🩶 Skeleton Loader (layout เท่าการ์ดจริงทุก pixel)
     --------------------------------------------------------- */
  const SkeletonCard = () => (
    <div className="skeleton-slide-itemeditorial fade-in">
      <div className="skeleton-cardsilde-editorial">
        <div className="skeleton-imagesilde-editorial" />
        <div className="skeleton-content-editorial">
          <div className="skeleton-titlesilde-editorial" />
          <div className="skeleton-datesilde-editorial" />
          <div className="skeleton-textsilde-editorial" />
          <div className="skeleton-textsilde-editorial" />
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------------
     🖼 แสดงผลหลัก
     --------------------------------------------------------- */
  return (
    <div className="editorial-wrapperslide fade-in">
      <h1 className="headtitleone">บทความ</h1>

      <div className="editorial-headerslide">
        <Link href="/editorial" className="view-all">
          <HiPlusSm className="icon-view" />
          ดูทั้งหมด
        </Link>
      </div>

      {/* ======= Skeleton Loading ======= */}
      {isLoading ? (
        <div className="editorial-loading-wrapper">
          <div className="editorial-loading-grid">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <Slider
            ref={sliderRef}
            dots={false}
            infinite={editorials.length > slidesPerGroup}
            speed={500}
            slidesToShow={3}
            slidesToScroll={1}
            swipeToSlide
            arrows={false}
            beforeChange={handleBeforeChange}
            afterChange={handleAfterChange}
            responsive={[
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 1,
                  swipeToSlide: true,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  swipeToSlide: true,
                },
              },
            ]}
          >
            {editorials.map((item, i) => {
              const snippet =
                item.content.length > 100
                  ? item.content.slice(0, 100) + '...'
                  : item.content;

              return (
                <div key={item.id || `ed-${i}`} className="slide-itemeditorial fade-in">
                  <div
                    className="editorial-cardslide"
                    onClick={() =>
                      !dragging && router.push(`/editorial/${item.id}`)
                    }
                  >
                    <div
                      className="editorial-image-wrapper"
                      style={{ position: 'relative', height: 200 }}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>

                    <div className="card-contentslide">
                      <h3 className="card-titleslide">{item.title}</h3>
                      <p className="editorial-dateslide">{item.date}</p>
                      <p className="card-snippetslide">{snippet}</p>
                      <p className="read-more">
                        อ่านเพิ่มเติม <FaArrowRightLong />
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>

          <CustomDots />
        </>
      )}
    </div>
  );
}
