// Este archivo es el "Controlador" de Editoriales. Al igual que el de autores, es un intermediario que conecta las peticiones con el Modelo de Editoriales y la Vista.

import { PublishersModel } from '../models/publishersModel.js'; // Importación de objeto model
import { ResponseFormatter } from '../views/responseFormatter.js'; // importacion de objeto views

//// Creamos el objeto para agrupar todas los métodos relacionadas con editoriales.
const PublishersController = {
  /**
   * Obtiene todos las editoriales y devuelve la respuesta formateada.
   * @returns {string} La respuesta formateada como un string.
   */
  getAllPublishers() {
    try {
      const publishers = PublishersModel.getPublishers();
      return ResponseFormatter.formatSuccess('Lista de editoriales obtenida.', publishers);
    } catch (error) {
      console.error('Error en getPublishers:', error);
      return ResponseFormatter.formatError('No se pudo obtener la lista de editoriales.');
    }
  },

  /**
   * Obtiene una lista de editoriales por su nombre y devuelve la respuesta formateada.
   * @param {string} name El nombre del editorial a buscar.
   * @returns {string} La respuesta formateada.
   */
  getPublishersByName(name) {
    try {
      const publishers = PublishersModel.findPublishersByName(name);
      if (publishers.length > 0) {
        return ResponseFormatter.formatSuccess(`Se encontraron ${publishers.length} editoriales con el nombre "${name}".`, publishers);
      } else {
        return ResponseFormatter.formatError(`No se encontró ninguna editorial con el nombre "${name}".`);
      }
    } catch (error) {
      console.error('Error en getPublishersByName:', error);
      return ResponseFormatter.formatError('Error al buscar editoriales.');
    }
  },

   /**
   * Obtiene una única editorial por su ID.
   * @param {string} id - El ID de la editorial a buscar.
   * @returns {string} Una cadena de texto con la respuesta.
   */
  getPublisherById(id) {
    try {
      const publisher = PublishersModel.getPublisherById(id);
      if (publisher) {
        return ResponseFormatter.formatSuccess(`Editorial con ID ${id} encontrada.`, publisher);
      } else {
        return ResponseFormatter.formatError(`No se encontró ninguna editorial con el ID ${id}.`);
      }
    } catch (error) {
      console.error('Error en getPublisherById:', error);
      return ResponseFormatter.formatError('Error al buscar la editorial.');
    }
  },

  /**
   * Añade una nueva editorial y devuelve la respuesta formateada.
   * @param {object} newPublisherData - Los datos de la nueva editorial.
   * @returns {string} La respuesta formateada como un string.
   */
  addPublisher(newPublisherData) {
    try {
      // 1. Acceso a los datos: Busca las claves en MAYÚSCULAS o minúsculas.
      const rawName = newPublisherData.NAME || newPublisherData.name;
      const rawCountry = newPublisherData.COUNTRY || newPublisherData.country;

      // 2. Validación de que existan los datos
      if (!rawName || !rawCountry) {
        return ResponseFormatter.formatError('Faltan datos obligatorios (name, country).');
      }
      
      // 3. Crear el objeto final con las claves en minúsculas (lo que el modelo espera).
      const publisherToSave = { 
          name: rawName.toLowerCase(), 
          country: rawCountry.toLowerCase() 
      };

      PublishersModel.addPublisher(publisherToSave);
      return ResponseFormatter.formatSuccess('Editorial añadida correctamente.', publisherToSave);
    } catch (error) {
      console.error('Error en addPublisher:', error);
      return ResponseFormatter.formatError('Ocurrió un error al añadir la editorial.');
    }
  },

  /**
   * Actualiza un editorial existente.
   * @param {string} id El id del editorial a actualizar.
   * @param {object} updatedPublisher Los nuevos datos para el editorial.
   * @returns {string} La respuesta formateada.
   */
  updatePublisher(id, updatedPublisher) {
    try {
      const success = PublishersModel.updatePublisher(id, updatedPublisher);
      if (success) {
        return ResponseFormatter.formatSuccess(`Editorial con ID ${id} actualizada correctamente.`);
      } else {
        return ResponseFormatter.formatError(`No se encontró ninguna editorial con el ID ${id} para actualizar.`);
      }
    } catch (error) {
      console.error('Error en updatePublisher:', error);
      return ResponseFormatter.formatError('Error al actualizar la editorial.');
    }
  },

    /**
     * Elimina un editorial por su id.
     * @param {string} id El id del editorial a eliminar.
     * @returns {string} La respuesta formateada.
     */
     deletePublisher(id) {
    try {
      const success = PublishersModel.deletePublisher(id);
      if (success) {
        return ResponseFormatter.formatSuccess(`Editorial con ID ${id} eliminada correctamente.`);
      } else {
        return ResponseFormatter.formatError(`No se encontró ninguna editorial con el ID ${id} para eliminar.`);
      }
    } catch (error) {
      console.error('Error en deletePublisher:', error);
      return ResponseFormatter.formatError('Error al eliminar la editorial.');
    }
  }
};

// exportación
export { PublishersController };
