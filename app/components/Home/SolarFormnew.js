'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { MdOutlineElectricBolt, MdSunny } from 'react-icons/md';
import { IoMdMoon } from 'react-icons/io';
import { TbCurrencyBaht } from 'react-icons/tb';
import styles from './SolarFormnew.module.css';

// อ่านค่า Environment สำหรับ API
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/**
 * แคปเจอร์ภาพผลลัพธ์และเปิดหน้าต่างปริ้นอัตโนมัติ
 */
const handlePrintScreenshot = () => {
  const element = document.querySelector(`.${styles.resultGrid}`);
  if (!element) {
    alert('ไม่พบส่วนที่ต้องการแคป');
    return;
  }

  html2canvas(element, { scale: 2 })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('ไม่สามารถเปิดหน้าปริ้นได้');
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>ปริ้นภาพผลลัพธ์</title>
            <style>
              @page { size: landscape; margin: 0; }
              body {
                margin: 0; padding: 0;
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                background: #fff;
                font-family: sans-serif;
              }
              h1 {
                font-size: clamp(1.2rem, 5vw, 2rem);
                font-weight: 600;
                color: #F2780C;
                text-align: center;
                margin-bottom: 0.5rem;
              }
              img {
                max-width: 90%;
                height: auto;
                display: block;
              }
            </style>
          </head>
          <body>
            <h1>ผลการคำนวณขนาดติดตั้ง</h1>
            <img src="${imgData}" alt="ผลการคำนวณขนาดติดตั้ง" />
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    })
    .catch((err) => {
      console.error('เกิดข้อผิดพลาดในการแคปภาพ:', err);
    });
};

/**
 * คำนวณขนาดระบบโซลาร์และผลตอบแทน
 */
const calculateSolarSize = (electricityCost, dayUsage, installationCost = 0) => {
  const usageUnits = electricityCost / 5; // สมมุติ 1 หน่วยไฟ = 5 บาท
  const averageDailyUnits = usageUnits / 30;
  const dayUnits = averageDailyUnits * (dayUsage / 100);
  const nightUnits = averageDailyUnits - dayUnits;
  const totalDayUsage = usageUnits * (dayUsage / 100);

  // ตารางขนาดระบบตามกำลังไฟสูงสุด
  const sizeTable = [
    { size: '1.8 kW', max: 270 },
    { size: '3.1 kW', max: 465 },
    { size: '5 kW', max: 750 },
    { size: '10 kW', max: 1500 },
    { size: '15 kW', max: 2250 },
    { size: '20 kW', max: 3000 },
    { size: '25 kW', max: 3750 },
    { size: '30 kW', max: 4500 },
    { size: '35 kW', max: 5250 },
    { size: '40 kW', max: 6000 },
  ];

  const recommendedItem = sizeTable.find((item) => totalDayUsage <= item.max);
  const recommended = recommendedItem?.size || 'เกิน 60 kW';

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
  // จัดเก็บค่าจากแบบฟอร์ม
  const [formValues, setFormValues] = useState({
    electricityCost: '',
    systemType: '',
    roofArea: '',
    dayUsage: 60,
  });

  // สถานะและข้อมูลอื่น ๆ
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [attemptedRoofInput, setAttemptedRoofInput] = useState(false);

  /**
   * โหลดข้อมูลสินค้าเมื่อ component mount ครั้งแรก
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/productpageapi`, {
          headers: { 'X-API-KEY': apiKey },
        });

        if (!res.ok) {
          console.error('การเชื่อมต่อ API ล้มเหลว');
          return;
        }

        const data = await res.json();
        if (data.status && data.result?.data) {
          setProductsData(data.result.data);
        } else {
          console.error('ข้อมูลจาก API ไม่ถูกต้อง:', data.message);
        }
      } catch (err) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', err);
      }
    };

    fetchProducts();
  }, []);

  /**
   * ตรวจสอบค่าที่กรอกในฟอร์ม
   */
  const validate = () => {
    const newErrors = {};

    // ตรวจสอบค่าไฟฟ้า
    if (!formValues.electricityCost) {
      newErrors.electricityCost = '*กรุณากรอกค่าไฟฟ้า';
    } else if (isNaN(Number(formValues.electricityCost)) || Number(formValues.electricityCost) <= 0) {
      newErrors.electricityCost = '*กรุณากรอกค่าไฟฟ้าเป็นตัวเลขบวก';
    }

    // ตรวจสอบระบบไฟฟ้า
    if (!formValues.systemType) {
      newErrors.systemType = '*กรุณาเลือกระบบไฟฟ้า';
    }

    // ตรวจสอบพื้นที่หลังคา
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

  /**
   * เมื่อมีการกรอกข้อมูลในฟิลด์ฟอร์ม
   */
  const handleChange = (field) => (e) => {
    let value = e.target.value;

    // เฉพาะค่าไฟฟ้า: รับเฉพาะตัวเลข
    if (field === 'electricityCost') {
      value = value.replace(/,/g, '');
      if (!/^\d*$/.test(value)) return;
    }

    // เฉพาะพื้นที่หลังคา: ตรวจสอบค่าช่วง
    if (field === 'roofArea') {
      setAttemptedRoofInput(true);

      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        const roofNum = parseFloat(value);
        let roofError = null;

        const maxArea = formValues.systemType === 'single' ? 45 : 179;
        const minArea = formValues.systemType === 'single' ? 9 : 45;

        if (value !== '' && !isNaN(roofNum)) {
          if (roofNum < minArea)
            roofError = `*พื้นที่สำหรับ ${formValues.systemType === 'single' ? '1 เฟส' : '3 เฟส'} ต้องไม่ต่ำกว่า ${minArea} ตารางเมตร.`;
          else if (roofNum > maxArea) return;
        }

        setErrors((prev) => ({ ...prev, roofArea: roofError }));
      } else return;
    }

    // อัปเดตค่าใน state หลัก
    setFormValues((prev) => ({ ...prev, [field]: value }));

    // ลบข้อความ error เมื่อผู้ใช้แก้ไขค่าถูกต้อง
    setErrors((prevErrors) => {
      if (!prevErrors[field]) return prevErrors;
      const updated = { ...prevErrors };
      delete updated[field];
      return updated;
    });
  };

  /**
   * เมื่อผู้ใช้กด "คำนวณ"
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const electricityCostNum = Number(formValues.electricityCost);
    const roofAreaNum = Number(formValues.roofArea);
    const { systemType, dayUsage } = formValues;

    // ตรวจสอบช่วงค่าพื้นที่หลังคาอีกครั้งเพื่อความปลอดภัย
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

  /**
   * รีเซ็ตข้อมูลทั้งหมดกลับค่าเริ่มต้น
   */
  const handleReset = () => {
    setFormValues({
      electricityCost: '',
      systemType: '',
      roofArea: '',
      dayUsage: 60,
    });
    setErrors({});
    setResults(null);
    setAttemptedRoofInput(false);
  };

  /**
   * ดึงสินค้าที่แนะนำตามประเภทระบบไฟฟ้า
   */
  /**
   * ดึงสินค้าที่ตรงกับผลลัพธ์ (phase + ขนาดระบบที่แนะนำ)
   */
  /**
   * ดึงสินค้าแนะนำ 1–2 รายการ ที่ตรงหรือใกล้เคียงผลลัพธ์ที่คำนวณได้
   */
  const getRecommendedItems = (systemType, recommendedSize) => {
    if (!systemType || !recommendedSize || productsData.length === 0) return [];

    const phase = systemType === 'single' ? '1' : '3';
    const targetSize = parseFloat(recommendedSize); // เช่น 30 จาก "30 kW"

    // ปรับ tolerance เป็น ±5 kW
    const tolerance = 5;

    // กรองสินค้าตาม phase และขนาดที่อยู่ในช่วง ±5 kW
    const filtered = productsData
      .filter((item) => item.phase === phase && item.installationsize.includes('kW'))
      .map((item) => ({
        ...item,
        sizeNum: parseFloat(item.installationsize),
      }))
      .filter(
        (item) =>
          !isNaN(item.sizeNum) &&
          item.sizeNum >= targetSize - tolerance &&
          item.sizeNum <= targetSize + tolerance
      );

    //  จุดที่ควรใส่ log
    console.log('Recommended Size:', recommendedSize);
    console.log('Products matched:', filtered.map((i) => i.modelname));

    if (filtered.length === 0) return []; // ❌ ไม่มีสินค้าในเกณฑ์

    // เรียงลำดับจากที่ใกล้เคียงที่สุด
    const sortedByClosest = filtered.sort(
      (a, b) => Math.abs(a.sizeNum - targetSize) - Math.abs(b.sizeNum - targetSize)
    );

    // ลบสินค้าซ้ำกัน (ชื่อรุ่นเดียวกัน)
    const unique = [];
    const seen = new Set();
    for (const item of sortedByClosest) {
      if (!seen.has(item.modelname)) {
        seen.add(item.modelname);
        unique.push(item);
      }
    }

    // แสดงเฉพาะ 1–2 รายการ
    return unique.slice(0, 2);
  };


  const recommendedItems = getRecommendedItems(formValues.systemType, results?.recommended);

  return (
    <div className={styles.containersolar}>
      {/* กล่องหลักของหน้า: แบ่งโหมดแบบฟอร์ม และโหมดแสดงผลลัพธ์ */}
      <div
        className={`${styles.formWrapper} ${results ? styles.formWrapperResult : styles.formWrapperInitial
          }`}
      >
        {/* หัวข้อหลักของหน้า */}
        <h1
          className={styles.headtitleonesolar}
          lang="th"
          style={{ marginBottom: '1rem', marginTop: '-0.5rem' }}
        >
          {!results ? (
            <>
              ระบบคำนวณขนาด <span className="keep-together">Solar Rooftop</span>{' '}
              <span className="keep-together">ที่เหมาะสม</span>
            </>
          ) : (
            <>
              ผลการคำนวณขนาดติดตั้ง
            </>
          )}
        </h1>

        {/* ======================= */}
        {/* แบบฟอร์มคำนวณ (แสดงเมื่อยังไม่มีผลลัพธ์) */}
        {/* ======================= */}
        {!results && (
          <form noValidate onSubmit={handleSubmit}>
            {/* แถวแรก: ช่องกรอกค่าไฟฟ้า และเลือกระบบไฟฟ้า */}
            <div className={styles.row}>
              {/* ช่องกรอกค่าไฟฟ้า */}
              <div className={`${styles.formGroup} ${styles.flexGrow}`}>
                <label htmlFor="electricityCost" className="form-label">
                  ค่าไฟฟ้าต่อเดือน (บาท) :
                </label>

                <input
                  id="electricityCost"
                  name="electricityCost"
                  type="text"
                  inputMode="numeric"
                  className={`form-field ${errors.electricityCost ? 'input-error' : ''
                    }`}
                  placeholder="กรุณากรอกค่าไฟต่อเดือนของท่าน**"
                  value={
                    formValues.electricityCost !== ''
                      ? Number(formValues.electricityCost).toLocaleString('en-US')
                      : ''
                  }
                  onChange={handleChange('electricityCost')}
                  autoComplete="off"
                  suppressHydrationWarning
                />

                {/* แสดงข้อความ error (ถ้ามี) */}
                {errors.electricityCost && (
                  <div className="error-text">{errors.electricityCost}</div>
                )}
              </div>

              {/* เลือกระบบไฟฟ้า (1 เฟส / 3 เฟส) */}
              <div className="form-group align-right">
                <span className="form-label" style={{ marginBottom: '1rem' }}>
                  ระบบไฟฟ้า :
                </span>

                <div
                  className={`radio-group ${errors.systemType ? 'error-border' : ''
                    }`}
                >
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

                {/* แสดงข้อความ error (ถ้ามี) */}
                {errors.systemType && (
                  <div className="error-text" style={{ marginTop: '0.5rem' }}>
                    {errors.systemType}
                  </div>
                )}
              </div>
            </div>

            {/* ======================= */}
            {/* สไลเดอร์เลือกเปอร์เซ็นต์ใช้ไฟกลางวัน / กลางคืน */}
            {/* ======================= */}
            <label htmlFor="dayUsage" className="form-label">
              เปอร์เซ็นต์การใช้ไฟฟ้า{' '}
              <span className={styles.keepTogethersolar}>
                ในช่วงกลางวันและกลางคืน :
              </span>
            </label>

            <input
              id="dayUsage"
              name="dayUsage"
              type="range"
              min="0"
              max="100"
              value={formValues.dayUsage}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  dayUsage: Number(e.target.value),
                }))
              }
              className={styles.rangeControl}
              style={{
                background: `linear-gradient(to right, #F2780C ${formValues.dayUsage}%, #F2F2F2 ${formValues.dayUsage}%)`,
              }}
              suppressHydrationWarning
            />

            {/* แสดงผลเปอร์เซ็นต์แบบคู่กลางวัน-กลางคืน */}
            <div className={styles.usageSplit}>
              <span className={styles.day}>
                <span className={styles.text}>ช่วงกลางวัน</span>
                <MdSunny className={styles.icon} />
                {formValues.dayUsage} %
              </span>

              <span className={styles.night}>
                <span className={styles.text}>ช่วงกลางคืน</span>
                <IoMdMoon className={styles.icon} />
                {100 - formValues.dayUsage} %
              </span>
            </div>

            {/* ======================= */}
            {/* ช่องกรอกพื้นที่หลังคา */}
            {/* ======================= */}
            <div className={styles.formGroup}>
              <label htmlFor="roofArea" className="form-label">
                พื้นที่หลังคาโดยประมาณ
                <span className={styles.unit}> (ตารางเมตร) :</span>
              </label>

              <input
                id="roofArea"
                name="roofArea"
                type="text"
                inputMode="decimal"
                className={`form-field ${errors.roofArea ? 'input-error' : ''
                  }`}
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
                  backgroundColor: !formValues.systemType
                    ? '#f5f5f5'
                    : 'white',
                  cursor: !formValues.systemType ? 'not-allowed' : 'text',
                }}
                autoComplete="off"
                suppressHydrationWarning
              />

              {/* ข้อความแจ้งเตือน / error */}
              {errors.roofArea && (
                <div className="error-text">{errors.roofArea}</div>
              )}
              {!formValues.systemType && (
                <div className="error-text">
                  *กรุณาเลือกระบบไฟฟ้าก่อนจึงจะสามารถกรอกพื้นที่หลังคาได้
                </div>
              )}
            </div>

            {/* ======================= */}
            {/* หมายเหตุเพิ่มเติมสำหรับผู้ใช้ */}
            {/* ======================= */}
            <h6
              className={`${styles.instructions} ${styles.hideOnMobile}`}
            >
              <span style={{ color: 'red', fontWeight: '600' }}>หมายเหตุ :</span>{' '}
              ระบบไฟ 1 เฟส ต้องระบุพื้นที่หลังคา 9 – 45 ตารางเมตร
            </h6>
            <h6
              className={`${styles.instructions1} ${styles.hideOnMobile}`}
              style={{ marginLeft: '4rem' }}
            >
              ระบบไฟ 3 เฟส ต้องระบุพื้นที่หลังคา 45 – 179 ตารางเมตร
            </h6>

            {/* ======================= */}
            {/* ปุ่มควบคุม (คำนวณ / รีเซ็ต) */}
            {/* ======================= */}
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

        {/* =============================== */}
        {/* ส่วนหัวของผลลัพธ์ */}
        {/* =============================== */}
        {results && (
          <>
            <h4 className={styles.headtitelsolar}>
              แพ็กเกจที่ออกแบบมาให้เหมาะกับพื้นที่หลังคา และรูปแบบการใช้พลังงานของคุณ
            </h4>

            {/* =============================== */}
            {/* กล่องผลลัพธ์หลัก (Result Grid) */}
            {/* =============================== */}
            <div className={styles.resultGrid}>
              {/* ===================== */}
              {/* แถวบน: ขนาดระบบ / คืนทุน */}
              {/* ===================== */}
              <div className={styles.topGrid}>
                {/* กล่องแสดง "ขนาดระบบที่แนะนำ" */}
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

                {/* กล่องแสดง "ระยะเวลาคืนทุน" */}
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
                  <p className={styles.subtext}>
                    Solar Rooftop เพื่อลดค่าไฟฟ้าอย่างยั่งยืน
                  </p>
                </div>
              </div>

              {/* ===================== */}
              {/* แถวล่าง: แพ็กเกจ / ผลตอบแทน */}
              {/* ===================== */}
              <div className={styles.bottomGrid}>
                {/* -------------------------------------- */}
                {/* กล่องซ้าย: แสดงแพ็กเกจสินค้าที่แนะนำ */}
                {/* -------------------------------------- */}
                <div className={styles.resultBoxL}>
                  <h4 className={styles.packageTitle}>แพ็กเกจที่เราแนะนำ</h4>
                  <p className={`${styles.systemType} ${styles['with-lines']}`}>
                    ระบบไฟฟ้า {formValues.systemType === 'single' ? '1 เฟส' : '3 เฟส'}
                  </p>

                  {/* รายการสินค้าแนะนำ */}
                  <div className="productListWrapper">
                    <div className={styles.productList}>
                      {recommendedItems && recommendedItems.length > 0 ? (
                        recommendedItems.map((item, idx) => {
                          // เตรียมข้อมูลพื้นฐานสินค้า
                          let gallery = [];
                          try {
                            gallery = item.gallery ? JSON.parse(item.gallery) : [];
                          } catch {
                            gallery = [];
                          }

                          const mainImage =
                            gallery.length > 0 ? `${baseUrl}/${gallery[0]}` : '/images/no-image.png';

                          const name =
                            item.modelname ||
                            item.modelairname ||
                            item.solarpanel ||
                            item.productbrandName ||
                            item.name ||
                            'ไม่พบข้อมูลชื่อ';

                          const brandID =
                            item.productbrandID ||
                            item.probrandID ||
                            item.brandID ||
                            item.BrandID ||
                            '0';

                          const productTypeID =
                            item.producttypeID || item.protypeID || item.product_typeID || '0';

                          const productNum = item.product_num || item.product_ID || idx;

                          const size = item.installationsize || item.size || '';
                          const battery = item.battery || null;

                          // คำนวณราคาโปรโมชั่น
                          let finalPrice = null;
                          if (item.isprice === '1' && item.price) {
                            if (item.productpro_ispromotion === '1' && item.productpro_percent) {
                              const p = parseFloat(item.productpro_percent) || 0;
                              finalPrice = item.price - (item.price * p) / 100;
                            } else {
                              finalPrice = item.price;
                            }
                          }

                          // ลิงก์สินค้า
                          const productHref = `/products/${productTypeID}/${brandID}/${productNum}`;
                          // ตัวแปรจับการ drag (ไม่ใช้ useState)
                          let dragStart = { x: 0, y: 0 };
                          let isDragging = false;

                          const handleMouseDown = (e) => {
                            dragStart = { x: e.clientX, y: e.clientY };
                          };

                          const handleMouseUp = (e) => {
                            const dx = Math.abs(e.clientX - dragStart.x);
                            const dy = Math.abs(e.clientY - dragStart.y);
                            isDragging = dx > 5 || dy > 5;
                          };

                          // Log การคลิกสินค้า
                          const handleLogClick = async (e) => {
                            if (isDragging) {
                              e.preventDefault();
                              return;
                            }
                            try {
                              const logData = {
                                actionType: '1',
                                actionDetail: `Solar Calculator คลิกดูสินค้า: ${name}`,
                                typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
                                datatype: 'ผลิตภัณฑ์',
                                dataID: productNum,
                                datatypeID: '1',
                                brandtype: productTypeID,
                                dataname: name,
                              };

                              await fetch(`${baseUrl}/log/saveLog`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: apiKey,
                                },
                                body: JSON.stringify(logData),
                              });
                            } catch (err) {
                              console.error('❌ เกิดข้อผิดพลาดในการบันทึก Log:', err);
                            }
                          };

                          // Render card
                          return (
                            <Link
                              key={productNum}
                              href={productHref}
                              prefetch={false}
                              style={{ textDecoration: 'none' }}
                              onMouseDown={handleMouseDown}
                              onMouseUp={handleMouseUp}
                              onClick={handleLogClick}
                            >
                              <div
                                className={`${styles.productCard} fade-in`}
                                style={{
                                  cursor: 'pointer',
                                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                }}
                              >
                                {/* รูปภาพสินค้า */}
                                <div className="product-image-wrapper" style={{ position: 'relative' }}>
                                  <Image
                                    src={mainImage}
                                    alt={name}
                                    width={330}
                                    height={330}
                                    style={{ objectFit: 'cover' }}
                                    draggable={false}
                                  />
                                  {item.productpro_ispromotion === '1' && item.productpro_percent && (
                                    <div className="product-promo-ribbon">- {item.productpro_percent}</div>
                                  )}
                                </div>

                                {/* ข้อมูลสินค้า */}
                                <div
                                  className="product-info"
                                  style={{
                                    padding: '0.75rem 1rem 1rem',
                                    textAlign: 'left',
                                  }}
                                >
                                  {/* ชื่อสินค้า */}
                                  <h3
                                    style={{
                                      margin: '0.25rem 0',
                                      fontSize: '1.05rem',
                                      fontWeight: 600,
                                      color: '#264798',
                                    }}
                                  >
                                    {name}
                                  </h3>

                                  {/* รุ่นแบตเตอรี่ */}
                                  {battery && (
                                    <h6 style={{ margin: 0, color: '#666' }}>รุ่นแบตเตอรี่ {battery} kWh</h6>
                                  )}

                                  {/* ขนาดระบบ */}
                                  {size && (
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        marginTop: '0.6rem',
                                        gap: '4px',
                                      }}
                                    >
                                      <MdOutlineElectricBolt size={22} color="#ffc300" />
                                      <p
                                        style={{
                                          margin: 0,
                                          fontWeight: 600,
                                          fontSize: 18,
                                          color: '#000000ff',
                                        }}
                                      >
                                        {size}
                                      </p>
                                    </div>
                                  )}

                                  {/* ราคา */}
                                  {item.isprice === '1' && item.price && (
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginTop: '0.8rem',
                                        fontSize: '20px',
                                        fontWeight: 600,
                                        color: '#000',
                                      }}
                                    >
                                      <TbCurrencyBaht size={22} />
                                      {Number(finalPrice ?? item.price).toLocaleString()} บาท
                                      {item.productpro_ispromotion === '1' && item.productpro_percent && (
                                        <span
                                          style={{
                                            fontSize: '15px',
                                            color: '#888',
                                            textDecoration: 'line-through',
                                            marginLeft: '4px',
                                          }}
                                        >
                                          {Number(item.price).toLocaleString()} บาท
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            textAlign: 'center',
                            color: '#777',
                            padding: '2rem 0',
                            fontSize: '1.1rem',
                            fontWeight: '500',
                          }}
                        >
                          ไม่พบสินค้าที่ตรงกับผลลัพธ์การคำนวณของคุณ
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                {/* -------------------------------------- */}
                {/* กล่องขวา: แสดงผลตอบแทนระบบโซลาร์ */}
                {/* -------------------------------------- */}
                <div className={styles.resultBox}>
                  <h4 className={styles.solarTitle}>ผลตอบแทนระบบโซลาร์</h4>

                  {/* ค่าไฟที่ลดต่อเดือน */}
                  <div className={styles.costRow}>
                    <div className={styles.leftGroup}>
                      <Image src="/icons/coin.png" alt="Bill" width={40} height={40} />
                      <span className={styles.costLabel}>ค่าไฟที่ลดต่อเดือน</span>
                    </div>
                    <span className={styles.costValue}>
                      {results.savingsPerMonth !== undefined
                        ? Number(results.savingsPerMonth.toFixed(0)).toLocaleString()
                        : 'XXX'}{' '}
                      บาท
                    </span>
                  </div>

                  {/* การใช้ไฟช่วงกลางวัน */}
                  <div className={styles.costRow}>
                    <div className={styles.leftGroup}>
                      <Image src="/icons/sun1.png" alt="Day" width={40} height={40} />
                      <span className={styles.costLabel}>ใช้ไฟช่วงกลางวัน</span>
                    </div>
                    <span className={styles.costValue}>
                      {results.dayUnits ? Math.floor(results.dayUnits) : 0} kW (
                      {results.dayUsage}%)
                    </span>
                  </div>

                  {/* การใช้ไฟช่วงกลางคืน */}
                  <div className={styles.costRow}>
                    <div className={styles.leftGroup}>
                      <Image src="/icons/night.png" alt="Night" width={40} height={40} />
                      <span className={styles.costLabel}>ใช้ไฟช่วงกลางคืน</span>
                    </div>
                    <span className={styles.costValue}>
                      {Math.floor(results.nightUnits)} kW (
                      {Math.floor(100 - results.dayUsage)}%)
                    </span>
                  </div>

                  {/* รายการสรุปผลเพิ่มเติม (List) */}
                  <ul className={styles.costList}>
                    <h4 className={styles.solardeteil}>ผลตอบแทนระบบโซลาร์</h4>

                    {/* ค่าไฟต่อปี */}
                    <li>
                      <div className={styles.rowds}>
                        <span className={styles.bullet}></span>
                        <span className={styles.labelds}>ค่าไฟที่ลดได้ต่อปี</span>
                        <strong className={styles.valueds}>
                          {results.savingsPerYear?.toLocaleString('th-TH', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }) || '-'}{' '}
                          บาท
                        </strong>
                      </div>
                    </li>

                    {/* ค่าไฟใน 25 ปี */}
                    <li>
                      <div className={styles.rowds}>
                        <span className={styles.bullet}></span>
                        <span className={styles.labelds}>
                          ค่าไฟที่ประหยัดได้ใน 25 ปี
                        </span>
                        <strong className={styles.valueds}>
                          {results.savingsIn25Years?.toLocaleString() || '-'} บาท
                        </strong>
                      </div>
                    </li>

                    {/* การใช้ไฟเฉลี่ยต่อเดือน */}
                    <li>
                      <div className={styles.rowds}>
                        <span className={styles.bullet}></span>
                        <span className={styles.labelds}>การใช้ไฟเฉลี่ยต่อเดือน</span>
                        <strong className={styles.valueds}>
                          {results.usageUnits?.toFixed(0) || '-'} kW
                        </strong>
                      </div>
                    </li>

                    {/* การใช้ไฟเฉลี่ยต่อวัน */}
                    <li>
                      <div className={styles.rowds}>
                        <span className={styles.bullet}></span>
                        <span className={styles.labelds}>การใช้ไฟเฉลี่ยต่อวัน</span>
                        <strong className={styles.valueds}>
                          {results.averageDailyUnits?.toFixed(0) || '-'} kW
                        </strong>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* =============================== */}
            {/* ปุ่มด้านล่าง (คำนวณใหม่ / ปริ้นผล) */}
            {/* =============================== */}
            <div
              className={styles.buttonWrapper}
              style={{ display: 'flex', gap: '10px' }}
            >
              {/* ปุ่มคำนวณใหม่ */}
              <button
                className="buttonSecondaryonebule"
                onClick={() => {
                  setResults(null);
                  setAttemptedRoofInput(false);
                  document
                    .querySelector(`.${styles.formWrapper}`)
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                suppressHydrationWarning
                style={{ marginBottom: '1rem' }}
              >
                คำนวณใหม่
              </button>

              {/* ปุ่มปริ้นผลลัพธ์ */}
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