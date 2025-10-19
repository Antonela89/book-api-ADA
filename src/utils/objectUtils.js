import { toCapitalCase } from './formatters.js';

/**
 * Obtiene el valor de una propiedad de un objeto sin importar mayúsculas o minúsculas.
 * @param {object} obj - El objeto del que se extraerá el valor.
 * @param {string} key - El nombre de la clave a buscar (ej. 'name').
 * @returns {any | undefined} El valor encontrado o undefined si no existe.
 */
export function getCaseInsensitiveValue(obj, key) {
  if (!obj || !key) return undefined;

  // CORRECCIÓN: Primero busca la clave exacta (ej. 'authorName'),
  // y solo si no la encuentra, busca las versiones en minúscula y mayúscula.
  const exactKey = obj[key];
  if (exactKey !== undefined) return exactKey;
  
  // Como alternativa más robusta, podemos buscar la clave comparando en minúsculas.
  const lowerCaseKey = key.toLowerCase();
  const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerCaseKey);
  
  return foundKey ? obj[foundKey] : undefined;
}


/**
 * Construye un objeto limpio para actualizaciones, filtrando, formateando y parseando
 * los campos según un esquema definido.
 * @param {object} rawData - Los datos de entrada crudos.
 * @param {object} allowedFields - Un objeto que define los campos permitidos y su tipo
 *                                 (ej. { title: 'string', year: 'number' }).
 * @returns {object} El objeto filtrado y formateado, listo para ser enviado al modelo.
 */
export function buildUpdateObject(rawData, allowedFields) {
  const dataToUpdate = {};

  for (const field in allowedFields) {
    // Usamos la versión corregida de getCaseInsensitiveValue
    const value = getCaseInsensitiveValue(rawData, field);

    if (value !== undefined && value !== null && String(value).trim() !== '') {
      const fieldType = allowedFields[field];

      switch (fieldType) {
        case 'string':
          dataToUpdate[field] = toCapitalCase(String(value));
          break;
        case 'number':
          const parsedNumber = parseInt(value, 10);
          if (!isNaN(parsedNumber)) {
            dataToUpdate[field] = parsedNumber;
          }
          break;
        default:
          dataToUpdate[field] = value;
          break;
      }
    }
  }
  return dataToUpdate;
}