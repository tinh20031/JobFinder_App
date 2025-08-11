
/**
 * Strip HTML tags from text content
 * @param {string} html - Text that may contain HTML tags
 * @returns {string} Clean text without HTML tags
 */
export const stripHtmlTags = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '');
};

