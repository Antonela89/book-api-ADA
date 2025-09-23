import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construye la ruta al archivo de libros de forma absoluta
const booksFilePath = path.join(__dirname, '..', 'data', 'books.json');

// Creación del objeto BookModel para encapsular metodos
const BookModel = {

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
   * @param {object} item El elemento a añadir.
   */
  addBook(book) {
    // traemos la lista de objetos con el metodo getBooks()
    const books = this.getBooks();
    // agregamos el item a la lista
    books.push(book);
    // escribimos la nueva lista en el archivo json
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2), 'utf8');
  },

  /**
  * Busca un libro por nombre.
  * @param {any} name El valor a buscar.
  * @returns {object|undefined} El elemento encontrado o undefined.
  */
  getBookByName(name) {
    // traemos la lista de objetos con el metodo getBooks()
    const books = this.getBooks();
    // empleamos el metodo toLowerCase() para manejar la sensibilidad a mayúsculas
    return books.find(book => book.name.toLowerCase() === name.toLowerCase());
  },

  /**
 * Actualiza un editorial existente por su ID.
 * @param {string|number} id El ID del elemento a actualizar, puede ser string o número
 * @param {object} updatedItem Los datos a aplicar al elemento.
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
  * Elimina un editorial por su ID.
  * @param {string|number} id El ID del elemento a eliminar.
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