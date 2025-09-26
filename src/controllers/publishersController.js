// Este archivo es el "Controlador" de Editoriales. Actúa como un intermediario,
// conectando las peticiones con el Modelo de Editoriales y la Vista.
// Implementa las reglas de negocio, como la prevención de duplicados y la restricción de eliminación.

import { PublishersModel } from '../models/publishersModel.js';
import { BooksModel } from '../models/booksModel.js';
import { ResponseFormatter } from '../views/responseFormatter.js';

// Creamos el objeto para agrupar todos los métodos relacionados con editoriales.
const PublishersController = {
  /**
   * Obtiene todas las editoriales.
   * @returns {string} La respuesta formateada.
   */
  getAllPublishers() {
    try {
      const publishers = PublishersModel.getPublishers();
      return ResponseFormatter.formatSuccess('Lista de editoriales obtenida.', publishers);
    } catch (error) {
      console.error('Error en getAllPublishers:', error);
      return ResponseFormatter.formatError('No se pudo obtener la lista de editoriales.');
    }
  },

  /**
   * Busca editoriales por nombre.
   * @param {string} name - El nombre de la editorial a buscar.
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
   * @returns {string} La respuesta formateada.
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
   * Añade una nueva editorial, validando datos y previniendo duplicados.
   * @param {object} newPublisherData - Los datos de la nueva editorial.
   * @returns {string} La respuesta formateada.
   */
  addPublisher(newPublisherData) {
    try {
      // Normalizamos los datos de entrada.
      const rawName = newPublisherData.NAME || newPublisherData.name;
      const rawCountry = newPublisherData.COUNTRY || newPublisherData.country;

      if (!rawName || !rawCountry) {
        return ResponseFormatter.formatError('Faltan datos obligatorios (name, country).');
      }

      // Creamos el objeto final con valores normalizados.
      const publisherToSave = {
        name: rawName.toLowerCase(),
        country: rawCountry.toLowerCase()
      };

      // Regla de negocio: verificamos si ya existe.
      const existingPublishers = PublishersModel.findPublishersByName(publisherToSave.name);
      if (existingPublishers.length > 0) {
        return ResponseFormatter.formatError(`Ya existe una editorial con el nombre "${publisherToSave.name}".`);
      }

      // Pasamos el objeto limpio al Modelo.
      PublishersModel.addPublisher(publisherToSave);
      return ResponseFormatter.formatSuccess('Editorial añadida correctamente.', publisherToSave);
    } catch (error) {
      console.error('Error en addPublisher:', error);
      return ResponseFormatter.formatError('Ocurrió un error al añadir la editorial.');
    }
  },

  /**
   * Actualiza una editorial existente por su ID.
   * @param {string} id - El ID de la editorial a actualizar.
   * @param {object} updatedPublisherData - Los nuevos datos para la editorial.
   * @returns {string} La respuesta formateada.
   */
  updatePublisher(id, updatedPublisherData) {
    try {
      // Filtramos y normalizamos los datos de entrada.
      const dataToUpdate = {};
      const rawName = updatedPublisherData.NAME || updatedPublisherData.name;
      if (rawName) dataToUpdate.name = rawName.toLowerCase();

      const rawCountry = updatedPublisherData.COUNTRY || updatedPublisherData.country;
      if (rawCountry) dataToUpdate.country = rawCountry.toLowerCase();

      // Regla de negocio: si no se pasaron datos válidos, devolvemos un error.
      if (Object.keys(dataToUpdate).length === 0) {
        return ResponseFormatter.formatError(`No se proporcionaron datos válidos (name, country) para actualizar.`);
      }

      // Le pasamos al Modelo el objeto 'dataToUpdate' con los datos ya filtrados.
      const success = PublishersModel.updatePublisher(id, dataToUpdate);
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
   * Elimina una editorial por su ID, solo si no tiene libros asociados.
   * @param {string} id - El ID de la editorial a eliminar.
   * @returns {string} La respuesta formateada.
   */
  deletePublisher(id) {
    try {
      // Primero, verificamos si la editorial existe.
      const publisherExists = PublishersModel.getPublisherById(id);
      if (!publisherExists) {
        return ResponseFormatter.formatError(`No se encontró ninguna editorial con el ID ${id} para eliminar.`);
      }
      
      // Regla de negocio: buscamos si existen libros asociados.
      const booksByPublisher = BooksModel.findBooksByPublisherId(id);

      // Si hay libros, aplicamos la restricción y no permitimos la eliminación.
      if (booksByPublisher.length > 0) {
        return ResponseFormatter.formatError(
          `No se puede eliminar la editorial "${publisherExists.name}" porque tiene ${booksByPublisher.length} libro(s) asociado(s).`
        );
      }
      
      // Si no hay libros, procedemos a eliminar.
      const success = PublishersModel.deletePublisher(id);
      if (success) {
        return ResponseFormatter.formatSuccess(`La editorial "${publisherExists.name}" (ID: ${id}) ha sido eliminada.`);
      } else {
        return ResponseFormatter.formatError(`No se encontró ninguna editorial con el ID ${id} para eliminar.`);
      }
    } catch (error) {
      console.error('Error inesperado en deletePublisher:', error);
      return ResponseFormatter.formatError('Ocurrió un error inesperado al intentar eliminar la editorial.');
    }
  }
};

// exportación
export { PublishersController };