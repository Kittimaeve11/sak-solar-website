'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '../Context/LocaleContext';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { IoMenu } from 'react-icons/io5';
import '../../styles/tabmenu.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default function TabMenu() {
  const { messages, locale } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [activeProductSlug, setActiveProductSlug] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const isActive = (path) => (path === '/' ? pathname === '/' : pathname.startsWith(path));
  const isInProductsSection = pathname.startsWith('/products');

useEffect(() => {
  // โหลด products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/productHeaderapi`, {
        headers: { 'X-API-KEY': `${apiKey}` },
      });
      const data = await res.json();

      if (data.status && Array.isArray(data.result)) {
        const formatted = data.result.map((item) => ({
          slug: item.producttypeID,
          name: {
            th: item.producttypenameTH.trim(),
            en: item.producttypenameEN.trim(),
          },
          brands:
            item.Brand?.map((b) => ({
              slug: b.productbrandID,
              name: b.productbrandname,
            })) || [],
        }));
        setProducts(formatted);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // เช็ค mobile
  const checkMobile = () => {
    setIsMobile(window.matchMedia('(max-width: 991px)').matches);
  };

  // ริ่มทำงาน
  fetchProducts();
  checkMobile();
  window.addEventListener('resize', checkMobile);

  // reset state ทุกครั้งที่ pathname เปลี่ยน
  setOpen(false);
  setServiceOpen(false);
  setActiveProductSlug(null);
  clearTimeout(timeoutRef.current);

  // cleanup
  return () => {
    window.removeEventListener('resize', checkMobile);
    clearTimeout(timeoutRef.current);
  };
}, [pathname]);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setServiceOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setServiceOpen(false);
      setActiveProductSlug(null);
    }, 200);
  };

  const toggleBrandSubmenu = (slug) => {
    if (isMobile) {
      setActiveProductSlug((prev) => (prev === slug ? null : slug));
    }
  };

  const handleLinkClick = () => {
    setOpen(false);
    setServiceOpen(false);
    setActiveProductSlug(null);
  };

  return (
    <nav className="navbar">
      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <IoMenu />
      </button>

      <nav id="navmenu" className={`navmenu ${open ? 'active' : ''}`} role="navigation">
        <ul className="nav-root">
          <li>
            <Link href="/" className={isActive('/') ? 'active' : ''} onClick={handleLinkClick}>
              {messages.home}
            </Link>
          </li>

          <li
            className={`dropdown ${isInProductsSection ? 'active' : ''}`}
            onMouseEnter={() => !isMobile && handleMouseEnter()}
            onMouseLeave={() => !isMobile && handleMouseLeave()}
          >
            <div className="dropdown-header">
              <Link
                href="/products"
                className={isInProductsSection ? 'active' : ''}
                onClick={handleLinkClick}
                style={{ flexGrow: 1, textDecoration: 'none' }}
              >
                {messages.serviceproduct}
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setServiceOpen((prev) => !prev);
                }}
                aria-label="Toggle submenu"
                aria-expanded={serviceOpen}
                className="dropdown-toggle-button"
              >
                {serviceOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </button>
            </div>

            {serviceOpen && (
              <ul className="dropdown-menu level-1">
                {loading ? (
                  <li style={{ padding: '10px', color: '#ccc', fontStyle: 'italic' }}>
                    กำลังโหลดข้อมูล...
                  </li>
                ) : (
                  products.map((product) => {
                    const isCurrent =
                      pathname === `/products/${product.slug}` ||
                      pathname.startsWith(`/products/${product.slug}/`);
                    const isOpen = activeProductSlug === product.slug;

                    return (
                      <li
                        key={product.slug}
                        className={`dropdown-item ${isCurrent ? 'active' : ''}`}
                        onMouseEnter={() => !isMobile && setActiveProductSlug(product.slug)}
                        onMouseLeave={() => !isMobile && setActiveProductSlug(null)}
                      >
                        <div className="dropdown-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {/* ข้อความ (กดแล้วไปที่หน้า product นั้นๆ) */}
                          <Link
                            href={`/products/${product.slug}`}
                            className={`dropdown-toggle ${isOpen ? 'hovered' : ''}`}
                            onClick={handleLinkClick}
                            style={{ flexGrow: 1, textDecoration: 'none' }}
                          >
                            {locale === 'th' ? product.name.th : product.name.en}
                          </Link>

                          {/* ลูกศร (กดแล้วแค่เปิด/ปิด brand submenu) */}
                          {isMobile && product.brands.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleBrandSubmenu(product.slug);
                              }}
                              aria-label="Toggle brand submenu"
                              aria-expanded={isOpen}
                              className="dropdown-toggle-button"
                            >
                              {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                            </button>
                          )}

                        </div>

                        {/* submenu แบรนด์ */}
                        {isOpen && product.brands.length > 0 && (
                          <ul className="brand-submenu">
                            {product.brands.map((brand, index) => (
                              <li key={`${product.slug}-${brand.slug}-${index}`}>
                                <Link
                                  href={`/products/${product.slug}/${brand.slug}`}
                                  className={pathname === `/products/${product.slug}/${brand.slug}` ? 'active' : ''}
                                  onClick={handleLinkClick}
                                >
                                  {brand.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>

                    );
                  })
                )}
              </ul>
            )}
          </li>

          <li>
            <Link href="/Faq" className={isActive('/Faq') ? 'active' : ''} onClick={handleLinkClick}>
              {messages.faq}
            </Link>
          </li>

          <li>
            <Link href="/portfolio" className={isActive('/portfolio') ? 'active' : ''} onClick={handleLinkClick}>
              {messages.portfolio}
            </Link>
          </li>
          <li>
            <Link href="/review" className={isActive('/review') ? 'active' : ''} onClick={handleLinkClick}>
              {messages.review}
            </Link>
          </li>

          <li>
            <Link href="/editorial" className={isActive('/editorial') ? 'active' : ''} onClick={handleLinkClick}>
              {messages.editorial}
            </Link>
          </li>
        </ul>
      </nav>
    </nav>
  );
}
