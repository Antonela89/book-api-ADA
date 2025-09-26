// Este es el Controlador de Libros. Es el más complejo porque un libro se relaciona con autores y editoriales. 
// Por lo tanto, este controlador necesita hablar con los tres modelos (BooksModel, AuthorsModel, PublishersModel) para hacer su trabajo.

// importaciones
import { BooksModel } from '../models/booksModel.js';
import { AuthorsModel } from '../models/authorsModel.js';
import { PublishersModel } from '../models/publishersModel.js';
import { ResponseFormatter } from '../views/responseFormatter.js';

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
      const rawTitle = newBookData.TITLE || newBookData.title;
      const rawAuthorName = newBookData.AUTHORNAME || newBookData.authorName;
      const rawPublisherName = newBookData.PUBLISHERNAME || newBookData.publisherName;
      const rawYear = newBookData.YEAR || newBookData.year;
      const rawGenre = newBookData.GENRE || newBookData.genre;

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
 * Actualiza un libro existente (solo año, titulo y genero)
 * @param {string} id - El ID del libro a actualizar.
 * @param {object} updatedBookData - Los datos a actualizar. 
 * @returns {string} La respuesta formateada.
 */
  updateBook(id, updatedBookData) {
    try {
      // Regla de negocio: no permitir cambiar autor/editorial vía actualización.
      if (updatedBookData.authorName || updatedBookData.publisherName || updatedBookData.authorId || updatedBookData.publisherId || updatedBookData.AUTHORNAME || updatedBookData.PUBLISHERNAME) {
        return ResponseFormatter.formatError("Para cambiar autor o editorial, debe eliminar y volver a crear el libro.");
      }

      // Filtramos y normalizamos solo los campos permitidos.
      const dataToUpdate = {};
      const rawTitle = updatedBookData.TITLE || updatedBookData.title;
      if (rawTitle) dataToUpdate.title = toCapitalCase(rawTitle);

      const rawYear = updatedBookData.YEAR || updatedBookData.year;
      if (rawYear) dataToUpdate.year = parseInt(rawYear);

      const rawGenre = updatedBookData.GENRE || updatedBookData.genre;
      if (rawGenre) dataToUpdate.genre = toCapitalCase(rawGenre);

      if (Object.keys(dataToUpdate).length === 0) {
        return ResponseFormatter.formatError("No se proporcionaron datos válidos (title, year, genre) para actualizar.");
      }

      if (updatedBookData.authorName || updatedBookData.publisherName || updatedBookData.authorId || updatedBookData.publisherId) {
        return ResponseFormatter.formatError("Para cambiar autor o editorial, debe eliminar y volver a crear el libro. Solo se permite actualizar título, año y género.");
      }

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