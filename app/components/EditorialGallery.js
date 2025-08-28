// 'use client';

// import React, { useEffect, useState } from 'react';
// import Image from 'next/image';
// import styles from './EditorialGallery.module.css';

// export default function EditorialGallery({ gallery = [], title = 'แกลเลอรี' }) {
//   const [lightboxIndex, setLightboxIndex] = useState(null);
//   const [zoom, setZoom] = useState(false);
//   const [fullscreen, setFullscreen] = useState(false);
//   const [showThumbs, setShowThumbs] = useState(true);

//   useEffect(() => {
//     document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [lightboxIndex]);

//   if (!gallery || gallery.length === 0) return null;

//   return (
//     <>
//       <section>
//         <h2>{title}</h2>
//         <div className={styles.galleryGrid}>
//           {gallery.slice(0, 3).map((img, i) => {
//             const isLast = i === 2 && gallery.length > 3;
//             return (
//               <div
//                 key={i}
//                 className={styles.galleryImageWrapper}
//                 onClick={() => setLightboxIndex(i)}
//               >
//                 <Image
//                   src={img}
//                   alt={`gallery-${i + 1}`}
//                   fill
//                   className={styles.galleryImage}
//                   priority={i === 0}
//                 />
//                 {isLast && (
//                   <div className={styles.overlay}>
//                     <div>
//                       ดูเพิ่มเติม<br />
//                       {gallery.length - 3} ภาพ
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </section>

//       {lightboxIndex !== null && (
//         <div
//           className={styles.lightboxOverlay}
//           onClick={() => {
//             setLightboxIndex(null);
//             setZoom(false);
//             setFullscreen(false);
//           }}
//         >
//           <div
//             className={styles.lightboxContainer}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className={styles.lightboxTopBar}>
//               <div className={styles.lightboxInfo}>
//                 รูปที่ {lightboxIndex + 1} / {gallery.length}
//               </div>
//               <div className={styles.lightboxControls}>
//                 <button onClick={() => setZoom((z) => !z)}>
//                   {zoom ? 'ไม่ซูม' : 'ซูม'}
//                 </button>
//                 <button onClick={() => setFullscreen((f) => !f)}>
//                   {fullscreen ? 'ออกเต็มจอ' : 'เต็มจอ'}
//                 </button>
//                 <button
//                   onClick={() => {
//                     setLightboxIndex(null);
//                     setZoom(false);
//                     setFullscreen(false);
//                   }}
//                 >
//                   ✕
//                 </button>
//               </div>
//             </div>

//             <div className={styles.lightboxContent}>
//               <button
//                 className={styles.navButton}
//                 onClick={() =>
//                   setLightboxIndex(
//                     (lightboxIndex - 1 + gallery.length) % gallery.length
//                   )
//                 }
//               >
//                 ‹
//               </button>
//               <div
//                 className={`${styles.lightboxImageWrapper} ${
//                   zoom ? styles.zoomed : ''
//                 } ${fullscreen ? styles.fullscreen : ''}`}
//               >
//                 <Image
//                   src={gallery[lightboxIndex]}
//                   alt={`รูปเต็ม ${lightboxIndex + 1}`}
//                   fill
//                   sizes="(max-width: 1000px) 100vw, 1000px"
//                   className={styles.lightboxImage}
//                   priority
//                 />
//               </div>
//               <button
//                 className={styles.navButton}
//                 onClick={() =>
//                   setLightboxIndex((lightboxIndex + 1) % gallery.length)
//                 }
//               >
//                 ›
//               </button>
//             </div>

//             <div className={styles.lightboxThumbToggle}>
//               <button onClick={() => setShowThumbs((v) => !v)}>
//                 {showThumbs ? 'ซ่อนแกลเลอรี' : 'แสดงแกลเลอรี'}
//               </button>
//             </div>

//             {showThumbs && (
//               <div className={styles.lightboxThumbs}>
//                 {gallery.map((img, i) => (
//                   <div
//                     key={i}
//                     className={`${styles.thumbWrapper} ${
//                       lightboxIndex === i ? styles.activeThumbWrapper : ''
//                     }`}
//                     onClick={() => setLightboxIndex(i)}
//                     tabIndex={0}
//                     role="button"
//                     aria-label={`เลือกรูปที่ ${i + 1}`}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter' || e.key === ' ') {
//                         setLightboxIndex(i);
//                       }
//                     }}
//                   >
//                     <Image
//                       src={img}
//                       alt={`รูปย่อที่ ${i + 1}`}
//                       width={100}
//                       height={60}
//                       className={styles.thumbImage}
//                       draggable={false}
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
