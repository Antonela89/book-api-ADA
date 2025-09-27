// Este archivo es la "Vista" de nuestra aplicación. Su única responsabilidad es
// tomar los datos que le pasa el Controlador y darles un formato legible
// para que el usuario los vea en la terminal. No sabe de dónde vienen los datos,
// solo cómo presentarlos.

// Creamos un objeto para agrupar todas las funciones de formato.
const ResponseFormatter = {
  /**
     * Crea una cadena de texto con formato de tabla a partir de un array de objetos.
     * @param {Array<object>} data - El array de objetos a formatear.
     * @returns {string} Una cadena de texto formateada como una tabla.
     */
  formatAsTable(data) {
    // Caso base: si no hay datos o el array está vacío, devolvemos un mensaje simple.
    if (!data || data.length === 0) {
      return "(No hay datos para mostrar)\n";
    }

    // Obtener las cabeceras y columnas (keys del primer objeto)
    // Tomamos el primer objeto del array para ver qué "columnas" tiene (sus claves o propiedades).
    const headers = Object.keys(data[0]);

    // Calcular el ancho máximo de cada columna
    // Para que la tabla se vea bien alineada, necesitamos saber cuál es el texto más largo de cada columna.

    // Primero, creamos un objeto para guardar los anchos. Empezamos con el ancho de los propios títulos(cabeceras).
    const columnWidths = headers.reduce((widths, header) => {
      widths[header] = header.length; // Empezar con el largo del header
      return widths;
    }, {});

    // Luego, recorremos cada fila de datos para ver si alguna celda es más ancha que el título.
    data.forEach(row => {
      headers.forEach(header => {
        // Convertimos el contenido de la celda a string para poder medir su longitud.
        const cellLength = String(row[header]).length;
        // Si esta celda es más larga que el ancho que teníamos guardado, la actualizamos.
        if (cellLength > columnWidths[header]) {
          columnWidths[header] = cellLength;
        }
      });
    });

    // Construir la cadena de la tabla como string
    let tableString = '';

    // Fila de cabecera (títulos)
    const headerRow = headers.map(header => {
      // Convertimos a mayúsculas y usamos .padEnd() para añadir espacios hasta alcanzar el ancho de la columna.
      return header.toUpperCase().padEnd(columnWidths[header]);
    }).join(' | '); // Unimos cada título con un separador.
    tableString += headerRow + '\n';

    // Línea separadora (ej: '----|---------|---').
    const separatorRow = headers.map(header => {
      return '-'.repeat(columnWidths[header]);
    }).join('-|-');
    tableString += separatorRow + '\n';

    // Filas de datos
    data.forEach(row => {
      const dataRow = headers.map(header => {
        // Añadimos espacios al final de cada celda para alinearla
        return String(row[header]).padEnd(columnWidths[header]);
      }).join(' | ');
      tableString += dataRow + '\n';
    });

    // Devolvemos el string completo con la tabla ya construida.
    return tableString;
  },

  /**
   * Formatea una respuesta de éxito para la terminal. Si los datos son un array, los formatea como tabla.
   * @param {string} message - Un mensaje descriptivo del éxito.
   * @param {object|array} [data=null] - Los datos opcionales a mostrar.
   * @returns {string} La respuesta formateada como texto plano.
   */
  formatSuccess(message, data = null) {
    // Empezamos con un mensaje de éxito.
    let response = `\n✅ Éxito: ${message}\n`;
    // Si nos pasaron datos...
    if (data) {
      // ...y si esos datos son un array (una lista)...
      if (Array.isArray(data)) {
        // ...los formateamos como una tabla.
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
    // Creamos un mensaje de error estándar
    return `\n❌ Error: ${message}\n`;
  }
};

// Exportamos el objeto para que los Controladores puedan usarlo.
export { ResponseFormatter };