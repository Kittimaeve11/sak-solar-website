'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MdOutlineElectricBolt } from "react-icons/md";
import { TbCurrencyBaht } from "react-icons/tb";

export default function ProductCard({
  item,
  index,                // ⬅ รับ index ที่ส่งมาจาก Grid
  categories,
  handleLogClick,
  slugify,
  getImageUrl,
}) {
  const discount =
    item.isPromotion === "1"
      ? parseFloat(item.discountPercent)
      : 0;

  const finalPrice =
    discount > 0
      ? item.price - item.price * (discount / 100)
      : item.price;

  const typeSlug = slugify(
    categories.find(
      (c) => Number(c.producttypeID) === item.categoryId
    )?.producttypenameEN || ""
  );

  const brandSlug = slugify(item.brandName);

  return (
    <Link
      href={`/products/${typeSlug}/${brandSlug}/${item.num}`}
      className="servicesproduct-card fade-inproduck"
      onClick={() => handleLogClick(item)}
      style={{ "--delay": `${index * 0.07}s` }}   // ⬅ ใช้ index ที่ส่งมา
    >
      {/* รูปสินค้า */}
      <div className="servicesproduct-image-wrapper">
        <Image
          src={getImageUrl(item.mainImage)}
          alt={item.model || item.solarpanel}
          width={300}
          height={300}
          style={{ objectFit: "cover" }}
        />

        {/* ป้ายลดราคา */}
        {item.isPromotion === "1" && item.discountPercent && (
          <div className="servicesproduct-promo-ribbon">
            - {item.discountPercent}
          </div>
        )}
      </div>

      {/* ข้อมูลสินค้า */}
      <div className="servicesproduct-info">
        <h3>{item.modelair || item.model || item.solarpanel}</h3>

        {item.battery && (
          <h6 style={{ marginTop: '-0.5rem' }}>
            รุ่นแบตเตอรี่ {item.battery} kWh
          </h6>
        )}

        {/* แสดงขนาด */}
        {item.isprice === "0" && item.size && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontWeight: 600,
              fontSize: 20,
              color: "#000",
            }}
          >
            <MdOutlineElectricBolt size={25} color="#ffc300" />
            {item.size}
          </div>
        )}

        {/* แสดงราคา */}
        {item.isprice === "1" && item.price && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 600,
              fontSize: 20,
              color: "#000",
            }}
          >
            <TbCurrencyBaht size={25} />
            {Number(finalPrice).toLocaleString()} บาท

            {discount > 0 && (
              <span
                style={{
                  marginLeft: 4,
                  fontSize: 14,
                  textDecoration: "line-through",
                  color: "#999",
                }}
              >
                {Number(item.price).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
