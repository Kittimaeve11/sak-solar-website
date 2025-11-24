'use client';

import React, { useState, useRef } from 'react';
import FAQItem from './FAQItem';
import SkeletonFaq from './SkeletonFaq';

export default function FAQList({ faqs, loading }) {
  const [openIndex, setOpenIndex] = useState(null);
  const answerRefs = useRef([]);

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return Array.from({ length: 5 }).map((_, i) => <SkeletonFaq key={i} />);
  }

  return faqs.map((item, index) => (
    <FAQItem
      key={item.fqa_id}
      item={item}
      index={index}
      isOpen={openIndex === index}
      toggle={toggleAnswer}
      answerRef={(answerRefs.current[index] = answerRefs.current[index] || React.createRef())}
    />
  ));
}
