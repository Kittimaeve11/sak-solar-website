'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MdOutlineElectricBolt } from "react-icons/md";
import { TbCurrencyBaht } from "react-icons/tb";
import { useLocale } from '@/app/Context/LocaleContext';
import Link from 'next/link';
import '@/styles/products.css';

/* ====== ค่าคงที่สำหรับ API ====== */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* ====== Component หลัก ProductsPage ====== */
export default function ProductsPage() {
  const { locale } = useLocale(); 
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  /* ====== ฟังก์ชันสร้าง URL ของรูปสินค้า ====== */
  const getImageUrl = (path) => {
    if (!path) return '/images/no-image.jpg';
    if (path.startsWith('http')) return path;
    try {
      return new URL(path, baseUrl).toString();
    } catch {
      return '/images/no-image.jpg';
    }
  };

  /* ====== useEffect โหลดข้อมูลจาก API ====== */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // โหลด header (หมวดหมู่ + ยี่ห้อ)
        if (categories.length === 0) {
          const resHeader = await fetch(`${baseUrl}/api/productHeaderapi`, {
            headers: { 'X-API-KEY': apiKey }
          });
          const headerData = await resHeader.json();
          if (headerData.status && Array.isArray(headerData.result)) {
            setCategories(headerData.result);
            const allBrands = headerData.result.flatMap(cat => cat.Brand || []);
            setBrands(allBrands);
          }
        }

        // โหลดสินค้า
        if (products.length === 0) {
          const resProducts = await fetch(`${baseUrl}/api/productpageapi`, {
            headers: { 'X-API-KEY': apiKey }
          });
          const data = await resProducts.json();
          if (data.status && Array.isArray(data.result?.data)) {
            const formatted = data.result.data.map(p => {
              let mainImage = "";
              try {
                const gallery = JSON.parse(p.gallery || "[]");
                mainImage = gallery[0] || "";
              } catch {
                mainImage = "";
              }

              // parse percent เช่น "50%" -> 50
              let percent = null;
              if (p.productpro_percent) {
                percent = parseFloat(p.productpro_percent.replace("%", ""));
              }

              return {
                id: p.product_ID,
                num: p.product_num,
                model: p.modelname,
                solarpanel: p.solarpanel,
                size: p.installationsize,
                price: parseFloat(p.price) || null,
                isprice: p.isprice,
                battery: p.battery,
                mainImage,
                categoryId: p.protypeID,
                brandId: p.probrandID,
                product_pin: p.product_pin || "0",
                productpro_ispromotion: p.productpro_ispromotion || "0",
                productpro_percent: percent,
                productpro_name: p.productpro_name || null,
              };
            });
            setProducts(formatted);
          }
        }

        // อัพเดทแบรนด์ที่สามารถเลือกได้
        if (selectedCategories.length === 0) {
          setFilteredBrands(brands);
        } else {
          const filtered = categories
            .filter(cat => selectedCategories.includes(cat.producttypeID))
            .flatMap(cat => cat.Brand || []);
          setFilteredBrands(filtered);
          setSelectedBrands(prev => prev.filter(b =>
            filtered.some(fb => fb.productbrandID === b)
          ));
        }

        // Dynamic title & meta
        let title = 'บริการและผลิตภัณฑ์';
        let description = 'บริการและผลิตภัณฑ์';

        if (selectedCategories.length === 1) {
          const cat = categories.find(c => c.producttypeID === selectedCategories[0]);
          if (cat) {
            const catName = locale === 'en' ? cat.producttypenameEN : cat.producttypenameTH;
            title += ` (${catName})`;
            description += ` (${catName})`;
          }
        }

        if (selectedBrands.length === 1) {
          const brand = brands.find(b => b.productbrandID === selectedBrands[0]);
          if (brand) {
            title += ` (${brand.productbrandname})`;
            description += ` (${brand.productbrandname})`;
          }
        }

        title += ' | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด';
        document.title = title;

        const metaDescription = document.querySelector("meta[name='description']");
        if (metaDescription) {
          metaDescription.setAttribute("content", description);
        } else {
          const meta = document.createElement('meta');
          meta.name = 'description';
          meta.content = description;
          document.head.appendChild(meta);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategories.join(','), selectedBrands.join(','), locale]);

  /* ====== ฟังก์ชันเลือกหมวดหมู่ ====== */
  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  /* ====== ฟังก์ชันเลือกยี่ห้อ ====== */
  const toggleBrand = (brandId) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(b => b !== brandId)
        : [...prev, brandId]
    );
  };

  /* ====== filter ====== */
  const filteredItems = products.filter(item => {
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(item.categoryId);
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brandId);
    return matchCategory && matchBrand;
  });

  /* ====== ใช้ข้อมูลตาม API โดยไม่ sort ====== */
  const sortedItems = filteredItems;

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <main className="products-container">
      {/* Sidebar */}
      <aside className="products-sidebar">
        <div className="sidebar-header">คัดกรองสินค้า</div>

        {/* หมวดหมู่ */}
        <section>
          <h3>หมวดหมู่สินค้า</h3>
          <div className="filter-box">
            {categories.map(cat => (
              <label key={cat.producttypeID} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.producttypeID)}
                  onChange={() => toggleCategory(cat.producttypeID)}
                />
                {locale === 'en' ? cat.producttypenameEN : cat.producttypenameTH}
              </label>
            ))}
          </div>
        </section>
        <hr className="divider" />

        {/* ยี่ห้อ */}
        {selectedCategories.length > 0 && (
          <section>
            <h3>ยี่ห้อ</h3>
            <div className="filter-box">
              {filteredBrands.map(b => (
                <label key={b.productbrandID} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.productbrandID)}
                    onChange={() => toggleBrand(b.productbrandID)}
                  />
                  {b.productbrandname}
                </label>
              ))}
            </div>
          </section>
        )}
        <hr className="divider" />

        {/* ปุ่มรีเซ็ต */}
        {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
          <button
            className="buttonorangep"
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

      {/* สินค้า */}
      <section className="products-list">
        <h2>{`สินค้าทั้งหมด ${sortedItems.length} รายการ`}</h2>

        {sortedItems.length === 0 ? (
          <p className="no-products">ไม่มีสินค้าในตอนนี้</p>
        ) : (
          <div className="products-grid">
            {sortedItems.map(item => {
              let finalPrice = null;
              if (item.isprice === "1" && item.price) {
                if (item.productpro_ispromotion === "1" && item.productpro_percent) {
                  finalPrice = item.price - (item.price * item.productpro_percent / 100);
                } else {
                  finalPrice = item.price;
                }
              }

              return (
                <Link
                  key={item.id}
                  href={`/products/${item.categoryId}/${item.brandId}/${item.id}`}
                  className="product-card"
                >
                  {/* รูป */}
                  {item.mainImage && (
                    <div className="product-image-wrapper" style={{ position: 'relative' }}>
                      <Image
                        src={getImageUrl(item.mainImage)}
                        alt={item.model || item.solarpanel}
                        width={285}
                        height={285}
                        unoptimized
                      />
                      {item.productpro_ispromotion === "1" && item.productpro_percent && (
                        <div className="product-promo-ribbon">
                          -{item.productpro_percent}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* ข้อมูล */}
                  <div className="product-info">
                    <h3 className="product-name">{item.model || item.solarpanel}</h3>
                    {item.battery && (
                      <h6 className="product-battery">รุ่นแบตเตอรี่ {item.battery} kWh</h6>
                    )}

                    {item.isprice === "0" && item.size && (
                      <p style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                        <MdOutlineElectricBolt size={25} color='#ffc300' /> {item.size}
                      </p>
                    )}

                    {item.isprice === "1" && item.price && (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        {item.productpro_ispromotion === "1" && item.productpro_percent ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <p style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontWeight: 600,
                              fontSize: '20px',
                              margin: 0
                            }}>
                              <TbCurrencyBaht size={25} /> {Number(finalPrice).toLocaleString()} บาท
                            </p>
                            <span style={{
                              fontSize: '14px',
                              color: '#888',
                              textDecoration: 'line-through'
                            }}>
                              {Number(item.price).toLocaleString()} บาท
                            </span>
                          </div>
                        ) : (
                          <p style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontWeight: 600
                          }}>
                            <TbCurrencyBaht size={25} /> {Number(item.price).toLocaleString()} บาท
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
