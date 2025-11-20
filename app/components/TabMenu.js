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

/* =========================================================
   🔹 Best-practice slugify (ตรงกับ ProductsPage)
========================================================= */
const slugify = (name) =>
  name
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // space → hyphen
    .replace(/[^a-z0-9-]/g, '')  // remove symbols
    || '';

export default function TabMenu() {
  const { messages, locale } = useLocale();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [activeProductSlug, setActiveProductSlug] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState([]);

  const timeoutRef = useRef(null);

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const isInProductsSection = pathname.startsWith('/products');

  /* =========================================================
     📌 Load Menu Products (Cache + Clean Slug)
  ========================================================== */
  useEffect(() => {
    const cached = sessionStorage.getItem('menuProducts');
    if (cached) {
      setProducts(JSON.parse(cached));
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/productHeaderapi`, {
          headers: { 'X-API-KEY': apiKey },
        });

        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data = await res.json();
        if (data.status && Array.isArray(data.result)) {
          const formatted = data.result.map((item) => {
            const seen = new Set();
            const uniqueBrands =
              item.Brand?.filter((b) => {
                if (seen.has(b.productbrandname)) return false;
                seen.add(b.productbrandname);
                return true;
              }) || [];

            return {
              slug: slugify(item.producttypenameEN),
              name: {
                th: item.producttypenameTH?.trim() || '',
                en: item.producttypenameEN?.trim() || '',
              },
              brands: uniqueBrands.map((b) => ({
                slug: slugify(b.productbrandname),
                name: b.productbrandname.trim(),
              })),
            };
          });

          setProducts(formatted);
          sessionStorage.setItem('menuProducts', JSON.stringify(formatted));
        }
      } catch (err) {
        console.error('Error loading menu products:', err);
      }
    };

    fetchProducts();
  }, []);

  /* =========================================================
     🖥️ Handle mobile view
  ========================================================== */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 991px)').matches);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  /* =========================================================
     🐭 Dropdown hover (Desktop only)
  ========================================================== */
  const handleMouseEnter = () => {
    if (!isMobile) {
      clearTimeout(timeoutRef.current);
      setServiceOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setServiceOpen(false);
        setActiveProductSlug(null);
      }, 200);
    }
  };

  const toggleBrandSubmenu = (slug) => {
    setActiveProductSlug((prev) => (prev === slug ? null : slug));
  };

  const handleLinkClick = () => {
    setOpen(false);
    setServiceOpen(false);
    setActiveProductSlug(null);
    clearTimeout(timeoutRef.current);
  };

  /* =========================================================
     🎯 MAIN RENDER
  ========================================================== */
  return (
    <nav className="navbar">
      {/* Hamburger (Mobile) */}
      <button
        className="hamburger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <IoMenu />
      </button>

      <nav id="navmenu" className={`navmenu ${open ? 'active' : ''}`}>
        <ul className="nav-root">
          {/* Home */}
          <li>
            <Link
              href="/"
              className={isActive('/') ? 'active' : ''}
              onClick={handleLinkClick}
            >
              {messages.home}
            </Link>
          </li>

          {/* Products */}
          <li
            className={`dropdown ${isInProductsSection ? 'active' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="dropdown-header">
              <Link
                href="/products"
                className={isInProductsSection ? 'active' : ''}
                onClick={handleLinkClick}
              >
                {messages.serviceproduct}
              </Link>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setServiceOpen((prev) => !prev);
                }}
                className="dropdown-toggle-button"
              >
                {serviceOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </button>
            </div>

            {/* 👉 dropdown level-1 */}
            {serviceOpen && (
              <ul className="dropdown-menu level-1">
                {products.map((product) => {
                  const isOpen = activeProductSlug === product.slug;

                  return (
                    <li
                      key={product.slug}
                      className="dropdown-item"
                      onMouseEnter={() => !isMobile && setActiveProductSlug(product.slug)}
                      onMouseLeave={() => !isMobile && setActiveProductSlug(null)}
                    >
                      <div className="dropdown-header">
                        {/* 🌟 ใช้ slug แบบตรงกับ ProductsPage */}
                        <Link
                          href={`/products?categories=${product.slug}`}
                          onClick={handleLinkClick}
                          className={`${isOpen ? 'hovered' : ''}`}
                        >
                          {locale === 'th' ? product.name.th : product.name.en}
                        </Link>

                        {isMobile && product.brands.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleBrandSubmenu(product.slug);
                            }}
                            className="dropdown-toggle-button"
                          >
                            {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                          </button>
                        )}
                      </div>

                      {/* 🔽 Brand submenu */}
                      {isOpen && product.brands.length > 0 && (
                        <ul className="brand-submenu">
                          {product.brands.map((brand, index) => (
                            <li key={`${product.slug}-${brand.slug}-${index}`}>
                              <Link
                                href={`/products?categories=${product.slug}&brands=${brand.slug}`}
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
                })}
              </ul>
            )}
          </li>

          {/* Other Menu */}
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
