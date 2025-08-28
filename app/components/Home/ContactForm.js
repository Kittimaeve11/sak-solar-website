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
        <h4 style={{ textAlign: 'center', marginTop: -10, marginBottom: 20, fontWeight: 400 }}>
          หรือต้องการปรึกษาการติดตั้ง เรายินดีให้คำแนะนำ
        </h4>

        <form onSubmit={handleSubmit}>
          {/* ✅ form fields (เหมือนเดิม) */}

          {/* ปุ่มส่ง */}
          <div className={styles.row} style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="submit" className="buttonSecondaryoneorange" disabled={submitting}>
              {submitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
            </button>
          </div>

          {/* ✅ Feedback */}
          {status === 'success' && <p style={{ color: 'green', textAlign: 'center' }}>ส่งข้อมูลเรียบร้อย ✅</p>}
          {status === 'error' && <p style={{ color: 'red', textAlign: 'center' }}>ส่งข้อมูลล้มเหลว ❌ กรุณาลองใหม่</p>}
        </form>
      </div>
    </div>
  );
}
