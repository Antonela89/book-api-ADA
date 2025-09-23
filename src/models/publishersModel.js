import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construye la ruta al archivo de editoriales de forma absoluta y segura
const publishersFilePath = path.join(__dirname, '..', 'data', 'publishers.json');

// Creación de objeto para encapsular los métodos
const publishersModel = {

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
  * @param {object} item El elemento a añadir.
  */
  addPublisher(publisher) {
    // traemos la lista de objetos con el metodo getPublishers()
    const publishers = this.getPublishers();
    // agregamos el item a la lista
    publishers.push(publisher);
    // escribimos la nueva lista en el archivo json
    fs.writeFileSync(publishersFilePath, JSON.stringify(publishers, null, 2), 'utf8');
  },

  /**
  * Busca una editorial por nombre.
  * @param {any} name El valor a buscar.
  * @returns {object|undefined} El elemento encontrado o undefined.
  */
  findPublisherByName(name) {
    // traemos la lista de objetos con el metodo getPublishers()
    const publishers = this.getPublishers();
    // empleamos el metodo toLowerCase() para manejar la sensibilidad a mayúsculas
    return publishers.find(publisher => publisher.name.toLowerCase() === name.toLowerCase());
  },

  /**
  * Actualiza una editorial existente por su ID.
  * @param {string|number} id El ID del elemento a actualizar, puede ser string o número
  * @param {object} updatedItem Los datos a aplicar al elemento.
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
  * @param {string|number} id El ID del elemento a eliminar.
  * @returns {boolean} True si se eliminó, false si no se encontró.
  */
  deltePublisher(id) {
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
export { publishersModel }

// -----------------------------------------------------------------------------------
// Opcion usando el archivo utils.js y el archivo createDataModel.js
// -----------------------------------------------------------------------------------
// import { createDataModel } from './createDataModel.js';

// const PublishersBaseModel = createDataModel('publishers.json');

// const PublishersModel = {
//     ...PublishersBaseModel,

//     findPublisherByName(name) {
//         return this.findBy('name', name);
//     }
// };

// export { PublishersModel };