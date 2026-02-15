
import { toCapitalCase } from './formatters.js';

/**
 * Obtiene el valor de una propiedad de un objeto sin importar si la clave está en mayúsculas o minúsculas.
 * @param {object} obj - El objeto del que se extraerá el valor.
 * @param {string} key - El nombre de la clave a buscar (ej. 'name').
 * @returns {any | undefined} El valor encontrado o undefined si no existe.
 */
export function getCaseInsensitiveValue(obj, keyToFind) {
  if (!obj || !keyToFind) return undefined;
  
  const realKey = Object.keys(obj).find(
    (k) => k.toLowerCase() === keyToFind.toLowerCase()
  );
  
  return realKey ? obj[realKey] : undefined;
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

  // Iteramos sobre las claves del objeto allowedFields
  for (const field in allowedFields) {
    const value = getCaseInsensitiveValue(rawData, field);

    if (value !== undefined && value !== null && String(value).trim() !== '') {
      const fieldType = allowedFields[field];

      // Aplicamos la transformación correcta según el tipo
      switch (fieldType) {
        case 'string':
          dataToUpdate[field] = toCapitalCase(String(value));
          break;
        case 'number':
          const parsedNumber = parseInt(value, 10);
          // Solo añadimos el número si es válido
          if (!isNaN(parsedNumber)) {
            dataToUpdate[field] = parsedNumber;
          }
          break;
        default:
          // Para otros tipos, simplemente pasamos el valor
          dataToUpdate[field] = value;
          break;
      }
    }
  }
  return dataToUpdate;
}
