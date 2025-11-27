'use client';

import Image from 'next/image';
import Gallery from './Gallery'; // นำเข้า gallery component ที่คุณมีอยู่
import styles from './EditorialDetailPage.module.css';

export default function ArticleImages({ images = [], title }) {
  if (!images || images.length === 0) return null;

  // ดึงแค่ภาพแรกเป็น Main Image
  const mainImage = images[0];

  // รูปที่เหลือ (เริ่มจาก index 1)
  const galleryImages = images.slice(1);

  return (
    <div className={styles.articleImagesWrapper}>
      
      {/* 🖼 รูปหลัก (แสดงรูปแรกเท่านั้น) */}
      <div className={styles.mainImageWrapper}>
        <Image
          src={mainImage}
          alt={`${title} - main image`}
          width={900}
          height={450}
          className={styles.mainImage}
          priority
        />
      </div>

      {/* 📸 แกลเลอรี่ภาพที่เหลือ */}
      {galleryImages.length > 0 && (
        <div className={styles.gallerySection}>
          <Gallery images={galleryImages} />
        </div>
      )}
    </div>
  );
}
