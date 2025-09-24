// importacion de modulos necesarios
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construye la ruta al archivo de autores de forma absoluta y segura
const authorsFilePath = path.join(__dirname, '..', 'data', 'authors.json');

// creación del objeto AuthorsModel para encapsular metodos 
const AuthorsModel = {

  /**
 * Obtiene todos los autores del archivo JSON.
 * @returns {Array} Los elementos del archivo.
 */
  getAuthors() {
    try {
      // lectura del archivo json con modulo fs
      const data = fs.readFileSync(authorsFilePath, 'utf8');
      // parse de información obtenida
      return JSON.parse(data);
      // manejo de error
    } catch (error) {
      if (error.code === 'ENOENT') { // Si el archivo no existe, lo tratamos como vacío
        return [];
      }
      console.error('Error al leer el archivo de autores:', error);
      return [];
    }
  },

  /**
   * Añade un nuevo autor al archivo JSON.
   * @param {object} author  El autor a añadir.
   */
  addAuthor(author) {
    // traemos la lista de objetos con el metodo getAuthors()
    const authors = this.getAuthors();
    // Asignar un UUID si el autor no viene con uno
    if (!author.id) {
      author.id = uuidv4();
    }
    // agregamos el item a la lista
    authors.push(author);
    // escribimos la nueva lista en el archivo json
    fs.writeFileSync(authorsFilePath, JSON.stringify(authors, null, 2), 'utf8');
  },

  /**Busca TODOS los autores que coincidan parcialmente con un nombre.
   * @param {string} name - El nombre a buscar.
   * @returns {Array<object>} Un array con los autores encontrados (puede estar vacío).
   */
  findAuthorsByName(name) {
    const authors = this.getAuthors();
    // Usamos .filter() para obtener todas las coincidencias
    // busqueda parcial -> includes()
    return authors.filter(author => author.name.toLowerCase().includes(name.toLowerCase()));
  },

  /**
   * Busca un único autor por su ID.
   * @param {string} id - El ID del autor (UUID).
   * @returns {object|undefined} El autor encontrado o undefined.
   */
  getAuthorById(id) {
    const authors = this.getAuthors();
    return authors.find(author => author.id === id);
  },

  /**
  * Actualiza un autor existente por su ID.
  * @param {string} id El ID del elemento a actualizar
  * @param {object} updatedAuthor Los datos a aplicar al elemento.
  * @returns {boolean} True si se actualizó, false si no se encontró.
  */
  updateAuthor(id, updatedAuthor) {
    // traemos la lista de objetos con el metodo getAuthors()
    let authors = this.getAuthors();
    // buscamos el index del elemento a editar segun el parametro que ingresamos para filtrar
    const index = authors.findIndex(author => author.id === id);
    // No encontrado
    if (index === -1) {
      // retornamos un booleano para manejar la respuesta al usuario -> aviso de no encotrado
      return false;
    }
    // Fusionamos los datos
    // si el objeto es encontrado cambiamos los datos respectivos
    authors[index] = { ...authors[index], ...updatedAuthor };
    // reescribimos el archivo json
    fs.writeFileSync(authorsFilePath, JSON.stringify(authors, null, 2), 'utf8');
    // retornamos un booleano para manejar la respuesta al usuario  -> aviso de edición exitosa
    return true;
  },

  /**
  * Elimina un autor por su ID.
  * @param {string} id El ID del elemento a eliminar.
  * @returns {boolean} True si se eliminó, false si no se encontró.
  */
  deleteAuthor(id) {
    // traemos la lista de objetos con el metodo getAuthors()
    let authors = this.getAuthors();
    // verificamos la longitud de la lista (cantidad inicial de elementos)
    const initialLength = authors.length;
    // creamos un nuevo array con los elementos que NO tienen el id a Eliminar
    authors = authors.filter(author => author.id !== id);
    // corroboramos la longitud del nuevo array con la longitud del array inicial
    // si es igual, no se encontró el elemento a eliminar
    if (authors.length === initialLength) {
      return false; // No encontrado
    }
    // si la longitud entre los array es distinta procedemos a reescribir el archivo con la nueva lista
    fs.writeFileSync(authorsFilePath, JSON.stringify(authors, null, 2), 'utf8');
    return true; // Encontrado
  }
}

// exportar el objeto
export { AuthorsModel }

// -----------------------------------------------------------------------------------
// Opcion usando el archivo utils.js y el archivo createDataModel.js
// -----------------------------------------------------------------------------------

// import { createDataModel } from './createDataModel.js';

// Creamos un modelo de datos genérico para 'authors.json'
// const AuthorsBaseModel = createDataModel('authors.json');

// // Extendemos el objeto base con métodos específicos o alias para mayor claridad
// const AuthorsModel = {
//   ...AuthorsBaseModel, // Copiamos todos los métodos genéricos (getAll, add, findById, etc.)

//   /**
//    * Obtiene todos los autores. Alias de getAll() para claridad semántica.
//    * @returns {Array} Un array con todos los autores.
//    */
//   getAuthors() {
//     return this.getAll();
//   },

//   /**
//    * Añade un nuevo autor. Alias de add() para claridad semántica.
//    * @param {object} authorData - Los datos del autor a añadir.
//    */
//   addAuthor(authorData) {
//     this.add(authorData);
//   },

//   /**
//    * Busca todos los autores que coincidan con un nombre.
//    * @param {string} name - El nombre a buscar.
//    * @returns {Array<object>} Un array con los autores encontrados.
//    */
//   findAuthorsByName(name) {
//     // Reutilizamos el método genérico findAllBy del modelo base
//     return this.findAllBy('name', name);
//   },

//   /**
//    * Busca un único autor por su ID. Alias de findById().
//    * @param {string} id - El ID del autor.
//    * @returns {object|undefined} El autor encontrado o undefined.
//    */
//   getAuthorById(id) {
//     return this.findById(id);
//   },

//   /**
//    * Actualiza un autor por su ID. Alias de update().
//    * @param {string} id - El ID del autor a actualizar.
//    * @param {object} updatedData - Los datos a actualizar.
//    * @returns {boolean} True si se actualizó, false si no.
//    */
//   updateAuthor(id, updatedData) {
//     return this.update(id, updatedData);
//   },

//   /**
//    * Elimina un autor por su ID. Alias de delete().
//    * @param {string} id - El ID del autor a eliminar.
//    * @returns {boolean} True si se eliminó, false si no.
//    */
//   deleteAuthor(id) {
//     return this.delete(id);
//   }
// };

// export { AuthorsModel };