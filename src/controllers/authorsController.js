import { AuthorsModel } from '../models/authorsModel.js'; // Importación de objeto model
import { ResponseFormatter } from '../views/responseFormatter.js'; // importacion de objeto views

// Creación de objeto de para encapsular metodos 
const AuthorsController = {
  /**
 * Obtiene todos los autores y devuelve la respuesta formateada.
 * @returns {string} La respuesta formateada como un string.
 */
  getAllAuthors() {
    try {
      const authors = AuthorsModel.getAuthors();
      return ResponseFormatter.formatSuccess('Lista de autores obtenida.', authors);
    } catch (error) {
      console.error('Error en getAuthors:', error);
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
      if (!newAuthorData || !newAuthorData.name || !newAuthorData.nationality) {
        return ResponseFormatter.formatError('Faltan datos obligatorios (name, nationality).');
      }
      AuthorsModel.addAuthor(newAuthorData);
      // El objeto newAuthorData ahora incluye el ID que le asignó el modelo
      return ResponseFormatter.formatSuccess('Autor añadido correctamente.', newAuthorData);
    } catch (error) {
      console.error('Error en addAuthor:', error);
      return ResponseFormatter.formatError('Ocurrió un error al añadir el autor.');
    }
  },

  /**
   * Actualiza un autor por su ID único.
   * @param {string} id - El ID del autor a actualizar.
   * @param {object} updatedAuthor - Los nuevos datos para el autor.
   * @returns {string} La respuesta formateada.
   */
  updateAuthor(id, updatedAuthor) {
    try {
      const success = AuthorsModel.updateAuthor(id, updatedAuthor);
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

export { AuthorsController };