import * as booksModel from '../models/booksModel.js';
import * as authorsModel from '../models/authorsModel.js';
import * as publishersModel from '../models/publishersModel.js';

function getBooks() {
  return booksModel.getBooks();
}

function addBook(bookData) {
  // 1. Buscamos el autor y el editor por su nombre
  const author = authorsModel.findAuthorByName(bookData.authorName);
  const publisher = publishersModel.findPublisherByName(bookData.publisherName);

  // 2. Verificamos si se encontraron
  if (!author) {
    return { success: false, message: 'El autor no existe.' };
  }
  if (!publisher) {
    return { success: false, message: 'La editorial no existe.' };
  }

  // 3. Si ambos existen, asignamos sus IDs a los datos del libro
  bookData.authorId = author.id;
  bookData.publisherId = publisher.id;

  // 4. Eliminamos los campos de nombre para no guardarlos duplicados
  delete bookData.authorName;
  delete bookData.publisherName;

  // 5. Guardamos el libro con los IDs correctos
  booksModel.addBook(bookData);

  return { success: true, message: 'Libro añadido con éxito.', data: bookData };
}

export {
  getBooks,
  addBook
};