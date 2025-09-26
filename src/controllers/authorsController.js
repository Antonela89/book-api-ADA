// Este archivo es el "Controlador" de Autores. Actúa como un intermediario.
// Recibe peticiones, les pide datos al Modelo y se los pasa a la Vista
// para que prepare la respuesta final. Aquí residen las reglas de negocio.

// importaciones
import { AuthorsModel } from '../models/authorsModel.js';
import { BooksModel } from '../models/booksModel.js';
import { ResponseFormatter } from '../views/responseFormatter.js';

/**
 * Convierte un string a formato Capital Case.
 * ej: "jorge luis borges" -> "Jorge Luis Borges"
 * @param {string} str - El string a convertir.
 * @returns {string} El string formateado.
 */
function toCapitalCase(str) {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Creación del objeto para encapsular los métodos relacionados con autores.
const AuthorsController = {
  /**
   * Obtiene todos los autores.
   * @returns {string} La respuesta formateada.
   */
  getAllAuthors() {
    try {
      // Pide los datos al Modelo.
      const authors = AuthorsModel.getAuthors();
      // Pasa los datos a la Vista para que los formatee.
      return ResponseFormatter.formatSuccess('Lista de autores obtenida.', authors);
    } catch (error) {
      console.error('Error en getAllAuthors:', error);
      return ResponseFormatter.formatError('No se pudo obtener la lista de autores.');
    }
  },

  /**
   * Busca autores por nombre.
   * @param {string} name - El nombre del autor a buscar.
   * @returns {string} La respuesta formateada.
   */
  getAuthorsByName(name) {
    try {
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
   *  Obtiene un único autor por su ID.
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
   * Añade un nuevo autor, validando datos y previniendo duplicados.
   * @param {object} newAuthorData - Los datos del nuevo autor recibidos del servidor.
   * @returns {string} La respuesta formateada.
   */
  addAuthor(newAuthorData) {
    try {
      // Normalizamos los datos de entrada (aceptamos claves en mayúsculas o minúsculas).
      const rawName = newAuthorData.NAME || newAuthorData.name;
      const rawNationality = newAuthorData.NATIONALITY || newAuthorData.nationality;

      if (!rawName || !rawNationality) {
        return ResponseFormatter.formatError('Faltan datos obligatorios (name, nationality).');
      }

      // Creamos el objeto final con las claves y valores normalizados (todo en minúsculas).
      const authorToSave = {
        name: toCapitalCase(rawName),
        nationality: toCapitalCase(rawNationality)
      };

      // Regla de negocio: verificamos si ya existe un autor con ese nombre.
      const existingAuthors = AuthorsModel.findAuthorsByName(authorToSave.name);
      if (existingAuthors.length > 0) {
        return ResponseFormatter.formatError(`Ya existe un autor con el nombre "${authorToSave.name}".`);
      }

      // Pasamos el objeto limpio al Modelo para que lo guarde.
      AuthorsModel.addAuthor(authorToSave);
      return ResponseFormatter.formatSuccess('Autor añadido correctamente.', authorToSave);
    } catch (error)      {
      console.error('Error en addAuthor:', error);
      return ResponseFormatter.formatError('Ocurrió un error al añadir el autor.');
    }
  },

  /**
   * Edita un autor por su ID.
   * @param {string} id - El ID del autor a editar.
   * @param {object} updatedAuthorData - Los nuevos datos del autor.
   * @returns {string} La respuesta formateada.
   */
  updateAuthor(id, updatedAuthorData) {
    try {
      // Filtramos y normalizamos solo los campos que nos interesan.
      const dataToUpdate = {};
      const rawName = updatedAuthorData.NAME || updatedAuthorData.name;
      if (rawName) dataToUpdate.name = toCapitalCase(rawName);

      const rawNationality = updatedAuthorData.NATIONALITY || updatedAuthorData.nationality;
      if (rawNationality) dataToUpdate.nationality = toCapitalCase(rawNationality);

      // Regla de negocio: si no se pasó ningún dato válido, devolvemos un error.
      if (Object.keys(dataToUpdate).length === 0) {
        return ResponseFormatter.formatError(`No se proporcionaron datos válidos (name, nationality) para actualizar.`);
      }

      // Le pedimos al Modelo que intente actualizar con los datos ya filtrados.
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
   * Elimina un autor por su ID, solo si no tiene libros asociados.
   * @param {string} id - El ID del autor a eliminar.
   * @returns {string} La respuesta formateada.
   */
  deleteAuthor(id) {
    try {
      // Primero, verificamos si el autor que se quiere eliminar realmente existe.
      const authorExists = AuthorsModel.getAuthorById(id);
      if (!authorExists) {
        return ResponseFormatter.formatError(`No se encontró ningún autor con el ID ${id} para eliminar.`);
      }

      // Regla de negocio: buscamos si existen libros asociados a este autor.
      const booksByAuthor = BooksModel.findBooksByAuthorId(id);

      // Si el array resultante tiene uno o más libros, aplicamos la restricción y no permitimos la eliminación.
      if (booksByAuthor.length > 0) {
        return ResponseFormatter.formatError(
          `No se puede eliminar al autor "${authorExists.name}" porque tiene ${booksByAuthor.length} libro(s) asociado(s). Primero elimina sus libros.`
        );
      }
      
      // Si el autor existe y no tiene libros, procedemos a eliminarlo.
      const success = AuthorsModel.deleteAuthor(id);
      if (success) {
        return ResponseFormatter.formatSuccess(`El autor "${authorExists.name}" (ID: ${id}) ha sido eliminado.`);
      } else {
        // Este caso es redundante gracias a la primera verificación, pero es una buena práctica de seguridad.
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