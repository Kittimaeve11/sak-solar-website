'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import { MdOutlineElectricBolt } from "react-icons/md";
import { TbCurrencyBaht } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import styles from './RecommendedProducts.module.css';

// อ่านค่า API จาก .env
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ปุ่มลูกศรสำหรับ Slick slider */
const PrevArrow = ({ onClick }) => (
    <button className={styles.arrowPrevpro} onClick={onClick}>
        <IoIosArrowBack />
    </button>
);
const NextArrow = ({ onClick }) => (
    <button className={styles.arrowNextpro} onClick={onClick}>
        <IoIosArrowForward />
    </button>
);

/* ฟังก์ชันดึง URL รูปจาก API */
const getImageUrl = (gallery) => {
    if (!gallery) return "/images/no-image.jpg"; // fallback ถ้าไม่มีรูป
    try {
        const parsed = JSON.parse(gallery);      // gallery เป็น JSON array
        if (Array.isArray(parsed) && parsed.length > 0) {
            const path = parsed[0];
            if (/^https?:\/\//.test(path)) return path; // ถ้าเป็น URL จริง
            return `${baseUrl}/${String(path).replace(/^\/+/, '').replace(/\\/g, '/')}`;
        }
    } catch (e) { }
    return "/images/no-image.jpg";
};

/* Hook สำหรับดูขนาดหน้าจอแบบ realtime */
function useWindowWidth() {
    const [width, setWidth] = useState(1200);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleResize = () => setWidth(window.innerWidth);
        handleResize(); // อัปเดตครั้งแรก
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
}

export default function RecommendedProducts({ brandId, productId }) {
    const [items, setItems] = useState([]); // เก็บรายการสินค้าที่ดึงมา
    const sliderRef = useRef(null);         // ref สำหรับควบคุม slider
    const width = useWindowWidth();         // ความกว้างของหน้าจอ

    // จำนวนการ์ดตาม breakpoint
    const slidesToShow = width > 1200 ? 4 :
        width > 991 ? 3 :
            width > 638 ? 2 : 1;

    /* useEffect เดียว: ดึงข้อมูล + reset slider หลัง render */
    useEffect(() => {
        if (!brandId || !productId) return; // ถ้าไม่มีค่าไม่ต้อง fetch

        const fetchData = async () => {
            try {
                const res = await fetch(
                    `${baseUrl}/api/belowproductpageapi?brandProductID=${brandId}&product_ID=${productId}`,
                    { headers: { 'X-API-KEY': apiKey } }
                );
                const data = await res.json();

                if (data?.status && Array.isArray(data.result)) {
                    setItems(data.result); // เซ็ตข้อมูล

                    // ให้ React render ก่อน แล้วค่อยเลื่อนไปหน้าแรกของ slider
                    await new Promise(resolve => setTimeout(resolve, 0));
                    sliderRef.current?.slickGoTo(0);
                }
            } catch (err) {
                console.error('Error fetching recommended products:', err);
            }
        };

        fetchData();
    }, [brandId, productId]);

    if (!items.length) return null; // ถ้าไม่มีข้อมูล → ไม่แสดง component

    // ตั้งค่า Slick slider
    const settings = {
        infinite: true,
        speed: 400,
        arrows: true,
        swipe: true,
        draggable: true,
        touchThreshold: 10,
        centerMode: false,
        slidesToShow,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
    };

    return (
        <div className={styles.recommendedWrapper}>
            {/* หัวข้อของสินค้าที่แนะนำ */}
            <h3 className={styles.recommendedTitle}>สินค้าแนะนำ</h3>

            <div className={styles.recommendedproductsWrapper}>
                {/* Slider สำหรับเลื่อนสินค้า ใช้ ref ควบคุมจากด้านนอก */}
                <Slider ref={sliderRef} {...settings}>

                    {/* วนลูปแสดงสินค้าแต่ละตัว */}
                    {items.map((item, idx) => {
                        const imageUrl = getImageUrl(item.gallery); // ดึง URL รูปจริง
                        const discountPercent = parseFloat(item.productpro_percent) || 0;

                        // คำนวณราคาหลังลด (ถ้ามีโปรโมชัน)
                        let finalPrice = item.price;
                        if (item.productpro_ispromotion === "1" && discountPercent) {
                            finalPrice -= (item.price * discountPercent) / 100;
                        }

                        // เลือกชื่อสินค้าให้เหมาะกับประเภท
                        const displayName =
                            String(item.protypeID) === "2"
                                ? item.modelairname || item.modelname || item.solarpanel
                                : item.modelname || item.solarpanel;

                        return (
                            <div key={item.product_ID}>
                                {/* คลิกการ์ดเพื่อไปหน้ารายละเอียดสินค้า */}
                                <Link
                                    href={`/products/${item.protypeID}/${item.probrandID}/${item.product_num}`}
                                    className={`${styles.recommendedCard} fade-in`}
                                    style={{ animationDelay: `${idx * 0.08}s` }} // ทำให้การ์ดแสดงทีละใบแบบ fade-in
                                >

                                    {/* กล่องรูปสินค้า */}
                                    <div className={styles.recommendedImage}>
                                        <Image
                                            src={imageUrl}
                                            alt={displayName}
                                            width={270}
                                            height={270}
                                            loading="lazy" // โหลดเมื่อใกล้ viewport
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 270px"
                                            unoptimized
                                        />

                                        {/* ป้ายส่วนลด ถ้ามี */}
                                        {item.productpro_ispromotion === "1" && discountPercent > 0 && (
                                            <div className={styles.productPromoRibbon}>- {item.productpro_percent}%</div>
                                        )}
                                    </div>

                                    {/* ข้อมูลสินค้า */}
                                    <div className={styles.productInfo}>
                                        <h3>{displayName}</h3>

                                        {/* แสดงรุ่นแบตเตอรี่ ถ้ามี */}
                                        {item.battery && (
                                            <h6>รุ่นแบตเตอรี่ {item.battery} kWh</h6>
                                        )}

                                        {/* ถ้าเป็นสินค้าประเภทกำลังไฟ */}
                                        {item.isprice === "0" && item.installationsize && (
                                            <p
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    fontWeight: 600,
                                                    fontSize: "20px",
                                                    margin: 0,
                                                }}
                                            >
                                                <MdOutlineElectricBolt size={22} color="#ffc300" />
                                                {item.installationsize}
                                            </p>
                                        )}

                                        {/* แสดงราคา ถ้าเป็นสินค้าที่มีราคา */}
                                        {item.isprice === "1" && item.price && (
                                            <div style={{ position: "relative", display: "inline-block" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <p
                                                        style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            fontWeight: 600,
                                                            fontSize: "20px",
                                                            margin: 0,
                                                            gap: "1px",
                                                        }}
                                                    >
                                                        <TbCurrencyBaht size={22} color="#000" />
                                                        {Number(
                                                            item.productpro_ispromotion === "1" && item.productpro_percent
                                                                ? finalPrice
                                                                : item.price
                                                        ).toLocaleString()}
                                                        บาท
                                                    </p>

                                                    {/* ราคาเดิมที่ขีดฆ่า ถ้ามีโปรโมชัน */}
                                                    {item.productpro_ispromotion === "1" && item.productpro_percent && (
                                                        <span
                                                            style={{
                                                                fontSize: "14px",
                                                                color: "#888",
                                                                textDecoration: "line-through",
                                                            }}
                                                        >
                                                            {Number(item.price).toLocaleString()} บาท
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </Slider>
            </div>
        </div>
    );
}