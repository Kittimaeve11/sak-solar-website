'use client';

import React, { useState } from 'react';
import Slider from 'react-slick';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiPlusCircle } from 'react-icons/hi';
import { MdOutlineElectricBolt } from 'react-icons/md';
import { TbCurrencyBaht } from "react-icons/tb";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ProductCarousel.css';

// Custom Arrow Component
function Arrow({ onClick, direction }) {
  return (
    <button
      className={`carouselArrow ${direction}`}
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
    >
      {direction === 'left' ? <FaChevronLeft size={25} /> : <FaChevronRight size={25} />}
    </button>
  );
}

export default function ProductCarousel({ title, items, link }) {
  const showSlider = items.length > 4;
  const [isDragging, setIsDragging] = useState(false);

  const settings = {
    dots: false,
    infinite: true,
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    swipeToSlide: true,
    cssEase: 'ease-out',
    nextArrow: <Arrow direction="right" />,
    prevArrow: <Arrow direction="left" />,
    beforeChange: () => setIsDragging(true),
    afterChange: () => setTimeout(() => setIsDragging(false), 50),
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  const getProductName = (item) =>
    item.name ?? item.model ?? item.solarpanel ?? item.title ?? 'ไม่พบข้อมูลชื่อ';
  const renderCard = (item) => {
    let finalPrice = null;
    if (item.isprice === "1" && item.price) {
      if (item.productpro_ispromotion === "1" && item.productpro_percent) {
        const discountPercent = parseFloat(item.productpro_percent) || 0;
        finalPrice = item.price - (item.price * discountPercent / 100);
      } else {
        finalPrice = item.price;
      }
    }

    return (
      <Link
        href={`/products/${item.producttypeID}/${item.productbrandID}/${item.product_ID}`}
        className="carouselCard no-underline hover:no-underline"
        onClick={(e) => { if (isDragging) e.preventDefault(); }}
      >


        {/* รูปสินค้า + ป้ายโปรโมชั่น */}
        {item.image && (
          <div className="product-image-wrapper" style={{ position: 'relative' }}>
            <Image
              src={item.image}
              alt={getProductName(item)}
              width={330}
              height={330}
              style={{ objectFit: 'cover' }}
            />
            {item.productpro_ispromotion === "1" && item.productpro_percent && (
              <div className="product-promo-ribbon">-{item.productpro_percent}</div>
            )}
          </div>
        )}

        {/* ข้อมูลสินค้า */}
        <div className="product-info" >
          <h3>
            {item.productbrandName ? `${item.productbrandName} ` : ''}
            {getProductName(item)}
          </h3>

          {item.battery && (
            <h6 style={{ marginTop: '0.5rem' }}>รุ่นแบตเตอรี่ {item.battery} kWh</h6>
          )}

          {(item.isprice == 0 || item.isprice === "0") && item.size && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>

              <p style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '18px', margin: 0, lineHeight: 1 }}>
                <MdOutlineElectricBolt size={25} color='#ffc300'  /> {item.size}
              </p>
            </div>
          )}

          {item.isprice === "1" && item.price && (
            <div>
              {item.productpro_ispromotion === "1" && item.productpro_percent ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1rem' }}>
                  <p style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '18px', margin: 0, lineHeight: 1 }}>
                    <TbCurrencyBaht size={25} color='#000000ff' /> {Number(finalPrice).toLocaleString()} บาท
                  </p>
                  <span style={{ fontSize: '16px', color: '#888', textDecoration: 'line-through' }}>
                    {Number(item.price).toLocaleString()} บาท
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1rem' }}>
                  <p style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: '18px', margin: 0, lineHeight: 1 }}>
                    <TbCurrencyBaht size={25} color='#000000ff' /> {Number(item.price).toLocaleString()} บาท
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="carouselWrapper">
      {/* Header */}
      <div className="carouselHeader">
        <h2 className="carouselTitle">{title}</h2>
        <Link href={link} className="carouselLink no-underline hover:no-underline">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <HiPlusCircle />
            ผลิตภัณฑ์ทั้งหมด
          </span>
        </Link>
      </div>

      {/* Slider / Static */}
      <div className="carouselInner">
        {showSlider ? (
          <Slider {...settings}>
            {items.map((item) => (
              <div
                key={item.id || item.product_ID || `${item.name}-${Math.random()}`}
                className="carouselStaticWrapper"
              >
                {renderCard(item)}
              </div>
            ))}
          </Slider>
        ) : (
          <div className="carouselStaticWrapper">
            {items.map((item) => (
              <React.Fragment
                key={item.id || item.product_ID || `${item.name}-${Math.random()}`}
              >
                {renderCard(item)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
