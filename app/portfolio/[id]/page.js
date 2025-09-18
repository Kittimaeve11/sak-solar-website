'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './PortfolioDetail.module.css';
import { MdOutlineKeyboardDoubleArrowRight, MdKeyboardDoubleArrowRight } from 'react-icons/md';
import { BsCalendarCheck } from 'react-icons/bs';
import { FaSolarPanel } from 'react-icons/fa';
import Gallery from '../gallery';
import { useLocale } from '@/app/Context/LocaleContext';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function PortfolioDetailPage({ params: paramsPromise }) {
  const params = React.use(paramsPromise);
  const { id } = params;
  const { locale } = useLocale();

  const [project, setProject] = useState(null);
  const [products, setProducts] = useState([]);
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let isMounted = true; // ป้องกัน setState หลัง unmount

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch project
        const resProject = await fetch(`${baseUrl}/api/portfolioIDpageapi/${id}`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const dataProject = await resProject.json();

        let projectData = null;
        if (dataProject.status && dataProject.result && isMounted) {
          const item = dataProject.result;

          let gallery = [];
          try { gallery = item.portfolio_gallery ? JSON.parse(item.portfolio_gallery) : []; } catch { }
          let workSteps = [];
          try { workSteps = item.workssteps_description ? JSON.parse(item.workssteps_description) : []; } catch { }

          projectData = {
            id: item.portfolio_id,
            portfolioNum: item.portfolio_num,
            titleTH: item.adddressTH,
            titleEN: item.adddressEN,
            size: item.installationsize,
            detailTH: item.portfolio_detailTH,
            detailEN: item.portfolio_detailEN,
            panelCount: item.panelsolarcout,
            postDate: item.portfolio_datainstall,
            gallery: gallery.map((img) => `${baseUrl}/${img}`),
            workSteps,
            product_ID: item.product_ID,
            productTypeTH: item.TypeProduct_nameTH,
            productTypeEN: item.TypeProduct_nameEN,
          };

          setProject(projectData);
        }

        // Fetch products
        const resProducts = await fetch(`${baseUrl}/api/productpageapi`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const dataProducts = await resProducts.json();

        let productsData = [];
        if (dataProducts.status && dataProducts.result?.data && isMounted) {
          productsData = dataProducts.result.data.map((p) => ({
            item: {
              ...p,
              mainImage: p.gallery ? JSON.parse(p.gallery)[0] : null,
              model: p.modelname,
              size: p.installationsize,
              panel_type: p.solarpanel,
              panel_count: p.panelsolarcout,
              area: p.roofarea,
              inverter_model: p.inverter || null,
              power_system: p.phase || null,
              battery: p.battery || null,
            },
            type: p.protypeID === '1' ? 'SolarRooftop' : 'SolarAir',
          }));
          setProducts(productsData);
        }

        // Match product
        if (projectData && productsData.length > 0 && isMounted) {
          const matched = productsData.find((p) => p.item.product_ID === projectData.product_ID);
          setMatchedProduct(matched || null);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setProject(null);
          setProducts([]);
          setMatchedProduct(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    // ปิด scroll หน้าเวลามี lightbox
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';

    return () => {
      isMounted = false;
      document.body.style.overflow = '';
    };
  }, [id, lightboxIndex]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: 50 }}>Loading...</p>;
  if (!project) return <p style={{ textAlign: 'center', marginTop: 50 }}>Project not found</p>;

  const t = {
    detail: locale === 'th' ? 'รายละเอียด' : 'Details',
    workSteps: locale === 'th' ? 'ขั้นตอนการดำเนินงาน' : 'Work Steps',
    gallery: locale === 'th' ? 'แกลเลอรี่รูปภาพ' : 'Gallery',
    productDetail: locale === 'th' ? 'รายละเอียดผลิตภัณฑ์' : 'Product Details',
    contactTitle: locale === 'th' ? 'สนใจเพิ่มเติมติดต่อ' : 'Contact Us',
    contactSubtitle: locale === 'th' ? 'ติดต่อเราเพื่อรับคำปรึกษาและเสนอราคา' : 'Reach out for consultation and quotation',
    backHome: locale === 'th' ? 'หน้าหลัก' : 'Home',
    backPortfolio: locale === 'th' ? 'ย้อนกลับ' : 'Back to Portfolio',
    noWorkSteps: locale === 'th' ? 'ไม่พบข้อมูลขั้นตอน' : 'No work steps available',
    contactButton: locale === 'th' ? 'สอบถามรายละเอียด' : 'Request Info',
  };

  const isSolarAir = matchedProduct?.type === 'SolarAir';

  const renderDetail = (text) => {
    if (!text) return '-';
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map((d, i) => <p key={i}>{d}</p>);
      return parsed;
    } catch {
      return text;
    }
  };

  return (
    <main className={`${styles.container} ${styles.fadeIn}`}>
      {/* Header */}

      <div className={styles.headerportfolio}>
        <h2 className={styles.titleportfolio}>{locale === 'th' ? project.titleTH : project.titleEN}</h2>
        <div className={styles.meta}>
          <Link href="/" className={styles.backLink}>
            {t.backHome} <MdKeyboardDoubleArrowRight style={{ fontSize: 19 }} />
          </Link>
          <Link href="/portfolio" className={styles.backLink}>
            {t.backPortfolio} <MdKeyboardDoubleArrowRight style={{ fontSize: 19 }} />
          </Link>
          <span className={styles.iconText}>
            <FaSolarPanel />{' '}
            <span style={{ marginLeft: 2 }}>{locale === 'th' ? project.productTypeTH : project.productTypeEN}</span>
          </span>
          <span className={styles.iconText}>
            <BsCalendarCheck />{' '}
            <span style={{ marginLeft: 2 }}>
              {new Date(project.postDate).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </span>
        </div>
      </div>

      {/* Cover Image */}
      <div className={styles.coverWrapper}>
        <div className={styles.coverImageContainer}>
          <Image
            src={project.gallery[0] || '/images/placeholder.png'}
            alt={locale === 'th' ? project.titleTH : project.titleEN}
            fill
            className={styles.coverImage}
          />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.leftColumn}>
          {/* รายละเอียด */}
          <div className={styles.section}>
            <h2 className={styles.topicportfolio}>{t.detail}</h2>
            <div className={styles.Detailsportfolio}>
              {locale === 'th' ? renderDetail(project.detailTH) : renderDetail(project.detailEN)}
            </div>
          </div>

          {/* ขั้นตอนการดำเนินงาน */}
          <div className={styles.section}>
            <h2 className={styles.topicportfolio}>{t.workSteps}</h2>
            {project.workSteps.length > 0 ? (
              <ul className={styles.workSteps}>
                {project.workSteps.map((step, index) => (
                  <li key={index} className={styles.workStepItem}>
                    <Image src="/icons/correct1.png" alt="correct icon" width={40} height={40} />
                    <div>
                      <div className={styles.workStepTitle}>
                        <span>{locale === 'th' ? step.stapnameTH : step.stapnameEN}</span>
                        <span className={styles.arrowIcon}>
                          <MdOutlineKeyboardDoubleArrowRight />
                        </span>
                        <span>{locale === 'th' ? step.durationTH : step.durationEN}</span>
                      </div>
                      <div className={styles.workStepDesc}>
                        {locale === 'th' ? step.descriptionTH : step.descriptionEN}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t.noWorkSteps}</p>
            )}
          </div>

          {/* แกลเลอรี่ */}
          {project.gallery.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.topicportfolio}>{t.gallery}</h2>
              <Gallery
                img2={project.gallery[1]}
                img3={project.gallery[2]}
                img4={project.gallery[3]}
                img5={project.gallery[4]}
                img6={project.gallery[5]}
                img7={project.gallery[6]}
                img8={project.gallery[7]}
                img9={project.gallery[8]}
              />
            </div>
          )}
        </div>

        <div className={styles.rightColumn}>
          {/* แสดงข้อมูล product */}
          <div className={styles.section}>
            <h2 className={styles.topicportfolio}>{t.productDetail}</h2>
            {!matchedProduct ? (
              <p>ไม่มีสินค้าในตอนี้</p>
            ) : (
              <>
                {matchedProduct.item.mainImage && (
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                    <Link
                      href={`/products/${matchedProduct.item.protypeID}/${matchedProduct.item.probrandID}/${matchedProduct.item.product_ID}`}
                      className={styles.cardContainer}
                      style={{
                        borderRadius: '6px',
                        overflow: 'hidden',
                        width: 300,
                        height: 300,
                        marginBottom: 16,
                        position: 'relative',
                        display: 'block',
                      }}
                    >
                      <Image
                        src={`${baseUrl}/${matchedProduct.item.mainImage}`}
                        alt="Main product image"
                        width={300}
                        height={300}
                        style={{ objectFit: 'cover' }}
                      />
                      <div className={styles.cardOverlay}>
                        ดูรายละเอียดสินค้า
                      </div>
                    </Link>
                  </div>
                )}


                {isSolarAir ? (
                  <>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>รุ่น</span>
                      <span className={styles.valuesd}>{matchedProduct.item.model || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>ขนาด</span>
                      <span className={styles.valuesd}>{matchedProduct.item.size || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>ประเภทแผง</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_type || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelpanels}>จำนวนแผง</span>
                      <span className={styles.valuepanels}>{matchedProduct.item.panel_count || ''} แผง</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>พื้นที่ติดตั้ง</span>
                      <span className={styles.valuesd}>{matchedProduct.item.area || '-'} ตารางเมตร</span>
                    </div>
                  </>
                ) : (
                  <>
                    {matchedProduct.item.inverter_model && (
                      <div className={styles.detailRow}>
                        <span className={styles.labelsds}>รุ่นอินเวอร์เตอร์</span>
                        <span className={styles.valuesds}>{matchedProduct.item.inverter_model}</span>
                      </div>
                    )}

                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>ขนาด</span>
                      <span className={styles.valuesd}>{matchedProduct.item.size || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>ระบบไฟฟ้า</span>
                      <span className={styles.valuesd}>
                        {matchedProduct.item.power_system ? `${matchedProduct.item.power_system} เฟส` : '-'}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>จำนวนแผง</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_count || ''} แผง</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>ประเภทแผง</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_type || '-'}</span>
                    </div>
                    {matchedProduct.item.battery && (
                      <div className={styles.detailRow}>
                        <span className={styles.labelsds}>แบตเตอรี่</span>
                        <span className={styles.valuesds}>{matchedProduct.item.battery}</span>
                      </div>
                    )}
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>พื้นที่ติดตั้ง</span>
                      <span className={styles.valuesd}>{matchedProduct.item.area || '-'} ตารางเมตร </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Contact */}
          <div className={styles.contactBox}>
            <Image
              src="/icons/solar-panels.gif"
              alt="solar panels"
              width={100}
              height={100}
              className={styles.contactIcon}
            />
            <h3 style={{marginBottom:'-1.5rem',marginTop:'-0.2rem',fontWeight:'600'}}>{t.contactTitle}</h3>
            <h5 style={{marginBottom:'0rem'}}>{t.contactSubtitle}</h5>
            <Link href={`/?product=`}>
              <button className={styles.contactButton}>{t.contactButton}</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
