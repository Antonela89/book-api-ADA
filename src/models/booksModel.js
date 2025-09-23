import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construye la ruta al archivo de libros de forma absoluta
const booksFilePath = path.join(__dirname, '..', 'data', 'books.json');

// creacion del objeto BookModel para encapsular metodos
const BookModel = {

  // Función para obtener todos los libros
  getBooks() {
    try {
      const data = fs.readFileSync(booksFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al leer el archivo de libros:', error);
      return [];
    }
  },

  // Función para añadir un nuevo libro 
  addBook(book) {
    const books = this.getBooks();
    books.push(book);
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2), 'utf8');
  },

  // Función de buscar libro pon nombre
  getBookByName() {

  },

  // Función para editar libro
  updateBook() {

  },

  // Función para eliminar un libro
  deleteBook() {
    
  }

}

// exportación del objeto
export { BookModel }

// -----------------------------------------------------------------------------------
// Opcion usando el archivo utils.js y el archivo createDataModel.js
// -----------------------------------------------------------------------------------

// import { createDataModel } from './createDataModel.js';

// const BookBaseModel = createDataModel('books.json');

// const BookModel = {
//     ...BookBaseModel,

//     getBookByName(name) { // Buscar por la propiedad 'title' del libro
//         return this.findBy('title', name);
//     },

//     // Ejemplo de un método más específico para libros
//     // Ver como emplear la busqueda por nombre de autor y despues cruzar con authorsModel
//     findByAuthorId(authorId) {
//         const books = this.getAll();
//         return books.filter(book => book.authorId === authorId); 
//     }
// };

// export { BookModel };