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
      // 1. Acceso y normalización de datos: Busca las claves en MAYÚSCULAS o minúsculas.
      const rawTitle = newBookData.TITLE || newBookData.title;
      const rawAuthorName = newBookData.AUTHORNAME || newBookData.authorName;
      const rawPublisherName = newBookData.PUBLISHERNAME || newBookData.publisherName;
      const rawYear = newBookData.YEAR || newBookData.year;
      const rawGenre = newBookData.GENRE || newBookData.genre;

      // 2. Validación de que existan todos los datos.
      if (!rawTitle || !rawAuthorName || !rawPublisherName || !rawYear || !rawGenre) {
        return ResponseFormatter.formatError('Faltan datos obligatorios (title, authorName, publisherName, year, genre).');
      }

      // 3. Normalizar nombres y buscar ID del Autor
      // CORRECCIÓN: Se cambia .getAuthorsByName a .findAuthorsByName
      const authorResults = AuthorsModel.findAuthorsByName(rawAuthorName.toLowerCase()); 
      const author = authorResults.length > 0 ? authorResults[0] : null;

      // 4. Normalizar nombres y buscar ID de la Editorial
      const publisherResults = PublishersModel.findPublishersByName(rawPublisherName.toLowerCase());
      const publisher = publisherResults.length > 0 ? publisherResults[0] : null;

      // 5. Validaciones de existencia
      if (!author) {
        return ResponseFormatter.formatError(`Autor/a "${rawAuthorName}" no encontrado/a. Por favor, asegúrate de que el nombre sea exacto y que el/la autor/a exista antes de añadir el libro.`);
      }
      if (!publisher) {
        return ResponseFormatter.formatError(`Editorial "${rawPublisherName}" no encontrada. Por favor, asegúrate de que el nombre sea exacto y que la editorial exista antes de añadir el libro.`);
      }

      // 6. Crear el objeto final para guardar en el Modelo
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

  /**
   * Función auxiliar para contar libros por Author ID (usada por server.js para DELETE)
   * CORRECCIÓN: Realizamos el conteo en el controlador.
   * @param {string} authorId - El ID del autor.
   * @returns {number} La cantidad de libros asociados a ese autor.
   */
  countBooksByAuthorId(authorId) {
    try {
      // 1. Obtenemos todos los libros del Modelo.
      const allBooks = BooksModel.getBooks(); 
      // 2. Filtramos la lista para contar solo los que coinciden con el authorId.
      const associatedBooks = allBooks.filter(book => book.authorId === authorId);
      return associatedBooks.length;
    } catch (error) {
      console.error('Error en countBooksByAuthorId:', error);
      // Retornamos un número alto para prevenir la eliminación si falla la lectura del modelo.
      return 999; 
    }
  },

  /**
   * Función auxiliar para contar libros por Publisher ID (usada por server.js para DELETE)
   * CORRECCIÓN: Realizamos el conteo en el controlador.
   * @param {string} publisherId - El ID de la editorial.
   * @returns {number} La cantidad de libros asociados a esa editorial.
   */
  countBooksByPublisherId(publisherId) {
    try {
      // 1. Obtenemos todos los libros del Modelo.
      const allBooks = BooksModel.getBooks(); 
      // 2. Filtramos la lista para contar solo los que coinciden con el publisherId.
      const associatedBooks = allBooks.filter(book => book.publisherId === publisherId);
      return associatedBooks.length;
    } catch (error) {
      console.error('Error en countBooksByPublisherId:', error);
      // Retornamos un número alto para prevenir la eliminación si falla la lectura del modelo.
      return 999;
    }
  },
  
  /**
 * Elimina un libro por su ID.
 * @param {string} name - El ID del libro a eliminar.
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