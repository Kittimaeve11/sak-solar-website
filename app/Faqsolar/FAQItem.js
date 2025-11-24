'use client';

import { MdOutlineArrowForwardIos } from 'react-icons/md';
import { cleanHtml } from './cleanHtml';

export default function FAQItem({ item, index, isOpen, toggle, answerRef }) {
  return (
    <div className="faq-item fade-in">
      <button className="faq-button" onClick={() => toggle(index)}>
        {cleanHtml(item.fqa_questionTH)}
        <span className={`faq-icon ${isOpen ? 'open' : ''}`}>
          <MdOutlineArrowForwardIos />
        </span>
      </button>

      <div
        className="faq-answer"
        ref={answerRef}
        style={{
          maxHeight: isOpen ? answerRef.current?.scrollHeight : 0,
          padding: isOpen ? '1rem 3rem' : '0 3rem',
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: cleanHtml(item.fqa_answersTH),
          }}
        />
      </div>
    </div>
  );
}
