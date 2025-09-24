import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construye la ruta al archivo de editoriales de forma absoluta y segura
const publishersFilePath = path.join(__dirname, '..', 'data', 'publishers.json');

// Creación de objeto para encapsular los métodos
const PublishersModel = {

  /**
  * Obtiene todos las editoriales del archivo JSON.
  * @returns {Array} Los elementos del archivo.
  */
  getPublishers() {
    try {
      // lectura del archivo json con modulo fs
      const data = fs.readFileSync(publishersFilePath, 'utf8');
      // parse de informaciòn obtenida
      return JSON.parse(data);
      // manejo de error
    } catch (error) {
      console.error('Error al leer el archivo de editoriales:', error);
      return [];
    }
  },

  /**
  * Añade una nueva editorial al archivo JSON.
  * @param {object} publisher El elemento a añadir.
  */
  addPublisher(publisher) {
    // traemos la lista de objetos con el metodo getPublishers()
    const publishers = this.getPublishers();
    if (!publisher.id) {
      publisher.id = uuidv4();
    }
    // agregamos el item a la lista
    publishers.push(publisher);
    // escribimos la nueva lista en el archivo json
    fs.writeFileSync(publishersFilePath, JSON.stringify(publishers, null, 2), 'utf8');
  },

   /**Busca TODAS las editoriales que coincidan parcialmente con un nombre.
   * @param {string} name - El nombre a buscar.
   * @returns {Array<object>} Un array con las editoriales encontrados (puede estar vacío).
   */
  findPublishersByName(name) {
    const publishers = this.getPublishers();
    // Usamos .filter() para obtener todas las coincidencias
    // busqueda parcial -> includes()
    return publishers.filter(publisher => publisher.name.toLowerCase().includes(name.toLowerCase()));
  },

  /**
   * Busca un único editorial por su ID.
   * @param {string} id - El ID del editorial (UUID).
   * @returns {object|undefined} El editorial encontrado o undefined.
   */
  getPublisherById(id) {
    const publishers = this.getPublishers();
    return publishers.find(publisher => publisher.id === id);
  },
  /**
  * Actualiza una editorial existente por su ID.
  * @param {string} id El ID del elemento a actualizar.
  * @param {object} updatedPublisher Los datos a aplicar al elemento.
  * @returns {boolean} True si se actualizó, false si no se encontró.
  */
  updatePublisher(id, updatedPublisher) {
    // traemos la lista de objetos con el metodo getPublishers()
    let publishers = this.getPublishers();
    // buscamos el index del elemento a editar segun el parametro que ingresamos para filtrar
    const index = publishers.findIndex(publisher => publisher.id === id);
    // No encontrado
    if (index === -1) {
      // retornamos un booleano para manejar la respuesta al usuario -> aviso de no encotrado
      return false;
    }
    // Fusionamos los datos
    // si el objeto es encontrado cambiamos los datos respectivos
    publishers[index] = { ...publishers[index], ...updatedPublisher };
    // reescribimos el archivo json
    fs.writeFileSync(publishersFilePath, JSON.stringify(publishers, null, 2), 'utf8');
    // retornamos un booleano para manejar la respuesta al usuario  -> aviso de edición exitosa
    return true;
  },

  /**
  * Elimina una editorial por su ID.
  * @param {string} id El ID del elemento a eliminar.
  * @returns {boolean} True si se eliminó, false si no se encontró.
  */
  deletePublisher(id) {
    // traemos la lista de objetos con el metodo getPublishers()
    let publishers = this.getPublishers();
    // verificamos la longitud de la lista (cantidad inicial de elementos)
    const initialLength = publishers.length;
    // creamos un nuevo array con los elementos que NO tienen el id a Eliminar
    publishers = publishers.filter(publisher => publisher.id !== id);
    // corroboramos la longitud del nuevo array con la longitud del array inicial
    // si es igual, no se encontró el elemento a eliminar
    if (publishers.length === initialLength) {
      return false; // No encontrado
    }
    // si la longitud entre los array es distinta procedemos a reescribir el archivo con la nueva lista
    fs.writeFileSync(publishersFilePath, JSON.stringify(publishers, null, 2), 'utf8');
    return true; // Encontrado
  }
}

// Exportar objeto
export { PublishersModel }

// -----------------------------------------------------------------------------------
// Opcion usando el archivo utils.js y el archivo createDataModel.js
// -----------------------------------------------------------------------------------
// import { createDataModel } from './createDataModel.js';

// // Creamos un modelo de datos genérico para 'publishers.json'
// const PublishersBaseModel = createDataModel('publishers.json');

// // Extendemos el objeto base con alias para mayor claridad semántica
// const PublishersModel = {
//   ...PublishersBaseModel, // Copiamos todos los métodos genéricos

//   /**
//    * Obtiene todas las editoriales. Alias de getAll().
//    * @returns {Array} Un array con todas las editoriales.
//    */
//   getPublishers() {
//     return this.getAll();
//   },

//   /**
//    * Añade una nueva editorial. Alias de add().
//    * @param {object} publisherData - Los datos de la editorial a añadir.
//    */
//   addPublisher(publisherData) {
//     this.add(publisherData);
//   },

//   /**
//    * Busca todas las editoriales que coincidan con un nombre.
//    * @param {string} name - El nombre a buscar.
//    * @returns {Array<object>} Un array con las editoriales encontradas.
//    */
//   findPublishersByName(name) {
//     return this.findAllBy('name', name);
//   },

//   /**
//    * Busca una única editorial por su ID. Alias de findById().
//    * @param {string} id - El ID de la editorial.
//    * @returns {object|undefined} La editorial encontrada o undefined.
//    */
//   getPublisherById(id) {
//     return this.findById(id);
//   },

//   /**
//    * Actualiza una editorial por su ID. Alias de update().
//    * @param {string} id - El ID de la editorial a actualizar.
//    * @param {object} updatedData - Los datos a actualizar.
//    * @returns {boolean} True si se actualizó, false si no.
//    */
//   updatePublisher(id, updatedData) {
//     return this.update(id, updatedData);
//   },

//   /**
//    * Elimina una editorial por su ID. Alias de delete().
//    * @param {string} id - El ID de la editorial a eliminar.
//    * @returns {boolean} True si se eliminó, false si no.
//    */
//   deletePublisher(id) {
//     return this.delete(id);
//   }
// };

// export { PublishersModel };