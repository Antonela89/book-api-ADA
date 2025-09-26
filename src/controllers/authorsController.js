// Este archivo es el "Controlador" de Autores. Actúa como un intermediario.
// Recibe peticiones (ej: "dame todos los autores"), le pide los datos al Modelo, y luego le pasa esos datos a la Vista (ResponseFormatter) para que prepare la respuesta final.

// importaciones
import { AuthorsModel } from '../models/authorsModel.js'; // Importación de objeto model
import { BooksModel } from '../models/booksModel.js';
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
   * Añade un nuevo autor, verificando que no exista uno con el mismo nombre, el modelo genera el ID.
   * @param {object} newAuthorData - Los datos del nuevo autor.
   * @returns {string} La respuesta formateada.
   */
  addAuthor(newAuthorData) {
    try {
      // validacion de que esten todos los datos 
      if (!newAuthorData || !newAuthorData.name || !newAuthorData.nationality) {
        return ResponseFormatter.formatError('Faltan datos obligatorios (name, nationality).');
      }

      // Buscamos si ya existe un autor con el mismo nombre (insensible a mayúsculas).
      // findAuthorsByName devuelve una lista de coincidencias.
      const existingAuthors = AuthorsModel.findAuthorsByName(newAuthorData.name);
      if (existingAuthors.length > 0) {
        // Si la lista no está vacía, el autor ya existe.
        return ResponseFormatter.formatError(`Ya existe un autor con el nombre "${newAuthorData.name}".`);
      }

      // Le pasamos los datos al Modelo para que los guarde.
      AuthorsModel.addAuthor(newAuthorData);
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
      // Le pedimos al Modelo que intente actualizar. El Modelo nos dirá si tuvo éxito (true/false).
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
   * Elimina un autor por su ID, solo si no tiene libros asociados.
   * @param {string} id - El ID del autor a eliminar.
   * @returns {string} La respuesta formateada.
   */
  deleteAuthor(id) {
    try {
      // --- VERIFICACIÓN DE RESTRICCIÓN ---
      // Primero, verificamos si el autor que se quiere eliminar existe.
      const authorExists = AuthorsModel.getAuthorById(id);
      if (!authorExists) {
        return ResponseFormatter.formatError(`No se encontró ningún autor con el ID ${id} para eliminar.`);
      }

      // Buscamos si existen libros asociados a este autor.
      const booksByAuthor = BooksModel.findBooksByAuthorId(id);

      // Si el array resultante tiene uno o más libros, no permitimos la eliminación.
      if (booksByAuthor.length > 0) {
        return ResponseFormatter.formatError(
          `No se puede eliminar el autor con ID ${id} porque tiene ${booksByAuthor.length} libro(s) asociado(s).`
        );
      }
      // ------------------------------------------

      // --- PROCEDER CON LA ELIMINACIÓN ---
      // Si el código llega hasta aquí, significa que el autor no tiene libros.
      const success = AuthorsModel.deleteAuthor(id);

      if (success) {
        return ResponseFormatter.formatSuccess(`Autor con ID ${id} ha sido eliminado.`);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún autor con el ID ${id} para eliminar.`);
      }
    } catch (error) {
      console.error('Error inesperado en deleteAuthor:', error);
      return ResponseFormatter.formatError('Ocurrió un error inesperado al intentar eliminar el autor.');
    }
  }
};

// Exportamos el controlador para que el servidor (server.js) pueda usarlo.
export { AuthorsController };