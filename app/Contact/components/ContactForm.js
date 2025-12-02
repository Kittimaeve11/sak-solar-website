'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';

import { validateFieldmoreInfo } from '../../Utils/validation';

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), {
  ssr: false,
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function ContactForm({ messages, locale, topics }) {
  const [formData, setFormData] = useState({
    topic: '',
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const getClassName = (value, base) =>
    value.trim() === '' ? `${base} placeholder-gray` : `${base} input-filled`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'name') {
      newValue = value.replace(/[^\u0E01-\u0E4Fa-zA-Z\s]/g, '');
    } else if (name === 'phone') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'email') {
      newValue = value.replace(/[^\x00-\x7F]/g, '');
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateAll = () => {
    const newErrors = validateFieldmoreInfo(formData, messages);
    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );
    return Object.keys(newErrors).length === 0;
  };

  // log เหมือนเดิม
  const handleLogContactSubmit = async () => {
    try {
      const logData = {
        actionType: '7',
        actionDetail: `ส่งแบบฟอร์มสอบถามเพิ่มเติม | หัวข้อ: ${formData.topic || 'N/A'
          } | ชื่อ: ${formData.name || 'N/A'} | เบอร์โทร: ${formData.phone || 'N/A'
          } | อีเมล: ${formData.email || 'ไม่มี'} | ข้อความ: ${formData.message || 'ไม่มีข้อความ'
          }`,
        typeUser: 'ผู้เยี่ยมชมเว็บไซต์',
        datatype: 'สอบถามเพิ่มเติม',
        dataID: '0',
        datatypeID: '0',
        brandtype: 'N/A',
        dataname: 'Contact Page Form',
      };

      fetch(`${baseUrl}/api/logWebsitepageapi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify(logData),
      })
        .then((res) => res.text())
        .then((text) => console.log('Log contact saved:', text))
        .catch((err) => console.warn('log failed:', err.message));
    } catch (err) {
      console.warn('unexpected log error:', err.message);
    }
  };

  const handleSubmitAfterCaptcha = async (token) => {
    setIsSubmitting(true);
    const payload = {
      topic: formData.topic,
      fullname: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      message: formData.message,
    };

    try {
      const res = await fetch(`${baseUrl}/api/contactinqpageapi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status || data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'ส่งข้อมูลเรียบร้อยแล้ว!',
          text: 'ทีมงานจะติดต่อกลับโดยเร็วที่สุดค่ะ',
          showConfirmButton: false,
          timer: 2500,
        });

        await handleLogContactSubmit();

        setFormData({
          topic: '',
          name: '',
          phone: '',
          email: '',
          message: '',
        });
        setCaptchaToken(null);
        setShowCaptcha(false);
      } else {
        Swal.fire({ icon: 'error', title: 'ไม่สามารถส่งข้อมูลได้' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaChange = async (token) => {
    if (!token) return;
    setCaptchaToken(token);
    await handleSubmitAfterCaptcha(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateAll()) return;

    if (!showCaptcha) {
      setShowCaptcha(true);
      return;
    }

    if (captchaToken) {
      await handleSubmitAfterCaptcha(captchaToken);
    }
  };

  const isTopicLoading = topics.length === 0;

  return (
    <form onSubmit={handleSubmit} className="form-container fade-in">
      <div>
        {/* Select Topic */}
        <div className="form-select-wrapper">
          <label htmlFor="topic" className="form-label">
            {messages.selecttop} <span className="required-asterisk">*</span>
          </label>

          <div
            className={`custom-select-container ${touched.topic && errors.topic ? 'error-border' : ''
              }`}
          >
            <select
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, topic: true }))
              }
              disabled={isTopicLoading}
              className={`${getClassName(
                formData.topic,
                'form-select'
              )} ${touched.topic && errors.topic ? 'error-border' : ''}`}
            >
              {isTopicLoading ? (
                <option value="">
                  {locale === 'th'
                    ? 'กำลังโหลดหัวข้อที่ต้องการสอบถาม...'
                    : 'Loading topics, please wait...'}
                </option>
              ) : (
                <>
                  <option value="" disabled hidden>
                    {messages.pleaseselect}**
                  </option>
                  {topics.map((topic) => (
                    <option key={topic.topicID} value={topic.topicID}>
                      {locale === 'th'
                        ? topic.topic_nameTH
                        : topic.topic_nameEN}
                    </option>
                  ))}
                </>
              )}
            </select>
            <MdOutlineKeyboardArrowDown className="select-arrow" />
          </div>

          {touched.topic && errors.topic && (
            <p className="error-text">*{errors.topic}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="form-label">
            {messages.namelast} <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, name: true }))
            }
            placeholder={`${messages.please_fill}**`}
            className={`${getClassName(
              formData.name,
              'form-field'
            )} ${touched.name && errors.name ? 'error-border' : ''}`}
          />
          {touched.name && errors.name && (
            <p className="error-text">*{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="form-label">
            {messages.pnumber} <span className="required-asterisk">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, phone: true }))
            }
            placeholder={`${messages.onlyphone} (0912345678)**`}
            className={`${getClassName(
              formData.phone,
              'form-field'
            )} ${touched.phone && errors.phone ? 'error-border' : ''}`}
            inputMode="numeric"
            maxLength={10}
          />
          {touched.phone && errors.phone && (
            <p className="error-text">*{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="form-label">
            {messages.emailany}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, email: true }))
            }
            placeholder="example@example.com"
            className={`${getClassName(
              formData.email,
              'form-field'
            )} ${touched.email && errors.email ? 'error-border' : ''}`}
          />
          {touched.email && errors.email && (
            <p className="error-text">*{errors.email}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="form-label">
            {messages.leavemassage}
            <span className="required-asterisk">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, message: true }))
            }
            className={`${getClassName(
              formData.message,
              'form-textarea'
            )} ${touched.message && errors.message ? 'error-border' : ''
              }`}
          />
          {touched.message && errors.message && (
            <p className="error-text">*{errors.message}</p>
          )}
        </div>
      </div>

      {/* reCAPTCHA */}
      {/* {showCaptcha && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1rem',
          }}
        >
          <ReCAPTCHA
            sitekey="6LcIkRosAAAAAND5QNfsXclXOIMMr6CT4zoK124Q"
            onChange={handleCaptchaChange}
          />
        </div>
      )} */}

      {/* Submit Buttons */}
      <div className="form-submit">
        <button
          type="submit"
          className="buttonPrimaryorange"
          disabled={isSubmitting}
          style={{ fontSize: '14px' }}
        >
          {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
        </button>

        <Link
          href="/"
          className="buttonPrimary link-button"
          style={{ fontSize: '14px' }}
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </form>
  );
}
