'use client';

import React, { useCallback, useRef } from 'react';
import LightGallery from 'lightgallery/react';
import Image from 'next/image';
import styles from './gallery.module.css';

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

const Gallery = ({ img2, img3, img4, img5, img6, img7, img8, img9 }) => {
  const lightGallery = useRef(null);

  const onInit = useCallback((detail) => {
    if (detail) {
      lightGallery.current = detail.instance;
    }
  }, []);

  const onOpen = (index) => {
    lightGallery.current.openGallery(index);
  };

  const dynamicElements = [
    img2 && { src: img2, thumb: img2 },
    img3 && { src: img3, thumb: img3 },
    img4 && { src: img4, thumb: img4 },
    img5 && { src: img5, thumb: img5 },
    img6 && { src: img6, thumb: img6 },
    img7 && { src: img7, thumb: img7 },
    img8 && { src: img8, thumb: img8 },
    img9 && { src: img9, thumb: img9 },
  ].filter(Boolean);

  const maxItems = 3;

  const showMore = dynamicElements.length > maxItems;
  const visibleImages = showMore
    ? dynamicElements.slice(0, maxItems - 1) // แสดง 2 ภาพแรก
    : dynamicElements.slice(0, maxItems);   // 1-3 ภาพ

  // แก้ไขนับภาพที่ซ่อนจริงๆ (ไม่รวมปุ่มที่เป็นภาพที่แสดง)
  const hiddenCount = showMore
    ? dynamicElements.length - maxItems
    : 0;

  return (
    <LightGallery
      onInit={onInit}
      dynamic
      hash={false}
      speed={500}
      dynamicEl={dynamicElements}
      plugins={[lgThumbnail, lgAutoplay, lgZoom, lgVideo, lgRotate, lgShare]}
      licenseKey="your_license_key"
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
            />
          </div>
        ))}

        {showMore && (
          <div
            className={styles.galleryImageWrapper}
            onClick={() => onOpen(maxItems - 1)}
          >
            <Image
              src={dynamicElements[maxItems - 1].thumb}
              alt="ดูเพิ่มเติม"
              fill
              sizes="(max-width: 600px) 100vw, 196px"
              className={styles.galleryImage}
            />
            <div className={styles.overlay}>
              ดูเพิ่มเติม
              <br />
              {hiddenCount} ภาพ
            </div>
          </div>
        )}
      </div>
    </LightGallery>
  );
};

export default Gallery;
