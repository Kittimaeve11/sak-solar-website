'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import Swal from 'sweetalert2'
import ReCAPTCHA from 'react-google-recaptcha'
import styles from '../../Home.module.css'
import { useSearchParams } from 'next/navigation'
import { useLocale } from '@/app/Context/LocaleContext'
import { validateFieldmoreInfo } from '@/app/Utils/validation'

// ตัวแปรฐานข้อมูลและคีย์ API จากไฟล์ .env
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API

export default function ContactForm({
  provinces = [],
  amphures = [],
  tambons = [],
  productOptions = []
}) {
  // ใช้ Locale สำหรับแปลภาษา
  const { locale } = useLocale()
  // ใช้สำหรับอ่านค่าพารามิเตอร์ใน URL
  const searchParams = useSearchParams()
  // ใช้อ้างอิงตำแหน่งของ element เพื่อปิด dropdown เมื่อคลิกนอกพื้นที่
  const wrapperRef = useRef(null)

  // State สำหรับเก็บข้อมูลจากฟอร์ม
  const [formData, setFormData] = useState({
    product: '',
    package: '',
    usageTime: '',
    fullName: '',
    phone: '',
    district: '',
    subDistrict: '',
    province: '',
    contactTime: ''
  })

  // State เสริมสำหรับจัดการการแสดงผล
  const [query, setQuery] = useState('')               // สำหรับค้นหาที่อยู่
  const [suggestions, setSuggestions] = useState([])   // รายการที่อยู่ที่ค้นเจอ
  const [errors, setErrors] = useState({})             // ข้อผิดพลาดของฟอร์ม
  const [submitting, setSubmitting] = useState(false)  // สถานะกำลังส่งข้อมูล
  const [captchaToken, setCaptchaToken] = useState(null) // token จาก reCAPTCHA
  const [showCaptcha, setShowCaptcha] = useState(false)  // แสดง/ซ่อน reCAPTCHA
  const [loadingProducts, setLoadingProducts] = useState(true) // โหลดสินค้า

  /* =========================================================
      โหลดข้อมูลและตรวจจับ product จาก URL
      หากมีค่า product จะติ๊กอัตโนมัติและ scroll มาที่ฟอร์ม
  ========================================================= */
  useEffect(() => {
    let timer

    // เมื่อ productOptions โหลดเสร็จจะหน่วงเวลาเล็กน้อยก่อนเปลี่ยนสถานะ
    if (productOptions && productOptions.length > 0) {
      timer = setTimeout(() => setLoadingProducts(false), 600)
    }

    // ดึงค่าจาก query parameter (เช่น ?product=1)
    const productParam = searchParams.get('product')
    if (productParam) {
      // ตั้งค่าให้เลือกสินค้าตามพารามิเตอร์ใน URL
      setFormData((prev) => ({ ...prev, product: productParam }))
      // scroll มายังฟอร์มอัตโนมัติ
      setTimeout(() => {
        document.querySelector(`.${styles.formWrapper}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 300)
    }

    // ปิดรายการแนะนำที่อยู่เมื่อคลิกนอกกล่อง
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    // ล้าง event listener และ timer เมื่อ component ถูก unmount
    return () => {
      if (timer) clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [productOptions, searchParams?.toString()])

  /* =========================================================
     ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลในฟอร์ม
  ========================================================= */
  const validate = (data = formData) => {
    // กำหนดข้อความแจ้งเตือนแต่ละช่อง
    const messages = {
      Infovalidate: {
        topic: '*กรุณาระบุสินค้าหรือบริการ',
        fullname: {
          fullnamenull: '*กรุณากรอกชื่อและนามสกุลของท่าน',
          name: '*ชื่อไม่ถูกต้อง (ห้ามมีตัวเลขหรืออักขระพิเศษ)'
        },
        phone: {
          phonenull: '*กรุณากรอกหมายเลขโทรศัพท์',
          phonenumber: '*หมายเลขโทรศัพท์ต้องเป็นตัวเลข 10 หลัก'
        }
      }
    }

    // ตรวจสอบข้อมูลโดยใช้ฟังก์ชัน validateFieldmoreInfo ที่นำเข้า
    const infoErrors = validateFieldmoreInfo(
      { topic: data.product, name: data.fullName, phone: data.phone },
      messages
    )

    // ตรวจสอบฟิลด์เพิ่มเติมในฟอร์ม
    if (!data.package) infoErrors.package = '*กรุณาเลือกราคาที่ยอมรับได้'
    if (!data.usageTime) infoErrors.usageTime = '*กรุณาระบุช่วงเวลาใช้ไฟ'
    if (!data.province) infoErrors.province = '*กรุณากรอกที่อยู่ของท่าน'
    if (!data.contactTime) infoErrors.contactTime = '*กรุณาเลือกช่วงเวลาติดต่อกลับ'

    return infoErrors
  }

  /* =========================================================
     ฟังก์ชันจัดการ input ของชื่อและเบอร์โทรศัพท์
     ลบ error อัตโนมัติเมื่อเริ่มพิมพ์ใหม่
  ========================================================= */
  const handleNameChange = (e) => {
    const input = e.target.value
    // กรองให้เหลือเฉพาะตัวอักษรไทยและอังกฤษ
    const filtered = input.replace(/[^ก-๙a-zA-Z\s]/g, '')
    setFormData((prev) => ({ ...prev, fullName: filtered }))
    // ลบ error เมื่อเริ่มแก้ไขใหม่
    setErrors((prev) => {
      const updated = { ...prev }
      if (updated.name) delete updated.name
      return updated
    })
  }

  const handlePhoneChange = (e) => {
    const input = e.target.value
    // กรองให้เหลือเฉพาะตัวเลข และจำกัดความยาวไม่เกิน 10 ตัว
    const filtered = input.replace(/[^0-9]/g, '').slice(0, 10)
    setFormData((prev) => ({ ...prev, phone: filtered }))
    // ลบ error เมื่อเริ่มแก้ไขใหม่
    setErrors((prev) => {
      const updated = { ...prev }
      if (updated.phone) delete updated.phone
      return updated
    })
  }

  /* =========================================================
     ฟังก์ชันจัดการการเปลี่ยนค่าช่อง input ทั่วไป
  ========================================================= */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // ลบ error เฉพาะช่องที่ผู้ใช้แก้ไขใหม่
    setErrors((prev) => {
      const updated = { ...prev }
      if (name === 'product' && updated.topic) delete updated.topic
      if (name === 'package' && updated.package) delete updated.package
      if (name === 'usageTime' && updated.usageTime) delete updated.usageTime
      if (name === 'contactTime' && updated.contactTime) delete updated.contactTime
      return updated
    })
  }

  /* =========================================================
     ฟังก์ชันค้นหาที่อยู่ (ตำบล / อำเภอ / จังหวัด)
  ========================================================= */
  const handleQueryChange = (e) => {
    const text = e.target.value.trim()
    setQuery(text)
    // ลบ error เมื่อเริ่มพิมพ์ใหม่
    setErrors((prev) => {
      const updated = { ...prev }
      if (updated.province) delete updated.province
      return updated
    })
    // หากไม่มีข้อความให้ล้างผลลัพธ์
    if (!text) return setSuggestions([])

    // ค้นหาข้อมูลตำบล อำเภอ จังหวัดที่ตรงกับข้อความ
    const matched = []
    tambons.forEach((t) => {
      const amphure = amphures.find((a) => a.id === t.amphure_id)
      const province = provinces.find((p) => p.id === amphure?.province_id)
      if (
        t.name_th.includes(text) ||
        amphure?.name_th.includes(text) ||
        province?.name_th.includes(text)
      ) {
        matched.push({
          subDistrict: t.name_th,
          district: amphure?.name_th || '',
          province: province?.name_th || ''
        })
      }
    })
    // แสดงผลลัพธ์สูงสุด 30 รายการ
    setSuggestions(matched.slice(0, 30))
  }

  // เมื่อเลือกที่อยู่จากรายการแนะนำ
  const handleSelect = (item) => {
    const fullText = `${item.subDistrict ? item.subDistrict + ', ' : ''}${item.district ? item.district + ', ' : ''}${item.province}`
    setQuery(fullText)
    setFormData((prev) => ({
      ...prev,
      subDistrict: item.subDistrict,
      district: item.district,
      province: item.province
    }))
    setSuggestions([])
  }

  /* =========================================================
     ฟังก์ชันบันทึก Log การส่งข้อความสนใจ (actionType = 6)
  ========================================================= */
  const handleLogSubmit = async () => {
    try {
      const logData = {
        actionType: '6', // ประเภทการกระทำ = การส่งข้อความสนใจ
        actionDetail: `ส่งแบบฟอร์มสนใจโซลาร์เซลล์ | สินค้า: ${formData.product || 'N/A'} | ราคา: ${formData.package || 'N/A'
          } | เวลาใช้ไฟ: ${formData.usageTime || 'N/A'} | จังหวัด: ${formData.province || 'N/A'}`,
        typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
        datatype: 'แบบฟอร์มติดต่อ',
        dataID: '0',
        datatypeID: '0',
        brandtype: 'N/A',
        dataname: 'Contact Form',
      }

      // เรียก API เพื่อบันทึก Log
      const res = await fetch(`${baseUrl}/api/logWebsitepageapi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify(logData),
      })

      const text = await res.text()
      if (!res.ok) {
        console.error('Log API error:', text)
      } else {
        console.log('บันทึก Log การส่งข้อความสนใจสำเร็จ:', text)
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการบันทึก Log การส่งข้อความสนใจ:', err)
    }
  }

  /* =========================================================
     ฟังก์ชันจัดการ token จาก reCAPTCHA
  ========================================================= */
  const handleCaptchaChange = async (token) => {
    if (!token) return
    setCaptchaToken(token)
    await handleSubmitAfterCaptcha(token)
  }

  /* =========================================================
     ฟังก์ชันจัดการเมื่อกดปุ่มส่งฟอร์ม
  ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    // ตรวจสอบความถูกต้องก่อนส่ง
    const validationErrors = validate(formData)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    // แสดง reCAPTCHA ก่อนส่งจริง
    if (!showCaptcha) {
      setShowCaptcha(true)
      return
    }

    // ถ้า token มีอยู่แล้วให้ส่งต่อ
    if (captchaToken) {
      await handleSubmitAfterCaptcha(captchaToken)
    }
  }

  /* =========================================================
     ฟังก์ชันส่งข้อมูลจริงไปยัง API หลังจากผ่าน reCAPTCHA
  ========================================================= */
  const handleSubmitAfterCaptcha = async (token) => {
    setSubmitting(true)

    // รวมที่อยู่ในรูปแบบเดียว
    const address = [formData.subDistrict, formData.district, formData.province]
      .filter(Boolean)
      .join(', ')

    // เตรียมข้อมูลที่จะส่ง
    const payload = {
      producttypeID: formData.product,
      acceptableprice: formData.package,
      usagetime: formData.usageTime,
      fullname: formData.fullName,
      phonenumber: formData.phone,
      address,
      contedtime: formData.contactTime,
      solce: 'เว็บไซต์'
    }

    try {
      const API_ENABLED = false;

      if (!API_ENABLED) {
        setLoadingServices(false);
        setLoadingProducts(false);
        return;
      }
      // เรียก API เพื่อบันทึกข้อมูล
      const res = await fetch(`${baseUrl}/api/Inquiriespageapi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      // หากส่งสำเร็จ
      if (data.status || data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'ส่งข้อมูลเรียบร้อยแล้ว!',
          text: 'ทีมงานจะติดต่อกลับโดยเร็วที่สุดค่ะ',
          showConfirmButton: false,
          timer: 2500
        })

        // บันทึก Log หลังจากส่งสำเร็จ
        await handleLogSubmit()

        // เคลียร์ข้อมูลในฟอร์ม
        setFormData({
          product: '',
          package: '',
          usageTime: '',
          fullName: '',
          phone: '',
          district: '',
          subDistrict: '',
          province: '',
          contactTime: ''
        })
        setQuery('')
        setSuggestions([])
        setCaptchaToken(null)
        setShowCaptcha(false)
        setErrors({})
      } else {
        Swal.fire({ icon: 'error', title: 'ไม่สามารถส่งข้อมูลได้' })
      }
    } catch (err) {
      // จัดการเมื่อเกิดข้อผิดพลาดในการส่ง
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.message })
    } finally {
      setSubmitting(false)
    }
  }
  /* =========================================================
     ส่วนแสดงผล UI (Render หน้าแบบฟอร์ม)
  ========================================================= */
  return (
    <div className={styles.containersolar}>
      {/* กล่องหลักของฟอร์ม */}
      <div className={styles.formWrapper} style={{ marginTop: '3rem' }}>
        <h1 className="headtitleone">สนใจโซลาร์เซลล์</h1>
        <h4
          style={{
            textAlign: 'center',
            color: '#19489D',
            fontWeight: 600,
            marginTop: '-10px',
            marginBottom: '20px'
          }}
        >
          หรือต้องการปรึกษาการติดตั้ง เรายินดีให้คำแนะนำ
        </h4>

        {/* ฟอร์มหลัก */}
        <form onSubmit={handleSubmit}>

          {/* สินค้าหรือบริการที่สนใจ */}
          <div>
            <span className="form-label">สินค้าหรือบริการที่สนใจ :</span>

            {/* แสดงข้อความระหว่างโหลดข้อมูล */}
            {loadingProducts ? (
              <div style={{ color: '#19489D', padding: '5px 0' }}>กำลังโหลดข้อมูล...</div>
            ) : (
              <div className={`radio-group fade-in ${errors.topic ? 'error-border' : ''}`}>
                {/* วนลูปแสดงตัวเลือกสินค้า */}
                {productOptions.map((product, idx) => {
                  const productName =
                    locale === 'th'
                      ? product.producttypenameTH
                      : product.producttypenameEN
                  return (
                    <label key={idx} className="form-radio">
                      <input
                        type="radio"
                        name="product"
                        value={product.producttypeID}
                        checked={formData.product === product.producttypeID}
                        onChange={handleChange}
                        className="radio-input"
                      />
                      {productName}
                    </label>
                  )
                })}
              </div>
            )}
            {/* แสดงข้อความ error ถ้ามี */}
            {errors.topic && <div className="error-text">{errors.topic}</div>}
          </div>

          {/* ราคาที่ยอมรับได้ */}
          <div className="form-select-wrapper">
            <label className="form-label">
              ราคาที่ยอมรับได้ :
              <div className="custom-select-container" style={{ position: 'relative' }}>
                <select
                  name="package"
                  value={formData.package}
                  onChange={handleChange}
                  className={`form-select ${formData.package === '' ? 'placeholder' : ''} ${errors.package ? 'input-error' : ''
                    }`}
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
            </label>
            {errors.package && <div className="error-text">{errors.package}</div>}
          </div>

          {/* ช่วงเวลาที่ใช้ไฟ */}
          <div>
            <span className="form-label">ช่วงเวลาที่ใช้ไฟ :</span>
            <div className={`radio-group ${errors.usageTime ? 'error-border' : ''}`}>
              <label className="form-radio">
                <input
                  type="radio"
                  name="usageTime"
                  value="กลางวัน"
                  checked={formData.usageTime === 'กลางวัน'}
                  onChange={handleChange}
                  className="radio-input"
                />
                กลางวัน
              </label>
              <label className="form-radio">
                <input
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

          {/* ชื่อจริง-นามสกุล */}
          <div>
            <label className="form-label">
              ชื่อจริง-นามสกุลจริง :
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleNameChange}
                className={`form-field ${errors.name ? 'input-error' : ''}`}
                placeholder="กรุณากรอกชื่อ - นามสกุล ของท่าน**"
                autoComplete="name"
              />
            </label>
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          {/* หมายเลขโทรศัพท์มือถือ */}
          <div>
            <label className="form-label">
              หมายเลขโทรศัพท์มือถือ :
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`form-field ${errors.phone ? 'input-error' : ''}`}
                placeholder="กรุณากรอกเบอร์โทรศัพท์ของท่าน**"
                autoComplete="tel"
              />
            </label>
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>

          {/* ค้นหาที่อยู่ */}
          <div ref={wrapperRef} style={{ position: 'relative' }}>
            <label className="form-label">
              ค้นหาที่อยู่ :
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                className={`form-field ${errors.province ? 'input-error' : ''}`}
                placeholder="เช่น (ตำบล)ท่าอิฐ, (อำเภอ)เมืองอุตรดิตถ์, (จังหวัด)อุตรดิตถ์"
              />
            </label>

            {/* รายการแนะนำที่อยู่ */}
            {suggestions.length > 0 && (
              <ul className={styles.autocompleteList}>
                {suggestions.map((s, i) => {
                  const fullText = `${s.subDistrict ? s.subDistrict + ', ' : ''}${s.district ? s.district + ', ' : ''
                    }${s.province}`;
                  // ไฮไลท์ข้อความที่ตรงกับคำค้นหา
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

          {/* ช่วงเวลาติดต่อกลับ */}
          <div className="form-select-wrapper">
            <label className="form-label">
              ช่วงเวลาที่สะดวกให้ติดต่อกลับ :
              <div className="custom-select-container" style={{ position: 'relative' }}>
                <select
                  name="contactTime"
                  value={formData.contactTime}
                  onChange={handleChange}
                  className={`form-select ${formData.contactTime === '' ? 'placeholder' : ''} ${errors.contactTime ? 'input-error' : ''
                    }`}
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
            </label>
            {errors.contactTime && <div className="error-text">{errors.contactTime}</div>}
          </div>

          {/* กล่อง reCAPTCHA (แสดง/ซ่อนด้วย CSS ไม่ลบออกจาก DOM) */}
          {/* <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '1rem',
              visibility: showCaptcha ? 'visible' : 'hidden',
              height: showCaptcha ? 'auto' : 0,
              overflow: 'hidden'
            }}
          >
            <ReCAPTCHA
              sitekey="6LcIkRosAAAAAND5QNfsXclXOIMMr6CT4zoK124Q"
              onChange={handleCaptchaChange}
            />
          </div> */}

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
