'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import './SlideEditorial.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaArrowRightLong } from "react-icons/fa6";
import { useRouter } from 'next/navigation';
import { HiPlusSm } from "react-icons/hi";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// 🔹 ฟังก์ชันทำความสะอาด description
function parseDescription(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/^"+|"+$/g, '')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\\n/g, '')
    .replace(/ style="[^"]*"/g, '')
    .replace(/<[^>]+>/g, '') // ลบ HTML tag
    .trim();
}

export default function SlideEditorial() {
  const [editorials, setEditorials] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const router = useRouter();

  // 🔹 ดึงข้อมูลจาก API จริง
  useEffect(() => {
    fetch(`${baseUrl}/api/edittormainpageapi`, {
      headers: { 'X-API-KEY': apiKey }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status && Array.isArray(data.result)) {
          const formatted = data.result.map(item => ({
            id: item.editoria_num,
            title: item.editoria_titieTH,
            date: new Date(item.editoria_creacteAt).toLocaleDateString('th-TH', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            content: parseDescription(item.editoria_descriptionTH),
            mainImage: item.editoria_gallary
              ? `${baseUrl}/${item.editoria_gallary.replace(/^"+|"+$/g, '').replace(/\\/g, '/')}`
              : '/images/no-image.jpg'
          }));
          setEditorials(formatted);
        } else {
          setEditorials([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch editorial:', err);
        setEditorials([]);
        setLoading(false);
      });
  }, []);

  const totalGroups = Math.ceil(editorials.length / 3);

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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    swipeToSlide: true,
    variableWidth: false,
    centerMode: false,
    arrows: false,
    beforeChange: handleBeforeChange,
    afterChange: handleAfterChange,
    appendDots: () => <CustomDots />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  const SkeletonCard = () => (
    <div className="slide-itemeditorial fade-in">
      <div className="skeleton-cardeditorial">
        <div className="skeleton skeleton-imageeditorial" />
        <div className="skeleton skeleton-titleeditorial" />
        <div className="skeleton skeleton-dataeditorial" />
        <span className="skeleton skeleton-lineeditorial" />
        <span className="skeleton skeleton-lineeditorial" />
      </div>
    </div>
  );

  return (
    <div className="editorial-wrapperslide">
      <h1 className="headtitleone">บทความ</h1>

      <div className="editorial-headerslide">
        <Link href="/editorial" className="view-all">
          <HiPlusSm className="icon-view" />
          ดูทั้งหมด
        </Link>
      </div>

      <Slider ref={sliderRef} {...settings}>
        {loading
          ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : editorials.map((item, index) => {
            const currentGroupStart = activeSlide * 3;
            const currentGroupEnd = currentGroupStart + 3;
            const visibleItems = editorials.slice(currentGroupStart, currentGroupEnd);
            const middleIndexInGroup = Math.floor(visibleItems.length / 2);
            const globalMiddleIndex = currentGroupStart + middleIndexInGroup;
            const isMiddle = index === globalMiddleIndex;

            const snippet = item.content.length > 100
              ? item.content.slice(0, 100) + '...'
              : item.content;

            return (
              <div key={item.id} className="slide-item">
                <div
                  className={`editorial-cardslide ${isMiddle ? 'highlight' : ''}`}
                  onClick={() => {
                    if (!dragging) router.push(`/editorial/${item.id}`);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-imageslide">
                    <Image
                      src={item.mainImage}
                      alt={item.title}
                      width={400}
                      height={200}
                      style={{ width: '100%', height: 'auto' }} // ป้องกัน aspect ratio error
                      onErrorCapture={(e) => { e.currentTarget.src = '/images/no-image.jpg'; }}
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
    </div>
  );
}
