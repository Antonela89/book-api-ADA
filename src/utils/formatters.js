/**
 * Convierte un string a formato Capital Case.
 * ej: "jorge luis borges" -> "Jorge Luis Borges"
 * @param {string} str - El string a convertir.
 * @returns {string} El string formateado.
 */

export function toCapitalCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}