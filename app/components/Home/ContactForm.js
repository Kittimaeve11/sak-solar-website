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
  const { locale } = useLocale()               // ตรวจสอบภาษาปัจจุบัน (th/en)
  const searchParams = useSearchParams()       // ใช้ดึง query string จาก URL
  const wrapperRef = useRef(null)              // ใช้ตรวจจับการคลิกนอกกรอบ suggestion

  // State สำหรับข้อมูลฟอร์ม
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

  // State ควบคุมอื่น ๆ ของฟอร์ม
  const [query, setQuery] = useState('')             // เก็บข้อความค้นหาที่อยู่
  const [suggestions, setSuggestions] = useState([]) // รายการคำแนะนำที่อยู่
  const [errors, setErrors] = useState({})           // เก็บ error ของฟอร์ม
  const [submitting, setSubmitting] = useState(false) // สถานะกำลังส่งข้อมูล
  const [captchaToken, setCaptchaToken] = useState(null) // token ของ reCAPTCHA
  const [showCaptcha, setShowCaptcha] = useState(false)  // สถานะการแสดง reCAPTCHA
  const [loadingProducts, setLoadingProducts] = useState(true) // สถานะโหลดสินค้า

  /* =========================================================
     รวม useEffect ทั้งหมดไว้ในอันเดียว
     - จำลองโหลดข้อมูลสินค้า
     - ปิด dropdown เมื่อคลิกนอกกรอบ
     ========================================================= */
  useEffect(() => {
    // 1) จำลองการโหลดข้อมูลสินค้า (หน่วง 600 ms)
    if (productOptions && productOptions.length > 0) {
      const timer = setTimeout(() => setLoadingProducts(false), 600)
      // เคลียร์ timer ถ้า component ถูก unmount หรือ productOptions เปลี่ยน
      return () => clearTimeout(timer)
    }

    // 2) จัดการ event คลิกนอก dropdown
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    // cleanup event เมื่อ component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [productOptions])

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

    // ตรวจสอบฟิลด์หลักโดยใช้ฟังก์ชัน validateFieldmoreInfo
    const infoErrors = validateFieldmoreInfo(
      { topic: data.product, name: data.fullName, phone: data.phone },
      messages
    )

    // ตรวจสอบฟิลด์เพิ่มเติม
    if (!data.package) infoErrors.package = '*กรุณาเลือกราคาที่ยอมรับได้'
    if (!data.usageTime) infoErrors.usageTime = '*กรุณาระบุช่วงเวลาใช้ไฟ'
    if (!data.province) infoErrors.province = '*กรุณากรอกที่อยู่ของท่าน'
    if (!data.contactTime) infoErrors.contactTime = '*กรุณาเลือกช่วงเวลาติดต่อกลับ'

    return infoErrors
  }

  /* =========================================================
     ฟังก์ชันเมื่อ reCAPTCHA ผ่านการตรวจสอบ
     ========================================================= */
  const handleCaptchaChange = async (token) => {
    if (!token) return
    setCaptchaToken(token)
    await handleSubmitAfterCaptcha(token)
  }

  /* =========================================================
     ฟังก์ชันส่งฟอร์มหลังจากผ่าน reCAPTCHA แล้ว
     ========================================================= */
  const handleSubmitAfterCaptcha = async (token) => {
    setSubmitting(true)

    // รวมที่อยู่จากตำบล อำเภอ จังหวัด
    const address = [formData.subDistrict, formData.district, formData.province]
      .filter(Boolean)
      .join(', ')

    // สร้าง payload สำหรับส่งไปยัง API
    const payload = {
      producttypeID: formData.product,
      acceptableprice: formData.package,
      usagetime: formData.usageTime,
      fullname: formData.fullName,
      phonenumber: formData.phone,
      address: address,
      contedtime: formData.contactTime,
      solce: 'เว็บไซต์',
    }

    try {
      const res = await fetch(`${baseUrl}/api/Inquiriespageapi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(payload)
      });

      // ตรวจสอบสถานะการตอบกลับจาก API
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const result = await res.json()
      console.log('ผลลัพธ์จาก API:', result)

      // แสดงข้อความสำเร็จ
      await Swal.fire({
        icon: 'success',
        title: 'ส่งข้อมูลเรียบร้อยแล้ว!',
        text: 'ขอบคุณที่สนใจโซลาร์เซลล์จากเรา ทีมงานจะติดต่อกลับโดยเร็วที่สุดค่ะ',
        showConfirmButton: false,
        timer: 2500,
      })

      // รีเซ็ตค่าทั้งหมดในฟอร์มหลังส่งสำเร็จ
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
      setQuery('')
      setSuggestions([])
      setCaptchaToken(null)
      setShowCaptcha(false)
      setErrors({})
    } catch (err) {
      console.error('Error sending:', err)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้งค่ะ',
      })
    } finally {
      setSubmitting(false)
    }
  }

  /* =========================================================
     handleChange — จัดการเมื่อมีการเปลี่ยนค่าช่อง input
     ========================================================= */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      const updated = { ...prev }
      // ลบ error ของช่องที่ถูกแก้ไข
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
     handleSubmit — เมื่อผู้ใช้กดปุ่มส่งฟอร์ม
     ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    // กรณียังไม่ได้เลือกจังหวัด แต่กรอกในช่องค้นหา
    let updatedData = { ...formData }
    if (!updatedData.province && query.trim()) {
      const [subDistrict, district, province] = query.split(',').map((s) => s.trim())
      updatedData = { ...updatedData, subDistrict, district, province }
      setFormData(updatedData)
    }

    // ตรวจสอบความถูกต้อง
    const validationErrors = validate(updatedData)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    // ถ้ายังไม่เปิด reCAPTCHA ให้แสดงก่อน
    if (!showCaptcha) {
      setShowCaptcha(true)
      return
    }

    // ถ้ามี token แล้วให้ส่งข้อมูลเลย
    if (captchaToken) await handleSubmitAfterCaptcha(captchaToken)
  }

  /* =========================================================
     handleQueryChange — ค้นหาตำบล/อำเภอ/จังหวัดจากข้อความ
     ========================================================= */
  const handleQueryChange = (e) => {
    const text = e.target.value.trim()
    setQuery(text)
    setErrors((prev) => {
      const updated = { ...prev }
      if (updated.province) delete updated.province
      return updated
    })

    if (!text) return setSuggestions([])

    const matched = []

    // ค้นหาจากข้อมูลตำบล
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
          province: province?.name_th || '',
        })
      }
    })

    // จำกัดจำนวนคำแนะนำ
    setSuggestions(matched.slice(0, 30))
  }

  /* =========================================================
     handleSelect — เมื่อเลือกตำบลจากรายการคำแนะนำ
     ========================================================= */
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
     ส่วน UI แสดงฟอร์มติดต่อ (Contact Form)
     ========================================================= */
  return (
    <div className={styles.containersolar}>
      {/* กล่องหลักของฟอร์ม */}
      <div className={styles.formWrapper} style={{ marginTop: '3rem' }}>
        {/* ส่วนหัวของฟอร์ม */}
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

        {/* เริ่มต้นฟอร์ม */}
        <form onSubmit={handleSubmit}>

          {/* =========================================================
             สินค้าหรือบริการที่สนใจ (radio)
             ========================================================= */}
          <div>
            <span className="form-label">สินค้าหรือบริการที่สนใจ :</span>
            {loadingProducts ? (
              // กรณีข้อมูลสินค้ากำลังโหลด
              <div style={{ color: '#19489D', padding: '5px 0' }}>กำลังโหลดข้อมูล...</div>
            ) : (
              // แสดงรายการสินค้าเป็น radio
              <div className={`radio-group fade-in ${errors.topic ? 'error-border' : ''}`}>
                {productOptions.map((product) => {
                  const productName =
                    locale === 'th'
                      ? product.producttypenameTH
                      : product.producttypenameEN
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
                  )
                })}
              </div>
            )}
            {/* แสดงข้อความ error */}
            {errors.topic && <div className="error-text">{errors.topic}</div>}
          </div>

          {/* =========================================================
             ราคาที่ยอมรับได้ (select)
             ========================================================= */}
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
            {/* แสดงข้อความ error */}
            {errors.package && <div className="error-text">{errors.package}</div>}
          </div>

          {/* =========================================================
             ช่วงเวลาที่ใช้ไฟ (radio)
             ========================================================= */}
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

          {/* =========================================================
             ชื่อจริง-นามสกุลจริง (text)
             ========================================================= */}
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

          {/* =========================================================
             หมายเลขโทรศัพท์มือถือ (tel)
             ========================================================= */}
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

          {/* =========================================================
             ค้นหาที่อยู่ (autocomplete)
             ========================================================= */}
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

            {/* แสดงรายการแนะนำเมื่อมีผลลัพธ์ */}
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

          {/* =========================================================
             ช่วงเวลาที่สะดวกให้ติดต่อกลับ (select)
             ========================================================= */}
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

          {/* =========================================================
             ส่วนแสดง reCAPTCHA (แสดงเมื่อกรอกข้อมูลครบ)
             ========================================================= */}
          {showCaptcha && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '1rem',
                opacity: 1,
                transition: 'opacity 0.3s ease-in-out',
              }}
            >
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
              />
            </div>
          )}

          {/* =========================================================
             ปุ่มส่งฟอร์ม
             ========================================================= */}
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