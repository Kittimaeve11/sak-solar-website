'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import Swal from 'sweetalert2'
import ReCAPTCHA from 'react-google-recaptcha'
import styles from '../../Home.module.css'
import { useSearchParams } from 'next/navigation'
import { useLocale } from '@/app/Context/LocaleContext'
import { validateFieldmoreInfo } from '@/app/Utils/validation'

// URL ของ API และ Key (มาจากไฟล์ .env)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* =========================================================
   Component หลัก: ContactForm (ฟอร์มติดต่อบริษัท)
   ========================================================= */
export default function ContactForm({
  provinces = [],    // ข้อมูลจังหวัด
  amphures = [],     // ข้อมูลอำเภอ
  tambons = [],      // ข้อมูลตำบล
  productOptions = [] // ข้อมูลสินค้า
}) {
  const { locale } = useLocale()
  const searchParams = useSearchParams()
  const wrapperRef = useRef(null)

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
  })

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  /* =========================================================
     ✅ โหลดข้อมูล + ตรวจจับ product จาก URL แล้วติ๊กอัตโนมัติ + scroll มาที่ฟอร์ม
     ========================================================= */
  useEffect(() => {
    let timer;

    // ✅ โหลด productOptions เสร็จ → ปิดสถานะโหลด
    if (productOptions && productOptions.length > 0) {
      timer = setTimeout(() => setLoadingProducts(false), 600);
    }

    // ✅ อ่าน query string จาก URL
    const productParam = searchParams.get('product'); // อ่านแค่ค่าที่ต้องใช้
    if (productParam) {
      setFormData((prev) => ({ ...prev, product: productParam }));

      // ✅ scroll ไปยังฟอร์ม
      setTimeout(() => {
        document.querySelector(`.${styles.formWrapper}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    }

    // ✅ คลิกนอก dropdown → ปิด autocomplete
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // ✅ cleanup function
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  // ✅ ใช้เฉพาะค่าที่ไม่เปลี่ยน reference
  }, [productOptions, searchParams?.toString()]);

  /* =========================================================
     ฟังก์ชันตรวจสอบข้อมูลฟอร์มก่อนส่ง
     ========================================================= */
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
    }

    const infoErrors = validateFieldmoreInfo(
      { topic: data.product, name: data.fullName, phone: data.phone },
      messages
    )

    if (!data.package) infoErrors.package = '*กรุณาเลือกราคาที่ยอมรับได้'
    if (!data.usageTime) infoErrors.usageTime = '*กรุณาระบุช่วงเวลาใช้ไฟ'
    if (!data.province) infoErrors.province = '*กรุณากรอกที่อยู่ของท่าน'
    if (!data.contactTime) infoErrors.contactTime = '*กรุณาเลือกช่วงเวลาติดต่อกลับ'

    return infoErrors
  }

  /* =========================================================
     ฟังก์ชัน reCAPTCHA
     ========================================================= */
/* =========================================================
   ✅ ฟังก์ชัน reCAPTCHA (ส่งอัตโนมัติหลังติ๊ก)
   ========================================================= */
const handleCaptchaChange = async (token) => {
  if (!token) return

  // ✅ เก็บ token และปิด reCAPTCHA ทันที
  setCaptchaToken(token)
  setShowCaptcha(false)

  // ✅ ตรวจสอบความถูกต้องของฟอร์มก่อนส่ง
  const validationErrors = validate(formData)
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    return
  }

  // ✅ ถ้าข้อมูลครบ ส่งฟอร์มอัตโนมัติเลย
  await handleSubmitAfterCaptcha(token)
}


/* =========================================================
   ✅ ฟังก์ชันบันทึก Log การส่งข้อความสนใจ (actionType = 6)
   ========================================================= */
const handleLogSubmit = async () => {
  try {
    const logData = {
      actionType: '6', // 6 = การส่งข้อความสนใจ
      actionDetail: `ส่งแบบฟอร์มสนใจโซลาร์เซลล์ | สินค้า: ${formData.product || 'N/A'} | ราคา: ${
        formData.package || 'N/A'
      } | เวลาใช้ไฟ: ${formData.usageTime || 'N/A'} | จังหวัด: ${formData.province || 'N/A'}`,
      typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
      datatype: 'แบบฟอร์มติดต่อ',
      dataID: '0',         // ส่งค่า "0" เพื่อไม่ให้ null
      datatypeID: '0',     // ส่งค่า "0" เพื่อไม่ให้ null
      brandtype: 'N/A',
      dataname: 'Contact Form',
    };

    const res = await fetch(`${baseUrl}/api/logWebsitepageapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(logData),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('Log API error:', text);
    } else {
      console.log(' Log การส่งข้อความสนใจถูกบันทึกเรียบร้อยแล้ว:', text);
    }
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการบันทึก Log การส่งข้อความสนใจ:', err);
  }
};

/* =========================================================
   ฟังก์ชัน handleSubmitAfterCaptcha
   ใช้สำหรับส่งข้อมูลฟอร์มไปยัง API หลังจากผ่านการยืนยัน reCAPTCHA สำเร็จ
   ========================================================= */
const handleSubmitAfterCaptcha = async (token) => {
  // ตั้งค่าสถานะว่ากำลังส่งข้อมูล (ป้องกันการกดปุ่มซ้ำ)
  setSubmitting(true)

  // รวมค่าที่อยู่จากตำบล อำเภอ จังหวัด ให้เป็นข้อความเดียว
  const address = [formData.subDistrict, formData.district, formData.province]
    .filter(Boolean)
    .join(', ')

  // สร้าง payload สำหรับส่งไปยัง API
  const payload = {
    producttypeID: formData.product,     // รหัสประเภทสินค้า
    acceptableprice: formData.package,   // ราคาที่ผู้ใช้ยอมรับได้
    usagetime: formData.usageTime,       // ช่วงเวลาที่ใช้ไฟ
    fullname: formData.fullName,         // ชื่อเต็มของผู้ติดต่อ
    phonenumber: formData.phone,         // หมายเลขโทรศัพท์
    address,                             // ที่อยู่รวม (ตำบล, อำเภอ, จังหวัด)
    contedtime: formData.contactTime,    // ช่วงเวลาที่สะดวกให้ติดต่อกลับ
    solce: 'เว็บไซต์',                   // แหล่งที่มาของการติดต่อ
  }

  try {
    // เรียก API เพื่อบันทึกข้อมูลการติดต่อ
    const res = await fetch(`${baseUrl}/api/Inquiriespageapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // ส่งข้อมูลในรูปแบบ JSON
        'X-API-KEY': apiKey,                // ใส่ API Key เพื่อยืนยันสิทธิ์
      },
      body: JSON.stringify(payload),         // แปลง payload เป็น JSON ก่อนส่ง
    })

    // ตรวจสอบว่า API ตอบกลับปกติหรือไม่
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

    // แปลงผลลัพธ์จาก API เป็น JSON แล้วเก็บไว้ใน result
    const result = await res.json()
    console.log('ผลลัพธ์จาก API:', result)

    // แสดงข้อความแจ้งเตือนเมื่อส่งข้อมูลสำเร็จ
    await Swal.fire({
      icon: 'success',
      title: 'ส่งข้อมูลเรียบร้อยแล้ว!',
      text: 'ขอบคุณที่สนใจโซลาร์เซลล์จากเรา ทีมงานจะติดต่อกลับโดยเร็วที่สุดค่ะ',
      showConfirmButton: false,
      timer: 2500,
    })

    // เรียกฟังก์ชันบันทึก Log หลังจากส่งข้อมูลสำเร็จ
    await handleLogSubmit()

    // รีเซ็ตค่าทั้งหมดในฟอร์มกลับเป็นค่าเริ่มต้น
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
    })

    // ล้างค่าที่เกี่ยวข้องกับการค้นหาที่อยู่และการยืนยัน captcha
    setQuery('')
    setSuggestions([])
    setCaptchaToken(null)
    setShowCaptcha(false)
    setErrors({})
  } catch (err) {
    // หากเกิดข้อผิดพลาดระหว่างการส่งข้อมูลให้แสดงข้อความแจ้งเตือน
    console.error('Error sending:', err)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้งค่ะ',
    })
  } finally {
    // ปิดสถานะการส่งข้อมูลไม่ว่าผลจะสำเร็จหรือไม่
    setSubmitting(false)
  }
}

  /* =========================================================
     🧩 ฟังก์ชันพิเศษ: จำกัดตัวอักษรที่อนุญาตในชื่อและเบอร์
     ========================================================= */
  const handleNameChange = (e) => {
    const input = e.target.value
    const filtered = input.replace(/[^ก-๙a-zA-Z\s]/g, '')
    setFormData((prev) => ({ ...prev, fullName: filtered }))
  }

  const handlePhoneChange = (e) => {
    const input = e.target.value
    const filtered = input.replace(/[^0-9]/g, '').slice(0, 10)
    setFormData((prev) => ({ ...prev, phone: filtered }))
  }

  /* =========================================================
     handleChange ปกติ (ช่องอื่น ๆ)
     ========================================================= */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      const updated = { ...prev }
      if (name === 'fullName' && updated.name) delete updated.name
      if (name === 'product' && updated.topic) delete updated.topic
      if (name === 'package' && updated.package) delete updated.package
      if (name === 'usageTime' && updated.usageTime) delete updated.usageTime
      if (name === 'phone' && updated.phone) delete updated.phone
      if (name === 'contactTime' && updated.contactTime) delete updated.contactTime
      return updated
    })
  }

  /* =========================================================
     handleSubmit
     ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    let updatedData = { ...formData }
    if (!updatedData.province && query.trim()) {
      const [subDistrict, district, province] = query.split(',').map((s) => s.trim())
      updatedData = { ...updatedData, subDistrict, district, province }
      setFormData(updatedData)
    }

    const validationErrors = validate(updatedData)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    if (!showCaptcha) {
      setShowCaptcha(true)
      return
    }

    if (!captchaToken) {
      Swal.fire({
        icon: "warning",
        title: "กรุณายืนยัน reCAPTCHA",
        text: "โปรดติ๊กที่ช่อง 'ฉันไม่ใช่หุ่นยนต์' ก่อนส่งข้อมูล",
      })
      return
    }
    setShowCaptcha(false)

    await handleSubmitAfterCaptcha(captchaToken)
  }

/* =========================================================
   handleQueryChange & handleSelect
   ฟังก์ชันนี้ทำหน้าที่จัดการเมื่อผู้ใช้ "พิมพ์ข้อความค้นหา" ในช่องค้นหาที่อยู่
   ========================================================= */
const handleQueryChange = (e) => {
  const text = e.target.value.trim(); 
  // ดึงค่าที่ผู้ใช้พิมพ์จากช่อง input และตัดช่องว่างหัว-ท้ายออก

  setQuery(text); 
  // บันทึกค่าข้อความค้นหาปัจจุบันลงใน state `query`

  setErrors((prev) => {
    const updated = { ...prev };
    if (updated.province) delete updated.province;
    // ถ้ามี error ของจังหวัดอยู่ ให้ลบออก (เพราะผู้ใช้เริ่มพิมพ์ใหม่)
    return updated;
  });

  if (!text) return setSuggestions([]);
  // ถ้าผู้ใช้ลบข้อความจนว่าง ให้เคลียร์รายการแนะนำ (suggestions) ออก

  const matched = [];
  // สร้างอาเรย์เก็บผลลัพธ์ที่ตรงกับการค้นหา

  // วนลูปผ่านทุกตำบล (tambons) เพื่อหาว่าตำบลใด อำเภอใด หรือจังหวัดใด ตรงกับข้อความที่พิมพ์
  tambons.forEach((t) => {
    const amphure = amphures.find((a) => a.id === t.amphure_id);
    // หาอำเภอที่ตำบลนี้อยู่ โดยใช้ amphure_id

    const province = provinces.find((p) => p.id === amphure?.province_id);
    //  หา “จังหวัด” ที่อำเภอนี้อยู่ โดยใช้ province_id

    // ✅ตรวจสอบว่าข้อความที่พิมพ์ ตรงกับชื่อของตำบล / อำเภอ / จังหวัดหรือไม่
    if (
      t.name_th.includes(text) ||
      amphure?.name_th.includes(text) ||
      province?.name_th.includes(text)
    ) {
      matched.push({
        subDistrict: t.name_th,          // ชื่อตำบล
        district: amphure?.name_th || '', // ชื่ออำเภอ (ถ้ามี)
        province: province?.name_th || '', // ชื่อจังหวัด (ถ้ามี)
      });
    }
  });

  setSuggestions(matched.slice(0, 30));
  // เก็บผลลัพธ์ที่ตรงไว้ใน state `suggestions`
  // จำกัดผลลัพธ์แสดงสูงสุด 30 รายการ เพื่อไม่ให้ยาวเกินไป
};

  const handleSelect = (item) => {
    const fullText = `${item.subDistrict ? item.subDistrict + ', ' : ''}${item.district ? item.district + ', ' : ''}${item.province}`
    setQuery(fullText)
    setFormData((prev) => ({
      ...prev,
      subDistrict: item.subDistrict,
      district: item.district,
      province: item.province,
    }))
    setSuggestions([])
  }


  /* =========================================================
     ส่วนแสดงผล UI
     ========================================================= */
  return (
    <div className={styles.containersolar}>
      <div className={styles.formWrapper} style={{ marginTop: '3rem' }}>
        <h1 className="headtitleone">สนใจโซลาร์เซลล์</h1>
        <h4
          style={{
            textAlign: 'center',
            color: '#19489D',
            fontWeight: 600,
            marginTop: '-10px',
            marginBottom: '20px',
          }}
        >
          หรือต้องการปรึกษาการติดตั้ง เรายินดีให้คำแนะนำ
        </h4>

        <form onSubmit={handleSubmit}>
          {/* 🔹 สินค้าหรือบริการที่สนใจ */}
          <div>
            <span className="form-label">สินค้าหรือบริการที่สนใจ :</span>
            {loadingProducts ? (
              <div style={{ color: '#19489D', padding: '5px 0' }}>กำลังโหลดข้อมูล...</div>
            ) : (
              <div className={`radio-group fade-in ${errors.topic ? 'error-border' : ''}`}>
                {productOptions.map((product, idx) => {
                  const id = `product-${product?.producttypeID ?? idx}`;
                  const productName = locale === 'th' ? product.producttypenameTH : product.producttypenameEN;
                  return (
                    <label key={id} className="form-radio" htmlFor={id}>
                      <input
                        id={id}
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
            )}
            {errors.topic && <div className="error-text">{errors.topic}</div>}
          </div>

          {/* 🔹 ราคาที่ยอมรับได้ */}
          <div className="form-select-wrapper">
            <label htmlFor="package" className="form-label">ราคาที่ยอมรับได้ :</label>
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

          {/* 🔹 ช่วงเวลาที่ใช้ไฟ */}
          <div>
            <span className="form-label">ช่วงเวลาที่ใช้ไฟ :</span>
            <div className={`radio-group ${errors.usageTime ? 'error-border' : ''}`}>
              <label className="form-radio" htmlFor="usageTimeDay">
                <input id="usageTimeDay" type="radio" name="usageTime" value="กลางวัน" checked={formData.usageTime === 'กลางวัน'} onChange={handleChange} className="radio-input" />
                กลางวัน
              </label>
              <label className="form-radio" htmlFor="usageTimeNight">
                <input id="usageTimeNight" type="radio" name="usageTime" value="กลางคืน" checked={formData.usageTime === 'กลางคืน'} onChange={handleChange} className="radio-input" />
                กลางคืน
              </label>
            </div>
            {errors.usageTime && <div className="error-text">{errors.usageTime}</div>}
          </div>

          {/* 🔹 ชื่อจริง-นามสกุลจริง */}
          <div>
            <label htmlFor="fullName" className="form-label">ชื่อจริง-นามสกุลจริง :</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleNameChange}
              className={`form-field ${errors.name ? 'input-error' : ''}`}
              placeholder="กรุณากรอกชื่อ - นามสกุล ของท่าน**"
              autoComplete="name"
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          {/* 🔹 หมายเลขโทรศัพท์มือถือ */}
          <div>
            <label htmlFor="contact-phone" className="form-label">หมายเลขโทรศัพท์มือถือ :</label>
            <input
              id="contact-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`form-field ${errors.phone ? 'input-error' : ''}`}
              placeholder="กรุณากรอกเบอร์โทรศัพท์ของท่าน**"
              autoComplete="tel"
            />
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>

          {/* 🔹 ค้นหาที่อยู่ */}
          <div ref={wrapperRef} style={{ position: 'relative' }}>
            <label htmlFor="addressQuery" className="form-label">ค้นหาที่อยู่ :</label>
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
                  const fullText = `${s.subDistrict ? s.subDistrict + ', ' : ''}${s.district ? s.district + ', ' : ''}${s.province}`
                  const highlighted = fullText.replace(
                    new RegExp(query, 'gi'),
                    (match) => `<span class='${styles.highlightText}'>${match}</span>`
                  )
                  return (
                    <li
                      key={i}
                      onClick={() => handleSelect(s)}
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                      className={styles.autocompleteItem}
                    />
                  )
                })}
              </ul>
            )}
            {errors.province && <div className="error-text">{errors.province}</div>}
          </div>

          {/* 🔹 ช่วงเวลาติดต่อกลับ */}
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
                <option value="12:00 น. - 13:00 น.">12:00 น. - 13:00 น.</option>
                <option value="13:00 น. - 15:00 น.">13:00 น. - 15:00 น.</option>
                <option value="15:00 น. - 17:30 น.">15:00 น. - 17:30 น.</option>
                <option value="ทุกช่วงเวลา">ทุกช่วงเวลา</option>
              </select>
              <MdOutlineKeyboardArrowDown className="select-arrow" />
            </div>
            {errors.contactTime && <div className="error-text">{errors.contactTime}</div>}
          </div>

          {/* reCAPTCHA */}
          {showCaptcha && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
              />
            </div>
          )}

          {/* ปุ่มส่งฟอร์ม */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button type="submit" className="buttonSecondaryoneorange" disabled={submitting}>
              {submitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
