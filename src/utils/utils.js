// importación de modulos
import fs from 'fs'; 
import path from 'path';
import { fileURLToPath } from 'url';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Construye una ruta absoluta a un archivo de datos.
 * @param {string} filename El nombre del archivo (ej. 'authors.json').
 * @returns {string} La ruta absoluta al archivo.
 */
function getFilePath(filename) {
    return path.join(__dirname, '..', 'data', filename);
}

/**
 * Lee un archivo JSON de forma síncrona.
 * @param {string} filePath La ruta absoluta al archivo.
 * @returns {Array} El contenido JSON parsedo o un array vacío si hay un error o el archivo no existe.
 */
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe, lo tratamos como un array vacío
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error(`Error al leer el archivo ${filePath}:`, error);
        return []; // Devolver array vacío en caso de error
    }
}

/**
 * Escribe datos en un archivo JSON de forma síncrona.
 * @param {string} filePath La ruta absoluta al archivo.
 * @param {Array} data Los datos a escribir (array de objetos).
 * @returns {void}
 */
function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error al escribir en el archivo ${filePath}:`, error);
    }
}

export { getFilePath, readJsonFile, writeJsonFile };