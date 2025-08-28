'use client';

import React, { useCallback, useRef } from 'react';
import LightGallery from 'lightgallery/react';
import Image from 'next/image';
import styles from './Gallery.module.css';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-autoplay.css';
import 'lightgallery/css/lg-share.css';
import 'lightgallery/css/lg-rotate.css';

import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import lgAutoplay from 'lightgallery/plugins/autoplay';
import lgVideo from 'lightgallery/plugins/video';
import lgShare from 'lightgallery/plugins/share';
import lgRotate from 'lightgallery/plugins/rotate';

const Gallery = ({ images = [] }) => {
  const lightGallery = useRef(null);

  const onInit = useCallback((detail) => {
    if (detail) {
      lightGallery.current = detail.instance;
    }
  }, []);

  const onOpen = (index) => {
    if (lightGallery.current) {
      lightGallery.current.openGallery(index);
    }
  };

  const dynamicElements = images
    .filter(Boolean)
    .map((src) => ({ src, thumb: src }));

  const visibleCount = 2; // ภาพที่แสดงจริง
  const showMoreIndex = visibleCount; // index สำหรับปุ่ม
  const total = dynamicElements.length;

  const hasMore = total > visibleCount;
  const hiddenCount = hasMore ? total - (visibleCount + 1) : 0;

  const visibleImages = hasMore
    ? dynamicElements.slice(0, visibleCount) // แสดงแค่ 2 ภาพแรก
    : dynamicElements.slice(0, total);      // แสดงทั้งหมดถ้าน้อยกว่า 3

  return (
    <LightGallery
      onInit={onInit}
      dynamic
      hash={false}
      speed={500}
      dynamicEl={dynamicElements}
      plugins={[lgThumbnail, lgAutoplay, lgZoom, lgVideo, lgRotate, lgShare]}
      licenseKey="your_license_key" // ใช้ license จริงถ้ามี
    >
      <div className={styles.galleryGrid}>
        {visibleImages.map((item, index) => (
          <div
            key={index}
            className={styles.galleryImageWrapper}
            onClick={() => onOpen(index)}
          >
            <Image
              src={item.thumb}
              alt={`Image ${index + 1}`}
              fill
              sizes="(max-width: 600px) 100vw, 196px"
              className={styles.galleryImage}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}

        {hasMore && (
          <div
            className={styles.galleryImageWrapper}
            onClick={() => onOpen(showMoreIndex)}
          >
            <Image
              src={dynamicElements[showMoreIndex]?.thumb || '/placeholder.jpg'}
              alt="ดูเพิ่มเติม"
              fill
              sizes="(max-width: 600px) 100vw, 196px"
              className={styles.galleryImage}
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.overlay}>
              ดูเพิ่มเติม
              <br />
              {hiddenCount > 0 ? `${hiddenCount} ภาพ` : '0 ภาพ'}
            </div>
          </div>
        )}
      </div>
    </LightGallery>
  );
};

export default Gallery;
