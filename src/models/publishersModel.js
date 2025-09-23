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

  // Función para obtener todas las editoriales
  getPublishers() {
    try {
      const data = fs.readFileSync(publishersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al leer el archivo de editoriales:', error);
      return [];
    }
  },

  // Función para añadir una nueva editorial
  addPublisher(publisher) {
    const publishers = this.getPublishers();
    publishers.push(publisher);
    fs.writeFileSync(publishersFilePath, JSON.stringify(publishers, null, 2), 'utf8');
  },

  // Función para buscar editorial por nombre
  findPublisherByName(name) {
    const publishers = this.getPublishers();
    return publishers.find(publisher => publisher.name.toLowerCase() === name.toLowerCase());
  },

  // Función para editar editorial
  updatePublisher() {

  }, 

  // Función para eliminar editorial
  deltePublisher() {

  }
}

// Exportar objeto
export {publishersModel}

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