// Este archivo es el "Controlador" de Editoriales. Actúa como intermediario entre las peticiones, el Modelo y la Vista.

import { PublishersModel } from '../models/publishersModel.js';
import { ResponseFormatter } from '../views/responseFormatter.js';

const PublishersController = {
  getAllPublishers() {
    try {
      const publishers = PublishersModel.getPublishers();
      return ResponseFormatter.formatSuccess('Lista de editoriales obtenida.', publishers);
    } catch (error) {
      console.error('Error en getAllPublishers:', error);
      return ResponseFormatter.formatError('No se pudo obtener la lista de editoriales.');
    }
  },

  getPublishersByName(name) {
    try {
      const publishers = PublishersModel.findPublishersByName(name.toLowerCase());
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

  getPublisherById(id) {
    try {
      const publisher = PublishersModel.getPublishers().find(p => p.id.toLowerCase() === id.toLowerCase());
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

  addPublisher(newPublisherData) {
    try {
      const rawName = newPublisherData.NAME || newPublisherData.name;
      const rawCountry = newPublisherData.COUNTRY || newPublisherData.country;

      if (!rawName || !rawCountry) {
        return ResponseFormatter.formatError('Faltan datos obligatorios (name, country).');
      }

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

export { PublishersController };
