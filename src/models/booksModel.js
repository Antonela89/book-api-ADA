import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construye la ruta al archivo de libros de forma absoluta
const booksFilePath = path.join(__dirname, '..', 'data', 'books.json');

// Creación del objeto BookModel para encapsular metodos
const BooksModel = {

  /**
 * Obtiene todos los libros del archivo JSON.
 * @returns {Array} Los elementos del archivo.
 */
  getBooks() {
    try {
      // lectura del archivo json con modulo fs
      const data = fs.readFileSync(booksFilePath, 'utf8');
      // parse de información obtenida
      return JSON.parse(data);
      // manejo de error
    } catch (error) {
      console.error('Error al leer el archivo de libros:', error);
      return [];
    }
  },

  /**
   * Añade un nuevo libro al archivo JSON.
   * @param {object} book El elemento a añadir.
   */
  addBook(book) {
    // traemos la lista de objetos con el metodo getBooks()
    const books = this.getBooks();
    if (!book.id) {
      book.id = uuidv4();
    }
    // agregamos el item a la lista
    books.push(book);
    // escribimos la nueva lista en el archivo json
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2), 'utf8');
  },

  /**Busca TODOS los libros que coincidan parciamente con un nombre.
   * @param {string} title - El nombre a buscar.
   * @returns {Array<object>} Un array con los libros encontrados (puede estar vacío).
   */
  findBooksByTitle(title) {
    const books = this.getBooks();
    // Usamos .filter() para obtener todas las coincidencias
    // busqueda parcial -> includes()
    return books.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
  },

  /**
   * Busca todos los libros asociados a un ID de autor.
   * @param {string} authorId - El ID del autor.
   * @returns {Array<object>} Un array con los libros de ese autor.
   */
  findBooksByAuthorId(authorId) {
    const allBooks = this.getBooks();
    return allBooks.filter(book => book.authorId === authorId);
  },

  /**
   * Busca todos los libros asociados a un ID de editorial.
   * @param {string} publisherId - El ID de la editorial.
   * @returns {Array<object>} Un array con los libros de esa editorial.
   */
  findBooksByPublisherId(publisherId) {
    const allBooks = this.getBooks();
    return allBooks.filter(book => book.publisherId === publisherId);
  },


  /**
   * Busca un único libro por su ID.
   * @param {string} id - El ID del libro (UUID).
   * @returns {object|undefined} El libro encontrado o undefined.
   */
  getBookById(id) {
    const books = this.getBooks();
    return books.find(book => book.id === id);
  },

  /**
 * Actualiza un libro existente por su ID.
 * @param {string} id El ID del elemento a actualizar.
 * @param {object} updatedBook Los datos a aplicar al elemento.
 * @returns {boolean} True si se actualizó, false si no se encontró.
 */
  updateBook(id, updatedBook) {
    // traemos la lista de objetos con el metodo getBooks()
    let books = this.getBooks();
    // buscamos el index del elemento a editar segun el parametro que ingresamos para filtrar
    const index = books.findIndex(book => book.id === id);
    // No encontrado
    if (index === -1) {
      // retornamos un booleano para manejar la respuesta al usuario -> aviso de no encotrado
      return false;
    }
    // Fusionamos los datos
    // si el objeto es encontrado cambiamos los datos respectivos
    books[index] = { ...books[index], ...updatedBook };
    // reescribimos el archivo json
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2), 'utf8');
    // retornamos un booleano para manejar la respuesta al usuario  -> aviso de edición exitosa
    return true;
  },

  /**
  * Elimina un libro por su ID.
  * @param {string} id El ID del elemento a eliminar.
  * @returns {boolean} True si se eliminó, false si no se encontró.
  */
  deleteBook(id) {
    // traemos la lista de objetos con el metodo getBooks()
    let books = this.getBooks();
    // verificamos la longitud de la lista (cantidad inicial de elementos)
    const initialLength = books.length;
    // creamos un nuevo array con los elementos que NO tienen el id a Eliminar
    books = books.filter(book => book.id !== id);
    // corroboramos la longitud del nuevo array con la longitud del array inicial
    // si es igual, no se encontró el elemento a eliminar
    if (books.length === initialLength) {
      return false; // No encontrado
    }
    // si la longitud entre los array es distinta procedemos a reescribir el archivo con la nueva lista
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2), 'utf8');
    return true; // Encontrado
  }
}


// exportación del objeto
export { BooksModel }

// -----------------------------------------------------------------------------------
// Opcion usando el archivo utils.js y el archivo createDataModel.js
// -----------------------------------------------------------------------------------

// import { createDataModel } from './createDataModel.js';

// // Creamos un modelo de datos genérico para 'books.json'
// const BooksBaseModel = createDataModel('books.json');

// // Extendemos el objeto base con métodos específicos y alias
// const BooksModel = {
//   ...BooksBaseModel, // Copiamos todos los métodos genéricos

//   /**
//    * Obtiene todos los libros. Alias de getAll().
//    * @returns {Array} Un array con todos los libros.
//    */
//   getBooks() {
//     return this.getAll();
//   },

//   /**
//    * Añade un nuevo libro. Alias de add().
//    * @param {object} bookData - Los datos del libro a añadir.
//    */
//   addBook(bookData) {
//     this.add(bookData);
//   },

//   /**
//    * Busca un único libro por su ID. Alias de findById().
//    * @param {string} id - El ID del libro.
//    * @returns {object|undefined} El libro encontrado o undefined.
//    */
//   getBookById(id) {
//     return this.findById(id);
//   },

//   /**
//    * Busca todos los libros que coincidan con un título.
//    * @param {string} title - El título a buscar.
//    * @returns {Array<object>} Un array con los libros encontrados.
//    */
//   findBooksByTitle(title) {
//     return this.findAllBy('title', title);
//   },

//   /**
//    * MÉTODO ESPECÍFICO: Busca todos los libros de un autor por su ID.
//    * @param {string} authorId - El ID del autor.
//    * @returns {Array<object>} Un array con los libros de ese autor.
//    */
//   findBooksByAuthorId(authorId) {
//     return this.findAllBy('authorId', authorId);
//   },

//   /**
//    * MÉTODO ESPECÍFICO: Busca todos los libros de una editorial por su ID.
//    * @param {string} publisherId - El ID de la editorial.
//    * @returns {Array<object>} Un array con los libros de esa editorial.
//    */
//   findBooksByPublisherId(publisherId) {
//     return this.findAllBy('publisherId', publisherId);
//   },

//   /**
//    * Actualiza un libro por su ID. Alias de update().
//    * @param {string} id - El ID del libro a actualizar.
//    * @param {object} updatedData - Los datos a actualizar.
//    * @returns {boolean} True si se actualizó, false si no.
//    */
//   updateBook(id, updatedData) {
//     return this.update(id, updatedData);
//   },

//   /**
//    * Elimina un libro por su ID. Alias de delete().
//    * @param {string} id - El ID del libro a eliminar.
//    * @returns {boolean} True si se eliminó, false si no.
//    */
//   deleteBook(id) {
//     return this.delete(id);
//   }
// };

// export { BooksModel };