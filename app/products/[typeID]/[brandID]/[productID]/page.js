'use client';

import React, { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { TbCurrencyBaht } from "react-icons/tb";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { useLocale } from '@/app/Context/LocaleContext';
import styles from './Productdetails.module.css';
import RecommendedProducts from './RecommendedProducts';

/* =========================================================
   ENV ตัวแปร API จากไฟล์ .env (ใช้ฝั่ง Client)
   ========================================================= */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* =========================================================
   ฟังก์ชันแปลงข้อความเป็น slug สำหรับใช้บน URL
   เช่น "Solar Rooftop" → "solar-rooftop"
   ========================================================= */
const slugify = (name) =>
  name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

/* =========================================================
   ฟังก์ชันรวม URL สำหรับโหลดรูปจาก API หรือ fallback
   ========================================================= */
const getImageUrl = (path) => {
  if (!path) return '/images/no-image.jpg'; // ถ้าไม่มีรูป → รูป default
  if (/^https?:\/\//.test(path)) return path; // ถ้าเป็น URL จริง → ใช้เลย
  return `${baseUrl?.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
};

/* =========================================================
   ฟังก์ชันแปลง HTML entity → ตัวหนังสือปกติ
   เช่น &amp; → &
   ========================================================= */
const decodeHtml = (html) => {
  if (!html) return '';
  const txt = typeof window !== 'undefined'
    ? document.createElement('textarea')
    : null;
  if (!txt) return html;
  txt.innerHTML = html;
  return txt.value;
};

/* =========================================================
   MAIN PAGE — หน้าแสดงรายละเอียดสินค้า
   ========================================================= */
export default function ProductDetailPage() {
  const { productID } = useParams();      // รับ productID จาก URL
  const { locale } = useLocale();         // ใช้ locale ภาษาไทย/อังกฤษ

  /* ---------------------------------------------------------
     State สำหรับเก็บข้อมูลสินค้าและ header
     --------------------------------------------------------- */
  const [product, setProduct] = useState(null);              // ข้อมูลสินค้าจริง
  const [categoryList, setCategoryList] = useState([]);      // รายชื่อหมวดหมู่จาก API
  const [brandName, setBrandName] = useState("");            // ชื่อแบรนด์ (UI)
  const [typeName, setTypeName] = useState("");              // ชื่อประเภท (UI)
  const [typeSlug, setTypeSlug] = useState("");              // slug สำหรับ query
  const [brandSlug, setBrandSlug] = useState("");            // slug สำหรับ query
  const [loading, setLoading] = useState(true);              // สถานะโหลดข้อมูล

  /* ---------------------------------------------------------
     State ของ Lightbox และ Slider
     --------------------------------------------------------- */
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const sliderRef = useRef(null);

  /* =========================================================
     USE EFFECT เดียว (หลักการสำคัญของหน้า detail)
     โหลด: สินค้าเดียว + header + คีย์ลิสเนอร์ Lightbox
     ========================================================= */
  useEffect(() => {
    const fetchData = async () => {
      if (!productID) return;
      setLoading(true);

      try {
        let foundProduct = null;

        /* ---------------------------------------------------------
           1) โหลดข้อมูลสินค้าแบบทีละตัวก่อน (เร็วที่สุด / แม่นสุด)
           --------------------------------------------------------- */
        try {
          const resOne = await fetch(
            `${baseUrl}/api/producIDpageapi/${encodeURIComponent(productID)}`,
            { headers: { 'X-API-KEY': apiKey } }
          );
          const dataOne = await resOne.json();

          if (dataOne?.status && dataOne?.result) foundProduct = dataOne.result;
        } catch { }

        /* ---------------------------------------------------------
           2) ถ้า endpoint แบบทีละตัวไม่มี → fallback ไป list ทั้งหมด
           --------------------------------------------------------- */
        if (!foundProduct) {
          const resList = await fetch(
            `${baseUrl}/api/productpageapi?offset=0&limit=9999`,
            { headers: { 'X-API-KEY': apiKey } }
          );
          const dataList = await resList.json();

          if (dataList?.status) {
            foundProduct = dataList.result.data.find(
              (p) => String(p.product_num) === String(productID)
            );
          }
        }

        if (!foundProduct) return;

        /* ---------------------------------------------------------
           3) Parse รูปภาพ gallery
           --------------------------------------------------------- */
        let gallery = [];
        try { gallery = JSON.parse(foundProduct.gallery || "[]"); } catch { }
        setProduct({ ...foundProduct, gallery });

        /* ---------------------------------------------------------
           4) โหลดข้อมูล header — เพื่อหา type + brand ที่ถูกต้อง
           --------------------------------------------------------- */
        const resHeader = await fetch(`${baseUrl}/api/productHeaderapi`, {
          headers: { "X-API-KEY": apiKey }
        });
        const dataHeader = await resHeader.json();

        if (Array.isArray(dataHeader?.result)) {
          setCategoryList(dataHeader.result);

          // หา type object จากฐานข้อมูล
          const typeObj = dataHeader.result.find(
            (t) => Number(t.producttypeID) === Number(foundProduct.protypeID)
          );

          if (typeObj) {
            // ชื่อที่ต้องแสดงบน UI
            setTypeName(locale === "en"
              ? typeObj.producttypenameEN
              : typeObj.producttypenameTH
            );

            // slug ที่ถูกต้องสำหรับ filter page
            setTypeSlug(slugify(typeObj.producttypenameEN));

            // หา brand object
            const brandObj = typeObj.Brand?.find(
              (b) => Number(b.productbrandID) === Number(foundProduct.probrandID)
            );

            if (brandObj) {
              setBrandName(brandObj.productbrandname);
              setBrandSlug(slugify(brandObj.productbrandname));
            }
          }
        }

      } catch (err) {
        console.error("Fetch Product Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    /* ---------------------------------------------------------
       Event: ควบคุม Lightbox ด้วยคีย์บอร์ด
       --------------------------------------------------------- */
    const handleKey = (e) => {
      if (!lightboxOpen) return;

      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setSelectedImage(i => i - 1);
      if (e.key === "ArrowRight") setSelectedImage(i => i + 1);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);

  }, [productID, locale, lightboxOpen]);

  /* =========================================================
     Loading และ Error Handling
     ========================================================= */
  if (loading) return <p>กำลังโหลด...</p>;
  if (!product) return <p>ไม่พบข้อมูลสินค้า</p>;

  /* =========================================================
     Display Name — ชื่อที่จะใช้บน UI
     มี logic แยกระหว่าง Solar Air vs Solar Rooftop
     ========================================================= */
  const isSolarAir =
    String(product.protypeID) === "2" ||
    typeName.includes("โซลาร์แอร์") ||
    typeName.toLowerCase().includes("solar air");

  const displayName =
    isSolarAir
      ? product.modelairname || product.solarpanel
      : product.modelname || product.solarpanel;

  /* =========================================================
     ฟังก์ชำนวณราคา (รองรับราคาโปรโมชัน)
     ========================================================= */
  const calculatePrice = () => {
    if (product.productpro_ispromotion === "1" && product.productpro_percent) {
      const p = Number(product.price) || 0;
      const dp = Number(String(product.productpro_percent).replace("%", "")) || 0;
      return {
        original: p,
        final: p - (p * dp) / 100,   // ราคาหลังหัก %
      };
    }

    return {
      original: null,
      final: Number(product.price) || null,
    };
  };

  const priceObj = calculatePrice();

  /* ============================================
     Render UI — โครงสร้างหน้า Product Detail
     ============================================ */
  return (
    <main className={styles.productslayout}>

      {/* =========================================================
        Breadcrumb — เส้นทางนำทางของผู้ใช้
        เช่น หน้าหลัก > ผลิตภัณฑ์ > ประเภท > แบรนด์ > รุ่นสินค้า
       ========================================================= */}
      <div className={styles.meta}>
        {/* กลับหน้าหลัก */}
        <Link href="/" className={styles.productlink}>
          หน้าหลัก <MdKeyboardDoubleArrowRight />
        </Link>

        {/* กลับหน้ารายการสินค้าหลัก */}
        <Link href="/products" className={styles.productlink}>
          บริการและผลิตภัณฑ์ <MdKeyboardDoubleArrowRight />
        </Link>

        {/* กลับไปดูสินค้าตามประเภท */}
        <Link href={`/products?categories=${typeSlug}`} className={styles.productlink}>
          {typeName} <MdKeyboardDoubleArrowRight />
        </Link>

        {/* กลับไปดูสินค้าตามประเภท + แบรนด์ */}
        <Link
          href={`/products?categories=${typeSlug}&brands=${brandSlug}`}
          className={styles.productlink}
        >
          {brandName} <MdKeyboardDoubleArrowRight />
        </Link>

        {/* ชื่อรุ่นสินค้า */}
        <span>{displayName}</span>
      </div>

      {/* =========================================================
        ส่วนเนื้อหาใหญ่ (Gallery + รายละเอียดสินค้า)
       ========================================================= */}
      <div className={styles.detailcontent}>

        {/* ============================
          GALLERY แสดงรูปสินค้า
         ============================ */}
        <div className={styles.galleryContainer}>
          {product.gallery?.length > 1 ? (
            <>
              {/* --- Slider รูปสินค้า --- */}
              <Slider
                ref={sliderRef}
                dots={false}
                infinite
                speed={600}
                slidesToShow={1}
                slidesToScroll={1}
                nextArrow={<FaChevronRight />}
                prevArrow={<FaChevronLeft />}
                beforeChange={(_, next) => setSelectedImage(next)}
              >
                {product.gallery.map((img, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <Image
                      src={getImageUrl(img)}
                      alt="Main"
                      width={500}
                      height={500}
                      unoptimized
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedImage(idx);
                        setLightboxOpen(true); // เปิด lightbox
                      }}
                    />
                  </div>
                ))}
              </Slider>

              {/* --- Thumbnail รูปเล็กใต้สไลด์ --- */}
              <div className={styles.thumbnailWrapper}>
                {product.gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className={`${styles.thumbnail} ${idx === selectedImage ? styles.active : ''}`}
                    onClick={() => {
                      setSelectedImage(idx);
                      sliderRef.current?.slickGoTo(idx); // เลื่อน slider ไปยังรูปที่คลิก
                    }}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt=""
                      width={90}
                      height={90}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* ถ้ามีรูปเดียว */
            <Image
              src={getImageUrl(product.gallery?.[0])}
              alt="Main"
              width={500}
              height={500}
              unoptimized
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedImage(0);
                setLightboxOpen(true);
              }}
            />
          )}
        </div>

        {/* ============================
          PRODUCT INFO — ข้อมูลสินค้า
         ============================ */}
        <div className={styles.detaiinfo}>

          {/* ชื่อรุ่นสินค้า */}
          <h1 className={styles.poductmodel}>{displayName}</h1>

          {/* Badge ส่วนลด */}
          {product.productpro_ispromotion === "1" && (
            <div className={styles.productpromo}>
              ลด {product.productpro_percent}
            </div>
          )}

          {/* ประเภท + แบรนด์ */}
          <h4 className={styles.detail_header}>
            ประเภท : {typeName} <span>ยี่ห้อ : {brandName}</span>
          </h4>

          <h4 className={styles.detail_label}>รายละเอียดผลิตภัณฑ์</h4>

          {/* -------------------------
            รายการข้อมูลสินค้า
           ------------------------- */}
          <div>
            <p>ชื่อแผงโซลาร์เซลล์ : {product.solarpanel}</p>

            {/* เฉพาะสินค้าประเภทกำลังไฟ */}
            {product.isprice === "0" && product.installationsize && (
              <p>ขนาดติดตั้ง : {product.installationsize}</p>
            )}

            <p>จำนวนแผง : {product.panelsolarcout} แผง</p>
            <p>พื้นที่การติดตั้ง : {product.roofarea} ตร.ม.</p>

            {/* เฟสไฟฟ้า */}
            {product.phase && <p>จำนวนเฟสไฟฟ้า : {product.phase} เฟส</p>}

            {/* Battery */}
            {product.battery && <p>รุ่นแบตเตอรี่ : {product.battery} kWh</p>}

            {/* รายละเอียดแบบ rich HTML จาก backend */}
            {(product.product_detailTH || product.product_detailEN) && (
              <div
                dangerouslySetInnerHTML={{
                  __html: locale === 'en'
                    ? decodeHtml(product.product_detailEN)
                    : decodeHtml(product.product_detailTH)
                }}
              />
            )}
          </div>

          {/* ============================
            PRICE — ราคาสินค้า
           ============================ */}
          {product.isprice !== "0" && (
            <>
              {/* ราคาเดิมก่อนลด */}
              {priceObj.original && (
                <span
                  style={{
                    textDecoration: 'line-through',
                    color: '#888',
                    fontSize: '18px'
                  }}
                >
                  {priceObj.original.toLocaleString()} บาท
                </span>
              )}

              {/* ราคาหลังลดหรือราคาปกติ */}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '32px',
                  fontWeight: 800,
                  marginTop: '0.5rem'
                }}
              >
                <TbCurrencyBaht size={35} /> {priceObj.final?.toLocaleString()} บาท
              </span>
            </>
          )}

          {/* ปุ่มติดต่อบริษัท */}
          <Link href={`/?product=${product.protypeID}#contact`}>
            <button className={styles.buttonproducts}>สนใจโซลาร์เซลล์</button>
          </Link>
        </div>
      </div>

      {/* =========================================================
        ส่วนตารางเปรียบเทียบราคา + ตารางผ่อน
       ========================================================= */}
      <div className={styles.compareInstallmentWrapper}>
        {product.comparepic && (
          <div className={styles.compareItem}>
            <Image
              src={getImageUrl(product.comparepic)}
              alt="Compare"
              width={1000}
              height={500}
              unoptimized
            />
          </div>
        )}

        {product.installmentpic && (
          <div className={styles.compareItem}>
            <Image
              src={getImageUrl(product.installmentpic)}
              alt="Installment"
              width={1000}
              height={500}
              unoptimized
            />
          </div>
        )}
      </div>

      {/* =========================================================
        LIGHTBOX — เปิดรูปใหญ่
       ========================================================= */}
      {lightboxOpen && (
        <div className={styles.lightboxOverlay}>

          {/* ปุ่มปิด */}
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
          >
            <FaTimes size={28} />
          </button>

          {/* ลูกศรซ้าย */}
          <button
            className={styles.lightboxArrowLeft}
            onClick={() =>
              setSelectedImage(
                (i) => (i - 1 + product.gallery.length) % product.gallery.length
              )
            }
          >
            <FaChevronLeft size={30} />
          </button>

          {/* รูปใหญ่ */}
          <div className={styles.lightboxContent}>
            <Image
              src={getImageUrl(product.gallery[selectedImage])}
              alt=""
              width={1000}
              height={700}
              unoptimized
              style={{ objectFit: "contain", maxWidth: "85vw", maxHeight: "75vh" }}
            />
          </div>

          {/* ลูกศรขวา */}
          <button
            className={styles.lightboxArrowRight}
            onClick={() =>
              setSelectedImage((i) => (i + 1) % product.gallery.length)
            }
          >
            <FaChevronRight size={30} />
          </button>
        </div>
      )}

      {/* =========================================================
        สินค้าแนะนำตามแบรนด์เดียวกัน
       ========================================================= */}
      <RecommendedProducts
        brandId={product.probrandID}
        productId={product.product_num}
      />
    </main>
  );
}