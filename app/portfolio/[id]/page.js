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

  const { locale } = useLocale(); // 'th' หรือ 'en'

  const [project, setProject] = useState(null);
  const [products, setProducts] = useState([]);
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/api/portfolioIDpageapi/${id}`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const data = await res.json();

        if (data.status && data.result) {
          const item = data.result;

          let gallery = [];
          try {
            gallery = item.portfolio_gallery ? JSON.parse(item.portfolio_gallery) : [];
          } catch { gallery = []; }

          let workSteps = [];
          try {
            workSteps = item.workssteps_description ? JSON.parse(item.workssteps_description) : [];
          } catch { workSteps = []; }

          setProject({
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
          });
        } else {
          setProject(null);
        }
      } catch (err) {
        console.error('Error fetching project detail:', err);
        setProject(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [id]);

  // ดึงข้อมูลสินค้าทั้งหมด
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${baseUrl}/api/productpageapi`, {
          headers: { 'X-API-KEY': apiKey },
        });
        const data = await res.json();
        if (data.status && data.result.data) {
          const mapped = data.result.data.map((p) => ({
            item: {
              ...p,
              mainImage: p.gallery ? JSON.parse(p.gallery)[0] : null,
              model: p.modelname,
              size: p.installationsize,
              panel_type: p.solarpanel,
              panel_count: p.panelsolarcout,
              area: p.roofarea,
              inverter_model: p.inverter || '-',
              power_system: p.phase || '-',
              battery: p.battery || '-',
            },
            type: p.protypeID === '1' ? 'SolarRooftop' : 'SolarAir',
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    }
    fetchProducts();
  }, []);

  // หา product ที่ตรงกับ project.product_ID
  useEffect(() => {
    if (project && products.length > 0) {
      const matched = products.find(p => p.item.product_ID === project.product_ID);
      setMatchedProduct(matched || null);
    }
  }, [project, products]);

  // ปิด scroll หน้าเวลามี lightbox
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

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
            <span style={{ marginLeft: 2 }}>
              {locale === 'th' ? project.productTypeTH : project.productTypeEN}
            </span>
          </span>
          <span className={styles.iconText}>
            <BsCalendarCheck />{' '}
            <span style={{ marginLeft: 2 }}>
              {new Date(project.postDate).toLocaleDateString(
                locale === 'th' ? 'th-TH' : 'en-US',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )}
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
            <h5 className={styles.Detailsportfolio}>
              {locale === 'th' ? JSON.parse(project.detailTH) : JSON.parse(project.detailEN)}            </h5>
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
              <p>ไม่พบข้อมูลผลิตภัณฑ์ที่ตรงกับโปรเจกต์นี้</p>
            ) : (
              <>
                {matchedProduct.item.mainImage && (
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                    <div style={{ borderRadius: '6px', overflow: 'hidden', width: 300, height: 300, marginBottom: 16 }}>
                      <Image
                        src={`${baseUrl}/${matchedProduct.item.mainImage}`}
                        alt="Main product image"
                        width={300}
                        height={300}
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
                      <span className={styles.labelsd}>ขนาด</span>
                      <span className={styles.valuesd}>{matchedProduct.item.size || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>ประเภทแผง</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_type || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>จำนวนแผงโซลาร์</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_count || ''} แผง</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>พื้นที่ติดตั้ง</span>
                      <span className={styles.valuesd}>{matchedProduct.item.area || '-'} ตารางเมตร</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>รุ่นอินเวอร์เตอร์</span>
                      <span className={styles.valuesds}>{matchedProduct.item.inverter_model || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>ขนาด</span>
                      <span className={styles.valuesd}>{matchedProduct.item.size || '-'}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsd}>ระบบไฟฟ้า</span>
                      <span className={styles.valuesd}>{matchedProduct.item.power_system || '-'} เฟส </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>จำนวนแผงโซลาร์</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_count || ''} แผง</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.labelsds}>ประเภทแผง</span>
                      <span className={styles.valuesds}>{matchedProduct.item.panel_type || '-'}</span>
                    </div>
                    {matchedProduct.item.battery && matchedProduct.item.battery !== '-' && (
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
            <h3>{t.contactTitle}</h3>
            <h5>{t.contactSubtitle}</h5>
            <Link href={`/?product=`}>
              <button className={styles.contactButton}>{t.contactButton}</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
