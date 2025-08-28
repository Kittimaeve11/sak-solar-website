'use client';
import React from 'react';
import { useEffect, useState } from "react";
import { useLocale } from '../Context/LocaleContext';
import { FaLine } from "react-icons/fa6";
import { AiFillTikTok } from "react-icons/ai";
import { FaFacebookSquare, FaYoutube, FaInstagramSquare } from "react-icons/fa";
import { IoChevronBackOutline } from "react-icons/io5";
import '@/styles//contact.css';
import Link from "next/link";
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import { validateFieldmoreInfo } from '../Utils/validation'
import Swal from 'sweetalert2';
import { MdOutlineKeyboardArrowDown } from "react-icons/md";



const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function Page() {
  const { messages, locale } = useLocale(); // ✅ ใช้ locale จาก Context

  const [contacts, setContacts] = useState([]);
  // const [socials, setSocials] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [brander, setBrander] = useState([]);
  console.log("Brander:", brander);

  useEffect(() => {
    // เปลี่ยน title และ meta description
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

    // ฟังก์ชัน async ดึงข้อมูลทั้งหมด
    const fetchAllData = async () => {
      try {
        // ดึง contacts, brander และ topics พร้อมกัน
        const [contactsRes, branderRes, topicsRes] = await Promise.all([
          fetch(`${baseUrl}/api/contactapi`, { headers: { 'X-API-KEY': `${apiKey}` } }),
          fetch(`${baseUrl}/api/branderIDapi/8`, { headers: { 'X-API-KEY': `${apiKey}` } }),
          fetch(`${baseUrl}/api/topicsapi`, { headers: { 'X-API-KEY': `${apiKey}` } }),
        ]);

        // แปลง response เป็น JSON
        const [contactsData, branderData, topicsData] = await Promise.all([
          contactsRes.json(),
          branderRes.json(),
          topicsRes.json(),
        ]);

        setContacts(contactsData.result || []);
        setBrander(branderData.data ? [branderData.data] : []);
        if (topicsData.status && Array.isArray(topicsData.result)) {
          setTopics(topicsData.result);
        } else {
          console.error("No topic data");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);


  // useEffect(() => {
  //   const fetchContacts = async () => {
  //     try {
  //       const res = await fetch('/api/data');
  //       const data = await res.json();
  //       setContacts(data.contacts || []);
  //       setSocials(data.socials || []);
  //     } catch (error) {
  //       console.error('Error fetching contacts:', error);
  //     }
  //   };

  //   fetchContacts();
  // }, []);

  const [formData, setFormData] = useState({
    topic: '',
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const getClassName = (value, base) =>
    value.trim() === "" ? `${base} placeholder-gray` : `${base} input-filled`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name") {
      newValue = value.replace(/[^\u0E01-\u0E4F\u0E5A-\u0E7Fa-zA-Z\s]/g, '');
    } else if (name === "phone") {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === "email") {
      newValue = value.replace(/[^\x00-\x7F]/g, '');
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // ป้องกันกดซ้ำ
    if (!validateAll()) return;

    setIsSubmitting(true);

    const payload = {
      topic: 1, // fixed value
      fullname: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message, // ต้องสะกดให้ตรงกับ PHP
    };

    try {
      const res = await fetch(`${baseUrl}/api/contactinqpageapi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("ส่งข้อมูลไม่สำเร็จ");

      await Swal.fire({
        icon: 'success',
        title: 'ส่งข้อมูลเรียบร้อยแล้ว',
        showConfirmButton: false,
        timer: 2000,
      });

      // เคลียร์ฟอร์ม
      setFormData({ topic: "", name: "", phone: "", email: "", message: "" });
      setTouched({});
      setErrors({});
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดในการส่งข้อความ',
        text: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // const getIcon = (id) => {

  //   switch (id) {
  //     case 1: return <Image src="/images/building.png" alt="Building" style={{ width: 28, height: 28 }} />;
  //     case 2: return <Image src="/images/phone.png" alt="Phone" style={{ width: 25, height: 25 }} />;
  //     case 3: return <Image src="/images/mail.png" alt="Email" style={{ width: 28, height: 28 }} />;
  //     default: return null;
  //   }
  // };
  const socialIconMap = {
    facebook: <FaFacebookSquare style={{ color: "#1877f2", fontSize: 36 }} />,
    line: <FaLine style={{ color: "#00c300", fontSize: 35 }} />,
    instagram: <FaInstagramSquare style={{ color: "#F5058D", fontSize: 36 }} />,
    youtube: <FaYoutube style={{ color: "#FF0033", fontSize: 36 }} />,
    tiktok: <AiFillTikTok style={{ color: "#101010", fontSize: 36 }} />,
  };

  const getIcon = [
    <Image key="building" src="/images/icons/building.png" alt="Building" width={28} height={28} />,
    <Image key="phone" src="/images/icons/phone.png" alt="Phone" width={25} height={25} />,
    <Image key="fax" src="/images/icons/fax.png" alt="Email" width={28} height={28} />,
    <Image key="mail" src="/images/icons/mail.png" alt="Email" width={28} height={28} />,
    <Image key="work" src="/images/icons/working-hours.png" alt="Email" width={28} height={28} />,

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
      {loading ? (
        <div className="skeleton-banner"></div>
      ) : (
        brander.map((item) => (
          <div className="banner-container fade-in" key={item.brander_ID}>
            <picture>
              <source srcSet={`${baseUrl}/${item.brander_pictureMoblie}`} media="(max-width: 768px)" />
              <Image
                src={`${baseUrl}/${item.brander_picturePC}`}
                alt="Contact Banner"
                width={1530}
                height={800}
                className="banner-image"
              />
            </picture>
          </div>
        ))
      )}

      <main className="layout-container">
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
                    <Image
                      src={`${baseUrl}/${item.locationphoto}`}
                      alt="อาคารบริษัท"
                      className="companyImage"
                      width={800}
                      height={600}
                      priority
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

          <div className="form-submit" style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <button type="submit" className="buttonPrimaryorange">


              {messages.send}
            </button>
            <Link href="/" passHref>
              <button type="button" className="buttonPrimary">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                  <IoChevronBackOutline style={{ fontSize: '1.2rem' }} />
                  {messages.back}
                </div>
              </button>
            </Link>
          </div>
        </form>

      </main>


    </div >
  );
}