'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import Swal from 'sweetalert2';
import styles from '../../Home.module.css';
import { useSearchParams } from 'next/navigation';
import { useLocale } from '@/app/Context/LocaleContext';
import { validateFieldmoreInfo } from '@/app/Utils/validation';

export default function ContactForm({
  provinces = [],
  amphures = [],
  tambons = [],
  productOptions = [],
}) {
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const wrapperRef = useRef(null);

  const [formData, setFormData] = useState({
    product: '',
    package: '',
    usageTime: '',
    fullName: '',
    phone: '',
    district: '',
    subDistrict: '',
    province: '',
    contactTime: '',
  });

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* ✅ เคลียร์ error เมื่อพิมพ์ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  /* ✅ ตรวจสอบข้อมูล */
  const validate = (data = formData) => {
    const messages = {
      Infovalidate: {
        topic: '*กรุณาระบุสินค้าหรือบริการ',
        fullname: {
          fullnamenull: '*กรุณากรอกชื่อและนามสกุลของท่าน',
          name: '*ชื่อไม่ถูกต้อง (ห้ามมีตัวเลขหรืออักขระพิเศษ)',
        },
        phone: {
          phonenull: '*กรุณากรอกหมายเลขโทรศัพท์',
          phonenumber: '*หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก',
        },
      },
    };

    const infoErrors = validateFieldmoreInfo(
      {
        topic: data.product,
        name: data.fullName,
        phone: data.phone,
      },
      messages
    );

    if (!data.package) infoErrors.package = '*กรุณาเลือกแพ็คเกจ';
    if (!data.usageTime) infoErrors.usageTime = '*กรุณาระบุช่วงเวลาใช้ไฟ';
    if (!data.province) infoErrors.province = '*กรุณากรอกที่อยู่ของท่าน';
    if (!data.contactTime) infoErrors.contactTime = '*กรุณาเลือกช่วงเวลาติดต่อกลับ';

    return infoErrors;
  };

  /* ✅ Submit Form */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // ✅ รวมค่าที่อยู่ล่าสุดก่อน validate
    let updatedData = { ...formData };
    if (!formData.province && query.trim()) {
      updatedData = { ...formData, province: query.trim() };
      setFormData(updatedData);
    }

    const validationErrors = validate(updatedData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    const address = [updatedData.subDistrict, updatedData.district, updatedData.province]
      .filter(Boolean)
      .join(', ');

    const payload = {
      product: updatedData.product,
      package: updatedData.package,
      usageTime: updatedData.usageTime,
      fullName: updatedData.fullName,
      phone: updatedData.phone,
      subDistrict: updatedData.subDistrict,
      district: updatedData.district,
      province: updatedData.province,
      contactTime: updatedData.contactTime,
      address,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('ส่งข้อมูลไม่สำเร็จ');
      const result = await response.json();
      console.log('📩 ส่งข้อมูลสำเร็จ:', result);

      await Swal.fire({
        icon: 'success',
        title: 'ส่งข้อมูลเรียบร้อยแล้ว!',
        text: 'ขอบคุณที่สนใจโซลาร์เซลล์จากเรา ทีมงานจะติดต่อกลับโดยเร็วที่สุดค่ะ ☀️',
        showConfirmButton: false,
        timer: 2500,
      });

      setFormData({
        product: '',
        package: '',
        usageTime: '',
        fullName: '',
        phone: '',
        district: '',
        subDistrict: '',
        province: '',
        contactTime: '',
      });
      setQuery('');
      setSuggestions([]);
    } catch (err) {
      console.error('❌ ส่งข้อมูลล้มเหลว:', err);
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดในการส่งข้อมูล',
        text: 'กรุณาลองใหม่อีกครั้ง หรือเช็คการเชื่อมต่ออินเทอร์เน็ตค่ะ',
        confirmButtonColor: '#f2780c',
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ✅ handleQueryChange (ค้นหาได้ทั้งจังหวัด อำเภอ ตำบล) */
  const handleQueryChange = (e) => {
    const text = e.target.value.trim();
    setQuery(text);
    setErrors((prev) => {
      if (!prev.province) return prev;
      const updated = { ...prev };
      delete updated.province;
      return updated;
    });
    if (!text) return setSuggestions([]);

    const matched = [];

    // ✅ 1. ค้นจากชื่อตำบล
    tambons.forEach((t) => {
      if (t.name_th.includes(text)) {
        const amphure = amphures.find((a) => a.id === t.amphure_id);
        const province = provinces.find((p) => p.id === amphure?.province_id);
        matched.push({
          subDistrict: t.name_th,
          district: amphure?.name_th || '',
          province: province?.name_th || '',
        });
      }
    });

    // ✅ 2. ค้นจากชื่ออำเภอ
    amphures.forEach((a) => {
      if (a.name_th.includes(text)) {
        const province = provinces.find((p) => p.id === a.province_id);
        const tambonList = tambons.filter((t) => t.amphure_id === a.id);
        if (tambonList.length > 0) {
          tambonList.forEach((t) =>
            matched.push({
              subDistrict: t.name_th,
              district: a.name_th,
              province: province?.name_th || '',
            })
          );
        } else {
          matched.push({
            subDistrict: '',
            district: a.name_th,
            province: province?.name_th || '',
          });
        }
      }
    });

    // ✅ 3. ค้นจากชื่อจังหวัด
    provinces.forEach((p) => {
      if (p.name_th.includes(text)) {
        const amphuresInProvince = amphures.filter((a) => a.province_id === p.id);
        amphuresInProvince.forEach((a) => {
          const tambonsInAmphure = tambons.filter((t) => t.amphure_id === a.id);
          tambonsInAmphure.forEach((t) => {
            matched.push({
              subDistrict: t.name_th,
              district: a.name_th,
              province: p.name_th,
            });
          });
        });
        matched.push({
          subDistrict: '',
          district: '',
          province: p.name_th,
        });
      }
    });

    // ✅ 🔧 กรองรายการซ้ำก่อนแสดงผล
    const uniqueMatched = matched.filter(
      (v, i, a) =>
        a.findIndex(
          (t) =>
            t.subDistrict === v.subDistrict &&
            t.district === v.district &&
            t.province === v.province
        ) === i
    );

    setSuggestions(uniqueMatched.slice(0, 20));
  };

  /* ✅ handleSelect */
  const handleSelect = (item) => {
    const fullText = `${item.subDistrict ? item.subDistrict + ', ' : ''}${item.district ? item.district + ', ' : ''}${item.province}`;
    setQuery(fullText);
    setFormData((prev) => ({
      ...prev,
      subDistrict: item.subDistrict,
      district: item.district,
      province: item.province,
    }));
    setSuggestions([]);
  };

  /* ✅ useEffect */
  useEffect(() => {
    const matchedTambon = tambons.find((t) => t.name_th === formData.subDistrict);
    if (matchedTambon) {
      const amphure = amphures.find((a) => a.id === matchedTambon.amphure_id);
      const province = provinces.find((p) => p.id === amphure?.province_id);
      if (amphure && province) {
        setFormData((prev) => ({
          ...prev,
          district: amphure.name_th,
          province: province.name_th,
        }));
      }
    }

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const productFromUrl = searchParams.get('product');
    if (productFromUrl) {
      setFormData((prev) => ({ ...prev, product: productFromUrl }));
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.product;
        return updated;
      });

      const contactSection = document.getElementById('contact');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [formData.subDistrict, searchParams, tambons, amphures, provinces]);

  return (
    <div className={styles.containersolar}>
      <div className={styles.formWrapper} style={{ marginTop: '3rem' }}>
        <h1 className="headtitleone">สนใจโซลาร์เซลล์</h1>
        <h4
          style={{
            textAlign: 'center',
            marginTop: -10,
            marginBottom: 20,
            fontWeight: 600,
            color: '#19489D',
          }}
        >
          หรือต้องการปรึกษาการติดตั้ง เรายินดีให้คำแนะนำ
        </h4>

        <form onSubmit={handleSubmit}>
          {/* ===== สินค้า ===== */}
          <div>
            <span className="form-label">สินค้าหรือบริการที่สนใจ :</span>
            <div className={`radio-group ${errors.topic ? 'error-border' : ''}`}>
              {productOptions.map((product) => {
                const productName =
                  locale === 'th'
                    ? product.producttypenameTH
                    : product.producttypenameEN;
                return (
                  <label
                    key={product.producttypeID}
                    className="form-radio"
                    htmlFor={`product-${product.producttypeID}`}
                  >
                    <input
                      id={`product-${product.producttypeID}`}
                      type="radio"
                      name="product"
                      value={product.producttypeID}
                      checked={formData.product === product.producttypeID}
                      onChange={handleChange}
                      className="radio-input"
                    />
                    {productName}
                  </label>
                );
              })}
            </div>
            {errors.topic && <div className="error-text">{errors.topic}</div>}
          </div>

          {/* ===== แพ็คเกจ ===== */}
          <div className="form-select-wrapper">
            <label htmlFor="package" className="form-label">
              ราคาที่ยอมรับได้ :
            </label>
            <div className="custom-select-container" style={{ position: 'relative' }}>
              <select
                id="package"
                name="package"
                value={formData.package}
                onChange={handleChange}
                className={`form-select ${formData.package === '' ? 'placeholder' : ''} ${errors.package ? 'input-error' : ''}`}
              >
                <option value="" disabled hidden>
                  กรุณาเลือกราคาที่ยอมรับได้**
                </option>
                <option value="ประหยัด (ต่ำกว่า 100,000 บาท)">
                  ประหยัด (ต่ำกว่า 100,000 บาท)
                </option>
                <option value="กลาง (100,000 - 250,000 บาท)">
                  กลาง (100,000 - 250,000 บาท)
                </option>
                <option value="Premium (มากกว่า 250,000 บาท)">
                  Premium (มากกว่า 250,000 บาท)
                </option>
                <option value="ไม่แน่ใจ ต้องการให้เจ้าหน้าที่แนะนำ">
                  ไม่แน่ใจ ต้องการให้เจ้าหน้าที่แนะนำ
                </option>
              </select>
              <MdOutlineKeyboardArrowDown className="select-arrow" />
            </div>
            {errors.package && <div className="error-text">{errors.package}</div>}
          </div>

          {/* ===== ช่วงเวลาใช้ไฟ ===== */}
          <div>
            <span className="form-label">ช่วงเวลาที่ใช้ไฟ :</span>
            <div className={`radio-group ${errors.usageTime ? 'error-border' : ''}`}>
              <label className="form-radio" htmlFor="usageTimeDay">
                <input
                  id="usageTimeDay"
                  type="radio"
                  name="usageTime"
                  value="กลางวัน"
                  checked={formData.usageTime === 'กลางวัน'}
                  onChange={handleChange}
                  className="radio-input"
                />
                กลางวัน
              </label>
              <label className="form-radio" htmlFor="usageTimeNight">
                <input
                  id="usageTimeNight"
                  type="radio"
                  name="usageTime"
                  value="กลางคืน"
                  checked={formData.usageTime === 'กลางคืน'}
                  onChange={handleChange}
                  className="radio-input"
                />
                กลางคืน
              </label>
            </div>
            {errors.usageTime && <div className="error-text">{errors.usageTime}</div>}
          </div>

          {/* ===== ชื่อและเบอร์โทร ===== */}
          <div>
            <label htmlFor="fullName" className="form-label">
              ชื่อจริง-นามสกุลจริง :
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`form-field ${errors.name ? 'input-error' : ''}`}
              placeholder="กรุณากรอกชื่อ - นามสกุล ของท่าน**"
              autoComplete="name"
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          <div>
            <label htmlFor="contact-phone" className="form-label">
              หมายเลขโทรศัพท์มือถือ :
            </label>
            <input
              id="contact-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-field ${errors.phone ? 'input-error' : ''}`}
              placeholder="กรุณากรอกเบอร์โทรศัพท์ของท่าน**"
              autoComplete="tel"
            />
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>

          {/* ===== ค้นหาที่อยู่ ===== */}
          <div ref={wrapperRef} style={{ position: 'relative' }}>
            <label htmlFor="addressQuery" className="form-label">
              ค้นหาที่อยู่ :
            </label>
            <input
              id="addressQuery"
              type="text"
              value={query}
              onChange={handleQueryChange}
              className={`form-field ${errors.province ? 'input-error' : ''}`}
              placeholder="เช่น (ตำบล)ท่าอิฐ, (อำเภอ)เมืองอุตรดิตถ์, (จังหวัด)อุตรดิตถ์"
            />
            {suggestions.length > 0 && (
              <ul className={styles.autocompleteList}>
                {suggestions.map((s, i) => {
                  const fullText = `${s.subDistrict ? s.subDistrict + ', ' : ''}${s.district ? s.district + ', ' : ''}${s.province}`;
                  const highlighted = fullText.replace(
                    new RegExp(query, 'gi'),
                    (match) => `<span class='${styles.highlightText}'>${match}</span>`
                  );
                  return (
                    <li
                      key={i}
                      onClick={() => handleSelect(s)}
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                      className={styles.autocompleteItem}
                    />
                  );
                })}
              </ul>
            )}

            {errors.province && <div className="error-text">{errors.province}</div>}
          </div>

          {/* ===== เวลาติดต่อกลับ ===== */}
          <div className="form-select-wrapper">
            <label htmlFor="contactTime" className="form-label">
              ช่วงเวลาที่สะดวกให้ติดต่อกลับ :
            </label>
            <div className="custom-select-container" style={{ position: 'relative' }}>
              <select
                id="contactTime"
                name="contactTime"
                value={formData.contactTime}
                onChange={handleChange}
                className={`form-select ${formData.contactTime === '' ? 'placeholder' : ''} ${errors.contactTime ? 'input-error' : ''}`}
              >
                <option value="" disabled hidden>
                  กรุณาเลือกช่วงเวลาที่สะดวกให้ติดต่อกลับ**
                </option>
                <option value="08:30 น. - 12:00 น.">08:30 น. - 12:00 น.</option>
                <option value="12:00 น. - 13:00 น.">12:00 น. - 13:00 น.</option>
                <option value="13:00 น. - 15:00 น.">13:00 น. - 15:00 น.</option>
                <option value="15:00 น. - 17:30 น.">15:00 น. - 17:30 น.</option>
                <option value="ทุกช่วงเวลา">ทุกช่วงเวลา</option>
              </select>
              <MdOutlineKeyboardArrowDown className="select-arrow" />
            </div>
            {errors.contactTime && <div className="error-text">{errors.contactTime}</div>}
          </div>

          {/* ปุ่มส่ง */}
          <div className={styles.row} style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="submit" className="buttonSecondaryoneorange" disabled={submitting}>
              {submitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
