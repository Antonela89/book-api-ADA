// Este es el Controlador de Libros. Es el más complejo porque un libro se relaciona con autores y editoriales.

// importaciones
import { BooksModel } from '../models/booksModel.js';
import { AuthorsModel } from '../models/authorsModel.js';
import { PublishersModel } from '../models/publishersModel.js';
import { ResponseFormatter } from '../views/responseFormatter.js';

/**
 * Formatea los datos de un libro reemplazando IDs por nombres.
 */
function formatBookData(book) {
  const author = AuthorsModel.getAuthorById(book.authorId);
  const publisher = PublishersModel.getPublisherById(book.publisherId);
  return {
    id: book.id,
    title: book.title,
    author: author ? author.name : `Autor Desconocido (ID: ${book.authorId})`,
    publisher: publisher ? publisher.name : `Editorial Desconocida (ID: ${book.publisherId})`,
    year: book.year,
    genre: book.genre
  };
}

const BooksController = {
  getAllBooks() {
    try {
      const books = BooksModel.getBooks().map(formatBookData);
      return ResponseFormatter.formatSuccess('Lista de libros obtenida.', books);
    } catch (error) {
      console.error('Error en getAllBooks:', error);
      return ResponseFormatter.formatError('No se pudo obtener la lista de libros.');
    }
  },

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

  getBookById(id) {
    try {
      const book = BooksModel.getBooks().find(b => b.id.toLowerCase() === id.toLowerCase());
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

      const authorResults = AuthorsModel.findAuthorsByName(rawAuthorName.toLowerCase());
      const author = authorResults.length > 0 ? authorResults[0] : null;

      const publisherResults = PublishersModel.findPublishersByName(rawPublisherName.toLowerCase());
      const publisher = publisherResults.length > 0 ? publisherResults[0] : null;

      if (!author) return ResponseFormatter.formatError(`Autor/a "${rawAuthorName}" no encontrado/a.`);
      if (!publisher) return ResponseFormatter.formatError(`Editorial "${rawPublisherName}" no encontrada.`);

      const bookToSave = {
        title: rawTitle.toLowerCase(),
        authorId: author.id,
        publisherId: publisher.id,
        year: parseInt(rawYear),
        genre: rawGenre.toLowerCase()
      };

      BooksModel.addBook(bookToSave);
      return ResponseFormatter.formatSuccess('Libro añadido correctamente.', bookToSave);
    } catch (error) {
      console.error('Error en addBook:', error);
      return ResponseFormatter.formatError('Ocurrió un error al añadir el libro.');
    }
  },

  updateBook(id, updatedBookData) {
    try {
      const success = BooksModel.updateBook(id, updatedBookData);
      if (success) {
        return ResponseFormatter.formatSuccess(`Libro con ID ${id} actualizado correctamente.`);
      } else {
        return ResponseFormatter.formatError(`No se encontró ningún libro con el ID ${id}.`);
      }
    } catch (error) {
      console.error('Error en updateBook:', error);
      return ResponseFormatter.formatError('Error al actualizar el libro.');
    }
  },

  countBooksByAuthorId(authorId) {
    try {
      return BooksModel.getBooks().filter(book => book.authorId.toLowerCase() === authorId.toLowerCase()).length;
    } catch (error) {
      console.error('Error en countBooksByAuthorId:', error);
      return 999;
    }
  },

  countBooksByPublisherId(publisherId) {
    try {
      return BooksModel.getBooks().filter(book => book.publisherId.toLowerCase() === publisherId.toLowerCase()).length;
    } catch (error) {
      console.error('Error en countBooksByPublisherId:', error);
      return 999;
    }
  },

  deleteBook(id) {
    try {
      const success = BooksModel.deleteBook(id);
      if (success) return ResponseFormatter.formatSuccess(`Libro con ID ${id} eliminado correctamente.`);
      return ResponseFormatter.formatError(`No se encontró ningún libro con el ID ${id} para eliminar.`);
    } catch (error) {
      console.error('Error en deleteBook:', error);
      return ResponseFormatter.formatError('Error al eliminar el libro.');
    }
  }
};

export { BooksController };
