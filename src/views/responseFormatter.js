// Creación de objeto para encapsular metodos 
const ResponseFormatter = {

//   /**
//  * Formatea una respuesta de éxito.
//  * @param {string} message - Un mensaje descriptivo del éxito.
//  * @param {object|array} data - Los datos a incluir en la respuesta (ej. lista de libros).
//  * @returns {string} La respuesta formateada como una cadena JSON.
//  */
//   formatSuccess(message, data) {
//     const response = {
//       status: 'success',
//       message: message,
//       data: data,
//     };
//     return JSON.stringify(response) + '\n';
//   },

//   /**
//    * Formatea una respuesta de error.
//    * @param {string} message - Un mensaje descriptivo del error.
//    * @returns {string} La respuesta de error formateada como una cadena JSON.
//    */
//   formatError(message) {
//     const response = {
//       status: 'error',
//       message: message,
//       data: null, // No se envían datos en caso de error
//     };
//     return JSON.stringify(response) + '\n';
//   }
// }

// export { ResponseFormatter };

/**
   * Crea una cadena de texto con formato de tabla a partir de un array de objetos.
   * @param {Array<object>} data - El array de objetos a formatear.
   * @returns {string} Una cadena de texto formateada como una tabla.
   */
  formatAsTable(data) {
    if (!data || data.length === 0) {
      return "(No hay datos para mostrar)\n";
    }

    // 1. Obtener las cabeceras (keys del primer objeto)
    const headers = Object.keys(data[0]);

    // 2. Calcular el ancho máximo de cada columna
    const columnWidths = headers.reduce((widths, header) => {
      widths[header] = header.length; // Empezar con el largo del header
      return widths;
    }, {});

    data.forEach(row => {
      headers.forEach(header => {
        const cellLength = String(row[header]).length;
        if (cellLength > columnWidths[header]) {
          columnWidths[header] = cellLength;
        }
      });
    });

    // 3. Construir la cadena de la tabla
    let tableString = '';

    // Fila de cabecera
    const headerRow = headers.map(header => {
      return header.toUpperCase().padEnd(columnWidths[header]);
    }).join(' | ');
    tableString += headerRow + '\n';

    // Línea separadora
    const separatorRow = headers.map(header => {
      return '-'.repeat(columnWidths[header]);
    }).join('-|-');
    tableString += separatorRow + '\n';

    // Filas de datos
    data.forEach(row => {
      const dataRow = headers.map(header => {
        return String(row[header]).padEnd(columnWidths[header]);
      }).join(' | ');
      tableString += dataRow + '\n';
    });

    return tableString;
  },

  /**
   * Formatea una respuesta de éxito para la terminal. Si los datos son un array, los formatea como tabla.
   * @param {string} message - Un mensaje descriptivo del éxito.
   * @param {object|array} data - Los datos a incluir en la respuesta.
   * @returns {string} La respuesta formateada como texto plano.
   */
  formatSuccess(message, data = null) {
    let response = `\n✅ Éxito: ${message}\n`;
    if (data) {
      if (Array.isArray(data)) {
        response += this.formatAsTable(data);
      } else {
        // Si no es un array, simplemente lo convierte a string (JSON es legible)
        response += JSON.stringify(data, null, 2) + '\n';
      }
    }
    return response;
  },

  /**
   * Formatea una respuesta de error para la terminal.
   * @param {string} message - Un mensaje descriptivo del error.
   * @returns {string} La respuesta de error formateada como texto plano.
   */
  formatError(message) {
    return `\n❌ Error: ${message}\n`;
  }
};

export { ResponseFormatter };