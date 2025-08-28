'use client';

import React, { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { TbCurrencyBaht } from "react-icons/tb";
import Link from 'next/link';
import { useLocale } from '@/app/Context/LocaleContext';
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import styles from './Productdetails.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// Custom slider arrows
const PrevArrow = ({ onClick }) => (
    <button className={styles.arrowPrev} onClick={onClick}>
        <FaChevronLeft size={20} />
    </button>
);
const NextArrow = ({ onClick }) => (
    <button className={styles.arrowNext} onClick={onClick}>
        <FaChevronRight size={20} />
    </button>
);

// ฟังก์ชัน fallback สำหรับรูป
const getImageUrl = (path) => {
    if (!path || path === null || path === "") return '/images/no-image.jpg';
    if (/^https?:\/\//.test(path)) return path;
    return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

export default function ProductDetailPage() {
    const { typeID, brandID, productID } = useParams();
    const { locale } = useLocale();

    const [product, setProduct] = useState(null);
    const [typeName, setTypeName] = useState('');
    const [brandName, setBrandName] = useState('');
    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState(0);
    const sliderRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [resProduct, resHeader] = await Promise.all([
                    fetch(`${baseUrl}/api/productpageapi`, { headers: { 'X-API-KEY': apiKey } }),
                    fetch(`${baseUrl}/api/productHeaderapi`, { headers: { 'X-API-KEY': apiKey } })
                ]);

                const dataProduct = await resProduct.json();
                const dataHeader = await resHeader.json();

                if (dataProduct.status && Array.isArray(dataProduct.result?.data)) {
                    const foundProduct = dataProduct.result.data.find(
                        p => String(p.product_ID) === String(productID)
                    );
                    if (foundProduct) {
                        const gallery = (() => {
                            try { return JSON.parse(foundProduct.gallery || '[]'); } catch { return []; }
                        })();
                        setProduct({ ...foundProduct, gallery });

                        // ← ใส่ตรงนี้เพื่อ set typeName และ brandName ให้ถูกต้อง
                        if (dataHeader.status) {
                            const typeData = dataHeader.result.find(t => t.producttypeID === String(foundProduct.protypeID));
                            if (typeData) {
                                setTypeName(locale === 'en' ? typeData.producttypenameEN : typeData.producttypenameTH);
                                const brandData = typeData.Brand.find(b => b.productbrandID === String(foundProduct.probrandID));
                                if (brandData) setBrandName(brandData.productbrandname);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (productID) fetchData();
    }, [productID, locale]);

    if (loading) return <p>กำลังโหลด...</p>;
    if (!product) return <p>ไม่พบข้อมูลสินค้า</p>;

    return (
        <main className={styles.productslayout}>
            {/* Breadcrumb */}
            <div className={styles.meta}>
                <Link href={`/`} className={styles.productlink}>หน้าหลัก <MdKeyboardDoubleArrowRight style={{ fontSize: 19, color: '#505052' }} /></Link>
                <Link href={`/products`} className={styles.productlink}>บริการและผลิตภัณฑ์ <MdKeyboardDoubleArrowRight style={{ fontSize: 19, color: '#505052' }} /></Link>
                <Link href={`/products/${typeID}`} className={styles.productlink}>{typeName || '...'} <MdKeyboardDoubleArrowRight style={{ fontSize: 19, color: '#505052' }} /></Link>
                <Link href={`/products/${typeID}/${brandID}`} className={styles.productlink}>{brandName || '...'} <MdKeyboardDoubleArrowRight style={{ fontSize: 19, color: '#505052' }} /></Link>
                <span>{product.modelname || product.solarpanel}</span>
            </div>

            <div className={styles.detailcontent}>
                {/* Gallery */}
                <div className={styles.galleryContainer}>
                    {product.gallery.length > 1 ? (
                        <>
                            <Slider
                                ref={sliderRef}
                                dots={false}
                                infinite={true}          // เปิด loop
                                speed={600}              // ความเร็ว transition
                                slidesToShow={1}
                                slidesToScroll={1}
                                cssEase="ease-in-out"    // ทำให้เลื่อนเนียน
                                nextArrow={<NextArrow />}
                                prevArrow={<PrevArrow />}
                            >
                                {product.gallery.map((img, idx) => (
                                    <div key={idx} style={{ width: '100%', position: 'relative' }}>
                                        <Image
                                            src={getImageUrl(img)}
                                            alt={`Image ${idx + 1}`}
                                            width={600}
                                            height={600}
                                            style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                                            unoptimized
                                            onError={(e) => { e.currentTarget.src = '/images/no-image.jpg'; }}
                                        />
                                    </div>
                                ))}
                            </Slider>

                            <div className={styles.thumbnailWrapper}>
                                {product.gallery.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`${styles.thumbnail} ${idx === selectedImage ? styles.active : ''}`}
                                        onClick={() => {
                                            setSelectedImage(idx);
                                            sliderRef.current.slickGoTo(idx);
                                        }}
                                    >
                                        <Image
                                            src={getImageUrl(img)}
                                            alt={`Thumbnail ${idx + 1}`}
                                            width={100}
                                            height={100}
                                            unoptimized
                                            onError={(e) => { e.currentTarget.src = '/images/no-image.jpg'; }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div>
                            <Image
                                src={getImageUrl(product.gallery[0])}
                                alt="Main"
                                width={500}
                                height={500}
                                style={{ objectFit: 'contain', width: '100%', height: 'auto', marginBottom: '1rem' }}
                                unoptimized
                                onError={(e) => { e.currentTarget.src = '/images/no-image.jpg'; }}
                            />
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className={styles.detaiinfo}>
                    <h1 className={styles.poductmodel}>{product.modelname || product.solarpanel}</h1>

                    {product.productpro_ispromotion === "1" && product.productpro_percent && (
                        <div className={styles.productpromo}>ลด {product.productpro_percent}</div>
                    )}

                    <h4 className={styles.detail_header}>
                        ประเภท : {typeName}
                        <span>ยี่ห้อ : {brandName}</span>
                    </h4>

                    <h4 className={styles.detail_label} id="product-detail">รายละเอียดผลิตภัณฑ์</h4>

                    <p>ชื่อแผงโซลาร์เซลล์ : {product.solarpanel}</p>
                    {product.isprice === "0" && product.installationsize && <p>ขนาดติดตั้ง : {product.installationsize}</p>}
                    <p>จำนวนแผง : {product.panelsolarcout} แผง</p>
                    <p>พื้นที่การติดตั้ง : {product.roofarea} ตารางเมตร</p>
                    {product.battery && <p>จำนวนเฟสไฟฟ้า : {product.phase} เฟส</p>}
                    {product.battery && <p>รุ่นแบตเตอรี่ {product.battery} kWh</p>}

                    {product.isprice !== "0" && (
                        product.productpro_ispromotion === "1" && product.productpro_percent ? (
                            (() => {
                                const price = Number(product.price) || 0;
                                const discountPercent = Number(String(product.productpro_percent).replace('%', '')) || 0;
                                const finalPrice = price - (price * discountPercent / 100);
                                return (
                                    <>
                                        <span style={{
                                            fontSize: '20px',
                                            color: '#888',
                                            textDecoration: 'line-through',
                                            display: 'block',
                                            marginTop: '1rem',
                                            marginBottom: '-0.5rem',
                                        }}>{price.toLocaleString()} บาท</span>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '2px',
                                            fontWeight: 800,
                                            fontSize: '32px',
                                            margin: 0,
                                        }}>
                                            <TbCurrencyBaht size={35} /> {finalPrice.toLocaleString()} บาท
                                        </span>
                                    </>
                                );
                            })()
                        ) : (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                fontWeight: 800,
                                fontSize: '32px',
                                marginTop: '1rem',
                            }}>
                                <TbCurrencyBaht size={35} /> {Number(product.price).toLocaleString()} บาท
                            </span>
                        )
                    )}

                    <Link href={`/?product=${typeID}#contact`}>
                        <button className={styles.buttonproducts}>สนใจโซลารเซลล์</button>
                    </Link>
                </div>
            </div>


            {/* Sticky Menu */}
            {(product.comparepic || product.installmentpic) && (
                <div className={styles.stickyMenu}>
                    {/* รายละเอียดผลิตภัณฑ์ แสดงเสมอ */}
                    <Link
                        href="#"
                        scroll={false}
                        onClick={(e) => {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        รายละเอียดผลิตภัณฑ์
                    </Link>

                    {/* ตารางเปรียบเทียบกำลังผลิต */}
                    {product.comparepic && (
                        <Link
                            href="#compare-table"
                            scroll={false}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('compare-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        >
                            ตารางเปรียบเทียบกำลังผลิต
                        </Link>
                    )}

                    {/* ตารางการวางเงินดาวน์ */}
                    {product.installmentpic && (
                        <Link
                            href="#installment-table"
                            scroll={false}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('installment-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                        >
                            ตารางการวางเงินดาวน์
                        </Link>
                    )}
                </div>
            )}

            {/* ตารางเปรียบเทียบและดาวน์ */}
            <div className={styles.compareInstallmentWrapper}>
                {product.comparepic && (
                    <div className={styles.compareItem} id="compare-table">
                        <Image
                            src={getImageUrl(product.comparepic)}
                            alt="Compare Table"
                            width={800}
                            height={400}
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                            unoptimized
                            onError={(e) => { e.currentTarget.src = '/images/no-image.jpg' }}
                        />
                    </div>
                )}

                {product.installmentpic && (
                    <div className={styles.compareItem} id="installment-table">
                        <Image
                            src={getImageUrl(product.installmentpic)}
                            alt="Installment Table"
                            width={800}
                            height={400}
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                            unoptimized
                            onError={(e) => { e.currentTarget.src = '/images/no-image.jpg' }}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
