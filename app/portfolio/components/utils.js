// app/portfolio/components/utils.js
export const formatDate = (dateString, locale = 'th') => {
  if (!dateString || dateString === '-') return '-';
  const date = new Date(dateString);
  return locale === 'th'
    ? new Intl.DateTimeFormat('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date)
    : new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
};
