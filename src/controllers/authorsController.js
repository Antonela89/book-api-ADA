// Este archivo es el "Controlador" de Autores. Actúa como un intermediario.
// Recibe peticiones (ej: "dame todos los autores"), le pide los datos al Modelo, y luego le pasa esos datos a la Vista (ResponseFormatter) para que prepare la respuesta final.

// importaciones
import { AuthorsModel } from '../models/authorsModel.js'; // Importación de objeto model
import { ResponseFormatter } from '../views/responseFormatter.js'; // importacion de objeto views

// Creación de objeto de para encapsular metodos relacionados con autores
const AuthorsController = {
  /**
 * Obtiene todos los autores y devuelve la respuesta formateada.
 * @returns {string} La respuesta formateada como un string.
 */
  getAllAuthors() {
    try {
      // pide los datos al modelo
      const authors = AuthorsModel.getAuthors();
      // pasa los datos a la vista para que los formatee
      return ResponseFormatter.formatSuccess('Lista de autores obtenida.', authors);
      // control de errores
    } catch (error) {
      console.error('Error en getAuthors:', error);
      // formateo de la respuesta del error
      return ResponseFormatter.formatError('No se pudo obtener la lista de autores.');
    }
  },

  /**
   * Busca autores por nombre y maneja múltiples resultados.
   * @param {string} name - El nombre del autor a buscar.
   * @returns {string} La respuesta formateada.
   */
  getAuthorsByName(name) {
    try {
      // El modelo devuelve un ARRAY de autores
      const authors = AuthorsModel.findAuthorsByName(name);

      // Comprueba si el Modelo encontró algún autor.
      if (authors.length > 0) {
        return ResponseFormatter.formatSuccess(`Se encontraron ${authors.length} autores con el nombre "${name}".`, authors);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún autor con el nombre "${name}".`);
      }
    } catch (error) {
      console.error('Error en getAuthorsByName:', error);
      return ResponseFormatter.formatError('Error al buscar autores.');
    }
  },

  /**
   * Obtiene un único autor por su ID.
   * @param {string} id - El ID del autor a buscar.
   * @returns {string} La respuesta formateada.
   */
  getAuthorById(id) {
    try {
      const author = AuthorsModel.getAuthorById(id);
      if (author) {
        return ResponseFormatter.formatSuccess(`Autor con ID ${id} encontrado.`, author);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún autor con el ID ${id}.`);
      }
    } catch (error) {
      console.error('Error en getAuthorById:', error);
      return ResponseFormatter.formatError('Error al buscar el autor.');
    }
  },

/**
   * Añade un nuevo autor. El modelo se encarga de generar el ID.
   * @param {object} newAuthorData - Los datos del nuevo autor.
   * @returns {string} La respuesta formateada.
   */
  addAuthor(newAuthorData) {
    try {
      // 1. Acceso a los datos: Buscamos las claves en MAYÚSCULAS (que es como vienen del servidor)
      // o en minúsculas (como vienen del cliente), y las normalizamos.
      // Usamos || newAuthorData.name como fallback si el servidor se corrige.
      const rawName = newAuthorData.NAME || newAuthorData.name;
      const rawNationality = newAuthorData.NATIONALITY || newAuthorData.nationality;

      // 2. Validación de que existan los datos
      if (!rawName || !rawNationality) {
        return ResponseFormatter.formatError('Faltan datos obligatorios (name, nationality).');
      }
      
      // 3. Crear el objeto final con las claves en minúsculas (lo que el modelo espera).
      const authorToSave = { 
          name: rawName.toLowerCase(), 
          nationality: rawNationality.toLowerCase() 
      };

      // Le pasamos los datos al Modelo para que los guarde.
      AuthorsModel.addAuthor(authorToSave);
      return ResponseFormatter.formatSuccess('Autor añadido correctamente.', authorToSave);
    } catch (error) {
      console.error('Error en addAuthor:', error);
      return ResponseFormatter.formatError('Ocurrió un error al añadir el autor.');
    }
  },

  /**
   * Actualiza un autor por su ID único.
   * @param {string} id - El ID del autor a actualizar.
   * @param {object} updatedAuthor - Los nuevos datos para el autor (tal como llegan del servidor).
   * @returns {string} La respuesta formateada.
   */
  updateAuthor(id, updatedAuthor) {
    try {
      // 1. Filtrado y Normalización de datos
      const dataToUpdate = {};
      
      // Intentar obtener el nombre (NAME o name) y normalizar
      const rawName = updatedAuthor.NAME || updatedAuthor.name;
      if (rawName) dataToUpdate.name = rawName.toLowerCase();

      // Intentar obtener la nacionalidad (NATIONALITY o nationality) y normalizar
      const rawNationality = updatedAuthor.NATIONALITY || updatedAuthor.nationality;
      if (rawNationality) dataToUpdate.nationality = rawNationality.toLowerCase();

      // 2. Comprobar si hay datos válidos para actualizar
      if (Object.keys(dataToUpdate).length === 0) {
          return ResponseFormatter.formatError(`No se proporcionaron datos válidos (name, nationality) para actualizar el autor con ID ${id}.`);
      }
      
      // 3. Pasar SOLO los datos filtrados y normalizados al Modelo
      const success = AuthorsModel.updateAuthor(id, dataToUpdate); 
      if (success) {
        return ResponseFormatter.formatSuccess(`Autor con ID ${id} actualizado correctamente.`);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún autor con el ID ${id} para actualizar.`);
      }
    } catch (error) {
      console.error('Error en updateAuthor:', error);
      return ResponseFormatter.formatError('Error al actualizar el autor.');
    }
  },

  /**
   * Elimina un autor por su ID único.
   * @param {string} id - El ID del autor a eliminar.
   * @returns {string} La respuesta formateada.
   */
  deleteAuthor(id) {
    try {
      // Le pedimos al Modelo que intente eliminar. El Modelo nos dirá si tuvo éxito.
      const success = AuthorsModel.deleteAuthor(id);
      if (success) {
        return ResponseFormatter.formatSuccess(`Autor con ID ${id} eliminado correctamente.`);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún autor con el ID ${id} para eliminar.`);
      }
    } catch (error) {
      console.error('Error en deleteAuthor:', error);
      return ResponseFormatter.formatError('Error al eliminar el autor.');
    }
  }
};

// Exportamos el controlador para que el servidor (server.js) pueda usarlo.
export { AuthorsController };