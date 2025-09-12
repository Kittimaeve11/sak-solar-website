'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import styles from '../../Home.module.css';
import { useSearchParams } from 'next/navigation';
import { useLocale } from '@/app/Context/LocaleContext';
// import SliderCaptcha from 'rc-slider-captcha'; // 👉 ถ้ายังไม่ใช้ ให้ปิดไว้ก่อน
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

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
  const [captchaVerified, setCaptchaVerified] = useState(false); // ✅ ไว้ใช้ถ้าเปิด captcha
  const [submitting, setSubmitting] = useState(false); // ป้องกันกดซ้ำ
  const [status, setStatus] = useState(null); // success / error

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // ✅ ลบ error เฉพาะช่องที่ผู้ใช้พิมพ์
    setErrors((prevErrors) => {
      if (!prevErrors[name]) return prevErrors;
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[name];
      return updatedErrors;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.product) newErrors.product = '*กรุณาระบุสินค้าหรือบริการ';
    if (!formData.package) newErrors.package = '*กรุณาเลือกแพ็คเกจ';
    if (!formData.usageTime) newErrors.usageTime = '*กรุณาระบุช่วงเวลาใช้ไฟ';
    if (!formData.fullName) newErrors.fullName = '*กรุณากรอกชื่อและนามสกุลของท่าน';
    if (!formData.phone) newErrors.phone = '*กรุณากรอกหมายเลขโทรศัพท์';
    if (!formData.contactTime) newErrors.contactTime = '*กรุณาเลือกช่วงเวลาติดต่อกลับ';
    if (!formData.province) newErrors.province = '*กรุณากรอกที่อยู่ของท่าน';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 👉 ถ้าใช้ captcha ให้เปิดบรรทัดนี้
    // if (!captchaVerified) {
    //   alert('กรุณายืนยันตัวตนด้วย captcha ก่อนส่งแบบฟอร์ม');
    //   return;
    // }

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setStatus(null);

    const address = [formData.subDistrict, formData.district, formData.province]
      .filter(Boolean)
      .join(', ');

    const payload = {
      producttypeID: formData.product,
      acceptableprice: formData.package,
      usagetime: formData.usageTime,
      fullname: formData.fullName,
      phonenumber: formData.phone,
      address,
      contedtime: formData.contactTime,
      solce: "เว็บไซต์",
    };

    try {
      const response = await fetch(`${baseUrl}/api/Inquiriespageapi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      console.log("📩 ส่งข้อมูลสำเร็จ:", result);

      // reset form
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
      setCaptchaVerified(false);

      setStatus('success');
    } catch (err) {
      console.error("❌ ส่งข้อมูลล้มเหลว:", err);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQueryChange = (e) => {
    const text = e.target.value.trim();
    setQuery(text);

    // ✅ clear error province เมื่อพิมพ์ใหม่
    setErrors((prevErrors) => {
      if (!prevErrors.province) return prevErrors;
      const updated = { ...prevErrors };
      delete updated.province;
      return updated;
    });

    if (!text) return setSuggestions([]);

    const matched = [];

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

    amphures.forEach((a) => {
      if (a.name_th.includes(text)) {
        const province = provinces.find((p) => p.id === a.province_id);
        matched.push({
          subDistrict: '',
          district: a.name_th,
          province: province?.name_th || '',
        });
      }
    });

    provinces.forEach((p) => {
      if (p.name_th.includes(text)) {
        matched.push({
          subDistrict: '',
          district: '',
          province: p.name_th,
        });
      }
    });

    setSuggestions(matched.slice(0, 10));
  };

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

  useEffect(() => {
    // auto fill district/province เมื่อเลือก tambon
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

    // ปิด suggestion เมื่อคลิกนอกกล่อง
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // อ่าน query param product
    const productFromUrl = searchParams.get('product');
    if (productFromUrl) {
      setFormData((prev) => ({
        ...prev,
        product: productFromUrl,
      }));
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.product;
        return newErrors;
      });

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
            fontWeight: '600',
            color: '#19489D',
          }}
        >          หรือต้องการปรึกษาการติดตั้ง เรายินดีให้คำแนะนำ
        </h4>

        <form onSubmit={handleSubmit}>
          {/* สินค้า */}
          <div>
            <span className="form-label">สินค้าหรือบริการที่สนใจ :</span> 
            <div className={`radio-group ${errors.product ? 'error-border' : ''}`}>
              {productOptions.map((product) => {
                const productName = locale === 'th' ? product.producttypenameTH : product.producttypenameEN;
                return (
                  <label key={product.producttypeID} className="form-radio" htmlFor={`product-${product.producttypeID}`}>
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
            {errors.product && <div className="error-text">{errors.product}</div>}
          </div>

          {/* แพ็คเกจ */}
          <div className="form-select-wrapper">
            <label htmlFor="package" className="form-label">ราคาที่ยอมรับได้ :</label> {/* ✅ ถูกต้องแล้ว */}
            <div className="custom-select-container" style={{ position: 'relative' }}>
              <select
                id="package"
                name="package"
                value={formData.package}
                onChange={handleChange}
                className={`form-select ${formData.package === '' ? 'placeholder' : ''} ${errors.package ? 'input-error' : ''}`}
              >
                <option value="" disabled hidden>กรุณาเลือกราคาที่ยอมรับได้**</option>
                <option value="ประหยัด (ต่ำกว่า 100,000 บาท)">ประหยัด (ต่ำกว่า 100,000 บาท)</option>
                <option value="กลาง (100,000 - 250,000 บาท)">กลาง (100,000 - 250,000 บาท)</option>
                <option value="Premium (มากกว่า 250,000 บาท)">Premium (มากกว่า 250,000 บาท)</option>
                <option value="ไม่แน่ใจ ต้องการให้เจ้าหน้าที่แนะนำ">ไม่แน่ใจ ต้องการให้เจ้าหน้าที่แนะนำ</option>
              </select>
              <MdOutlineKeyboardArrowDown className="select-arrow" />
            </div>
            {errors.package && <div className="error-text">{errors.package}</div>}
          </div>

          {/* ช่วงเวลาใช้ไฟ */}
          <div>
            <span className="form-label">ช่วงเวลาที่ใช้ไฟ :</span> {/* ✅ ใช้ span แทน */}
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


          {/* ชื่อและเบอร์ */}
          <div>
            <label htmlFor="fullName" className="form-label">ชื่อจริง-นามสกุลจริง :</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`form-field ${errors.fullName ? 'input-error' : ''}`}
              placeholder="กรุณากรอกชื่อ - นามสกุล ของท่าน**"
              autoComplete="name"
            />
            {errors.fullName && <div className="error-text">{errors.fullName}</div>}
          </div>

          <div>
            <label htmlFor="contact-phone" className="form-label">หมายเลขโทรศัพท์มือถือ :</label>
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

          {/* ค้นหาที่อยู่ */}
          <div ref={wrapperRef} style={{ position: 'relative' }}>
            <label htmlFor="addressQuery" className="form-label">ค้นหาที่อยู่ :</label>
            <input
              id="addressQuery"
              type="text"
              value={query}
              onChange={handleQueryChange}
              className={`form-field ${errors.province ? 'input-error' : ''}`}
              placeholder="เช่น (ตำบล)ท่าอิฐ, (อำเภอ)เมืองอุตรดิตถ์, (จังหวัด)อุตรดิตถ์"
              autoComplete="address-line1"
            />
            {suggestions.length > 0 && (
              <ul className="autocomplete-list">
                {suggestions.map((s, i) => (
                  <li key={i} onClick={() => handleSelect(s)} style={{ padding: '8px', cursor: 'pointer' }}>
                    {`${s.subDistrict ? s.subDistrict + ', ' : ''}${s.district ? s.district + ', ' : ''}${s.province}`}
                  </li>
                ))}
              </ul>
            )}
            {errors.province && <div className="error-text">{errors.province}</div>}
          </div>

          {/* เวลาติดต่อกลับ */}
          <div className="form-select-wrapper">
            <label htmlFor="contactTime" className="form-label">ช่วงเวลาที่สะดวกให้ติดต่อกลับ :</label>
            <div className="custom-select-container" style={{ position: 'relative' }}>
              <select
                id="contactTime"
                name="contactTime"
                value={formData.contactTime}
                onChange={handleChange}
                className={`form-select ${formData.contactTime === '' ? 'placeholder' : ''} ${errors.contactTime ? 'input-error' : ''}`}
              >
                <option value="" disabled hidden>กรุณาเลือกช่วงเวลาที่สะดวกให้ติดต่อกลับ**</option>
                <option value="08:30 น. - 12:00 น.">08:30 น. - 12:00 น.</option>
                <option value="12:00 น. - 13:00 น">12:00 น. - 13:00 น.</option>
                <option value="13:00 น. - 15:00 น.">13:00 น. - 15:00 น.</option>
                <option value="late-15:00 น. - 17:30 น.">15:00 น. - 17:30 น.</option>
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

          {/* Feedback */}
          {status === 'success' && <p style={{ color: 'green', textAlign: 'center' }}>ส่งข้อมูลเรียบร้อย </p>}
          {status === 'error' && <p style={{ color: 'red', textAlign: 'center' }}>ส่งข้อมูลล้มเหลว  กรุณาลองใหม่อีกครั้งค่ะ</p>}
        </form>

      </div>
    </div>
  );
}
