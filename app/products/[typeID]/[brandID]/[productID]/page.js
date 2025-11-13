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


const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* -------------------- Helpers -------------------- */
const getImageUrl = (path) => {
  if (!path) return '/images/no-image.jpg';
  if (/^https?:\/\//.test(path)) return path;
  return `${baseUrl?.replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
};

const decodeHtml = (html) => {
  if (!html) return '';
  const txt = typeof window !== 'undefined' ? document.createElement('textarea') : null;
  if (!txt) return html;
  txt.innerHTML = html;
  return txt.value;
};

/* -------------------- Slider Arrows -------------------- */
const PrevArrow = ({ onClick }) => (
  <button className={styles.arrowPrev} onClick={onClick}><FaChevronLeft size={20} /></button>
);
const NextArrow = ({ onClick }) => (
  <button className={styles.arrowNext} onClick={onClick}><FaChevronRight size={20} /></button>
);

/* -------------------- Lightbox -------------------- */
function Lightbox({ images, currentIndex, onClose, setCurrentIndex }) {
  const total = images.length;
  const prevImage = () => setCurrentIndex((currentIndex - 1 + total) % total);
  const nextImage = () => setCurrentIndex((currentIndex + 1) % total);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [currentIndex]);

  return (
    <div
      className={styles.lightboxOverlay}
      onClick={(e) => {
        if (e.target.classList.contains(styles.lightboxOverlay)) onClose();
      }}
    >
      <button className={styles.lightboxClose} onClick={onClose}><FaTimes size={28} /></button>
      <button className={styles.lightboxArrowLeft} onClick={prevImage}><FaChevronLeft size={30} /></button>

      <div className={styles.lightboxContent}>
        <Image
          src={getImageUrl(images[currentIndex])}
          alt={`Image ${currentIndex + 1}`}
          width={1000}
          height={700}
          style={{ objectFit: 'contain', maxWidth: '90vw', maxHeight: '80vh' }}
          unoptimized
        />
      </div>

      <button className={styles.lightboxArrowRight} onClick={nextImage}><FaChevronRight size={30} /></button>
    </div>
  );
}

/* -------------------- Main -------------------- */
export default function ProductDetailPage() {
  const { typeID, brandID, productID } = useParams(); // productID = product_num
  const { locale } = useLocale();

  const [product, setProduct] = useState(null);
  const [typeName, setTypeName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!productID) return;
      setLoading(true);
      try {
        // 1) พยายามดึงจาก endpoint รายการเดียวก่อน (เสถียรสุด)
        let foundProduct = null;
        try {
          const resOne = await fetch(
            `${baseUrl}/api/producIDpageapi/${encodeURIComponent(String(productID))}`,
            { headers: { 'X-API-KEY': apiKey } }
          );
          const dataOne = await resOne.json();
          if (dataOne?.status && dataOne?.result) {
            foundProduct = dataOne.result;
          }
        } catch {
          // เงียบไว้ แล้วไป fallback ข้างล่าง
        }

        // 2) ถ้าไม่เจอจาก endpoint เดี่ยว ให้ fallback ไปหาจาก list
        if (!foundProduct) {
          const resList = await fetch(
            `${baseUrl}/api/productpageapi?offset=0&limit=9999`,
            { headers: { 'X-API-KEY': apiKey } }
          );
          const dataList = await resList.json();
          if (dataList?.status && Array.isArray(dataList.result?.data)) {
            foundProduct = dataList.result.data.find(
              p =>
                String(p.product_num).trim().toLowerCase() === String(productID).trim().toLowerCase()
            );
          }
        }

        if (foundProduct) {
          // parse gallery
          let gallery = [];
          try { gallery = JSON.parse(foundProduct.gallery || '[]'); } catch { gallery = []; }

          // เก็บ product
          setProduct({ ...foundProduct, gallery });

          // 3) โหลด header เพื่อดึงชื่อประเภทและยี่ห้อ
          try {
            const resHeader = await fetch(`${baseUrl}/api/productHeaderapi`, {
              headers: { 'X-API-KEY': apiKey }
            });
            const dataHeader = await resHeader.json();
            if (dataHeader?.status && Array.isArray(dataHeader.result)) {
              const typeData = dataHeader.result.find(
                t => Number(t.producttypeID) === Number(foundProduct.protypeID)
              );
              if (typeData) {
                setTypeName(locale === 'en' ? typeData.producttypenameEN : typeData.producttypenameTH);
                const brandData = typeData.Brand?.find(
                  b => Number(b.productbrandID) === Number(foundProduct.probrandID)
                );
                if (brandData) setBrandName(brandData.productbrandname);
              }
            }
          } catch {
            // ถ้าโหลด header ไม่ได้ ก็ปล่อยชื่อว่าง ๆ ไว้
          }
        }
      } catch (err) {
        console.error('Fetch Product Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productID, locale]);

  if (loading) return <p>กำลังโหลด...</p>;
  if (!product) return <p>ไม่พบข้อมูลสินค้า</p>;

  /* -------------------- Display Name -------------------- */
  const isSolarAir =
    String(product.protypeID) === '2' ||
    typeName.includes('โซลาร์แอร์') ||
    typeName.toLowerCase().includes('solar air');

  const displayName = isSolarAir
    ? (product.modelairname || product.solarpanel)
    : (product.modelname || product.solarpanel);

  /* -------------------- Price -------------------- */
  const calculatePrice = () => {
    if (product.productpro_ispromotion === "1" && product.productpro_percent) {
      const price = Number(product.price) || 0;
      const discountPercent = Number(String(product.productpro_percent).replace('%', '')) || 0;
      const finalPrice = price - (price * discountPercent / 100);
      return { original: price, final: finalPrice };
    }
    return { original: null, final: Number(product.price) || null };
  };
  const priceObj = calculatePrice();

  return (
    <main className={styles.productslayout}>
      {/* Breadcrumb */}
      <div className={styles.meta}>
        <Link href="/" className={styles.productlink}>หน้าหลัก <MdKeyboardDoubleArrowRight /></Link>
        <Link href="/products" className={styles.productlink}>บริการและผลิตภัณฑ์ <MdKeyboardDoubleArrowRight /></Link>
        <Link href={`/products/${product.protypeID}`} className={styles.productlink}>{typeName || '...'} <MdKeyboardDoubleArrowRight /></Link>
        <Link href={`/products/${product.protypeID}/${product.probrandID}`} className={styles.productlink}>{brandName || '...'} <MdKeyboardDoubleArrowRight /></Link>
        <span>{displayName}</span>
      </div>

      <div className={styles.detailcontent}>
        {/* Gallery */}
        <div className={styles.galleryContainer}>
          {product.gallery?.length > 1 ? (
            <>
              <Slider
                ref={sliderRef}
                dots={false}
                infinite
                speed={600}
                slidesToShow={1}
                slidesToScroll={1}
                nextArrow={<NextArrow />}
                prevArrow={<PrevArrow />}
                beforeChange={(_, next) => setSelectedImage(next)}
              >
                {product.gallery.map((img, idx) => (
                  <div key={idx} style={{ width: '100%', position: 'relative' }}>
                    <Image
                      src={getImageUrl(product.gallery?.[0])}
                      alt="Main"
                      width={500}
                      height={500}
                      style={{ objectFit: 'contain', width: '100%', height: 'auto', marginBottom: '1rem', cursor: 'pointer' }}
                      unoptimized
                      priority  //
                      onClick={() => { setSelectedImage(0); setLightboxOpen(true); }}
                    />

                  </div>
                ))}
              </Slider>

              <div className={styles.thumbnailWrapper}>
                {product.gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className={`${styles.thumbnail} ${idx === selectedImage ? styles.active : ''}`}
                    onClick={() => { setSelectedImage(idx); sliderRef.current?.slickGoTo(idx); }}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      width={100}
                      height={100}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Image
              src={getImageUrl(product.gallery?.[0])}
              alt="Main"
              width={500}
              height={500}
              style={{ objectFit: 'contain', width: '100%', height: 'auto', marginBottom: '1rem', cursor: 'pointer' }}
              unoptimized
              onClick={() => { setSelectedImage(0); setLightboxOpen(true); }}
            />
          )}
        </div>

        {/* Product Info */}
        <div className={styles.detaiinfo}>
          <h1 className={styles.poductmodel}>{displayName}</h1>

          {product.productpro_ispromotion === "1" && product.productpro_percent && (
            <div className={styles.productpromo}>ลด {product.productpro_percent}</div>
          )}

          <h4 className={styles.detail_header}>
            ประเภท : {typeName} <span>ยี่ห้อ : {brandName}</span>
          </h4>

          <h4 className={styles.detail_label} id="product-detail">รายละเอียดผลิตภัณฑ์</h4>

          <div>
            <p>ชื่อแผงโซลาร์เซลล์ : {product.solarpanel}</p>
            {product.isprice === "0" && product.installationsize && (
              <p>ขนาดติดตั้ง : {product.installationsize}</p>
            )}
            <p>จำนวนแผง : {product.panelsolarcout} แผง</p>
            <p>พื้นที่การติดตั้ง : {product.roofarea} ตารางเมตร</p>
            {product.phase && <p>จำนวนเฟสไฟฟ้า : {product.phase} เฟส</p>}
            {product.battery && <p>รุ่นแบตเตอรี่ {product.battery} kWh</p>}


            {(product.product_detailTH || product.product_detailEN) && (
              <div
                // className={styles.detailSection}
                dangerouslySetInnerHTML={{
                  __html: locale === 'en'
                    ? decodeHtml(product.product_detailEN)
                    : decodeHtml(product.product_detailTH)
                }}
              />
            )}
          </div>

          {/* Price */}
          {product.isprice !== "0" && (
            <>
              {priceObj.original && (
                <span style={{
                  fontSize: '20px',
                  color: '#888',
                  textDecoration: 'line-through',
                  display: 'block',
                  marginTop: '1rem',
                  marginBottom: '-0.5rem',
                }}>
                  {priceObj.original.toLocaleString()} บาท
                </span>
              )}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontWeight: 800,
                fontSize: '32px',
                marginTop: '0.5rem',
              }}>
                <TbCurrencyBaht size={35} /> {priceObj.final?.toLocaleString()} บาท
              </span>
            </>
          )}

          <Link href={`/?product=${product.protypeID}#contact`}>
            <button className={styles.buttonproducts}>สนใจโซลารเซลล์</button>
          </Link>
        </div>
      </div>

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
            />
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={product.gallery || []}
          currentIndex={selectedImage}
          setCurrentIndex={setSelectedImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <RecommendedProducts
        brandId={product.probrandID}
        productId={product.product_num} // ใช้ product_num ที่มีอยู่จริง
      />
    </main>
  );
}
