export const cleanHtml = (str) =>
  (!str || typeof str !== 'string'
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
