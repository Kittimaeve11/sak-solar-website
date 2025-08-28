'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { products } from '@/app/data/products';
import '@/styles/products.css';
import { MdOutlineElectricBolt } from "react-icons/md";
import { useLocale } from '@/app/Context/LocaleContext';
import Link from 'next/link';

export default function ProductsPage({
    preSelectedCategoryId = null,
    preSelectedBrandNames = [],
}) {
    const { locale } = useLocale(); // ดึง locale ภาษา (เช่น 'th' หรือ 'en')

    // ฟังก์ชันช่วยแปลงชื่อหลายภาษาเป็น string ตาม locale
    const getLocalizedString = (name) => {
        if (typeof name === 'object' && name !== null) {
            return name[locale] || name.th || Object.values(name)[0] || '';
        }
        return name || '';
    };

    // แปลง categories ให้เป็น array ที่มีชื่อแสดงผลตาม locale
    const categories = products.map(({ id, name }) => ({
        id,
        name: getLocalizedString(name),
    }));

    // รวมสินค้าทั้งหมด โดยแปลงชื่อ brand, category, และ item ให้เป็น string ตาม locale
    const allItems = products.flatMap((category) =>
        category.brands.flatMap((brand) => {
            if (brand.packages) {
                return brand.packages.flatMap((pkg) =>
                    pkg.items.map((item) => ({
                        ...item,
                        id: item.id,
                        brand: getLocalizedString(brand.name),
                        brandImage: brand.brandImage || '',
                        category: getLocalizedString(category.name),
                        categoryId: category.id,
                        mainImage: item.mainImage || pkg.mainImage || brand.mainImage || '',
                        name:
                            getLocalizedString(item.inverter_model) ||
                            getLocalizedString(item.model) ||
                            'ไม่มีชื่อสินค้า',
                        price: item.price || null,
                    }))
                );
            }
            return (
                brand.items?.map((item) => ({
                    ...item,
                    id: item.id,
                    brand: getLocalizedString(brand.name),
                    brandImage: brand.brandImage || '',
                    category: getLocalizedString(category.name),
                    categoryId: category.id,
                    mainImage: item.mainImage || brand.mainImage || '',
                    name:
                        getLocalizedString(item.inverter_model) ||
                        getLocalizedString(item.model) ||
                        'ไม่มีชื่อสินค้า',
                    price: item.price || null,
                })) || []
            );
        })
    );

    // รวบรวมแบรนด์แบบไม่ซ้ำ พร้อมแปลงชื่อให้แสดงตาม locale
    const allBrands = products
        .flatMap((cat) => cat.brands)
        .filter((b, i, arr) => arr.findIndex(x => getLocalizedString(x.name) === getLocalizedString(b.name)) === i)
        .map((b) => ({
            ...b,
            name: getLocalizedString(b.name),
        }));

    // State สำหรับเก็บหมวดหมู่และยี่ห้อที่เลือก
    const [selectedCategories, setSelectedCategories] = useState(
        preSelectedCategoryId ? [preSelectedCategoryId] : []
    );
    const [selectedBrands, setSelectedBrands] = useState(preSelectedBrandNames);

    // ฟังก์ชัน toggle เลือก/ยกเลิกหมวดหมู่
    const toggleCategory = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((c) => c !== categoryId)
                : [...prev, categoryId]
        );
    };

    // ฟังก์ชัน toggle เลือก/ยกเลิกยี่ห้อ
    const toggleBrand = (brandName) => {
        setSelectedBrands((prev) =>
            prev.includes(brandName)
                ? prev.filter((b) => b !== brandName)
                : [...prev, brandName]
        );
    };

    // กรองสินค้า ตามหมวดหมู่และยี่ห้อที่เลือก
    const filteredItems = allItems.filter((item) => {
        const matchCategory =
            selectedCategories.length === 0 || selectedCategories.includes(item.categoryId);
        const matchBrand =
            selectedBrands.length === 0 || selectedBrands.includes(item.brand);
        return matchCategory && matchBrand;
    });

    // ฟิลเตอร์แบรนด์ให้แสดงเฉพาะของหมวดหมู่ที่เลือก
    const filteredBrandsByCategory = selectedCategories.length === 0
        ? [] // ถ้ายังไม่เลือกหมวดหมู่ ไม่แสดงแบรนด์
        : products
            .filter((cat) => selectedCategories.includes(cat.id))
            .flatMap((cat) => cat.brands)
            .filter((b, i, arr) =>
                arr.findIndex(x => getLocalizedString(x.name) === getLocalizedString(b.name)) === i
            )
            .map((b) => ({
                ...b,
                name: getLocalizedString(b.name),
            }));


    return (
        <main className="products-container">
            <aside className="products-sidebar">
                <div className="sidebar-header">คัดกรองสินค้า</div>
                <section>
                    <h3>หมวดหมู่สินค้า</h3>
                    <div className="filter-box">
                        {categories.map(({ id, name }) => (
                            <label key={id} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(id)}
                                    onChange={() => toggleCategory(id)}
                                />
                                {name}
                            </label>
                        ))}
                    </div>
                </section>
                <hr className="divider" />
                {selectedCategories.length > 0 && filteredItems.length > 0 && (
                    <section>
                        <h3>ยี่ห้อ</h3>
                        <div className="filter-box">
                            {filteredBrandsByCategory.map((brand) => (
                                <label key={brand.name} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.includes(brand.name)}
                                        onChange={() => toggleBrand(brand.name)}
                                    />
                                    {brand.name}
                                </label>
                            ))}
                        </div>
                    </section>
                )}
                <hr className="divider" />
                {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
                    <button
                        className="buttonPrimaryorange"
                        style={{ display: 'block', marginLeft: 'auto', marginRight: '16px', marginTop: '16px' }}
                        onClick={() => {
                            setSelectedCategories([]);
                            setSelectedBrands([]);
                        }}
                    >
                        รีเซ็ตการกรองสินค้า
                    </button>
                )}
            </aside>

            <section className="products-list">
                <h2>
                    {filteredItems.length === 0
                        ? '' // ไม่แสดงข้อความ
                        : (() => {
                            const selectedCategoryNames = selectedCategories
                                .map((id) => categories.find((c) => c.id === id)?.name)
                                .filter(Boolean);
                            const selectedBrandNames = selectedBrands;

                            let text = '';

                            // เช็คว่าผู้ใช้เลือกหมวดหมู่ครบทุกหมวดหมู่หรือไม่
                            const allCategoriesSelected = selectedCategories.length === categories.length;

                            if (allCategoriesSelected && selectedBrandNames.length === 0) {
                                // เลือกหมวดหมู่ทั้งหมด ไม่มีเลือกยี่ห้อ
                                text = `สินค้าทั้งหมด ${filteredItems.length} รายการ`;
                            } else if (selectedCategoryNames.length > 0 && selectedBrandNames.length > 0) {
                                text = `${selectedCategoryNames.join(', ')} (${selectedBrandNames.join(', ')}) สินค้าทั้งหมด ${filteredItems.length} รายการ`;
                            } else if (selectedCategoryNames.length > 0) {
                                text = `${selectedCategoryNames.join(', ')} สินค้าทั้งหมด ${filteredItems.length} รายการ`;
                            } else if (selectedBrandNames.length > 0) {
                                text = `${selectedBrandNames.join(', ')} สินค้าทั้งหมด ${filteredItems.length} รายการ`;
                            } else {
                                // กรณีไม่เลือกอะไรเลย
                                text = `สินค้าทั้งหมด ${filteredItems.length} รายการ`;
                            }

                            return text;
                        })()
                    }
                </h2>


                {filteredItems.length === 0 ? (
                    <p className="no-products">ไม่มีสินค้าในตอนนี้</p>
                ) : (
                    <div className="products-grid">
                        {filteredItems.map((item) => (
                            // เปลี่ยน div.product-card เป็น Link ไปหน้ารายละเอียด
                            <Link
                                key={item.id}
                                href={`/products/${encodeURIComponent(item.categoryId)}/${encodeURIComponent(item.brand)}/${encodeURIComponent(item.id)}`}
                                className="product-card"
                                passHref
                            >
                                {item.mainImage && (
                                    <div
                                        className="product-image-wrapper"
                                        style={{ position: 'relative', width: '100%', height: '200px' }}
                                    >
                                        <Image src={item.mainImage} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div className="product-info">
                                    <h3 className="product-name">{item.name}</h3>
                                    <p className="product-size">
                                        {item.size ? (
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '2px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                <MdOutlineElectricBolt size={25} />
                                                {item.size.toLocaleString()}
                                            </span>
                                        ) : null}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
