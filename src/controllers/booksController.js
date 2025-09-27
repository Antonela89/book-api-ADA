// Este es el Controlador de Libros. Es el más complejo porque un libro se relaciona con autores y editoriales. 
// Por lo tanto, este controlador necesita hablar con los tres modelos (BooksModel, AuthorsModel, PublishersModel) para hacer su trabajo.

// importaciones
import { BooksModel } from '../models/booksModel.js';
import { AuthorsModel } from '../models/authorsModel.js';
import { PublishersModel } from '../models/publishersModel.js';
import { toCapitalCase } from '../utils/formatters.js';
import { ResponseFormatter } from '../views/responseFormatter.js';
import { getCaseInsensitiveValue, buildUpdateObject } from '../utils/objectUtils.js';

/**
 * Función auxiliar para formatear los datos de un libro para una mejor visualización.
 * Reemplaza los IDs (authorId, publisherId) por los nombres correspondientes para que la información sea más legible para el usuario.
 * @param {object} book - El objeto libro original con IDs.
 * @returns {object} Un nuevo objeto libro con nombres en lugar de IDs.
 */
function formatBookData(book) {
  // Pide al Modelo de Autores que encuentre el autor por su ID.
  const author = AuthorsModel.getAuthorById(book.authorId);
  // Pide al Modelo de Editoriales que encuentre la editorial por su ID.
  const publisher = PublishersModel.getPublisherById(book.publisherId);
  // Devuelve un nuevo objeto con los datos listos para mostrar.
  return {
    id: book.id,
    title: book.title,
    author: author ? author.name : `Autor Desconocido (ID: ${book.authorId})`,
    publisher: publisher ? publisher.name : `Editorial Desconocida (ID: ${book.publisherId})`,
    year: book.year,
    genre: book.genre
  };
}

// Creación de objeto de para encapsular metodos relacionados con libros
const BooksController = {
  /**
   * Obtiene todos los libros y devuelve la respuesta formateada.
   * @returns {string} La respuesta formateada como un string.
   */
  getAllBooks() {
    try {
      const books = BooksModel.getBooks().map(formatBookData);
      return ResponseFormatter.formatSuccess('Lista de libros obtenida.', books);
    } catch (error) {
      console.error('Error en getAllBooks:', error);
      return ResponseFormatter.formatError('No se pudo obtener la lista de libros.');
    }
  },

  /**
   * Busca libros por título y maneja múltiples resultados.
   * @param {string} title - El título del libro a buscar (puede ser parcial).
   * @returns {string} La respuesta formateada.
   */
  getBooksByTitle(title) {
    try {
      const books = BooksModel.findBooksByTitle(title).map(formatBookData);
      if (books.length > 0) {
        return ResponseFormatter.formatSuccess(`Se encontraron ${books.length} libros con el título "${title}".`, books);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún libro con el título "${title}".`);
      }
    } catch (error) {
      console.error('Error en getBooksByTitle:', error);
      return ResponseFormatter.formatError('Error al buscar libros.');
    }
  },

  /**
   * Obtiene un libro por su ID.
   * @param {string} id - El ID del libro a buscar.
   * @returns {string} Una cadena de texto con la respuesta.
   */
  getBookById(id) {
    try {
      const book = BooksModel.getBookById(id);
      if (book) {
        return ResponseFormatter.formatSuccess(`Libro con ID ${id} encontrado.`, formatBookData(book));
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún libro con el ID ${id}.`);
      }
    } catch (error) {
      console.error('Error en getBookById:', error);
      return ResponseFormatter.formatError('Error al buscar el libro.');
    }
  },

  /**
     * Añade un nuevo libro y devuelve la respuesta formateada.
     * @param {object} newBookData - Los datos del nuevo libro.
     * @returns {string} La respuesta formateada como un string.
     */
  addBook(newBookData) {
    try {
      const rawTitle = getCaseInsensitiveValue(newBookData, 'title');
      const rawAuthorName = getCaseInsensitiveValue(newBookData, 'authorName');
      const rawPublisherName = getCaseInsensitiveValue(newBookData, 'publisherName');
      const rawYear = getCaseInsensitiveValue(newBookData, 'year');
      const rawGenre = getCaseInsensitiveValue(newBookData, 'genre');

      if (!rawTitle || !rawAuthorName || !rawPublisherName || !rawYear || !rawGenre) {
        return ResponseFormatter.formatError('Faltan datos obligatorios (title, authorName, publisherName, year, genre).');
      }

      // Busca si existe un libro con el nuevo título que se ingreso - evita duplicar objeto
      const existingBooks = BooksModel.findBooksByTitle(rawTitle);
      if (existingBooks.length > 0) {
        return ResponseFormatter.formatError(`Ya existe un libro con el título "${rawTitle}".`);
      }

      // Valida el nombre del autor
      const authors = AuthorsModel.findAuthorsByName(rawAuthorName);
      if (authors.length === 0) return ResponseFormatter.formatError(`El autor "${rawAuthorName}" no existe.`);
      if (authors.length > 1) return ResponseFormatter.formatError(`El nombre de autor "${rawAuthorName}" es ambiguo.`);

      // Valida el nombre de la editorial
      const publishers = PublishersModel.findPublishersByName(rawPublisherName);
      if (publishers.length === 0) return ResponseFormatter.formatError(`La editorial "${rawPublisherName}" no existe.`);
      if (publishers.length > 1) return ResponseFormatter.formatError(`El nombre de editorial "${rawPublisherName}" es ambiguo.`);

      // Creación del objeto a guardar
      const bookToSave = {
        title: toCapitalCase(rawTitle),
        authorId: authors[0].id,
        publisherId: publishers[0].id,
        year: parseInt(rawYear),
        genre: toCapitalCase(rawGenre)
      };

      // guardado del libro.
      BooksModel.addBook(bookToSave);
      return ResponseFormatter.formatSuccess('Libro añadido correctamente.', bookToSave);
    } catch (error) {
      console.error('Error en addBook:', error);
      return ResponseFormatter.formatError('Ocurrió un error al añadir el libro.');
    }
  },

  /**
  * Actualiza un libro existente (solo título, año y género).
  * @param {string} id - El ID del libro a actualizar.
  * @param {object} updatedBookData - Los datos a actualizar.
  * @returns {string} La respuesta formateada.
  */
  updateBook(id, updatedBookData) {
    try {
      // Regla de negocio: verificar si se intenta cambiar campos no permitidos.
      // Usamos la utilidad para hacer la comprobación más robusta.
      if (getCaseInsensitiveValue(updatedBookData, 'authorName') || getCaseInsensitiveValue(updatedBookData, 'publisherName')) {
        return ResponseFormatter.formatError("Para cambiar autor o editorial, debe eliminar y volver a crear el libro.");
      }

      // Definir los campos permitidos Y SU TIPO.
      const allowedFields = {
        title: 'string',
        year: 'number',
        genre: 'string'
      };

      // Usar la utilidad para crear el objeto de actualización de forma segura.
      const dataToUpdate = buildUpdateObject(updatedBookData, allowedFields);

      // Regla de negocio: si no se pasaron datos válidos, devolver un error.
      if (Object.keys(dataToUpdate).length === 0) {
        const validFields = Object.keys(allowedFields).join(', ');
        return ResponseFormatter.formatError(`No se proporcionaron datos válidos (${validFields}) para actualizar.`);
      }

      // Pasar el objeto limpio al Modelo.
      const success = BooksModel.updateBook(id, dataToUpdate);
      if (success) {
        return ResponseFormatter.formatSuccess(`Libro con ID ${id} actualizado correctamente.`);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún libro con el ID ${id} para actualizar.`);
      }
    } catch (error) {
      console.error('Error en updateBook:', error);
      return ResponseFormatter.formatError('Error al actualizar libro.');
    }
  },
  /**
 * Elimina un libro por su ID.
 * @param {string} id - El ID del libro a eliminar.
 * @returns {string} La respuesta formateada.
 */
  deleteBook(id) {
    try {
      const success = BooksModel.deleteBook(id);
      if (success) {
        return ResponseFormatter.formatSuccess(`Libro con ID ${id} eliminado correctamente.`);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún libro con el ID ${id} para eliminar.`);
      }
    } catch (error) {
      console.error('Error en deleteBook:', error);
      return ResponseFormatter.formatError('Error al eliminar el libro.');
    }
  }
};

// exportación
export { BooksController };