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
const getSlidesByWidth = (w) => (w < 801 ? 1 : w < 1200 ? 2 : w < 1500 ? 3 : 4);

function HardSkeleton() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateCount = () => setCount(getSlidesByWidth(window.innerWidth));
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);
  return (
    <div className="carouselWrapper fade-in">
      <div className="carouselHeader">
        <div
          className="skeleton pc-skeleton-title"
          style={{ width: '220px', height: '28px', marginBottom: '1.5rem', marginTop: '2.5rem ' }}
        />
        <div className="pc-skeleton-header-link">
          <HiPlusCircle size={20} />
          <span>ผลิตภัณฑ์ทั้งหมด</span>
        </div>
      </div>
      <div className="pc-skeleton-grid">
        <div className="pc-skeleton-row">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="pc-skeletonCard">
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

export default function ProductCarousel({ title, items, link = '#', loading = false }) {
  const [slidesToShow, setSlidesToShow] = useState(4);
  const [hydrated, setHydrated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const isSSR = typeof window === 'undefined';

  useEffect(() => {
    setHydrated(true);
    if (typeof window === 'undefined') return;
    const handleResize = () => setSlidesToShow(getSlidesByWidth(window.innerWidth));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isHardLoading =
    isSSR || !hydrated || loading || !items || (Array.isArray(items) && items.length === 0);
  if (isHardLoading) return <HardSkeleton />;

  const showSlider = Array.isArray(items) && items.length > slidesToShow;

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

  const handleLogClick = async (item) => {
    try {
      const logData = {
        actionType: '1',
        actionDetail: `หน้าหลัก รหัส: ${item.product_ID ?? item.product_num ?? '-'} หมายเลขผลิตภัณฑ์: ${
          item.modelname ?? item.modelairname ?? item.name ?? '-'
        }`,
        typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
        datatype: 'ผลิตภัณฑ์',
        dataID: item.product_ID ?? item.product_num ?? '0',
        datatypeID: '1',
        brandtype: item.producttypeID ?? '0',
        dataname: item.modelname ?? item.modelairname ?? item.name ?? '-',
      };

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/log/saveLog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API,
        },
        body: JSON.stringify(logData),
      });
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการบันทึก Log:', err);
    }
  };

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

    const brandID = item.productbrandID ?? item.probrandID ?? item.brandID ?? item.BrandID ?? '0';
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

        {/* ปรับ layout ด้านล่างให้เรียงแน่นอนและระยะเท่ากันทุกใบ */}
        <div
          className="product-info"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1,
            padding: '1rem',
            minHeight: '120px', // บังคับให้ทุกใบสูงเท่ากัน
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

          {/* ระบบไฟฟ้า (isprice=0) และ ราคา (isprice=1) — ขนาดเท่ากันแน่นอน */}
          {(item.isprice == 0 || item.isprice === '0') && item.size && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600,
                fontSize: 20,
                marginTop: '0',
                color: '#000',
                gap: 2,
              }}
            >
              <MdOutlineElectricBolt size={25} color="#ffc300" />
              {item.size}
            </div>
          )}

          {item.isprice === '1' && item.price && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600,
                fontSize: 20,
                marginTop: '0',
                color: '#000',
                gap: 0,
              }}
            >
              <TbCurrencyBaht size={25} />
              {Number(finalPrice ?? item.price).toLocaleString()} บาท
              {item.productpro_ispromotion === '1' && item.productpro_percent && (
                <span
                  style={{
                    fontSize: 14,
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
