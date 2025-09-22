/**
 * Formatea una respuesta de éxito.
 * @param {string} message - Un mensaje descriptivo del éxito.
 * @param {object|array} data - Los datos a incluir en la respuesta (ej. lista de libros).
 * @returns {string} La respuesta formateada como una cadena JSON.
 */
function formatSuccess(message, data) {
  const response = {
    status: 'success',
    message: message,
    data: data,
  };
  return JSON.stringify(response) + '\n';
}

/**
 * Formatea una respuesta de error.
 * @param {string} message - Un mensaje descriptivo del error.
 * @returns {string} La respuesta de error formateada como una cadena JSON.
 */
function formatError(message) {
  const response = {
    status: 'error',
    message: message,
    data: null, // No se envían datos en caso de error
  };
  return JSON.stringify(response) + '\n';
}

export {
  formatSuccess,
  formatError,
};