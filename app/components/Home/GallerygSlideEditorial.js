'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import LightGallery from 'lightgallery/react';
import { LightGallery as ILightGallery } from 'lightgallery/lightgallery';

import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-zoom.css';

export default function GallerySlideEditorial({ images = [] }) {
  const lightGalleryRef = useRef(null);
  const containerRef = useRef(null);
  const [galleryContainer, setGalleryContainer] = useState(null);

  const onInit = useCallback((detail) => {
    if (detail) {
      lightGalleryRef.current = detail.instance;
      // ไม่เปิด gallery อัตโนมัติ ให้เปิดเฉพาะตอนคลิก
      // lightGalleryRef.current.openGallery();
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setGalleryContainer(containerRef.current);
    }
  }, []);

  if (!images.length) return null;

  const dynamicEl = images.map((imgUrl, i) => ({
    src: imgUrl,
    thumb: imgUrl,
    subHtml: `<div class="lg-sub-html">รูปที่ ${i + 1}</div>`,
  }));

  return (
    <div className="gallery-slide-editorial" style={{ marginTop: '1rem' }}>
      <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>แกลเลอรี่รูปภาพ</h2>

      <div
        ref={containerRef}
        style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', cursor: 'pointer' }}
      >
        {images.slice(0, 3).map((img, index) => (
          <div
            key={index}
            onClick={() => lightGalleryRef.current?.openGallery(index)}
            style={{
              position: 'relative',
              width: '30%',
              paddingBottom: '20%',
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {index === 2 && images.length > 3 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  textAlign: 'center',
                  whiteSpace: 'pre-line',
                  userSelect: 'none',
                }}
              >
                ดูเพิ่มเติม{'\n'}
                {images.length - 3} ภาพ
              </div>
            )}
          </div>
        ))}
      </div>

      <LightGallery
        container={galleryContainer}
        onInit={onInit}
        plugins={[lgZoom, lgThumbnail]}
        dynamic
        dynamicEl={dynamicEl}
        mode="lg-fade"
        download={false}
      />
    </div>
  );
}
