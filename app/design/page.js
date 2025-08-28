'use client';

import React, { useState } from 'react';
import * as Yup from 'yup';
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const validationSchema = Yup.object({
    name: Yup.string().required('กรุณากรอกชื่อ'),
    country: Yup.string().required('กรุณาเลือกประเทศ'),
    gender: Yup.string().required('กรุณาเลือกเพศ'),
    agree: Yup.boolean().oneOf([true], 'กรุณายอมรับเงื่อนไข'),
    message: Yup.string().required('กรุณาฝากข้อความ')
});

export default function Page() {
    const [values, setValues] = useState({
        name: '',
        country: '',
        gender: '',
        agree: false,
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
    };

    const getClassName = (name, baseClass) => {
        return `${baseClass} ${touched[name] && errors[name] ? 'error-border' : ''}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await validationSchema.validate(values, { abortEarly: false });
            setErrors({});
            console.log('ส่งข้อมูล:', values);
        } catch (err) {
            const formErrors = {};
            err.inner.forEach((error) => {
                formErrors[error.path] = error.message;
            });
            setErrors(formErrors);
        }
    };

    const handleReset = () => {
        setValues({
            name: '',
            country: '',
            gender: '',
            agree: false,
            message: ''
        });
        setErrors({});
        setTouched({});
    };

    return (
        <div>
            {/* ปุ่มตัวอย่าง */}
            <div style={{ margin: '0 1rem' }}>
                <br />
                <button type="button" className="buttonPrimary">buttonPrimary</button>
                <button type="button" className="buttonSecondarybule">buttonSecondarybule</button>
                <button type="button" className="buttonSecondaryonebule">buttonSecondaryonebule</button>
            </div>

            <div style={{ margin: '0 1rem' }}>
                <button type="button" className="buttonDelete">buttonDelete</button>
                <button type="button" className="buttonSecondarydelte">buttonSecondarydelte</button>
                <button type="button" className="buttonSecondaryonedelte">buttonSecondaryonedelte</button>
            </div>

            <div style={{ margin: '0 1rem' }}>
                <button type="button" className="buttonPrimaryorange">buttonPrimaryorange</button>
                <button type="button" className="buttonSecondaryorange">buttonSecondaryorange</button>
                <button type="button" className="buttonSecondaryoneorange">buttonSecondaryoneorange</button>
            </div>

            {/* ฟอร์ม */}
            <form onSubmit={handleSubmit} className="form-container">
                <div>
                    <label htmlFor="name" className="form-label">ชื่อ - นามสกุล :</label>
                    <input
                        name="name"
                        type="text"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getClassName("name", "form-field")}
                        style={{ fontSize: '15px' }}
                    />
                    {touched.name && errors.name && <div className="error-text">{errors.name}</div>}
                </div>

                <div>
                    <label className="form-label">เพศ:</label>
                    {['male', 'female', 'other'].map((option) => (
                        <label key={option} className="form-radio">
                            <input
                                type="radio"
                                name="gender"
                                value={option}
                                checked={values.gender === option}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="radio-input"
                            />
                            {option === 'male' ? 'ชาย' : option === 'female' ? 'หญิง' : 'อื่น ๆ'}
                        </label>
                    ))}
                    {touched.gender && errors.gender && <div className="error-text">{errors.gender}</div>}
                </div>

                <div className="form-select-wrapper">
                    <label htmlFor="country" className="form-label">ประเทศ :</label>
                    <div className="custom-select-container">
                        <select
                            name="country"
                            value={values.country}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getClassName("country", "form-select")}
                        >
                            <option value="" disabled hidden>-- กรุณาเลือก --</option>
                            <option value="th">ไทย</option>
                            <option value="us">สหรัฐฯ</option>
                            <option value="jp">ญี่ปุ่น</option>
                        </select>
                        <MdOutlineKeyboardArrowDown className="select-arrow" />
                    </div>
                    {touched.country && errors.country && <div className="error-text">{errors.country}</div>}
                </div>

                <div className="checkbox-wrapper">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="agree"
                            checked={values.agree}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="checkbox-input"
                        />
                        <span className="custom-checkbox"></span>
                        <span style={{ color: '#264798' }}>ยอมรับเงื่อนไขการใช้งาน</span>
                    </label>
                    {touched.agree && errors.agree && <div className="error-text">{errors.agree}</div>}
                </div>

                <div>
                    <label className="form-label">
                        ฝากข้อความ <span className="required-asterisk">*</span>
                    </label>
                    <textarea
                        name="message"
                        rows={4}
                        value={values.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={getClassName("message", "form-textarea")}
                    />
                    {touched.message && errors.message && <div className="error-text">{errors.message}</div>}
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <button type="submit" className="buttonPrimary">ส่งข้อมูล</button>
                    <button type="button" onClick={handleReset} className="buttonDelete">เคลียร์ข้อมูล</button>
                </div>
            </form>
        </div>
    );
}
