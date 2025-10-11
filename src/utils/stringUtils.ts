/**
 * Converts a string to title case (capitalize first letter of each word).
 * Handles UPPER_CASE, snake_case, and regular strings.
 * 
 * @param str - The string to convert
 * @returns The string in title case format
 * 
 * @example
 * toTitleCase('COMPLETED') // returns 'Completed'
 * toTitleCase('IN_PROGRESS') // returns 'In Progress'
 * toTitleCase('hello world') // returns 'Hello World'
 */
export const toTitleCase = (str: string): string => {
  return str
    .replace(/_/g, ' ')           
    .toLowerCase()                 
    .replace(/\b\w/g, (char) => char.toUpperCase()); 
};