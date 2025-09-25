'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/app/Context/LocaleContext';
import './SlideReview.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { HiPlusSm } from 'react-icons/hi';
import { IoPlayCircleOutline } from "react-icons/io5";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ====== ฟังก์ชันดึง videoId จาก URL ของ YouTube ====== */
function extractVideoId(url) {
    if (!url) return null;
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/* ====== Component แสดง Thumbnail พร้อม fallback ถ้าภาพโหลดไม่ได้ ====== */
function ThumbnailWithFallback({ videoId, alt }) {
    const [srcIndex, setSrcIndex] = useState(0);

    // ลำดับรูป thumbnail ที่จะลองโหลด
    const thumbnailUrls = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    ];

    return (
        <Image
            key={`${videoId}-${srcIndex}`}
            src={thumbnailUrls[srcIndex]}
            alt={alt}
            width={374}
            height={210}
            className="thumbnailslide"
            style={{ width: "100%", height: "auto" }}
            onError={() => {
                // ถ้าโหลดรูปไม่ได้ → ใช้รูปถัดไป
                if (srcIndex < thumbnailUrls.length - 1) {
                    setSrcIndex(srcIndex + 1);
                }
            }}
            unoptimized
        />
    );
}

/* ====== Component หลัก SlideReview ====== */
export default function SlideReview() {
    const { locale } = useLocale(); // ภาษา en/th
    const [reviews, setReviews] = useState([]); // เก็บข้อมูลรีวิวจาก API
    const [isLoading, setIsLoading] = useState(true); // สถานะโหลดข้อมูล
    const [activeSlide, setActiveSlide] = useState(0); // index dot ปัจจุบัน
    const [dragging, setDragging] = useState(false); // กัน click ตอน drag
    const sliderRef = useRef(null); // reference ไปยัง Slider

    /* ====== ดึงข้อมูลรีวิวจาก API ====== */
    useEffect(() => {
        async function fetchReviews() {
            if (!baseUrl || !apiKey) {
                console.error('Missing baseUrl or apiKey:', { baseUrl, apiKey });
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const res = await fetch(`${baseUrl}/api/Reviewapi`, {
                    headers: { 'X-API-KEY': apiKey },
                });
                if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
                const data = await res.json();
                setReviews(data.result?.data || []); // เซ็ตข้อมูลลง state
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setReviews([]); // error → ไม่มีข้อมูล
            } finally {
                setIsLoading(false); // จบการโหลด
            }
        }
        fetchReviews();
    }, []);

    /* ====== จำนวน slide ต่อ group (ใช้คำนวณ dot) ====== */
    const slidesPerGroup = 3;
    const totalGroups = reviews.length > 0
        ? Math.ceil(reviews.length / slidesPerGroup)
        : 0;

    /* ====== คลิก dot → ไปยังสไลด์ที่เลือก ====== */
    const handleDotClick = (index) => {
        if (sliderRef.current) {
            sliderRef.current.slickGoTo(index * slidesPerGroup);
            setActiveSlide(index);
        }
    };

    /* ====== จัดการตอนเลื่อนสไลด์ (drag) ====== */
    const handleBeforeChange = () => setDragging(true);
    const handleAfterChange = (current) => {
        setActiveSlide(Math.floor(current / slidesPerGroup)); // เปลี่ยน dot ตามสไลด์
        setTimeout(() => setDragging(false), 50); // ปิด dragging หลังเลื่อนเสร็จ
    };

    /*  ====== Custom Dots แทนที่ default ของ slick ====== */
    const CustomDots = () => (
        <div className="custom-dots">
            {Array.from({ length: totalGroups }).map((_, i) => (
                <div
                    key={i}
                    className={`dot-bar ${activeSlide === i ? 'active' : ''}`}
                    onClick={() => handleDotClick(i)}
                />
            ))}
        </div>
    );

    /*  ====== Skeleton Loading Card (ตอนกำลังโหลดข้อมูล) ====== */
    const SkeletonCard = () => (
        <div className="slide-item">
            <div className="skeleton-card fade-in">
                <div className="skeleton skeleton-image"></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-line"></div>
            </div>
        </div>
    );

    return (
        <div className="review-wrapperslide">
            {/* ====== หัวข้อ ====== */}
            <h1 className="headtitleone">
                {locale === 'en' ? 'Customer Reviews' : 'รีวิวจากลูกค้า'}
            </h1>

            {/* ====== ลิงก์ไปหน้ารวมรีวิว ====== */}
            <div className="review-header-linkslide">
                <Link href="/review" className="view-all">
                    <HiPlusSm className="icon-view" />
                    {locale === 'en' ? 'View All' : 'ดูทั้งหมด'}
                </Link>
            </div>

            {/* ====== ถ้าโหลดอยู่ → แสดง Skeleton ====== */}
            {isLoading ? (
                <div className="review-loading-grid">
                    {[...Array(3)].map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : (
                <Slider
                    ref={sliderRef}
                    dots={false} // ปิด default dots
                    infinite={reviews.length > slidesPerGroup} // ใช้ infinite ถ้ามีหลายสไลด์
                    speed={500}
                    slidesToShow={3}
                    slidesToScroll={1}
                    swipeToSlide={true}
                    arrows={false}
                    beforeChange={handleBeforeChange}
                    afterChange={handleAfterChange}
                    appendDots={() => <CustomDots />}
                    responsive={[
                        { breakpoint: 1024, settings: { slidesToShow: 2 } },
                        { breakpoint: 640, settings: { slidesToShow: 1 } },
                    ]}
                >
                    {reviews.map((review) => {
                        const videoId = extractVideoId(review.vedio_link);
                        if (!videoId) return null;

                        //  ตั้งชื่อวิดีโอตามภาษา
                        const videoTitle =
                            locale === 'en'
                                ? review.nameEN_Vedio || review.nameTH_Vedio || 'No title'
                                : review.nameTH_Vedio || review.nameEN_Vedio || 'ไม่มีชื่อเรื่อง';

                        //  แปลงวันที่ตาม locale
                        const dateLocale = locale === 'en' ? 'en-US' : 'th-TH';
                        const formattedDate = new Date(review.vedio_creationdate).toLocaleDateString(dateLocale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });

                        return (
                            <div key={review.vedio_id} className="slide-item">
                                <div
                                    className="video-cardslide"
                                    onClick={() => !dragging && window.open(review.vedio_link, '_blank')}
                                >
                                    {/*  ====== แสดง thumbnail ของวิดีโอ ====== */}
                                    <div className="thumbnail-wrapperslide">
                                        <ThumbnailWithFallback videoId={videoId} alt={videoTitle} />
                                        <IoPlayCircleOutline className="play-icon" />
                                    </div>

                                    {/*  ====== แสดงข้อมูล title + วันที่ ====== */}
                                    <div className="infoslide">
                                        <h3 className="titleslide">{videoTitle}</h3>
                                        <p className="dateslide">{formattedDate}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Slider>
            )}
        </div>
    );
}
