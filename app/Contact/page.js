'use client';
import React, { useEffect, useState } from "react";
import { useLocale } from '../Context/LocaleContext';
import { FaLine } from "react-icons/fa6";
import { AiFillTikTok } from "react-icons/ai";
import { FaFacebookSquare, FaYoutube, FaInstagramSquare } from "react-icons/fa";
import { IoChevronBackOutline } from "react-icons/io5";
import '@/styles/contact.css';
import Link from "next/link";
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { validateFieldmoreInfo } from '../Utils/validation';
import Swal from 'sweetalert2';
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import ReCAPTCHA from 'react-google-recaptcha';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

//  Memory cache
let contactCache = {
  contacts: null,
  brander: null,
  topics: null,
  timestamp: 0,
};

export default function Page() {
  const { messages, locale } = useLocale();
  const [contacts, setContacts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [brander, setBrander] = useState([]);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  console.log("Brander:", brander);

  /* =========================================================
      โหลดข้อมูล contacts / brander / topics
     ========================================================= */
  useEffect(() => {
    document.title = 'ติดต่อเรา | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด';
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute("content", "หน้าติดต่อเรา");
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'หน้าติดต่อเรา';
      document.head.appendChild(meta);
    }

    const fetchAllData = async () => {
      try {
        const cacheAge = Date.now() - contactCache.timestamp;
        if (
          contactCache.contacts &&
          contactCache.brander &&
          contactCache.topics &&
          cacheAge < 1000 * 60 * 10
        ) {
          console.log("ใช้ข้อมูลจาก cache");
          setContacts(contactCache.contacts);
          setBrander(contactCache.brander);
          setTopics(contactCache.topics);
          setLoading(false);
          return;
        }

        console.log("โหลดข้อมูลจาก API");
        setLoading(true);
        const [contactsRes, branderRes, topicsRes] = await Promise.all([
          fetch(`${baseUrl}/api/contactapi`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/branderIDapi/8`, { headers: { 'X-API-KEY': apiKey } }),
          fetch(`${baseUrl}/api/topicsapi`, { headers: { 'X-API-KEY': apiKey } }),
        ]);

        const [contactsData, branderData, topicsData] = await Promise.all([
          contactsRes.json(),
          branderRes.json(),
          topicsRes.json(),
        ]);

        const contactsList = contactsData.result || [];
        const branderList = branderData.data ? [branderData.data] : [];
        const topicsList =
          topicsData.status && Array.isArray(topicsData.result)
            ? topicsData.result
            : [];

        setContacts(contactsList);
        setBrander(branderList);
        setTopics(topicsList);

        contactCache = {
          contacts: contactsList,
          brander: branderList,
          topics: topicsList,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  /* =========================================================
      ฟังก์ชันบันทึก Log การส่งข้อความสอบถามเพิ่มเติม (actionType = 7)
     ========================================================= */
  // ฟังก์ชัน handleLogContactSubmit ใช้สำหรับบันทึก Log เมื่อผู้ใช้ส่งฟอร์ม "สอบถามเพิ่มเติม"
  const handleLogContactSubmit = async () => {
    try {
      // สร้างข้อมูล Log ที่จะส่งไปยัง API
      const logData = {
        actionType: '7', // รหัสประเภทการกระทำ (7 = ส่งฟอร์มสอบถามเพิ่มเติม)
        actionDetail: `ส่งแบบฟอร์มสอบถามเพิ่มเติม | หัวข้อ: ${formData.topic || 'N/A'} | ชื่อ: ${formData.name || 'N/A'
          } | เบอร์โทร: ${formData.phone || 'N/A'} | อีเมล: ${formData.email || 'ไม่มี'
          } | ข้อความ: ${formData.message || 'ไม่มีข้อความ'}`,
        // รายละเอียดข้อมูลที่ผู้ใช้กรอก เช่น หัวข้อ ชื่อ เบอร์โทร อีเมล และข้อความ

        typeUser: 'ผู้เยี่ยมชมเว็บไซต์', // ประเภทผู้ใช้
        datatype: 'สอบถามเพิ่มเติม', // ประเภทของข้อมูล Log
        dataID: '0', // กำหนดเป็น "0" เพื่อป้องกันค่า null
        datatypeID: '0', // กำหนดเป็น "0" เพื่อป้องกันค่า null
        brandtype: 'N/A', // ไม่มีการระบุแบรนด์
        dataname: 'Contact Page Form', // ชื่อของฟอร์มที่บันทึก Log
      };

      // เรียก API เพื่อส่งข้อมูล Log ไปบันทึก
      fetch(`${baseUrl}/api/logWebsitepageapi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // ระบุชนิดข้อมูลเป็น JSON
          'X-API-KEY': apiKey, // ใส่ API Key สำหรับการเข้าถึง API
        },
        body: JSON.stringify(logData), // แปลงข้อมูล logData เป็น JSON ก่อนส่ง
      })
        // อ่านค่าตอบกลับจาก API เป็นข้อความ
        .then(res => res.text())
        // แสดงข้อความใน console ว่าบันทึก Log สำเร็จ
        .then(text => console.log('Log contact saved:', text))
        // กรณีเกิดข้อผิดพลาดในการส่ง Log
        .catch(err => console.warn('log failed:', err.message));
    } catch (err) {
      // กรณีเกิดข้อผิดพลาดในฟังก์ชันโดยรวม
      console.warn('unexpected log error:', err.message);
    }
  };
  /* =========================================================
      Validate & Handle Input
     ========================================================= */
  const getClassName = (value, base) =>
    value.trim() === "" ? `${base} placeholder-gray` : `${base} input-filled`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name") newValue = value.replace(/[^\u0E01-\u0E4Fa-zA-Z\s]/g, '');
    else if (name === "phone") newValue = value.replace(/\D/g, '').slice(0, 10);
    else if (name === "email") newValue = value.replace(/[^\x00-\x7F]/g, '');

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateAll = () => {
    const newErrors = validateFieldmoreInfo(formData, messages);
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));
    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
      reCAPTCHA Handler
     ========================================================= */
  const handleCaptchaChange = async (token) => {
    if (!token) return;
    setCaptchaToken(token);
    await handleSubmitAfterCaptcha(token);
  };

  /* =========================================================
      ส่งข้อมูลจริงหลังผ่าน reCAPTCHA
     ========================================================= */
  const handleSubmitAfterCaptcha = async (token) => {
    setIsSubmitting(true);
    const payload = {
      topic: formData.topic,
      fullname: formData.name,
      phone: formData.phone,
      email: formData.email || "",
      message: formData.message,
    };

    try {
      const res = await fetch(`${baseUrl}/api/contactinqpageapi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status || data.success) {
        await Swal.fire({
          icon: "success",
          title: "ส่งข้อมูลเรียบร้อยแล้ว!",
          text: "ทีมงานจะติดต่อกลับโดยเร็วที่สุดค่ะ",
          showConfirmButton: false,
          timer: 2500,
        });

        //  บันทึก Log หลังส่งสำเร็จ
        handleLogContactSubmit();

        //  รีเซ็ตฟอร์ม
        setFormData({ topic: "", name: "", phone: "", email: "", message: "" });
        setCaptchaToken(null);
        setShowCaptcha(false);
      } else {
        Swal.fire({ icon: "error", title: "ไม่สามารถส่งข้อมูลได้" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
      เมื่อผู้ใช้กดปุ่ม "ส่งข้อความ"
     ========================================================= */
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

  /* =========================================================
      ไอคอนโซเชียล
     ========================================================= */
  const socialIconMap = {
    facebook: <FaFacebookSquare style={{ color: "#1877f2", fontSize: 36 }} />,
    line: <FaLine style={{ color: "#00c300", fontSize: 35 }} />,
    instagram: <FaInstagramSquare style={{ color: "#F5058D", fontSize: 36 }} />,
    youtube: <FaYoutube style={{ color: "#FF0033", fontSize: 36 }} />,
    tiktok: <AiFillTikTok style={{ color: "#101010", fontSize: 36 }} />,
  };

  /* =========================================================
      ไอคอนที่อยู่ / เบอร์ / อีเมล
     ========================================================= */
  const getIcon = [
    <Image key="building" src="/images/icons/building.png" alt="Building" width={28} height={28} />,
    <Image key="phone" src="/images/icons/phone.png" alt="Phone" width={25} height={25} />,
    <Image key="fax" src="/images/icons/fax.png" alt="Fax" width={28} height={28} />,
    <Image key="mail" src="/images/icons/mail.png" alt="Mail" width={28} height={28} />,
    <Image key="work" src="/images/icons/working-hours.png" alt="Work Hours" width={28} height={28} />,
  ];


  return (

    <div className="no-margin">
      {/* ToastContainer ต้องมีใน JSX เพื่อแสดง toast */}
      {/* <ToastContainer
        position="top-center"
        toastStyle={{
          margin: 'auto',
          minWidth: '300px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '1.1rem'
        }}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          position: 'fixed',
          zIndex: 9999,
        }}
      /> */}
      {/* Skeleton Banner */}
      {/* ================= Banner ================= */}
      {loading ? (
        <div className="skeleton skeleton-banner fade-in"></div>
      ) : (
        brander.map((b) => {
          const imgSrc = window.innerWidth <= 768
            ? `${baseUrl}/${b.brander_pictureMoblie}`
            : `${baseUrl}/${b.brander_picturePC}`;

          return (
            <div key={b.brander_ID} className="banner-container fade-in">
              <Image
                src={imgSrc}
                alt={b.brander_name}
                fill
                className="banner-image"
                unoptimized
                priority
                sizes="100vw"
              />
            </div>
          );
        })
      )}

      <main className="layout-containercontact">
        <h1 className="headtitle">{messages.contact}</h1>
        {loading ? (
          <div className="contactGrid">
            {/* ข้อมูลบริษัท */}
            <div className="skeleton-card" style={{ gridColumn: '1 / 2' }}>
              <div className="skeleton-title" style={{ width: '40%' }}></div>
              <div className="skeleton-bullet-list">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton-bullet">
                    <div className="skeleton-bullet-circle"></div>
                    <div
                      className="skeleton-bullet-line"
                      style={{ width: `${90 - i * 5}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* รูปบริษัท */}
            <div className="skeleton-card" style={{ gridColumn: '2 / 3' }}>
              <div className="skeleton-image skeleton-image--medium"></div>
            </div>

            {/* แผนที่ */}
            <div className="skeleton-card" style={{ gridColumn: '1 / 2' }}>
              <div className="skeleton-image skeleton-image--large"></div>
            </div>

            {/* ช่องทางติดต่อ */}
            <div className="skeleton-card" style={{ gridColumn: '2 / 3' }}>
              <div className="skeleton-title" style={{ width: '50%' }}></div>
              <div className="skeleton-bullet-list">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton-bullet">
                    <div className="skeleton-bullet-circle"></div>
                    <div
                      className="skeleton-bullet-line"
                      style={{ width: `${80 - i * 5}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (


          <div className="contactGrid fade-in">
            {contacts.map((item) => {
              const infoValues = [
                locale === 'th' ? item.address_th : item.address_en,
                item.phone_number.replace(/ *, */g, ' | '),
                item.fax || '',
                item.email_sub
                  ? `${item.email_main} | ${item.email_sub}`
                  : item.email_main,
                locale === 'th' ? item.officehours_th : item.officehours_en,
              ];

              const socialValues = [
                { link: item.facebook, name: messages.contacts.socialmedia.facebook, key: 'facebook' },
                { link: item.line, name: messages.contacts.socialmedia.line, key: 'line' },
                { link: item.instagram, name: messages.contacts.socialmedia.ig, key: 'instagram' },
                { link: item.youtube, name: messages.contacts.socialmedia.youtube, key: 'youtube' },
                { link: item.tiktok, name: messages.contacts.socialmedia.tiktok, key: 'tiktok' },
              ].filter(data =>
                data.link !== null &&
                data.link !== undefined &&
                data.link !== 'null' &&
                data.link !== 'undefined' &&
                typeof data.link === 'string' &&
                data.link.trim() !== ''
              );


              return (
                <React.Fragment key={item.id}>
                  <div className="gridItem companyInfo">
                    <h1 className="companyName">{messages.company}</h1>
                    {infoValues.map((value, index) => (
                      <div key={index} className="infoItem">
                        <span className="icon">{getIcon[index]}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="gridItem companyImageWrapper">
                    {console.log("Full Image URL:", `${baseUrl.replace(/\/$/, '')}/${item.locationphoto.replace(/^\/+/, '')}`)}

                    <Image
                      src={`${baseUrl.replace(/\/$/, '')}/${item.locationphoto.replace(/^\/+/, '')}`}
                      alt="อาคารบริษัท"
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: "100%", height: "auto" }}
                      className="companyImage"
                    />



                  </div>

                  <div className="gridItem googleMapWrapper">
                    <iframe
                      className="googleMap"
                      src={`${item.google_map}`}
                      width="100%"
                      height="400"
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="gridItem socialSection">
                    <h1 className="communicationName">{messages.communication}</h1>
                    <div className="socialLinks">
                      {socialValues.map(({ link, name, key }) => (
                        <div
                          key={key}
                          className="socialItem"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}
                        >
                          <span className="iconFL">{socialIconMap[key]}</span>
                          <Link
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="label"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}

        <hr
          style={{
            border: 'none',
            borderTop: '2px solid #CBDCEB',
            width: 'calc(100% - 5px)',
            margin: '1rem 10px'
          }}
        />

        <h1 className="headtitle" style={{ marginBottom: '-1rem' }}>
          {messages.ask}
        </h1>
        <form onSubmit={handleSubmit} className="form-container">
          <div >
            {/* Select Topic */}
            <div className="form-select-wrapper">
              <label htmlFor="topic" className="form-label">
                {messages.selecttop} <span className="required-asterisk">*</span>
              </label>
              <div className={`custom-select-container ${touched.topic && errors.topic ? 'error-border' : ''}`}>

                <select
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  onBlur={() => setTouched((prev) => ({ ...prev, topic: true }))}
                  className={`${getClassName(formData.topic, "form-select")} ${touched.topic && errors.topic ? 'error-border' : ''}`}
                >
                  <option value="" disabled hidden>
                    {messages.pleaseselect}**
                  </option>
                  {topics.map((topic) => (
                    <option key={topic.topicID} value={topic.topicID}>
                      {locale === "th" ? topic.topic_nameTH : topic.topic_nameEN}
                    </option>
                  ))}
                </select>
                <MdOutlineKeyboardArrowDown className="select-arrow" />
              </div>
              {touched.topic && errors.topic && <p className="error-text">*{errors.topic}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="form-label">
                {messages.namelast} <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                id='name'
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                placeholder={`${messages.please_fill}**`}
                className={`${getClassName(formData.name, "form-field")} ${touched.name && errors.name ? 'error-border' : ''}`} />
              {touched.name && errors.name && <p className="error-text">*{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">
                {messages.pnumber} <span className="required-asterisk">*</span>
              </label>
              <input
                type="tel"
                id='phone'
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                placeholder={`${messages.onlyphone} (0912345678)**`}
                className={`${getClassName(formData.phone, "form-field")} ${touched.phone && errors.phone ? 'error-border' : ''}`} inputMode="numeric"
                maxLength={10}
              />
              {touched.phone && errors.phone && <p className="error-text">*{errors.phone}</p>}
            </div>

            {/* Email */}
            {/* Email */}
            <div>
              <label className="form-label">อีเมล์ (ถ้ามี)</label>
              <input
                type="email"
                id='email'
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                placeholder="example@example.com"
                className={`${getClassName(formData.email, "form-field")} ${touched.email && errors.email ? 'error-border' : ''}`}
              />
              {touched.email && errors.email && <p className="error-text">*{errors.email}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="form-label">
                ฝากข้อความ <span className="required-asterisk">*</span>
              </label>
              <textarea
                id='message'
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                onBlur={() => setTouched((prev) => ({ ...prev, message: true }))}
                className={`${getClassName(formData.message, "form-textarea")} ${touched.message && errors.message ? 'error-border' : ''}`}
              />
              {touched.message && errors.message && <p className="error-text">*{errors.message}</p>}
            </div>
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

          {/* ปุ่มส่งฟอร์มและย้อนกลับ */}
          <div
            className="form-submit"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '24px',
              marginTop: '1.5rem',
            }}
          >
            {/* ปุ่มส่ง */}
            <button
              type="submit"
              className="buttonPrimaryorange"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
            </button>

            {/* ปุ่มย้อนกลับ */}
            <Link href="/" passHref>
              <button type="button" className="buttonPrimary">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                  {/* <IoChevronBackOutline style={{ fontSize: '1.2rem' }} /> */}
                  กลับสู่หน้าหลัก
                </div>
              </button>
            </Link>
          </div>

        </form>

      </main>

    </div>
  );
}
