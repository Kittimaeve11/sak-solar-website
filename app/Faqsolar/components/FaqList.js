// app/faq/components/FaqList.js

'use client';

import { useRef } from 'react';
import { MdOutlineArrowForwardIos } from 'react-icons/md';

function cleanHtml(str) {
  return (!str || typeof str !== 'string'
    ? ''
    : str
        .replace(/^"|"$/g, '')
        .replace(/\\\//g, '/')
        .replace(/\\"/g, '"')
        .replace(/\\n/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/ style="[^"]*"/g, '')
        .replace(/<br\s*\/?>/gi, '<br/>')
  ).trim();
}

function SkeletonFaq() {
  return (
    <div className="faq-skeleton-card fade-in">
      <div className="faq-skeleton-question skeleton" />
      <div className="faq-skeleton-answer skeleton" />
    </div>
  );
}

export default function FaqList({ faqs, loadingFaq, openIndex, setOpenIndex }) {
  const answerRefs = useRef([]);

  if (loadingFaq) {
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonFaq key={i} />
        ))}
      </>
    );
  }

  return (
    <>
      {faqs.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={item.fqa_id} className="faq-item fade-in">
            <button
              className="faq-button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              {cleanHtml(item.fqa_questionTH)}
              <span className={`faq-icon ${isOpen ? 'open' : ''}`}>
                <MdOutlineArrowForwardIos />
              </span>
            </button>

            <div
              className="faq-answer"
              ref={(el) => (answerRefs.current[index] = el)}
              style={{
                maxHeight: isOpen
                  ? answerRefs.current[index]?.scrollHeight
                  : 0,
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
      })}
    </>
  );
}
