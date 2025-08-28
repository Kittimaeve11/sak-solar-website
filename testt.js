import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import TabMenu from "../components/TabMenu";
import { useLocale } from '../Context/LocaleContext';
import { FaPhoneVolume, FaLine } from "react-icons/fa6";
import { FaFacebookSquare } from "react-icons/fa";
import { PiBuildingOfficeFill } from "react-icons/pi";
import { MdEmail, MdHome } from "react-icons/md";
import '../../styles/globals.css';
import '../../styles/contact.css';
import Link from "next/link";

export default function Page() {
  const { messages, locale } = useLocale();
  const [contacts, setContacts] = useState([]);
  const [socials, setSocials] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const iconMapById = useMemo(() => ({
    1: <PiBuildingOfficeFill className="contact-icon" />,
    2: <FaPhoneVolume className="contact-icon" />,
    3: <MdEmail className="contact-icon" />,
  }), []);

  const iconComponentByKey = useMemo(() => ({
    facebook: <FaFacebookSquare color="#1877f2" />,
    line: <FaLine color="#00c300" />
  }), []);

  useEffect(() => {
    fetch('/api/contact')
      .then(res => res.json())
      .then(data => {
        setContacts(data.contacts || []);
        setSocials(data.socials || []);
      })
      .catch(err => console.error("Failed to fetch contact data", err));
  }, []);

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

  const validateField = (name, value) => {
    switch (name) {
      case 'topic':
        return value ? '' : "กรุณาเลือกหัวข้อที่ต้องการสอบถาม";
      case 'name':
        if (!value.trim()) return "กรุณากรอกชื่อและนามสกุลของท่าน";
        const validName = /^[\u0E01-\u0E4E\u0E50-\u0E59a-zA-Z\s]+$/.test(value.trim());
        const repeat = /(.)\1{4,}/.test(value);
        const word = /[ก-๙]{3,}|[a-zA-Z]{3,}/.test(value);
        if (!validName || repeat || !word) return "กรุณากรอกชื่อและนามสกุลให้ถูกต้อง";
        return '';
      case 'phone':
        if (!value) return "กรุณากรอกหมายเลขโทรศัพท์";
        if (value.length !== 10) return "กรุณากรอกหมายเลขโทรศัพท์ให้ครบ 10 หลัก";
        return '';
      case 'email':
        if (!value) return '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
          return "กรุณากรอกรูปแบบอีเมล์ให้ถูกต้อง เช่น example@example.com";
        return '';
      case 'message':
        const clean = value.trim();
        const pattern = /^[ก-๙a-zA-Z0-9\s.,!?()'"-]+$/;
        const repeatMsg = /(.)\1{4,}/.test(clean);
        const long = clean.length > 1000;
        const hasWords = clean.split(/\s+/).length >= 1;
        if (!clean) return "กรุณากรอกข้อความที่ท่านต้องการสอบถาม";
        if (!pattern.test(clean) || repeatMsg || long || !hasWords)
          return "กรุณากรอกข้อความที่ท่านต้องการสอบถามให้ถูกต้องและชัดเจน";
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    setTouched({
      topic: true, name: true, phone: true, email: true, message: true
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("ส่งอีเมลไม่สำเร็จ");

      alert("ส่งข้อมูลเรียบร้อยแล้ว");
      setFormData({ topic: "", name: "", phone: "", email: "", message: "" });
      setTouched({});
      setErrors({});
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการส่งข้อความ: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="layout-container">
      <Navbar />
      <TabMenu />
      {/* แบนเนอร์ที่เปลี่ยนตามขนาดหน้าจอ */}
      <div className="banner-container">
        <picture>
          {/* แสดงรูปสำหรับมือถือ (width <= 768px) */}
          <source srcSet="/images/contact_banner67_rp.jpg" media="(max-width: 768px)" />
          {/* แสดงรูปสำหรับเดสก์ท็อป */}
          <img src="/images/contact_banner67.jpg" alt="Contact Banner" className="banner-image" />
        </picture>
      </div>


      <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem' }}>
        <main style={{ padding: '0.8em' }}>
          <h1 style={{ color: '#102E50', fontWeight: 300 }}>{messages.company}</h1>
        </main>
      </div>
      
{/* ติดต่อเรา */}
      <div className="contact-container">
        {contacts.map(item => (
          <div key={item.id} className="contact-box">
            {iconMapById[item.id]}
            <div className="contact-text">
              <h4 dangerouslySetInnerHTML={{
                __html: locale === 'th' ? item.WorkforceTH : item.WorkforceENG
              }} />
            </div>
          </div>
        ))}

        <div className="contact-box1 social-section">
          <div className="social-title">
            <h3 style={{ color: '#E78B48', fontWeight: 400 }}>{messages.additional}</h3>
          </div>
          <div className="social-icons">
            {socials.map(item => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                {iconComponentByKey[item.icon]}
              </a>
            ))}
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '2px solid #CBDCEB', margin: '0 50px', marginTop: '1rem' }} />

      <h1 style={{ textAlign: 'center', padding: '0.5rem', color: '#102E50', fontWeight: 300 }}>{messages.ask}</h1>

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-grid">
          {/* Select Topic */}
          <label htmlFor="topic" className="form-label">{messages.selecttop} *</label>
          <select name="topic" value={formData.topic}
            onChange={handleChange}
            onBlur={() => setTouched(prev => ({ ...prev, topic: true }))}
            className={getClassName(formData.topic, "form-input")}>
            <option value="">{messages.pleaseselect}**</option>
            <option>{messages.inquiries1}</option>
            <option>{messages.inquiries2}</option>
            <option>{messages.inquiries3}</option>
          </select>
          {touched.topic && errors.topic && <p className="error-text">*{errors.topic}</p>}

          {/* Name */}
          <label className="form-label">{messages.namelast} *</label>
          <input type="text" name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
            placeholder={messages.please_fill}
            className={getClassName(formData.name, "form-input")}
          />
          {touched.name && errors.name && <p className="error-text">*{errors.name}</p>}

          {/* Phone */}
          <label className="form-label">{messages.pnumber} *</label>
          <input type="tel" name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
            placeholder={`${messages.onlyphone} (0912345678)**`}
            className={getClassName(formData.phone, "form-input")}
            inputMode="numeric" maxLength={10}
          />
          {touched.phone && errors.phone && <p className="error-text">*{errors.phone}</p>}

          {/* Email */}
          <label className="form-label">อีเมล์ (ถ้ามี)</label>
          <input type="email" name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            placeholder="example@example.com"
            className={getClassName(formData.email, "form-input")}
          />
          {touched.email && errors.email && <p className="error-text">*{errors.email}</p>}

          {/* Message */}
          <label className="form-label">ฝากข้อความ *</label>
          <textarea name="message" rows={4}
            value={formData.message}
            onChange={handleChange}
            onBlur={() => setTouched(prev => ({ ...prev, message: true }))}
            className={getClassName(formData.message, "form-textarea")}
          />
          {touched.message && errors.message && <p className="error-text">*{errors.message}</p>}
        </div>

        <div className="form-submit" style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
          <button type="submit" className="form-button btn-orange" disabled={isSubmitting}>
            <MdEmail style={{ fontSize: '1.3em' }} /> ส่งข้อความ
          </button>
          <Link href="/" passHref>
            <button type="button" className="form-button btn-blue">
              <MdHome style={{ fontSize: '1.3em' }} /> {messages.back}
            </button>
          </Link>
        </div>
      </form>

      <iframe src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d60843.47625946267!2d100.07331209813584!3d17.616155827293905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1zMjc1IOC4q-C4oeC4ueC5iOC4l-C4teC5iCAzIOC4leC4s-C4muC4peC4hOC4uOC5ieC4h-C4leC4sOC5gOC4oOC4siDguK3guLPguYDguKDguK3guYDguKHguLfguK3guIfguK3guLjguJXguKPguJTguLTguJXguJbguYwg4LiI4Lix4LiH4Lir4Lin4Lix4LiU4Lit4Li44LiV4Lij4LiU4Li04LiV4LiW4LmMLCBVdHRhcmFkaXQsIFRoYWlsYW5kLCBVdHRhcmFkaXQgNTMwMDA!5e0!3m2!1sth!2sth!4v1747899816988!5m2!1sth!2sth" width="600" height="450">
      </iframe>
    </div>
  );
}
