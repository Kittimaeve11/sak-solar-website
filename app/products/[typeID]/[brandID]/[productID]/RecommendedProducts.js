'use client';

import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import Image from 'next/image';
import Link from 'next/link';
import { MdOutlineElectricBolt } from "react-icons/md";
import { TbCurrencyBaht } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import styles from './RecommendedProducts.module.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// custom arrows
const PrevArrow = ({ onClick }) => (
    <button className={styles.arrowPrev} onClick={onClick}><IoIosArrowBack /></button>
);
const NextArrow = ({ onClick }) => (
    <button className={styles.arrowNext} onClick={onClick}><IoIosArrowForward /></button>
);

// helper สำหรับแก้ path
const getImageUrl = (gallery) => {
    if (!gallery) return "/images/no-image.jpg";
    try {
        const parsed = JSON.parse(gallery);
        if (Array.isArray(parsed) && parsed.length > 0) {
            const path = parsed[0];
            if (/^https?:\/\//.test(path)) return path;
            return `${baseUrl}/${String(path).replace(/^\/+/, '').replace(/\\/g, "/")}`;
        }
    } catch (e) {
        console.error("Parse gallery error:", e);
    }
    return "/images/no-image.jpg";
};

export default function RecommendedProducts({ brandId, productId }) {
    const [items, setItems] = useState([]);
    const isDragging = useRef(false); //  ตรวจว่าลากหรือคลิก

    useEffect(() => {
        if (!brandId || !productId) return;
        const fetchData = async () => {
            try {
                const res = await fetch(
                    `${baseUrl}/api/belowproductpageapi?brandProductID=${brandId}&product_ID=${productId}`,
                    { headers: { 'X-API-KEY': apiKey } }
                );
                const data = await res.json();
                if (data?.status && Array.isArray(data.result)) {
                    setItems(data.result);
                }
            } catch (err) {
                console.error('Error fetching recommended products:', err);
            }
        };
        fetchData();
    }, [brandId, productId]);

    if (items.length === 0) return null;

    const settings = {
        infinite: true,
        slidesToShow: 5,
        slidesToScroll: 1,
        speed: 400,
        arrows: true,
        swipe: true,
        draggable: true,
        swipeToSlide: true,     // ให้เลื่อนไปการ์ดที่ pointer ถึง
        touchThreshold: 10,     // ตอบสนองไวขึ้น
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        beforeChange: () => {
            isDragging.current = true; // เริ่ม drag
        },
        afterChange: () => {
            setTimeout(() => { isDragging.current = false; }, 50); // reset หลังเลื่อนเสร็จ
        },
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } },
        ]
    };

    return (
        <div className={styles.recommendedWrapper}>
            <h3 className={styles.recommendedTitle}>สินค้าแนะนำ</h3>
            <Slider {...settings}>
                {items.map((item, idx) => {
                    const imageUrl = getImageUrl(item.gallery);

                    let finalPrice = null;
                    if (item.isprice === "1" && item.price) {
                        if (item.productpro_ispromotion === "1" && item.productpro_percent) {
                            const discountPercent = parseFloat(item.productpro_percent) || 0;
                            finalPrice = item.price - (item.price * discountPercent / 100);
                        } else {
                            finalPrice = item.price;
                        }
                    }

                    // เลือกชื่อที่จะแสดง
                    let displayName = item.modelname || item.solarpanel;
                    if (String(item.protypeID) === "2") {
                        displayName = item.modelairname || item.modelname || item.solarpanel;
                    }

                    return (
                        <div key={item.product_ID}>
                            <Link
                                href={`/products/${item.protypeID}/${item.probrandID}/${item.product_num}`}
                                className={`${styles.recommendedCard} fade-in`}
                                style={{ animationDelay: `${idx * 0.08}s` }}
                                onClick={(e) => {
                                    if (isDragging.current) {
                                        e.preventDefault(); //  block click ถ้า drag
                                    }
                                }}
                            >
                                <div className={styles.recommendedImage}>
                                    <Image
                                        src={imageUrl}
                                        alt={displayName}
                                        width={280}
                                        height={280}
                                        unoptimized
                                    />
                                    {item.productpro_ispromotion === "1" && item.productpro_percent && (
                                        <div className={styles.productPromoRibbon}>
                                            - {item.productpro_percent}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.productInfo}>
                                    <h3>{displayName}</h3>

                                    {item.battery && (
                                        <h6>รุ่นแบตเตอรี่ {item.battery} kWh</h6>
                                    )}

                                    {item.isprice === "0" && item.installationsize && (
                                        <p
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px",        // ระยะห่างระหว่างไอคอนกับข้อความ
                                                fontWeight: 600,
                                                fontSize: "20px",  // ขนาดตัวหนังสือ
                                                margin: 0,
                                            }}
                                        >
                                            <MdOutlineElectricBolt size={22} color="#ffc300" />
                                            {item.installationsize}
                                        </p>
                                    )}


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
                                                        gap: "1px", // คุมระยะห่างระหว่างไอคอนกับตัวเลข
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
    );
}
