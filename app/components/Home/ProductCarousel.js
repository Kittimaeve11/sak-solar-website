'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiPlusCircle } from 'react-icons/hi';
import { MdOutlineElectricBolt } from 'react-icons/md';
import { TbCurrencyBaht } from 'react-icons/tb';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ProductCarousel.css';

/* =========================================================
   🔶 โหลด react-slick แบบ dynamic (ไม่รันฝั่ง server)
   ========================================================= */
const Slider = dynamic(() => import('react-slick'), { ssr: false });

/* =========================================================
   🔶 Skeleton Loader: ขนาดและระยะเท่าการ์ดจริงทุก pixel
   ========================================================= */
function HardSkeleton() {
  return (
    <div className="carouselWrapper fade-in">
      {/* Header Skeleton */}
      <div className="carouselHeader">
        <div
          className="skeleton skeleton-title"
          style={{ width: '220px', height: '28px', borderRadius: '6px' }}
        />
        <div className="skeleton-header-link">
          <HiPlusCircle size={20} />
          <span>ผลิตภัณฑ์ทั้งหมด</span>
        </div>
      </div>

      {/* Skeleton Card Grid — แสดงเพียง 1 แถว 4 การ์ด */}
      <div className="skeleton-grid">
        <div className="skeleton-row">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeletonCard">
              <div className="skeleton skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   🔶 ปุ่มลูกศรซ้าย/ขวาใน Carousel
   ========================================================= */
function Arrow({ onClick, direction }) {
  return (
    <button
      className={`carouselArrow ${direction}`}
      onClick={onClick}
      aria-label={direction === 'left' ? 'ก่อนหน้า' : 'ถัดไป'}
    >
      {direction === 'left' ? <FaChevronLeft size={25} /> : <FaChevronRight size={25} />}
    </button>
  );
}

/* =========================================================
   🔶 ฟังก์ชันกำหนดจำนวนสไลด์ตามขนาดหน้าจอ
   ========================================================= */
const getSlidesByWidth = (w) => (w < 801 ? 1 : w < 1200 ? 2 : w < 1500 ? 3 : 4);

/* =========================================================
   🔶 Component หลัก: ProductCarousel
   ========================================================= */
export default function ProductCarousel({ title, items, link = '#', loading = false }) {
  const [slidesToShow, setSlidesToShow] = useState(4);
  const [hydrated, setHydrated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const isSSR = typeof window === 'undefined';

  /* ---------------------------------------------------------
     ✅ ตรวจจับขนาดหน้าจอ
     --------------------------------------------------------- */
  useEffect(() => {
    setHydrated(true);
    if (typeof window === 'undefined') return;
    const handleResize = () => setSlidesToShow(getSlidesByWidth(window.innerWidth));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ---------------------------------------------------------
     ✅ แสดง Skeleton “ทันที” ถ้ายังโหลดอยู่
     --------------------------------------------------------- */
  const isHardLoading =
    isSSR || !hydrated || loading || !items || (Array.isArray(items) && items.length === 0);
  if (isHardLoading) return <HardSkeleton />;

  const showSlider = Array.isArray(items) && items.length > slidesToShow;

  /* ---------------------------------------------------------
     ✅ ตั้งค่า react-slick
     --------------------------------------------------------- */
  const settings = {
    dots: false,
    infinite: true,
    speed: 400,
    slidesToShow,
    slidesToScroll: 1,
    arrows: true,
    swipeToSlide: true,
    nextArrow: <Arrow direction="right" />,
    prevArrow: <Arrow direction="left" />,
  };

  /* ---------------------------------------------------------
     ✅ คืนชื่อสินค้า
     --------------------------------------------------------- */
  const getProductName = (item) => {
    if (item.producttypeID === '2') return item.modelairname ?? 'ไม่พบข้อมูลชื่อ';
    return item.modelname ?? item.name ?? item.solarpanel ?? item.title ?? 'ไม่พบข้อมูลชื่อ';
  };

  /* ---------------------------------------------------------
     ✅ ตรวจจับการลาก (ป้องกันคลิกผิด)
     --------------------------------------------------------- */
  const handleMouseDown = (e) => setDragStart({ x: e.clientX, y: e.clientY });
  const handleMouseUp = (e) => {
    const dx = Math.abs(e.clientX - dragStart.x);
    const dy = Math.abs(e.clientY - dragStart.y);
    setIsDragging(dx > 5 || dy > 5);
  };

  /* ---------------------------------------------------------
     ✅ การ์ดสินค้า
     --------------------------------------------------------- */
  const renderCard = (item, idx) => {
    let finalPrice = null;
    if (item.isprice === '1' && item.price) {
      if (item.productpro_ispromotion === '1' && item.productpro_percent) {
        const p = parseFloat(item.productpro_percent) || 0;
        finalPrice = item.price - (item.price * p) / 100;
      } else {
        finalPrice = item.price;
      }
    }

    const brandID =
      item.productbrandID ?? item.probrandID ?? item.brandID ?? item.BrandID ?? '0';
    const productNum = item.product_num ?? item.product_ID ?? idx;

    return (
      <Link
        key={productNum}
        prefetch={false}
        href={`/products/${item.producttypeID}/${brandID}/${productNum}`}
        className="carouselCard no-underline hover:no-underline"
        onMouseDown={handleMouseDown}
        onMouseUp={(e) => {
          handleMouseUp(e);
          if (isDragging) e.preventDefault();
        }}
      >
        {/* 🔸 รูปสินค้า */}
        {item.image && (
          <div className="product-image-wrapper" style={{ position: 'relative' }}>
            <Image
              src={item.image}
              alt={getProductName(item)}
              width={330}
              height={330}
              style={{ objectFit: 'cover' }}
              draggable={false}
              priority
            />
            {item.productpro_ispromotion === '1' && item.productpro_percent && (
              <div className="product-promo-ribbon">-{item.productpro_percent}</div>
            )}
          </div>
        )}

        {/* 🔸 รายละเอียดสินค้า */}
        <div className="product-info">
          <h3>
            {item.productbrandName ? `${item.productbrandName} ` : ''}
            {getProductName(item)}
          </h3>

          {item.battery && <h6 style={{ marginTop: 0 }}>รุ่นแบตเตอรี่ {item.battery} kWh</h6>}

          {(item.isprice == 0 || item.isprice === '0') && item.size && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
              <p
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 600,
                  fontSize: 18,
                  margin: 0,
                  lineHeight: 1,
                  gap: 4,
                }}
              >
                <MdOutlineElectricBolt size={22} color="#ffc300" />
                {item.size}
              </p>
            </div>
          )}

          {item.isprice === '1' && item.price && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 20,
                marginTop: '1rem',
                color: '#000',
                fontWeight: 600,
                gap: 4,
              }}
            >
              <TbCurrencyBaht size={22} />
              {Number(finalPrice ?? item.price).toLocaleString()} บาท
              {item.productpro_ispromotion === '1' && item.productpro_percent && (
                <span
                  style={{
                    fontSize: 16,
                    color: '#888',
                    textDecoration: 'line-through',
                    marginLeft: '0.5rem',
                  }}
                >
                  {Number(item.price).toLocaleString()} บาท
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    );
  };

  /* ---------------------------------------------------------
     ✅ Render Carousel
     --------------------------------------------------------- */
  return (
    <div className="carouselWrapper fade-in">
      <div className="carouselHeader">
        <h2 className="carouselTitle">{title}</h2>
        <Link href={link} className="carouselLink no-underline hover:no-underline">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            <HiPlusCircle /> ผลิตภัณฑ์ทั้งหมด
          </span>
        </Link>
      </div>

      <div className="carouselInner" style={{ minHeight: 380 }}>
        {Array.isArray(items) && items.length > 0 ? (
          showSlider ? (
            <Slider {...settings}>
              {items.map((item, idx) => (
                <div key={item.product_num ?? idx} className="carouselStaticWrapper">
                  {renderCard(item, idx)}
                </div>
              ))}
            </Slider>
          ) : (
            <div className="carouselStaticWrapper">
              {items.map((item, idx) => (
                <React.Fragment key={item.product_num ?? idx}>{renderCard(item, idx)}</React.Fragment>
              ))}
            </div>
          )
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem' }}>ไม่พบสินค้า</p>
        )}
      </div>
    </div>
  );
}
