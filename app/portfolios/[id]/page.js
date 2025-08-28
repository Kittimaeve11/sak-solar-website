'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './PortfolioDetail.module.css';
import { products } from '@/app/data/products';
import { MdOutlineKeyboardDoubleArrowRight, MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { BsCalendarCheck } from 'react-icons/bs';
import { FaSolarPanel } from 'react-icons/fa';

function findMatchingProduct(project) {
  const { productType, size, panelCount } = project || {};
  if (!productType) return null;

  const productGroup = products.find((p) => {
    if (typeof p.name === 'string') {
      return p.name === productType;
    }
    if (typeof p.name === 'object') {
      return p.name.th === productType || p.name.en === productType;
    }
    return false;
  });

  if (!productGroup) return null;

  for (const brand of productGroup.brands) {
    if (brand.packages) {
      for (const pkg of brand.packages) {
        for (const item of pkg.items) {
          if (item.size === size && item.panel_count === panelCount) {
            return {
              brand: brand.name,
              brandImage: brand.brandImage,
              packageName: pkg.name,
              item,
              productSlug: productGroup.slug,
            };
          }
        }
      }
    }

    if (brand.items) {
      for (const item of brand.items) {
        if (item.size === size || (Array.isArray(item.size) && item.size.includes(size))) {
          return {
            brand: brand.name,
            brandImage: brand.brandImage,
            packageName: null,
            item,
            productSlug: productGroup.slug,
          };
        }
      }
    }
  }

  return null;
}

export default function PortfolioDetailPage(props) {
  const params = React.use(props.params);
  const { id } = params;

  const [project, setProject] = useState(null);
  const [workSteps, setWorkSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showThumbs, setShowThumbs] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [portfolioRes, stepsRes] = await Promise.all([
          fetch('/api/portfolio'),
          fetch('/api/work-steps'),
        ]);
        if (!portfolioRes.ok || !stepsRes.ok) {
          throw new Error('Failed to fetch API');
        }

        const portfolioData = await portfolioRes.json();
        const projectData = portfolioData.projects.find((p) => p.id === Number(id));
        const workStepData = await stepsRes.json();

        setProject(projectData || null);
        setWorkSteps(workStepData.workSteps || []);
      } catch (error) {
        console.error('Error loading data:', error);
        setProject(null);
        setWorkSteps([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // ปิด scroll หน้าเวลามี lightbox เปิด
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  const matchedProduct = useMemo(() => {
    if (!project) return null;
    return findMatchingProduct(project);
  }, [project]);

  const productSlug =
    matchedProduct?.productSlug ||
    products.find((p) => {
      if (typeof p.name === 'string') return p.name === project?.productType;
      if (typeof p.name === 'object') return p.name.th === project?.productType || p.name.en === project?.productType;
      return false;
    })?.slug || '';

  const isSolarAir = project?.productType === 'Solar Air';

  if (loading) {
    return (
      <main className={styles.container}>
        {/* Skeleton Loading */}
        <div className={`${styles.skeletonBanner} ${styles.skeleton}`} />
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeletonTitle} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
            </div>
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeletonTitle} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
            </div>
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeletonTitle} ${styles.skeleton}`} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: '30%' }} />
                <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: '30%' }} />
                <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: '30%' }} />
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeletonTitle} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
            </div>
            <div className={styles.skeletonCard}>
              <div className={`${styles.skeletonTitle} ${styles.skeleton}`} style={{ width: '80%' }} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
              <div className={`${styles.skeletonLine} ${styles.skeleton}`} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return <div>ไม่พบข้อมูล</div>;
  }

  return (
    <main className={`${styles.container} ${styles.fadeIn}`}>
      <div className={styles.headerportfolio}>
        <h2 className={styles.titleportfolio}>{project.title}</h2>
        <div className={styles.meta}>
          <Link href="/" className={styles.backLink}>
            หน้าหลัก <MdKeyboardDoubleArrowRight style={{ fontSize: 19 }} />
          </Link>
          <Link href="/portfolio" className={styles.backLink}>
            ย้อนกลับ <MdKeyboardDoubleArrowRight style={{ fontSize: 19 }} />
          </Link>
          <span className={styles.iconText}>
            <FaSolarPanel /> <span style={{ marginLeft: 2 }}>{project.productType}</span>
          </span>
          <span className={styles.iconText}>
            <BsCalendarCheck /> <span style={{ marginLeft: 2 }}>{project.postDate}</span>
          </span>
        </div>
      </div>

      <div className={styles.coverWrapper}>
        <div className={styles.coverImageContainer}>
          <Image src={project.coverImage} alt={project.title} fill className={styles.coverImage} />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <h2 className={styles.topicportfolio}>รายละเอียด</h2>
            <h5 className={styles.Detailsportfolio}>{project.content}</h5>
          </div>

          <div className={styles.section}>
            <h2 className={styles.topicportfolio}>ขั้นตอนการดำเนินงาน</h2>
            {workSteps.length > 0 ? (
              <ul className={styles.workSteps}>
                {workSteps.map((step, index) => (
                  <li key={index} className={styles.workStepItem}>
                    <Image src="/icons/correct1.png" alt="correct icon" width={40} height={40} />
                    <div>
                      <div className={styles.workStepTitle}>
                        <span>{step.step}</span>
                        <span className={styles.arrowIcon}>
                          <MdOutlineKeyboardDoubleArrowRight />
                        </span>
                        <span>{step.duration}</span>
                      </div>
                      <div className={styles.workStepDesc}>{step.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>ไม่พบข้อมูลขั้นตอน</p>
            )}
          </div>

          <div className={styles.section}>
            {project.gallery?.length > 0 && (
              <>
                <h2 className={styles.topicportfolio}>แกลเลอรี่รูปภาพ</h2>
                <div className={styles.galleryGrid}>
                  {project.gallery.slice(0, 3).map((img, i) => {
                    const isLast = i === 2 && project.gallery.length > 3;
                    return (
                      <div
                        key={i}
                        className={styles.galleryImageWrapper}
                        onClick={() => setLightboxIndex(i)}
                      >
                        <Image
                          src={img}
                          alt={`gallery-${i}`}
                          fill
                          className={styles.galleryImage}
                          priority={i === 0}
                        />
                        {isLast && (
                          <div className={styles.overlay}>
                            <div>
                              ดูเพิ่มเติม
                              <br />
                              {project.gallery.length - 3} ภาพ
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {lightboxIndex !== null && (
              <div
                className={styles.lightboxOverlay}
                onClick={() => {
                  setLightboxIndex(null);
                  setZoom(false);
                  setFullscreen(false);
                }}
              >
                <div className={styles.lightboxContainer} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.lightboxTopBar}>
                    <div>
                      รูปที่ {lightboxIndex + 1} / {project.gallery.length}
                    </div>
                    <div>
                      <button onClick={() => setZoom((z) => !z)}>{zoom ? 'ไม่ซูม' : 'ซูม'}</button>
                      <button onClick={() => setFullscreen((f) => !f)}>{fullscreen ? 'ออกเต็มจอ' : 'เต็มจอ'}</button>
                      <button
                        onClick={() => {
                          setLightboxIndex(null);
                          setZoom(false);
                          setFullscreen(false);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className={styles.lightboxContent}>
                    <button
                      onClick={() =>
                        setLightboxIndex((lightboxIndex - 1 + project.gallery.length) % project.gallery.length)
                      }
                    >
                      ‹
                    </button>

                    <div
                      className={`${styles.lightboxImageWrapper} ${zoom ? styles.zoomed : ''} ${fullscreen ? styles.fullscreen : ''
                        }`}
                    >
                      <Image
                        src={project.gallery[lightboxIndex]}
                        alt={`รูปเต็ม ${lightboxIndex + 1}`}
                        fill
                        sizes="(max-width: 1000px) 100vw, 1000px"
                        className={styles.lightboxImage}
                        priority
                      />
                    </div>

                    <button onClick={() => setLightboxIndex((lightboxIndex + 1) % project.gallery.length)}>›</button>
                  </div>

                  <div className={styles.lightboxThumbToggle}>
                    <button onClick={() => setShowThumbs((v) => !v)}>
                      {showThumbs ? 'ซ่อนแกลเลอรี' : 'แสดงแกลเลอรี'}
                    </button>
                  </div>

                  {showThumbs && (
                    <div className={styles.lightboxThumbs}>
                      {project.gallery.map((img, i) => (
                        <div
                          key={i}
                          className={`${styles.thumbWrapper} ${lightboxIndex === i ? styles.activeThumbWrapper : ''}`}
                          onClick={() => setLightboxIndex(i)}
                        >
                          <Image src={img} alt={`thumb-${i + 1}`} width={100} height={60} className={styles.thumbImage} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <h2 className={styles.topicportfolio}>รายละเอียดผลิตภัณฑ์</h2>
            {!matchedProduct ? (
              <p>ไม่พบข้อมูลผลิตภัณฑ์ที่ตรงกับโปรเจกต์นี้</p>
            ) : (
              <>
                {matchedProduct.item.mainImage && (
                  <div
                    style={{
                      marginBottom: 12,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        width: 230,
                        height: 250,
                      }}
                    >
                      <Image
                        src={matchedProduct.item.mainImage}
                        alt="Main product image"
                        width={230}
                        height={250}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                )}

                {isSolarAir ? (
                  <>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>รุ่น</span>
                      <span className={styles.valuesd}>{matchedProduct.item.model || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>ประเภทแผง</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_type || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>ขนาด</span>
                      <span className={styles.valuesd}>{matchedProduct.item.size || '-'}</span>
                    </div>

                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>จำนวนแผงโซลาร์</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_count || ''} แผง </span>
                    </div>
                    {/* <div className={styles.detailRow}>
                      <span className={styles.labelsd}>ราคา</span>
                      <span className={styles.valuesd}>
                        {matchedProduct.item.price ? matchedProduct.item.price.toLocaleString() + ' บาท' : '-'}
                      </span>
                    </div> */}
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>พื้นที่ติดตั้ง</span>
                      <span className={styles.valuesd}>{matchedProduct.item.area || '-'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>รุ่นอินเวอร์เตอร์</span>
                      <span className={styles.valuesds}>{matchedProduct.item.inverter_model || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>ประเภทแผง</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_type || '-'}</span>
                    </div>

                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>ขนาด</span>
                      <span className={styles.valuesd}>{matchedProduct.item.size || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>ระบบไฟฟ้า</span>
                      <span className={styles.valuesd}>{matchedProduct.item.power_system || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>จำนวนแผงโซลาร์</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_count || ''} แผง </span>
                    </div>
                    {/* <div className={styles.detailRow}>
                      <span className={styles.labelsd}>ราคา</span>
                      <span className={styles.valuesd}>
                        {matchedProduct.item.price ? matchedProduct.item.price.toLocaleString() + ' บาท' : '-'}
                      </span>
                    </div> */}
                    {matchedProduct.item.battery && matchedProduct.item.battery !== '-' && (
                      <div className={styles.detailRow}>
                        <span className={styles.labelsds}>แบตเตอรี่</span>
                        <span className={styles.valuesds}>{matchedProduct.item.battery}</span>
                      </div>
                    )}
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>พื้นที่ติดตั้ง</span>
                      <span className={styles.valuesd}>{matchedProduct.item.area || '-'}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className={styles.contactBox}>
            <h3>สนใจเพิ่มเติมติดต่อ</h3>
            <h5>ติดต่อเราเพื่อรับคำปรึกษาและเสนอราคา</h5>
            <Link href={`/?product=${productSlug}#contact`}>
              <button className={styles.contactButton}>สอบถามรายละเอียด</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}