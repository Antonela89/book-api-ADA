// Este archivo es una fábrica de modelos. Es una función que construye un objeto Modelo genérico para cualquier archivo JSON que le pasemos, proporcionando toda la funcionalidad CRUD.

// importacion de archivos y modulos necesarios
import { getFilePath, readJsonFile, writeJsonFile } from '../utils/utils.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Función de fábrica para crear objetos de modelo de datos genéricos.
 * Proporciona métodos CRUD básicos para interactuar con archivos JSON.
 * @param {string} filename El nombre del archivo JSON (ej. 'authors.json').
 * @returns {object} Un objeto de modelo con métodos para gestionar datos.
 */
function createDataModel(filename) {
    // Verificación de ingreso de ruta del modelo
    if (!filename) {
        throw new Error('Se requiere un nombre de archivo para crear un DataModel.');
    }

    // Obtenemos la ruta completa al archivo de datos usando la utilidad getFilePath.
    const filePath = getFilePath(filename);

    // Definimos el objeto 'Model' que contendrá todos los métodos de acceso a datos.
    const Model = {
        /**
         * Obtiene todos los elementos del archivo JSON.
         * @returns {Array} Los elementos del archivo.
         */
        getAll() {
            // lectura del archivo json 
            return readJsonFile(filePath);
        },

        /**
         * Añade un nuevo elemento al archivo JSON,  asignándole un UUID si no tiene ID.
         * @param {object} item El elemento a añadir.
         */
        add(item) {
            // Obtenemos todos los items existentes.
            const items = this.getAll(); // Usamos 'this' para llamar a getAll del propio objeto
            // Si el item recibido no tiene un ID, le asignamos uno nuevo con uuidv4.
            if (!item.id) {
                item.id = uuidv4();
            }
            // agregamos el item a la lista
            items.push(item);
            // escribimos la nueva lista en el archivo json
            writeJsonFile(filePath, items);
        },

        /** Busca un único elemento por su ID.
         * @param {string|number} id El ID del elemento a buscar.
         * @return {object} elemento segun id.
         */
        findById(id) {
            const items = this.getAll();
            // Usamos .find() para devolver el primer elemento cuyo ID coincida.
            return items.find(item => item.id === id);
        },

        /**
         * Busca TODOS los elementos que coincidan PARCIALMENTE con una propiedad y valor.
         * @param {string} property La propiedad por la cual buscar (ej. 'name', 'id').
         * @param {string} value El valor a buscar.
         * @returns  {Array<object>} Un array con todos los elementos encontrados. 
         */
        findAllBy(property, value) {
            // traemos la lista de objetos con el metodo getAll()
            const items = this.getAll();
            // Evaluamos si el valor ingresado es un string 
            if (typeof value === 'string') {
                // si es string, empleamos el metodo toLowerCase() para manejar la sensibilidad a mayúsculas
                // usamos includes para manejar la busqueda parcial
                return items.filter(item => item[property] && item[property].toLowerCase().includes(value.toLowerCase()));;
            }
            // si no es string, trabajamos normalmente
            // usamos === para busqueda estricta 
            return items.filter(item => item[property] === value);
        },

        /**
         * Actualiza un elemento existente por su ID.
         * @param {string|number} id El ID del elemento a actualizar, puede ser string o número
         * @param {object} updatedItem - Un objeto con los campos y nuevos valores a actualizar.
         * @returns {boolean} True si se actualizó, false si no se encontró.
         */
        update(id, updatedItem) {
            // traemos la lista de objetos con el metodo getAll()
            const items = this.getAll();
            // buscamos el index del elemento a editar segun el parametro que ingresamos para filtrar
            // findIndex devuelve -1 si no lo encuentra.
            const index = items.findIndex(item => item.id === id);
            // No encontrado
            if (index === -1) {
                // retornamos un booleano para manejar la respuesta al usuario -> aviso de no encotrado
                return false;
            }
            // Fusionamos los datos
            // si el objeto es encontrado cambiamos los datos respectivos
            // Usamos el spread operator para fusionar el objeto existente con los datos nuevos.
            items[index] = { ...items[index], ...updatedItem };
            // reescribimos el archivo json
            writeJsonFile(filePath, items);
            // retornamos un booleano para manejar la respuesta al usuario  -> aviso de edición exitosa
            return true;
        },

        /**
         * Elimina un elemento por su ID.
         * @param {string|number} id El ID del elemento a eliminar.
         * @returns {boolean} True si se eliminó, false si no se encontró.
         */
        delete(id) {
            // traemos la lista de objetos con el metodo getAll()
            let items = this.getAll();
            // verificamos la longitud de la lista (cantidad inicial de elementos)
            const initialLength = items.length;
            // creamos un nuevo array con los elementos que NO tienen el id a Eliminar
            items = items.filter(item => item.id !== id);
            // corroboramos la longitud del nuevo array con la longitud del array inicial
            // si es igual, no se encontró el elemento a eliminar
            if (items.length === initialLength) {
                return false; // No encontrado
            }

            // si la longitud entre los array es distinta procedemos a reescribir el archivo con la nueva lista
            writeJsonFile(filePath, items);
            return true; // Encontrado
        }
    };

    // La función devuelve el objeto Modelo configurado para el archivo especificado.
    return Model;
}

// Exportamos la función de fábrica para ser utilizada por otros módulos.
export { createDataModel };