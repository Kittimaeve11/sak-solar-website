'use client';

import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiPlusCircle } from 'react-icons/hi';
import { MdOutlineElectricBolt } from 'react-icons/md';
import { TbCurrencyBaht } from 'react-icons/tb';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ProductCarousel.css';

function Arrow({ onClick, direction }) {
  return (
    <button className={`carouselArrow ${direction}`} onClick={onClick}>
      {direction === 'left' ? <FaChevronLeft size={25} /> : <FaChevronRight size={25} />}
    </button>
  );
}

const getSlidesByWidth = (width) => {
  if (width < 801) return 1;
  if (width < 1200) return 2;
  if (width < 1500) return 3;
  return 4;
};

export default function ProductCarousel({ title, items, link }) {
  const [isDragging, setIsDragging] = useState(false);
  const [slidesToShow, setSlidesToShow] = useState(4);

  useEffect(() => {
    const handleResize = () => setSlidesToShow(getSlidesByWidth(window.innerWidth));
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loading = !items || items.length === 0;
  const showSlider = !loading && items.length > slidesToShow;

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

  const getProductName = (item) =>
    item.name ?? item.model ?? item.solarpanel ?? item.title ?? 'ไม่พบข้อมูลชื่อ';

  const renderCard = (item) => {
    let finalPrice = null;
    if (item.isprice === '1' && item.price) {
      if (item.productpro_ispromotion === '1' && item.productpro_percent) {
        const discountPercent = parseFloat(item.productpro_percent) || 0;
        finalPrice = item.price - (item.price * discountPercent) / 100;
      } else finalPrice = item.price;
    }

    return (
      <Link
        key={item.product_ID ?? item.id}
        href={`/products/${item.producttypeID}/${item.productbrandID}/${item.product_ID}`}
        className="carouselCard no-underline hover:no-underline"
        onClick={(e) => isDragging && e.preventDefault()}
      >
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
        <div className="product-info">
          <h3>
            {item.productbrandName ? `${item.productbrandName} ` : ''}
            {getProductName(item)}
          </h3>
          {item.battery && (
            <h6 style={{ marginTop: '0rem' }}>รุ่นแบตเตอรี่ {item.battery} kWh</h6>
          )}
          {(item.isprice == 0 || item.isprice === '0') && item.size && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              <p
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 600,
                  fontSize: '18px',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                <MdOutlineElectricBolt size={25} color="#ffc300" /> {item.size}
              </p>
            </div>
          )}
          {item.isprice === '1' && item.price && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0',
                marginTop: '1rem',
                color: '#000',
                fontWeight: 700,
              }}
            >
              <TbCurrencyBaht size={25} style={{ verticalAlign: 'middle' }} />
              {Number(finalPrice ?? item.price).toLocaleString()} บาท
              {item.productpro_ispromotion === '1' && item.productpro_percent && (
                <span
                  style={{
                    fontSize: '16px',
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
    <div className="carouselWrapper">
      <div className="carouselHeader">
        <h2 className="carouselTitle">{title}</h2>
        <Link href={link} className="carouselLink no-underline hover:no-underline">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600,
            }}
          >
            <HiPlusCircle /> ผลิตภัณฑ์ทั้งหมด
          </span>
        </Link>
      </div>

      <div className="carouselInner" style={{ minHeight: '380px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', fontSize: '18px' }}>
            กำลังโหลด...
          </div>
        ) : showSlider ? (
          <Slider {...settings}>
            {items.map((item) => (
              <div key={item.product_ID ?? item.id} className="carouselStaticWrapper">
                {renderCard(item)}
              </div>
            ))}
          </Slider>
        ) : (
          <div className="carouselStaticWrapper">
            {items.map((item, index) => (
              <React.Fragment key={item.product_ID ?? item.id ?? index}>
                {renderCard(item)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
