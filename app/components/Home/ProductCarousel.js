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
// ไม่พึ่ง CSS skeleton แล้ว แต่คงไฟล์ไว้ใช้สไตล์อื่นๆ
import './ProductCarousel.css';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

/** ===== Inline Skeleton (ไม่ง้อ CSS, เห็นทันที) ===== */
function HardSkeleton({ slides = 4, rows = 2, minHeight = 380 }) {
  const box = (w='100%', h=16, r=8, m='8px 0') => (
    <div style={{ width:w, height:h, borderRadius:r, background:'#E6E6E6', margin:m }} />
  );
  return (
    <div style={{ position:'relative' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        {box(220, 28, 6, 0)}
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, opacity:.6, fontWeight:600 }}>
          <HiPlusCircle /> ผลิตภัณฑ์ทั้งหมด
        </div>
      </div>

      <div style={{ minHeight, paddingTop:8 }}>
        {[...Array(rows)].map((_, r) => (
          <div key={r} style={{ display:'flex', gap:20, marginBottom:20 }}>
            {[...Array(slides)].map((_, c) => (
              <div key={c} style={{ flex:'0 0 330px' }}>
                {box(330, 330, 12, '0 0 10px 0')}
                {box(260, 20)}
                {box('70%', 14)}
                {box('85%', 14)}
              </div>
            ))}
          </div>
        ))}
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

const getSlidesByWidth = (w) => (w < 801 ? 1 : w < 1200 ? 2 : w < 1500 ? 3 : 4);

export default function ProductCarousel({ title, items, link = '#', loading = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [slidesToShow, setSlidesToShow] = useState(4);
  const [hydrated, setHydrated] = useState(false);
  const isSSR = typeof window === 'undefined';

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handle = () => setSlidesToShow(getSlidesByWidth(window.innerWidth));
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  // ===== เงื่อนไขโชว์สเกเลตันแบบฮาร์ด (ไม่ง้อ CSS) =====
  const isHardLoading =
    isSSR ||
    !hydrated ||
    loading ||
    items === undefined ||
    items === null ||
    (Array.isArray(items) && items.length === 0 && !hydrated);

  if (isHardLoading) {
    // สเกเลตันขึ้น "ทันที" จริงๆ
    return <HardSkeleton slides={slidesToShow} rows={2} />;
  }

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
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false),
  };

  const getProductName = (item) => {
    if (item.producttypeID === '2') return item.modelairname ?? 'ไม่พบข้อมูลชื่อ';
    return item.modelname ?? item.name ?? item.solarpanel ?? item.title ?? 'ไม่พบข้อมูลชื่อ';
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

    return (
      <Link
        key={item.product_ID ?? item.id ?? idx}
        href={`/products/${item.producttypeID}/${item.productbrandID}/${item.product_ID}`}
        className="carouselCard no-underline hover:no-underline"
        onClick={(e) => isDragging && e.preventDefault()}
      >
        {item.image && (
          <div className="product-image-wrapper" style={{ position:'relative' }}>
            <Image
              src={item.image}
              alt={getProductName(item)}
              width={330}
              height={330}
              style={{ objectFit:'cover' }}
              draggable={false}
              priority
            />
            {item.productpro_ispromotion === '1' && item.productpro_percent && (
              <div className="product-promo-ribbon">-{item.productpro_percent}</div>
            )}
          </div>
        )}

        <div className="product-info">
          <h3>
            {item.productbrandName ? `${item.productbrandName} ` : ''}
            {getProductName(item)}
          </h3>

          {item.battery && <h6 style={{ marginTop: 0 }}>รุ่นแบตเตอรี่ {item.battery} kWh</h6>}

          {(item.isprice == 0 || item.isprice === '0') && item.size && (
            <div style={{ display:'flex', alignItems:'center', marginTop:'1rem' }}>
              <p style={{ display:'flex', alignItems:'center', fontWeight:600, fontSize:18, margin:0, lineHeight:1, gap:4 }}>
                <MdOutlineElectricBolt size={22} color="#ffc300" />
                {item.size}
              </p>
            </div>
          )}

          {item.isprice === '1' && item.price && (
            <div style={{ display:'flex', alignItems:'center', fontSize:20, marginTop:'1rem', color:'#000', fontWeight:600, gap:4 }}>
              <TbCurrencyBaht size={22} />
              {Number(finalPrice ?? item.price).toLocaleString()} บาท
              {item.productpro_ispromotion === '1' && item.productpro_percent && (
                <span style={{ fontSize:16, color:'#888', textDecoration:'line-through', marginLeft:'0.5rem' }}>
                  {Number(item.price).toLocaleString()} บาท
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    );
  };

  // ===== ของจริง (หลังผ่าน HardSkeleton) =====
  return (
    <div className="carouselWrapper">
      <div className="carouselHeader">
        <h2 className="carouselTitle">{title}</h2>
        <Link href={link} className="carouselLink no-underline hover:no-underline">
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontWeight:600 }}>
            <HiPlusCircle /> ผลิตภัณฑ์ทั้งหมด
          </span>
        </Link>
      </div>

      <div className="carouselInner" style={{ minHeight: 380 }}>
        {Array.isArray(items) && items.length > 0 ? (
          showSlider ? (
            <Slider {...settings}>
              {items.map((item, idx) => (
                <div key={item.product_ID ?? item.id ?? idx} className="carouselStaticWrapper">
                  {renderCard(item, idx)}
                </div>
              ))}
            </Slider>
          ) : (
            <div className="carouselStaticWrapper">
              {items.map((item, index) => (
                <React.Fragment key={item.product_ID ?? item.id ?? index}>
                  {renderCard(item, index)}
                </React.Fragment>
              ))}
            </div>
          )
        ) : (
          <p style={{ textAlign:'center', padding:'2rem' }}>ไม่พบสินค้า</p>
        )}
      </div>
    </div>
  );
}
