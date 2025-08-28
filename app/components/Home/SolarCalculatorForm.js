'use client';

import React, { useState } from 'react';
import styles from './SolarForm.module.css';
import { products } from '@/app/data/products';
import { BsDash } from "react-icons/bs";

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
  const [attemptedRoofInput, setAttemptedRoofInput] = useState(false);

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

  const handleChange = (field) => (e) => {
    let value = e.target.value;

    if (field === 'electricityCost') {
      value = value.replace(/,/g, '');
      if (!/^\d*$/.test(value)) return;
    }

    if (field === 'roofArea') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        const roofNum = parseFloat(value);

        // เช็คว่าค่าที่พิมพ์เกินช่วงไหม
        let roofError = null;
        let maxArea = formValues.systemType === 'single' ? 45 : 179;
        let minArea = formValues.systemType === 'single' ? 9 : 45;

        if (value !== '' && !isNaN(roofNum)) {
          if (roofNum < minArea) {
            roofError = `*พื้นที่สำหรับ ${formValues.systemType === 'single' ? '1 เฟส' : '3 เฟส'} ต้องไม่ต่ำกว่า ${minArea} ตารางเมตร.`;
          } else if (roofNum > maxArea) {
            roofError = `*พื้นที่สำหรับ ${formValues.systemType === 'single' ? '1 เฟส' : '3 เฟส'} ต้องไม่เกิน ${maxArea} ตารางเมตร.`;
            // ไม่อัพเดตค่าถ้าเกินขีดจำกัด
            return; // หยุดไม่ให้พิมพ์ค่าที่เกิน
          }
        }

        setErrors((prev) => ({ ...prev, roofArea: roofError }));
      } else {
        return; // ไม่อนุญาตพิมพ์อะไรที่ไม่ใช่ตัวเลขและจุด
      }
    }

    setFormValues((prev) => ({ ...prev, [field]: value }));

    // Reset error เฉพาะ field นี้ ถ้าไม่มี error ใหม่
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
    if (!systemType) return [];

    // แปลงค่า systemType ให้ตรงกับ power_system ใน data
    const powerSystemText = systemType === 'single' ? '1 เฟส' : '3 เฟส';

    const solarCategory = products.find((cat) => cat.id === 'solar1'); // Solar Rooftop category
    if (!solarCategory) return [];

    const matchedItems = [];

    solarCategory.brands.forEach((brand) => {
      brand.packages.forEach((pkg) => {
        pkg.items.forEach((item) => {
          if (item.power_system === powerSystemText) {
            matchedItems.push({
              brandName: brand.name,
              packageName: pkg.name,
              ...item,
            });
          }
        });
      });
    });

    return matchedItems;
  };

  return (
    <div className={styles.containersolar}>
      <div className={styles.formWrapper}>
        <h1 className={styles.headersolar}>
          {!results ? 'ระบบคำนวณขนาด Solar Rooftop ที่เหมาะสม' : 'ผลการคำนวณขนาดติดตั้ง'}
        </h1>

        {!results && (
          <form noValidate onSubmit={handleSubmit}>
            <div className={styles.row}>
              <div className={`${styles.formGroup} ${styles.flexGrow}`}>
                <label className="form-label">ค่าไฟฟ้าต่อเดือน (บาท) :</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-field ${errors.electricityCost ? 'input-error' : ''}`}
                  placeholder="กรุณากรอกค่าไฟต่อเดือนของท่าน**"
                  value={formValues.electricityCost !== '' ? Number(formValues.electricityCost).toLocaleString('en-US') : ''}
                  onChange={handleChange('electricityCost')}
                />
                {errors.electricityCost && <div className="error-text">{errors.electricityCost}</div>}
              </div>

              <div className="form-group align-right">
                <label className="form-label" style={{ marginBottom: '1rem' }}>
                  ระบบไฟฟ้า :
                </label>

                <div className={`radio-group ${errors.systemType ? 'error-border' : ''}`}>
                  <label className="form-radio">
                    <input
                      type="radio"
                      name="systemType"
                      value="single"
                      checked={formValues.systemType === 'single'}
                      onChange={handleChange('systemType')}
                      className="radio-input"
                    />
                    1 เฟส
                  </label>

                  <label className="form-radio">
                    <input
                      type="radio"
                      name="systemType"
                      value="three"
                      checked={formValues.systemType === 'three'}
                      onChange={handleChange('systemType')}
                      className="radio-input"
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


            <label className="form-label">เปอร์เซ็นต์การใช้ไฟฟ้าในช่วงกลางวันและกลางคืน</label>
            <input
              type="range"
              min="0"
              max="100"
              value={formValues.dayUsage}
              onChange={(e) => setFormValues((prev) => ({ ...prev, dayUsage: Number(e.target.value) }))}
              className={styles.rangeControl}
              style={{
                background: `linear-gradient(to right, #E88534 ${formValues.dayUsage}%, #F2F2F2 ${formValues.dayUsage}%)`,
              }}
            />
            <div className={styles.usageSplit}>
              <span>ช่วงกลางวัน {formValues.dayUsage} %</span>
              <span>ช่วงกลางคืน {100 - formValues.dayUsage} %</span>
            </div>


            <div className={styles.formGroup}>
              <label className="form-label">
                พื้นที่หลังคาโดยประมาณ (ตารางเมตร) :</label>
              <input
                type="text"
                inputMode="decimal"
                className={`form-field ${errors.roofArea ? 'input-error' : ''}`}
                disabled={!formValues.systemType}
                value={formValues.roofArea}
                onChange={handleChange('roofArea')}
                placeholder={
                  formValues.systemType
                    ? formValues.systemType === 'single'
                      ? 'กรอกพื้นที่หลังคา : 9-45 ตารางเมตร'
                      : 'กรอกพื้นที่หลังคา : 45-179 ตารางเมตร'
                    : 'กรุณาเลือกระบบไฟฟ้าก่อน**'
                }
                style={{
                  backgroundColor: !formValues.systemType ? '#f5f5f5' : 'white',
                  cursor: !formValues.systemType ? 'not-allowed' : 'text',
                }}
              />
              {errors.roofArea && <div className="error-text">{errors.roofArea}</div>}
              {!formValues.systemType && (
                <div className="error-text" >
                  *กรุณาเลือกระบบไฟฟ้าก่อนจึงจะสามารถกรอกพื้นที่หลังคาได้
                </div>
              )}
            </div>

            {/* <h6 className={styles.instructions}>
              หมายเหตุ : ระบบไฟ 1 เฟส จะต้องระบุพื้นที่หลังคาให้อยู่ในช่วง 9-45 ตารางเมตร
            </h6>
            <h6 className={styles.instructions1} style={{ marginLeft: '4rem' }}>
              ระบบไฟ 3 เฟส จะต้องระบุพื้นที่หลังคาให้อยู่ในช่วง 45-179 ตารางเมตร
            </h6> */}

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
            <h4 style={{ textAlign: 'center', marginTop: '-10px' ,marginBottom: '20px' }}>
              แพ็กเกจที่ออกแบบมาให้เหมาะกับพื้นที่หลังคาและรูปแบบการใช้พลังงานของคุณ
            </h4>
            <div className={styles.recommendCard}>
              <div className={styles.headerOrange}>
                <img src="/icons/solar-energy.png" alt="Solar panel" className={styles.iconLarge} />
                <div>
                  <div className={styles.labelhead}>ขนาดระบบที่แนะนำ</div>
                  <div className={styles.valueLarge}>{results.recommended}</div>
                </div>
              </div>

              <div className={styles.rowWhite}>
                <img src="/icons/coin.png" alt="Bill" className={styles.iconMedium} />
                <div className={styles.label}>ค่าไฟที่ลดได้ต่อเดือน :</div>
                <div className={styles.value}>{results.savingsPerMonth?.toLocaleString() || 'XXX'} บาท</div>
              </div>

              <div className={styles.rowSimple}>
                <img src="/icons/sun1.png" alt="Day" className={styles.iconMedium} />

                <div className={styles.label}>การใช้ไฟช่วงกลางวัน :</div>
                <div className={styles.value}>{results.dayUnits?.toFixed(2)} kW ({results.dayUsage}%)</div>
              </div>

              <div className={styles.rowSimple}>
                <img src="/icons/night.png" alt="Night" className={styles.iconMedium} />
                <div className={styles.label}>การใช้ไฟช่วงกลางคืน :</div>
                <div className={styles.value}> {results.nightUnits?.toFixed(2)} kW ({(100 - results.dayUsage).toFixed(2)}%)</div>
              </div>

              <div className={styles.section}>
                <div className={styles.paybackRow}>
                  <div className={styles.paybackTitle}>ระยะเวลาคืนทุน</div>
                  <div className={styles.paybackValue}>
                    {results.paybackPeriod || '-'} ปี</div>
                </div>
                <div className={styles.paybackNote}>Solar Rooftop เพื่อลดค่าไฟฟ้าอย่างยั่งยืน</div>

                <ul className={styles.paybackList}>
                  <li className={styles.record}>
                    <div
                      style={{
                        width: '10px',
                        height: '3px',
                        background: 'linear-gradient(to right, #E88534, #f87325ff)',
                        borderRadius: '4px',
                        marginRight: '8px', // ← เพิ่มระยะห่างด้านขวา
                      }}
                    >
                    </div>
                    <div className={styles.labelone}>ค่าไฟที่ลดได้ต่อปี :</div>
                    <div className={`${styles.valueone} font-500`}>
                      {results.savingsPerYear?.toLocaleString() || '-'} บาท</div>

                  </li>
                  <li className={styles.record}>
                    <div
                      style={{
                        width: '10px',
                        height: '3px',
                        background: 'linear-gradient(to right, #E88534, #f87325ff)',
                        borderRadius: '4px',
                        marginRight: '8px', // ← เพิ่มระยะห่างด้านขวา
                      }}
                    ></div>
                    <div className={styles.labelone}>ค่าไฟที่ประหยัดได้ใน 25 ปี :</div>
                    <div className={`${styles.valueone} font-500`}>
                      {results.savingsIn25Years?.toLocaleString() || '-'} บาท</div>

                  </li>
                  <li className={styles.record}>

                    <div
                      style={{
                        width: '10px',
                        height: '3px',
                        background: 'linear-gradient(to right, #E88534, #f87325ff)',
                        borderRadius: '4px',
                        marginRight: '8px', // ← เพิ่มระยะห่างด้านขวา
                      }}
                    ></div>

                    <div className={styles.labelone}>การใช้ไฟเฉลี่ยต่อเดือน :</div>
                    <div className={`${styles.valueone} font-500`}>
                      {results.usageUnits?.toFixed(2) || '-'} KW</div>

                  </li>

                  <li className={styles.record}>
                    <div
                      style={{
                        width: '10px',
                        height: '3px',
                        background: 'linear-gradient(to right, #E88534, #f87325ff)',
                        borderRadius: '4px',
                        marginRight: '8px', // ← เพิ่มระยะห่างด้านขวา
                      }}
                    ></div>
                    <div className={styles.labelone}>การใช้ไฟเฉลี่ยต่อวัน :</div>
                    <div className={`${styles.valueone} font-500`}>
                      {results.averageDailyUnits?.toFixed(2) || '-'} KW</div>

                  </li>
                </ul>
              </div>

              <h4 className={styles.packageTitle}>แพ็กเกจที่เราแนะนำ</h4>
              <p className={styles.systemType}>
                ระบบไฟฟ้า {formValues.systemType === 'single' ? '1 เฟส' : '3 เฟส'}
              </p>

              <div className={styles.productList}>
                {getRecommendedItems(formValues.systemType).length === 0 && (
                  <p>ไม่พบสินค้าที่แนะนำสำหรับระบบนี้</p>
                )}
                {getRecommendedItems(formValues.systemType).map((item) => (
                  <div key={item.id} className={styles.productCard}>
                    <img src={item.mainImage} alt={item.packageName} className={styles.productImage} />
                    <div className={styles.productInfo}>
                      <h5>{item.packageName}</h5>
                      <p><strong>แบรนด์:</strong> {item.brandName}</p>
                      <p><strong>ขนาด:</strong> {item.size}</p>
                      <p>{item.price.toLocaleString()} บาท</p>
                      {/* <p><strong>พื้นที่โดยประมาณ:</strong> {item.area}</p> */}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.buttonWrapper}>
                <button
                  className="buttonSecondaryonebule"
                  onClick={() => {
                    setResults(null);
                    setAttemptedRoofInput(false);
                    document.querySelector(`.${styles.formWrapper}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  คำนวณใหม่
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div >
  );
}

