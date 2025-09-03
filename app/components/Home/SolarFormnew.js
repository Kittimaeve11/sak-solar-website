'use client';

import React, { useState, useEffect } from 'react';
import styles from './SolarFormnew.module.css';
import Image from 'next/image';
import { MdOutlineElectricBolt } from 'react-icons/md';
import html2canvas from 'html2canvas';
import Link from 'next/link';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

const handlePrintScreenshot = () => {
  const element = document.querySelector(`.${styles.resultGrid}`);
  if (!element) {
    alert('ไม่พบส่วนที่ต้องการแคป');
    return;
  }

  html2canvas(element, { scale: 2 }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <html>
        <head>
          <title>ปริ้นภาพผลลัพธ์</title>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            h1 { font-size: clamp(1.2rem, 5vw, 2rem); font-weight: 600; text-align: center; margin-bottom: 0.5rem; color: #F2780C; }
            img { max-width: 90%; max-height: 80%; height: auto; display: block; }
          </style>
        </head>
        <body>
          <h1>ผลการคำนวณขนาดติดตั้ง</h1>
          <img src="${imgData}" />
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }).catch(err => {
    console.error('เกิดข้อผิดพลาดในการแคปภาพ:', err);
  });
};

const calculateSolarSize = (electricityCost, dayUsage, installationCost = 0) => {
  const usageUnits = electricityCost / 5;
  const averageDailyUnits = usageUnits / 30;
  const dayUnits = averageDailyUnits * (dayUsage / 100);
  const nightUnits = averageDailyUnits - dayUnits;
  const C = usageUnits * (dayUsage / 100);

  const sizeTable = [
    { size: "1.8 kW", max: 270 },
    { size: "3.1 kW", max: 465 },
    { size: "5 kW", max: 750 },
    { size: "10 kW", max: 1500 },
    { size: "15 kW", max: 2250 },
    { size: "20 kW", max: 3000 },
    { size: "25 kW", max: 3750 },
    { size: "30 kW", max: 4500 },
    { size: "35 kW", max: 5250 },
    { size: "40 kW", max: 6000 },
  ];

  const recommendedItem = sizeTable.find((item) => C <= item.max);
  const recommended = recommendedItem?.size || "เกิน 60 kW";

  const savingsPerMonth = electricityCost * (dayUsage / 100);
  const savingsPerYear = savingsPerMonth * 12;
  const savingsIn25Years = savingsPerYear * 25;
  const paybackPeriod =
    installationCost && savingsPerYear
      ? (installationCost / savingsPerYear).toFixed(1)
      : null;

  return {
    usageUnits,
    averageDailyUnits,
    dayUnits,
    nightUnits,
    recommended,
    dayUsage,
    savingsPerMonth,
    savingsPerYear,
    savingsIn25Years,
    paybackPeriod,
  };
};

export default function SolarCalculatorForm() {
  const [formValues, setFormValues] = useState({
    electricityCost: '',
    systemType: '',
    roofArea: '',
    dayUsage: 60,
  });

  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [attemptedRoofInput, setAttemptedRoofInput] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/productpageapi`, {
          headers: {
            'X-API-KEY': apiKey
          }
        });
        const data = await res.json();
        if (data.status) {
          setProductsData(data.result.data);
        } else {
          console.error('API returned error:', data.message);
        }
      } catch (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', err);
      }
    };
    fetchProducts();
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formValues.electricityCost) {
      newErrors.electricityCost = '*กรุณากรอกค่าไฟฟ้า';
    } else if (isNaN(Number(formValues.electricityCost)) || Number(formValues.electricityCost) <= 0) {
      newErrors.electricityCost = '*กรุณากรอกค่าไฟฟ้าเป็นตัวเลขบวก';
    }

    if (!formValues.systemType) {
      newErrors.systemType = '*กรุณาเลือกระบบไฟฟ้า';
    }

    if (!formValues.roofArea && formValues.roofArea !== 0) {
      newErrors.roofArea = '*กรุณากรอกพื้นที่หลังคา';
    } else if (!formValues.systemType && formValues.roofArea !== '') {
      newErrors.roofArea = '*กรุณาเลือกระบบไฟฟ้าก่อนจึงจะกรอกพื้นที่หลังคาได้';
    } else {
      const roofNum = parseFloat(formValues.roofArea);
      if (formValues.systemType === 'single') {
        if (roofNum < 9) newErrors.roofArea = '*พื้นที่สำหรับ 1 เฟส ต้องไม่ต่ำกว่า 9 ตารางเมตร.';
        else if (roofNum > 45) newErrors.roofArea = '*พื้นที่สำหรับ 1 เฟส ต้องไม่เกิน 45 ตารางเมตร.';
      } else if (formValues.systemType === 'three') {
        if (roofNum < 45) newErrors.roofArea = '*พื้นที่สำหรับ 3 เฟส ต้องไม่ต่ำกว่า 45 ตารางเมตร.';
        else if (roofNum > 179) newErrors.roofArea = '*พื้นที่สำหรับ 3 เฟส ต้องไม่เกิน 179 ตารางเมตร.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [roofAttempts, setRoofAttempts] = useState(0);


  const handleChange = (field) => (e) => {
    let value = e.target.value;

    if (field === 'electricityCost') {
      value = value.replace(/,/g, '');
      if (!/^\d*$/.test(value)) return;
    }

    if (field === 'roofArea') {
      setAttemptedRoofInput(true);
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        const roofNum = parseFloat(value);
        let roofError = null;
        const maxArea = formValues.systemType === 'single' ? 45 : 179;
        const minArea = formValues.systemType === 'single' ? 9 : 45;

        if (value !== '' && !isNaN(roofNum)) {
          if (roofNum < minArea) roofError = `*พื้นที่สำหรับ ${formValues.systemType === 'single' ? '1 เฟส' : '3 เฟส'} ต้องไม่ต่ำกว่า ${minArea} ตารางเมตร.`;
          else if (roofNum > maxArea) return;
        }

        setErrors((prev) => ({ ...prev, roofArea: roofError }));
      } else return;
    }

    setFormValues((prev) => ({ ...prev, [field]: value }));

    setErrors((prevErrors) => {
      if (!prevErrors[field]) return prevErrors;
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[field];
      return updatedErrors;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const electricityCostNum = Number(formValues.electricityCost);
    const roofAreaNum = Number(formValues.roofArea);
    const { systemType, dayUsage } = formValues;

    if (
      (systemType === 'single' && (roofAreaNum < 9 || roofAreaNum > 45)) ||
      (systemType === 'three' && (roofAreaNum < 45 || roofAreaNum > 179))
    ) {
      alert('พื้นที่หลังคาไม่เหมาะสมกับประเภทของระบบไฟฟ้าที่เลือก');
      return;
    }

    const installationCost = 100000;
    const result = calculateSolarSize(electricityCostNum, dayUsage, installationCost);
    setResults(result);
  };

  const handleReset = () => {
    setFormValues({ electricityCost: '', systemType: '', roofArea: '', dayUsage: 60 });
    setErrors({});
    setResults(null);
    setAttemptedRoofInput(false);
  };

  const getRecommendedItems = (systemType) => {
    if (!systemType || productsData.length === 0) return [];
    const phase = systemType === 'single' ? '1' : '3';
    const filtered = productsData.filter(item =>
      item.phase === phase && item.installationsize.includes('kW')
    );
    filtered.sort((a, b) => {
      const aPriority = (a.promotion ? 2 : 0) + (a.isPinned ? 1 : 0);
      const bPriority = (b.promotion ? 2 : 0) + (b.isPinned ? 1 : 0);
      return bPriority - aPriority;
    });
    return filtered;
  };

  const recommendedItems = getRecommendedItems(formValues.systemType);

  return (
    <div className={styles.containersolar}>
      <div className={`${styles.formWrapper} ${results ? styles.formWrapperResult : styles.formWrapperInitial}`}>
        <h1 className={styles.headtitleonesolar} lang="th" style={{ marginBottom: '1rem' }}>
          {!results
            ? <>ระบบคำนวณขนาด <span className="keep-together">Solar Rooftop</span> <span className="keep-together">ที่เหมาะสม</span></>
            : (
              <>
                ผลการคำนวณ<br />ขนาดติดตั้ง
              </>
            )}
        </h1>




        {!results && (
          <form noValidate onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={`${styles.formGroup} ${styles.flexGrow}`}>
                <label htmlFor="electricityCost" className="form-label">
                  ค่าไฟฟ้าต่อเดือน (บาท) :
                </label>
                <input
                  id="electricityCost"
                  name="electricityCost"
                  type="text"
                  inputMode="numeric"
                  className={`form-field ${errors.electricityCost ? 'input-error' : ''}`}
                  placeholder="กรุณากรอกค่าไฟต่อเดือนของท่าน**"
                  value={formValues.electricityCost !== '' ? Number(formValues.electricityCost).toLocaleString('en-US') : ''}
                  onChange={handleChange('electricityCost')}
                  autoComplete="off"
                  suppressHydrationWarning
                />
                {errors.electricityCost && <div className="error-text">{errors.electricityCost}</div>}
              </div>

              <div className="form-group align-right">
                <span className="form-label" style={{ marginBottom: '1rem' }}>
                  ระบบไฟฟ้า :
                </span>

                <div className={`radio-group ${errors.systemType ? 'error-border' : ''}`}>
                  <label className="form-radio" htmlFor="systemTypeSingle">
                    <input
                      id="systemTypeSingle"
                      name="systemType"
                      type="radio"
                      value="single"
                      checked={formValues.systemType === 'single'}
                      onChange={handleChange('systemType')}
                      className="radio-input"
                      suppressHydrationWarning
                    />
                    1 เฟส
                  </label>

                  <label className="form-radio" htmlFor="systemTypeThree">
                    <input
                      id="systemTypeThree"
                      name="systemType"
                      type="radio"
                      value="three"
                      checked={formValues.systemType === 'three'}
                      onChange={handleChange('systemType')}
                      className="radio-input"
                      suppressHydrationWarning
                    />
                    3 เฟส
                  </label>
                </div>

                {errors.systemType && (
                  <div className="error-text" style={{ marginTop: '0.5rem' }}>
                    {errors.systemType}
                  </div>
                )}
              </div>
            </div>

            <label htmlFor="dayUsage" className="form-label">
              เปอร์เซ็นต์การใช้ไฟฟ้า <span className={styles.keepTogethersolar}>ในช่วงกลางวันและกลางคืน :</span>
            </label>


            <input
              id="dayUsage"
              name="dayUsage"
              type="range"
              min="0"
              max="100"
              value={formValues.dayUsage}
              onChange={(e) => setFormValues((prev) => ({ ...prev, dayUsage: Number(e.target.value) }))}
              className={styles.rangeControl}
              style={{
                background: `linear-gradient(to right, #F2780C ${formValues.dayUsage}%, #F2F2F2 ${formValues.dayUsage}%)`,
              }}
              suppressHydrationWarning
            />
            <div className={styles.usageSplit}>
              <span>ช่วงกลางวัน {formValues.dayUsage} %</span>
              <span>ช่วงกลางคืน {100 - formValues.dayUsage} %</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="roofArea" className="form-label">
                พื้นที่หลังคาโดยประมาณ (ตารางเมตร) :
              </label>
              <input
                id="roofArea"
                name="roofArea"
                type="text"
                inputMode="decimal"
                className={`form-field ${errors.roofArea ? 'input-error' : ''}`}
                disabled={!formValues.systemType}
                value={formValues.roofArea}
                onChange={handleChange('roofArea')}
                placeholder={
                  formValues.systemType
                    ? formValues.systemType === 'single'
                      ? 'กรุณากรอกพื้นที่หลังคาในช่วง 9-45 ตารางเมตร'
                      : 'กรุณากรอกพื้นที่หลังคาในช่วง 45-179 ตารางเมตร'
                    : 'กรุณาเลือกระบบไฟฟ้าก่อน**'

                }
                style={{
                  backgroundColor: !formValues.systemType ? '#f5f5f5' : 'white',
                  cursor: !formValues.systemType ? 'not-allowed' : 'text',
                }}
                autoComplete="off"
                suppressHydrationWarning
              />
              {errors.roofArea && <div className="error-text">{errors.roofArea}</div>}
              {!formValues.systemType && (
                <div className="error-text">
                  *กรุณาเลือกระบบไฟฟ้าก่อนจึงจะสามารถกรอกพื้นที่หลังคาได้
                </div>
              )}
            </div>

            <h6 className={`${styles.instructions} ${styles.hideOnMobile}`}>
              <span style={{ color: 'red', fontWeight: '600' }}>หมายเหตุ : </span> ระบบไฟ 1 เฟส ต้องระบุพื้นที่หลังคา 9–45 ตร.ม.
            </h6>
            <h6 className={`${styles.instructions1} ${styles.hideOnMobile}`} style={{ marginLeft: '4rem' }}>
              ระบบไฟ 3 เฟส ต้องระบุพื้นที่หลังคา 45–179 ตร.ม.
            </h6>

            <div className={styles.buttonGroup}>
              <button type="submit" className="buttonSecondaryonebule">
                คำนวณ
              </button>
              <button
                type="button"
                className="buttonSecondaryonedelte"
                onClick={handleReset}
              >
                เคลียร์ข้อมูลและรีเฟรชหน้า
              </button>
            </div>

          </form>
        )}

        {results && (
          <>
            <h4 className={styles.headtitelsolar}>
              แพ็กเกจที่ออกแบบมาให้เหมาะกับพื้นที่หลังคา และรูปแบบการใช้พลังงานของคุณ
            </h4>

            <div className={styles.resultGrid}>
              {/* แถวบน: ขนาดระบบ / ระยะเวลาคืนทุน */}

              {/* ขนาดระบบที่แนะนำ */}
              <div className={styles.topGrid}>
                <div className={styles.resultBoxc}>
                  <div className={styles.labelRowc}>
                    <div className={styles.labelheadc}>ขนาดระบบที่แนะนำ</div>
                    <div className={styles.valueLargec}>
                      <span className={styles.recommendedNumberc}>
                        {results.recommended?.match(/[\d.]+/)?.[0]}
                      </span>
                      <span className={styles.recommendedUnitc}> kW</span>
                    </div>
                  </div>
                </div>


                {/* ระยะเวลาคืนทุน */}
                <div className={styles.resultBox}>
                  <div className={styles.labelRow}>
                    <div className={styles.labelhead}>ระยะเวลาคืนทุน</div>
                    <div className={styles.valueLarge}>
                      <span className={styles.recommendedNumber}>
                        {results.paybackPeriod}
                      </span>
                      <span className={styles.recommendedUnit}> ปี</span>
                    </div>
                  </div>
                  <p className={styles.subtext}>Solar Rooftop เพื่อลดค่าไฟฟ้าอย่างยั่งยืน</p>
                </div>
              </div>


              {/* แถวล่าง: แพ็กเกจ / รายละเอียดการใช้ไฟ */}
              <div className={styles.bottomGrid}>


                <div className={styles.resultBoxL}>
                  <h4 className={styles.packageTitle}>แพ็กเกจที่เราแนะนำ</h4>
                  <p className={`${styles.systemType} ${styles['with-lines']}`}>                    ระบบไฟฟ้า {formValues.systemType === 'single' ? '1 เฟส' : '3 เฟส'}
                  </p>


                  <div className="productListWrapper">

                    <div className={styles.productList}>
                      {recommendedItems.slice(0, 2).map((item) => {
                        const gallery = item.gallery ? JSON.parse(item.gallery) : [];
                        const mainImage = gallery.length > 0
                          ? `${baseUrl}/${gallery[0]}`  // ใช้ URL จริงจาก API
                          : '/images/no-image.png';
                        const name = item.modelname || item.product_num;
                        const size = item.installationsize;

                        return (
                          <Link
                            key={item.product_ID}
                            href={`/products/${item.protypeID}/${item.probrandID}/${item.product_ID}`}
                            style={{ textDecoration: 'none' }}
                            passHref
                          >
                            <div className={styles.productCard} style={{ cursor: 'pointer' }}>
                              <Image
                                src={mainImage}
                                alt={name}
                                width={320}
                                height={320}
                                className={styles.productImage}
                              />

                              <div className={styles.productTable}>
                                <div className="product-info" style={{ textAlign: 'left' }}>
                                  <h3 style={{ margin: 0 }}>{name}</h3>
                                  {size && (
                                    <p
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        margin: 0,
                                        fontWeight: 600,
                                        color: 'black'
                                      }}
                                    >
                                      <MdOutlineElectricBolt size={20} color='#ffc300' />
                                      {size}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className={styles.cardOverlay}>
                                ดูรายละเอียดสินค้า
                              </div>
                            </div>
                          </Link>
                        );
                      })}


                    </div>

                  </div>

                </div>

                <div className={styles.resultBox}>
                  <h4 className={styles.solarTitle}> ผลตอบแทนระบบโซลาร์ </h4>

                  <div className={styles.costRow}>
                    <div className={styles.leftGroup}>
                      <Image
                        src="/icons/coin.png"
                        alt="Bill"
                        width={40}
                        height={40}
                      />
                      <span className={styles.costLabel}>ค่าไฟที่ลดต่อเดือน</span>
                    </div>
                    <span className={styles.costValue}>
                      {results.savingsPerMonth !== undefined
                        ? Number(results.savingsPerMonth.toFixed(0)).toLocaleString()
                        : 'XXX'} บาท
                    </span>

                  </div>


                  <div className={styles.costRow}>
                    <div className={styles.leftGroup}>
                      <Image
                        src="/icons/sun1.png"
                        alt="Bill"
                        width={40}
                        height={40}
                      />
                      <span className={styles.costLabel}>ใช้ไฟช่วงกลางวัน</span>
                    </div>
                    <span className={styles.costValue}>
                      {results.dayUnits ? Math.floor(results.dayUnits) : 0} KW ({results.dayUsage}%)
                    </span>
                  </div>


                  <div className={styles.costRow}>
                    <div className={styles.leftGroup}>
                      <Image
                        src="/icons/night.png"
                        alt="Bill"
                        width={40}
                        height={40}
                      />
                      <span className={styles.costLabel}>ใช้ไฟช่วงกลางคืน</span>
                    </div>
                    <span className={styles.costValue}>
                      {Math.floor(results.nightUnits)} KW ({Math.floor(100 - results.dayUsage)}%)
                    </span>
                  </div>

                  <ul className={styles.costList}>
                    <h4 className={styles.solardeteil}> ผลตอบแทนระบบโซลาร์ </h4>
                    <li>
                      <div className={styles.rowds}>
                        <span className={styles.bullet}></span>
                        <span className={styles.labelds}>ค่าไฟที่ลดได้ต่อปี</span>
                        <strong className={styles.valueds}>
                          {results.savingsPerYear?.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '-'} บาท
                        </strong>
                      </div>
                    </li>


                    <li>
                      <div className={styles.rowds}>
                        <span className={styles.bullet}></span>
                        <span className={styles.labelds}>ค่าไฟที่ประหยัดได้ใน 25 ปี</span>
                        <strong className={styles.valueds}>{results.savingsIn25Years?.toLocaleString() || '-'} บาท</strong>
                      </div>
                    </li>

                    <li>
                      <div className={styles.rowds}>
                        <span className={styles.bullet}></span>
                        <span className={styles.labelds}>การใช้ไฟเฉลี่ยต่อเดือน</span>
                        <strong className={styles.valueds}>{results.usageUnits?.toFixed(0) || '-'} kW</strong>
                      </div>
                    </li>

                    <li>
                      <div className={styles.rowds}>
                        <span className={styles.bullet}></span>
                        <span className={styles.labelds}>การใช้ไฟเฉลี่ยต่อวัน</span>
                        <strong className={styles.valueds}>{results.averageDailyUnits?.toFixed(0) || '-'} kW</strong>
                      </div>
                    </li>
                  </ul>


                </div>

              </div>
            </div>

            {/* ปุ่มคำนวณใหม่ (อยู่นอก grid) */}
            <div className={styles.buttonWrapper} style={{ display: 'flex', gap: '10px' }}>
              <button
                className="buttonSecondaryonebule"
                onClick={() => {
                  setResults(null);
                  setAttemptedRoofInput(false);
                  document.querySelector(`.${styles.formWrapper}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                suppressHydrationWarning
                style={{ marginBottom: '1rem' }}
              >
                คำนวณใหม่
              </button>

              <button
                className="buttonPrimary"
                onClick={handlePrintScreenshot}
                suppressHydrationWarning
              >
                ปริ้นผลการคำนวณขนาดติดตั้ง
              </button>
            </div>



          </>
        )}

      </div>
    </div >
  );
}