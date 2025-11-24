// app/portfolio/utils.js
export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
export const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export let portfolioCache = {
  projects: null,
  types: null,
  brander: null,
  timestamp: 0,
};

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
