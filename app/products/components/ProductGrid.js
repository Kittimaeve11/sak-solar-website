'use client';

import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({
  items,
  categories,
  handleLogClick,
  slugify,
  getImageUrl,
}) {
  return (
    <div className="servicesproducts-grid">
      {items.map((item, index) => (
        <ProductCard
          key={`${item.num}-${index}`}
          item={item}
          index={index}               // ⬅ ส่ง index เข้าไปที่การ์ด
          categories={categories}
          handleLogClick={handleLogClick}
          slugify={slugify}
          getImageUrl={getImageUrl}
        />
      ))}
    </div>
  );
}
