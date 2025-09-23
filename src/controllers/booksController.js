import { BooksModel } from '../models/booksModel.js';
import { AuthorsModel } from '../models/authorsModel.js';
import { PublishersModel } from '../models/publishersModel.js';
import { ResponseFormatter } from '../views/responseFormatter.js';

/**
 * Función auxiliar para formatear los datos de un libro para una mejor visualización.
 */
function formatBookData(book) {
  const author = AuthorsModel.getAuthorById(book.authorId);
  const publisher = PublishersModel.getPublisherById(book.publisherId);
  return {
    id: book.id,
    title: book.title,
    author: author ? author.name : `Autor Desconocido (ID: ${book.authorId})`,
    publisher: publisher ? publisher.name : `Editorial Desconocida (ID: ${book.publisherId})`
  };
}

const BooksController = {
  /**
  * Obtiene todos los libros y cambia el id del autor y la editorial por los nombres.
  * @returns {string} La respuesta formateada como una tabla.
  */
  getAllBooks() {
    try {
      const books = BooksModel.getBooks();
      const formatedBooks = books.map(formatBookData);
      return ResponseFormatter.formatSuccess('Lista de libros obtenida.', formatedBooks);
    } catch (error) {
      console.error('Error en getAllBooks:', error);
      return ResponseFormatter.formatError('No se pudo obtener la lista de libros.');
    }
  },

  /**
 * Obtiene un libro por su titulo y formatea los datos.
 * @param {string|number} title - El titulo del libro.
 * @returns {string} La respuesta formateada.
 */
  getBooksByTitle(title) {
    try {
      const books = BooksModel.findBooksByTitle(title);
      if (books.length > 0) {
        const formatedBooks = books.map(formatBookData);
        return ResponseFormatter.formatSuccess(`Se encontraron ${books.length} libros con el título "${title}".`, formatedBooks);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún libro con el título "${title}".`);
      }
    } catch (error) {
      console.error('Error en getBooksByTitle:', error);
      return ResponseFormatter.formatError('Error al buscar libros por título.');
    }
  },

  /**
* Obtiene un libro por su id y formatea los datos.
* @param {string|number} id - El id del libro.
* @returns {string} La respuesta formateada.
*/
  getBookById(id) {
    try {
      const book = BooksModel.getBookById(id);
      if (book) {
        const formatedBooks = formatBookData(book);
        return ResponseFormatter.formatSuccess(`Libro con ID ${id} encontrado.`, formatedBooks);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún libro con el ID ${id}.`);
      }
    } catch (error) {
      console.error('Error en getBookById:', error);
      return ResponseFormatter.formatError('Error al buscar el libro.');
    }
  },

  /**
 * Añade un nuevo libro, convirtiendo nombres de autor/editorial a IDs.
 * @param {object} bookData - Datos del libro, incluyendo authorName y publisherName.
 * @returns {string} La respuesta formateada.
 */
  addBook(bookData) {
    try {
      const { title, authorName, publisherName } = bookData;
      if (!title || !authorName || !publisherName) {
        return ResponseFormatter.formatError('Faltan datos obligatorios (title, authorName, publisherName).');
      }

      // Validar autor
      const authors = AuthorsModel.findAuthorsByName(authorName);
      if (authors.length === 0) return ResponseFormatter.formatError(`El autor "${authorName}" no existe.`);
      if (authors.length > 1) return ResponseFormatter.formatError(`El nombre de autor "${authorName}" es ambiguo. Use 'buscar-autor ${authorName}' para obtener el ID exacto y vuelva a intentarlo.`);

      // Validar editorial
      const publishers = PublishersModel.findPublishersByName(publisherName);
      if (publishers.length === 0) return ResponseFormatter.formatError(`La editorial "${publisherName}" no existe.`);
      if (publishers.length > 1) return ResponseFormatter.formatError(`El nombre de editorial "${publisherName}" es ambiguo. Use 'buscar-editorial ${publisherName}' para obtener el ID exacto y vuelva a intentarlo.`);

      const newBook = { title, authorId: authors[0].id, publisherId: publishers[0].id };
      BooksModel.addBook(newBook);
      return ResponseFormatter.formatSuccess('Libro añadido correctamente.', newBook);

    } catch (error) {
      console.error('Error en addBook:', error);
      return ResponseFormatter.formatError('Ocurrió un error al añadir el libro.');
    }
  },

  /**
 * Actualiza un libro existente.
 * @param {string|number} name - El ID del libro a actualizar.
 * @param {object} updatedBook - Los datos a actualizar. Puede incluir authorName/publisherName.
 * @returns {string} La respuesta formateada.
 */
  updateBook(id, dataToUpdate) {
    try {
      if (dataToUpdate.authorName || dataToUpdate.publisherName || dataToUpdate.authorId || dataToUpdate.publisherId) {
        return ResponseFormatter.formatError("Para cambiar autor o editorial, debe eliminar y volver a crear el libro. Solo se permite actualizar el título.");
      }

      const success = BooksModel.updateBook(id, dataToUpdate);
      if (success) {
        return ResponseFormatter.formatSuccess(`Libro con ID ${id} actualizado correctamente.`);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún libro con el ID ${id} para actualizar.`);
      }
    } catch (error) {
      console.error('Error en updateBook:', error);
      return ResponseFormatter.formatError('Error al actualizar el libro.');
    }
  },

  /**
 * Elimina un libro por su ID.
 * @param {string|number} name - El ID del libro a eliminar.
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

export { BooksController };
