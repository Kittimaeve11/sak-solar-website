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
   ✅ ฟังก์ชันส่ง Log ไป Backend (แก้ brandtype = '0')
   ========================================================= */
const handleLogClick = async (item) => {
  try {
    // แสดงข้อมูล item ที่ถูกคลิกใน console เพื่อใช้ตรวจสอบ
    console.log("Log item:", item);

    // สร้างข้อมูล log สำหรับบันทึกเหตุการณ์การคลิกบทความ
    const logData = {
      actionType: '2', // รหัสประเภทการกระทำ (2 = การคลิกบทความ)
      actionDetail: `หน้าหลัก รหัสบทความ: ${item.editoria_id ?? '-'} หมายเลขบทความ: ${item.editoria_num ?? '-'} ชื่อบทความ: ${item.editoria_titieTH ?? '-'}`, // รายละเอียดเหตุการณ์
      typeUser: 'ผู้เยี่ยมชมเว็บไซต์', // ประเภทผู้ใช้
      datatype: 'บทความ', // ประเภทข้อมูลที่มีการกระทำ
      dataID: item.editoria_id ?? '0', // ID ของบทความ
      datatypeID: item.editoria_typeID ?? '0', // ประเภทของบทความ (type ID)
      brandtype: '0', // กำหนดค่าเริ่มต้นเป็น "0" เพื่อป้องกันค่า null
      dataname: item.editoria_titieTH ?? '-', // ชื่อบทความ
    };

    // แสดงข้อมูล logData ที่จะส่งให้ API
    console.log("LogData ที่จะส่ง:", logData);

    // ส่งข้อมูล log ไปยัง API สำหรับบันทึกเหตุการณ์
    const res = await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // กำหนดให้ส่งข้อมูลเป็น JSON
        'X-API-KEY': apiKey, // ใส่ API Key เพื่อยืนยันสิทธิ์การเข้าถึง API
      },
      body: JSON.stringify(logData), // แปลงข้อมูล log เป็น JSON ก่อนส่ง
    });

    // ตรวจสอบผลลัพธ์การส่งข้อมูล
    if (!res.ok) {
      // ถ้าเกิดข้อผิดพลาดจาก API ให้แสดงข้อความ error ใน console
      const err = await res.text();
      console.error('Log API error:', err);
    } else {
      // แสดงผลใน console เมื่อบันทึกสำเร็จ
      console.log('Log: บันทึกข้อมูลบทความสำเร็จ');
    }
  } catch (err) {
    // กรณีเกิดข้อผิดพลาดอื่น ๆ ระหว่างกระบวนการ (เช่น network error)
    console.error('เกิดข้อผิดพลาดในการบันทึก Log:', err);
  }
};

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

export default function SlideEditorial() {
  const [editorials, setEditorials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragging, setDragging] = useState(false);
  const sliderRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function loadEditorialOnce() {
      if (window.__EDITORIAL_CACHE__) {
        setEditorials(window.__EDITORIAL_CACHE__);
        setIsLoading(false);
        return;
      }

      try {
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
            } catch {}

            return {
              ...item, // เก็บค่าจริงทั้งหมดไว้ใช้ใน Log
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
          window.__EDITORIAL_CACHE__ = formatted;
          setEditorials(formatted);
        }
      } catch (error) {
        console.error('❌ Failed to fetch editorial:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadEditorialOnce();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const CustomDots = () => (
    <div className="custom-dots fade-in">
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
    <div className="skeleton-slide-itemeditorial fade-in">
      <div className="skeleton-cardsilde-editorial">
        <div className="skeleton skeleton-imagesilde-editorial" />
        <div className="skeleton-content-editorial">
          <div className="skeleton skeleton-titlesilde-editorial" />
          <div className="skeleton skeleton-datesilde-editorial" />
          <div className="skeleton skeleton-textsilde-editorial" />
          <div className="skeleton skeleton-textsilde-editorial" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="editorial-wrapperslide fade-in">
      <h1 className="headtitleone">บทความ</h1>

      <div className="editorial-headerslide">
        <Link href="/editorial" className="view-all">
          <HiPlusSm className="icon-view" />
          ดูทั้งหมด
        </Link>
      </div>

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
              { breakpoint: 1120, settings: { slidesToShow: 2 } },
              { breakpoint: 764, settings: { slidesToShow: 1 } },
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
                    onClick={async () => {
                      if (dragging) return;
                      await handleLogClick(item); // ✅ บันทึก Log ก่อนเปลี่ยนหน้า
                      router.push(`/editorial/${item.id}`);
                    }}
                  >
                    <div className="editorial-image-wrapper">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="card-imageslide"
                        sizes="(max-width: 768px) 100vw, 33vw"
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
