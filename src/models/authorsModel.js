import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construye la ruta al archivo de autores de forma absoluta y segura
const authorsFilePath = path.join(__dirname, '..', 'data', 'authors.json');

// Función para obtener todos los autores
function getAuthors() {
  try {
    const data = fs.readFileSync(authorsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo de autores:', error);
    return [];
  }
}

// Función para añadir un nuevo autor
function addAuthor(author) {
  const authors = getAuthors();
  authors.push(author);
  fs.writeFileSync(authorsFilePath, JSON.stringify(authors, null, 2), 'utf8');
}

// Función para encontrar un autor por su nombre
function findAuthorByName(name) {
  const authors = getAuthors();
  return authors.find(author => author.name.toLowerCase() === name.toLowerCase());
}

export {
  getAuthors,
  addAuthor,
  findAuthorByName
};