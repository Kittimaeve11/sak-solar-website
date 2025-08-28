'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';

import styles from './PortfolioGallery.module.css';

export default function PortfolioGallery({ gallery = [] }) {
  const lightGallery = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!gallery || gallery.length === 0) return null;

  const openGalleryAt = (i) => {
    setIndex(i);
    setIsOpen(true);

    setTimeout(() => {
      lightGallery.current?.openGallery(i);
    }, 100);
  };

  return (
    <section>
      <h2 className={styles.topicportfolio}>แกลเลอรี่รูปภาพ</h2>

      {/* Gallery preview */}
      <div className={styles.galleryGrid}>
        {gallery.map((img, i) => (
          <div
            key={i}
            className={styles.galleryImageWrapper}
            onClick={() => openGalleryAt(i)}
            style={{ cursor: 'pointer' }}
          >
            <Image
              src={img}
              alt={`รูปที่ ${i + 1}`}
              width={400}
              height={250}
              style={{ objectFit: 'cover', borderRadius: '8px' }}
            />
          </div>
        ))}
      </div>

      {/* React Carousel แบบ dynamic จริง ๆ */}
      {isOpen && (
        <LightGallery
          dynamic
          dynamicEl={gallery.map((src, i) => ({
            src,
            subHtml: `<div class="custom-caption">รูปที่ ${i + 1} / ${gallery.length}</div>`,
          }))}
          onInit={(ref) => (lightGallery.current = ref.instance)}
          plugins={[lgZoom]}
          closable
          download={false}
          mode="lg-slide"
          speed={500}
          index={index}
          onClose={() => setIsOpen(false)}
        />
      )}
    </section>
  );
}
