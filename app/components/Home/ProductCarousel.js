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

const Slider = dynamic(() => import('react-slick'), { ssr: false });

// กำหนดจำนวนการ์ดตามความกว้างหน้าจอ
const getSlidesByWidth = (w) => (w < 801 ? 1 : w < 1200 ? 2 : w < 1500 ? 3 : 4);

/* ===============================
   SKELETON โหลดชั่วคราว (ใช้ layout ใกล้ของจริง)
   =============================== */
function HardSkeleton() {
  // เรนเดอร์ 4 ใบตายตัว → ให้ CSS เป็นคนซ่อนใบเกินตาม breakpoint
  const cards = Array.from({ length: 4 });

  return (
    <div className="carouselWrapper fade-in">
      <div className="carouselHeader">
        <div
          className="skeleton pc-skeleton-title"
          style={{
            width: '220px',
            height: '28px',
            marginBottom: '1.5rem',
            marginTop: '2.5rem ',
          }}
        />
        <div className="pc-skeleton-header-link">
          <HiPlusCircle size={20} />
          <span>ผลิตภัณฑ์ทั้งหมด</span>
        </div>
      </div>

      <div className="pc-skeleton-grid">
        <div className="pc-skeleton-row">
          {cards.map((_, i) => (
            <div key={i} className="pc-skeletonCard skeleton-card">
              <div className="skeleton pc-skeleton-image" />
              <div className="pc-skeleton-content">
                <div className="skeleton pc-skeleton-title" />
                <div className="skeleton pc-skeleton-line" />
                <div className="skeleton pc-skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===============================
   ลูกศรเลื่อนซ้าย/ขวา
   =============================== */
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

/* ===============================
   ส่วนหลัก ProductCarousel
   =============================== */
export default function ProductCarousel({
  title,
  items = [],
  link = '#',
  loading = false,
}) {
  const [slidesToShow, setSlidesToShow] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSlidesToShow(getSlidesByWidth(window.innerWidth));
    };

    // เรียกครั้งแรกบน client
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 💡 ตอนโหลด: ใช้ prop loading จากหน้า HomePage อย่างเดียวพอ
  if (loading) {
    return <HardSkeleton />;
  }

  const hasItems = Array.isArray(items) && items.length > 0;
  const showSlider = hasItems && items.length > slidesToShow;

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

  const getProductName = (item) => {
    if (item.producttypeID === '2') return item.modelairname ?? 'ไม่พบข้อมูลชื่อ';
    return item.modelname ?? item.name ?? item.solarpanel ?? item.title ?? 'ไม่พบข้อมูลชื่อ';
  };

  const handleMouseDown = (e) => setDragStart({ x: e.clientX, y: e.clientY });

  const handleMouseUp = (e) => {
    const dx = Math.abs(e.clientX - dragStart.x);
    const dy = Math.abs(e.clientY - dragStart.y);
    setIsDragging(dx > 5 || dy > 5);
  };

  /* =========================================================
     ฟังก์ชันบันทึก Log ไป Backend (ตรงตาม productmainpageapi)
     ========================================================= */
  const handleLogClick = async (item) => {
    try {
      console.log('Log item:', item);

      const logData = {
        actionType: '1', // 1 = ดูผลิตภัณฑ์
        actionDetail: `หน้าหลัก รหัส: ${item.product_ID ?? '-'} หมายเลขผลิตภัณฑ์: ${
          item.product_num ?? '-'
        }`,
        typeUser: 'ผู้เยี่ยมชมเว็บไซต์', // ใครทำ
        datatype: 'ผลิตภัณฑ์', // ประเภทเมนูที่กระทำ
        dataID: item.product_ID ?? '0', // ไอดีข้อมูล
        datatypeID: item.producttypeID ?? '0', // ไอดีประเภทข้อมูล (จาก producttypeID)
        brandtype: item.productbrandID ?? item.probrandID ?? '0', // ไอดียี่ห้อ
        dataname: item.product_num ?? '-', // ชื่อข้อมูล (จาก product_num)
      };

      console.log('LogData ที่จะส่ง:', logData);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/api/logWebsitepageapi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API,
        },
        body: JSON.stringify(logData),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Log API error:', err);
      } else {
        console.log('Log: บันทึกข้อมูลการดูผลิตภัณฑ์สำเร็จ');
      }
    } catch (err) {
      console.error(' เกิดข้อผิดพลาดในการบันทึก Log:', err);
    }
  };

  /* ===============================
     การ์ดสินค้า
     =============================== */
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
        onClick={() => handleLogClick(item)}
      >
        {item.image && (
          <div className="product-image-wrapper">
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
              <div className="product-promo-ribbon">- {item.productpro_percent}</div>
            )}
          </div>
        )}

        <div
          className="product-info"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            padding: '1rem',
            minHeight: '120px',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#2a3e5e' }}>
              {item.productbrandName ? `${item.productbrandName} ` : ''}
              {getProductName(item)}
            </h3>

            {item.battery && (
              <h6 style={{ margin: '0.5rem 0 0 0', fontWeight: 500, color: '#333' }}>
                รุ่นแบตเตอรี่ {item.battery} kWh
              </h6>
            )}
          </div>

          {(item.isprice == 0 || item.isprice === '0') && item.size && (
            <div className="product-size-display">
              <MdOutlineElectricBolt size={25} color="#ffc300" />
              {item.size}
            </div>
          )}

          {item.isprice === '1' && item.price && (
            <div className="product-price-display">
              {/* ใส่ class ให้ตรงกับ CSS mobile (.price-icon, .product-price-new) */}
              <span className="price-icon">
                <TbCurrencyBaht size={25} />
              </span>
              <span className="product-price-new">
                {Number(finalPrice ?? item.price).toLocaleString()} บาท
              </span>
              {item.productpro_ispromotion === '1' && item.productpro_percent && (
                <span className="product-price-old">
                  {Number(item.price).toLocaleString()} บาท
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    );
  };

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
        {hasItems ? (
          showSlider ? (
            <Slider {...settings}>
              {items.map((item, idx) => (
                <div key={idx} className="slide-itemproduct">
                  {renderCard(item, idx)}
                </div>
              ))}
            </Slider>
          ) : (
            <div className="carouselStaticWrapper">
              {items.map((item, idx) => (
                <React.Fragment key={idx}>{renderCard(item, idx)}</React.Fragment>
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
