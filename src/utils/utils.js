// Contiene funciones genéricas auxiliares para manejar archivos, así no tenemos que repetir el mismo código en los modelos de autores, libros y editoriales. Es el principio DRY (Don't Repeat Yourself).

// importación de modulos
import fs from 'fs';  // leer y escribir archivos en la computadora
import path from 'path'; // construir rutas a archivos de una manera segura, que funciona igual en Windows, Mac o Linux.
import { fileURLToPath } from 'url'; // obtener la ruta del archivo actual cuando usamos ES Modules (import/export).

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
// A partir de la ruta del archivo, obtenemos la ruta del directorio que lo contiene
const __dirname = path.dirname(__filename);

/**
 * Construye una ruta absoluta a un archivo de datos.
 * @param {string} filename El nombre del archivo (ej. 'authors.json').
 * @returns {string} La ruta absoluta al archivo.
 */
function getFilePath(filename) {
    return path.join(__dirname, '..', '..', 'data', filename);
}


// --- FUNCIONES REUTILIZABLES ---
/**
 * Lee un archivo JSON de forma síncrona.
 * @param {string} filePath La ruta absoluta al archivo.
 * @returns {Array} El contenido JSON parsedo o un array vacío si hay un error o el archivo no existe.
 */
function readJsonFile(filePath) {
    // Usamos 'try...catch' para 'atrapar' errores
    try {
        // fs.readFileSync() lee el archivo de forma síncrona (el programa espera a que termine de leer). y 'utf8' es la codificación
        const data = fs.readFileSync(filePath, 'utf8');
        // JSON.parse() convierte el texto del archivo en un objeto literal js
        return JSON.parse(data);
    } catch (error) {
        // Si el error es 'ENOENT' (Error NO ENTry), significa que el archivo no existe y lo tratamos como un array vacío
        if (error.code === 'ENOENT') {
            return [];
        }
        // Para cualquier otro error, lo mostramos en la consola del servidor para poder depurarlo.
        console.error(`Error al leer el archivo ${filePath}:`, error);
        return []; // Devolver array vacío en caso de error, esto evita que el programa se rompa
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
        // fs.writeFileSync() escribe en el archivo de forma síncrona. Si el archivo ya existe, lo sobrescribe.
        // JSON.stringify() convierte nuestro array de objetos de JavaScript de vuelta a un string de texto.
        // Los parámetros 'null, 2' son para formatear el archivo de forma legible, con 2 espacios de indentación.
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
         // Si hay un error al escribir lo mostramos en la consola.
        console.error(`Error al escribir en el archivo ${filePath}:`, error);
    }
}

// Hacemos que nuestras funciones estén disponibles para otros archivos del proyecto.
export { getFilePath, readJsonFile, writeJsonFile };