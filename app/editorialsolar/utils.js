const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;

export const parseDescription = (str) => {
  if (!str || typeof str !== 'string') return '';
  try {
    return str
      .replace(/^"+|"+$/g, '')
      .replace(/\\\//g, '/')
      .replace(/\\"/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/\\n/g, '')
      .replace(/ style="[^"]*"/g, '')
      .trim();
  } catch {
    return '';
  }
};

export const getImageUrl = (galleryStr) => {
  if (!galleryStr) return '/images/no-image.jpg';
  try {
    const arr = JSON.parse(galleryStr);
    const first = arr?.[0];
    if (!first) return '/images/no-image.jpg';

    const cleaned = first.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
    return `${baseUrl}/${cleaned.replace(/^\//, '')}`;
  } catch {
    return '/images/no-image.jpg';
  }
};
