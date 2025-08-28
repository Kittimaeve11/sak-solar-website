'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MdOutlineElectricBolt } from 'react-icons/md';
import { TbCurrencyBaht } from 'react-icons/tb';
import { useLocale } from '@/app/Context/LocaleContext';
import '@/styles/products.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function ProductsByTypeBrandPage() {
  const { typeID, brandID } = useParams();
  const { locale } = useLocale();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState(typeID ? [typeID] : []);
  const [selectedBrands, setSelectedBrands] = useState(brandID ? [brandID] : []);
  const [filteredBrands, setFilteredBrands] = useState([]);

  const getImageUrl = (path) => {
    if (!path) return '/images/no-image.jpg';
    if (path.startsWith('http')) return path;
    try {
      return new URL(path, baseUrl).toString();
    } catch {
      return '/images/no-image.jpg';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let fetchedCategories = categories;
        let fetchedBrands = brands;

        // fetch categories & brands
        if (categories.length === 0) {
          const resHeader = await fetch(`${baseUrl}/api/productHeaderapi`, {
            headers: { 'X-API-KEY': apiKey },
          });
          const headerData = await resHeader.json();
          if (headerData.status && Array.isArray(headerData.result)) {
            fetchedCategories = headerData.result;
            setCategories(fetchedCategories);

            fetchedBrands = headerData.result.flatMap(cat => cat.Brand || []);
            setBrands(fetchedBrands);
          }
        }

        // fetch products
        if (products.length === 0) {
          const resProducts = await fetch(`${baseUrl}/api/productpageapi`, {
            headers: { 'X-API-KEY': apiKey },
          });
          const data = await resProducts.json();
          if (data.status && Array.isArray(data.result?.data)) {
            const formatted = data.result.data.map(p => ({
              id: p.product_ID,
              model: p.modelname,
              solarpanel: p.solarpanel,
              size: p.installationsize,
              price: p.price,
              isprice: p.isprice,
              battery: p.battery,
              mainImage: (() => {
                try {
                  const gallery = JSON.parse(p.gallery || '[]');
                  return gallery[0] || '';
                } catch {
                  return '';
                }
              })(),
              categoryId: p.protypeID,
              brandId: p.probrandID,
              product_pin: p.product_pin || '0',
              productpro_ispromotion: p.productpro_ispromotion || '0',
              productpro_percent: p.productpro_percent || null,
            }));
            setProducts(formatted);
          }
        }

        // update filteredBrands ตาม selectedCategories
        if (selectedCategories.length === 0) {
          setFilteredBrands(fetchedBrands);
        } else {
          const filtered = fetchedCategories
            .filter(cat => selectedCategories.includes(cat.producttypeID))
            .flatMap(cat => cat.Brand || []);
          setFilteredBrands(filtered);

          setSelectedBrands(prev =>
            prev.filter(b => filtered.some(fb => fb.productbrandID === b))
          );
        }

        // dynamic title & meta
        let title = 'บริการและผลิตภัณฑ์';
        let description = 'บริการและผลิตภัณฑ์';

        if (selectedCategories.length === 1) {
          const cat = fetchedCategories.find(c => c.producttypeID === selectedCategories[0]);
          if (cat) {
            const catName = locale === 'en' ? cat.producttypenameEN : cat.producttypenameTH;
            title += ` (${catName})`;
            description += ` (${catName})`;
          }
        }

        if (selectedBrands.length === 1) {
          const brand = fetchedBrands.find(b => b.productbrandID === selectedBrands[0]);
          if (brand) {
            title += ` (${brand.productbrandname})`;
            description += ` (${brand.productbrandname})`;
          }
        }

        title += ' | บริษัท ศักดิ์สยาม โซลาร์ เอ็นเนอร์ยี่ จำกัด';
        document.title = title;

        const metaDescription = document.querySelector("meta[name='description']");
        if (metaDescription) {
          metaDescription.setAttribute('content', description);
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
  }, [typeID, brandID, locale]);

  const filteredItems = useMemo(() => {
    return products.filter(item => {
      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(item.categoryId);
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brandId);
      return matchCategory && matchBrand;
    });
  }, [products, selectedCategories, selectedBrands]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (a.productpro_ispromotion === '1' && b.productpro_ispromotion !== '1') return -1;
      if (a.productpro_ispromotion !== '1' && b.productpro_ispromotion === '1') return 1;
      if (a.product_pin === '1' && b.product_pin !== '1') return -1;
      if (a.product_pin !== '1' && b.product_pin === '1') return 1;
      return 0;
    });
  }, [filteredItems]);

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <main className="products-container">
      <aside className="products-sidebar">
        <div className="sidebar-header">คัดกรองสินค้า</div>

        <section>
          <h3>หมวดหมู่สินค้า</h3>
          <div className="filter-box">
            {categories.map(cat => (
              <label key={cat.producttypeID} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.producttypeID)}
                  onChange={() => {
                    setSelectedCategories(prev =>
                      prev.includes(cat.producttypeID)
                        ? prev.filter(c => c !== cat.producttypeID)
                        : [...prev, cat.producttypeID]
                    );
                  }}
                />
                {locale === 'en' ? cat.producttypenameEN : cat.producttypenameTH}
              </label>
            ))}
          </div>
        </section>

        <hr className="divider" />
        {selectedCategories.length > 0 && (
          <section>
            <h3>ยี่ห้อ</h3>
            <div className="filter-box">
              {filteredBrands.map(b => (
                <label key={b.productbrandID} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.productbrandID)}
                    onChange={() => {
                      setSelectedBrands(prev =>
                        prev.includes(b.productbrandID)
                          ? prev.filter(x => x !== b.productbrandID)
                          : [...prev, b.productbrandID]
                      );
                    }}
                  />
                  {b.productbrandname}
                </label>
              ))}
            </div>
          </section>
        )}
        <hr className="divider" />

        {/* Reset Button */}
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
        <h2>{`สินค้าทั้งหมด ${sortedItems.length} รายการ`}</h2>
        {sortedItems.length === 0 ? (
          <p className="no-products">ไม่มีสินค้าในตอนนี้</p>
        ) : (
          
          <div className="products-grid">
            {sortedItems.map(item => {
              // คำนวณราคาหลังหักส่วนลด
              let finalPrice = null;
              if (item.isprice === "1" && item.price) {
                if (item.productpro_ispromotion === "1" && item.productpro_percent) {
                  const discountPercent = parseFloat(item.productpro_percent) || 0;
                  finalPrice = item.price - (item.price * discountPercent / 100);
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
                  {/* รูปสินค้า + ป้ายโปรโมชั่น */}
                  {item.mainImage && (
                    <div className="product-image-wrapper" style={{ position: 'relative' }}>
                      <Image
                        src={getImageUrl(item.mainImage)}
                        alt={item.model || item.solarpanel}
                        width={280}
                        height={300}
                        unoptimized
                      />
                      {item.productpro_ispromotion === "1" && item.productpro_percent && (
                        <div className="product-promo-ribbon">
                          -{item.productpro_percent}%
                        </div>
                      )}
                    </div>
                  )}

                  {/* ข้อมูลสินค้า */}
                  <div className="product-info">
                    <h3 className="product-name">{item.model || item.solarpanel}</h3>
                    {item.battery && (
                      <h6 className="product-battery">รุ่นแบตเตอรี่ {item.battery} kWh</h6>
                    )}

                    {item.isprice === "0" && item.size && (
                      <p style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                        <MdOutlineElectricBolt size={25} color='#ffc300'/> {item.size}
                      </p>
                    )}

                    {item.isprice === "1" && item.price && (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        {item.productpro_ispromotion === "1" && item.productpro_percent ? (
                          <>
                            {/* ราคาจริงขีดฆ่า */}
                            <span style={{
                              marginTop: '0.5rem',
                              fontSize: '14px',
                              color: '#888',
                              textDecoration: 'line-through',
                              position: 'absolute',
                              top: '-18px',
                              right: '0'
                            }}>
                              {Number(item.price).toLocaleString()} บาท
                            </span>
                            {/* ราคาหลังหักส่วนลด */}
                            <p style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0px',
                              fontWeight: 700,
                              fontSize: '20px',
                            }}>
                              <TbCurrencyBaht size={25} color='#000000ff'/> {Number(finalPrice).toLocaleString()} บาท
                            </p>
                          </>
                        ) : (
                          <p style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0px',
                            fontWeight: 600
                          }}>
                            <TbCurrencyBaht size={25} color='#000000ff'/> {Number(item.price).toLocaleString()} บาท
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
