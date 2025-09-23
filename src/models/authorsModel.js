// importacion de modulos necesarios
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
      console.error('Error al leer el archivo de autores:', error);
      return [];
    }
  },

  /**
   * Añade un nuevo autor al archivo JSON.
   * @param {object} item El elemento a añadir.
   */
  addAuthor(author) {
    // traemos la lista de objetos con el metodo getAuthors()
    const authors = this.getAuthors();
    // agregamos el item a la lista
    authors.push(author);
    // escribimos la nueva lista en el archivo json
    fs.writeFileSync(authorsFilePath, JSON.stringify(authors, null, 2), 'utf8');
  },

  /**
  * Busca un autor por nombre.
  * @param {any} name El valor a buscar.
  * @returns {object|undefined} El elemento encontrado o undefined.
  */
  findAuthorByName(name) {
    // traemos la lista de objetos con el metodo getAuthors()
    const authors = this.getAuthors();
    // empleamos el metodo toLowerCase() para manejar la sensibilidad a mayúsculas
    return authors.find(author => author.name.toLowerCase() === name.toLowerCase());
  },

  /**
  * Actualiza un autor existente por su ID.
  * @param {string|number} id El ID del elemento a actualizar, puede ser string o número
  * @param {object} updatedItem Los datos a aplicar al elemento.
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
  * @param {string|number} id El ID del elemento a eliminar.
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

// Extendemos el objeto base con métodos específicos si son necesarios
//const AuthorsModel = {
//...AuthorsBaseModel, // Copiamos todos los métodos del modelo base

// Añadimos/Sobreescribimos métodos específicos para autores
//findAuthorByName(name) {
// Reutilizamos el findBy genérico
//return this.findBy('name', name);
//},

// Si un autor tiene una propiedad 'alias'
// findAuthorByAlias(alias) {
//     const authors = this.getAll();
//     return authors.find(author => author.alias && author.alias.toLowerCase() === alias.toLowerCase());
// }
// };

// export { AuthorsModel };