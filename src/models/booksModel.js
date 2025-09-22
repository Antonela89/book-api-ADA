import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construye la ruta al archivo de libros de forma absoluta
const booksFilePath = path.join(__dirname, '..', 'data', 'books.json');

// Función para obtener todos los libros
function getBooks() {
  try {
    const data = fs.readFileSync(booksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo de libros:', error);
    return [];
  }
}

// Función para añadir un nuevo libro
function addBook(book) {
  const books = getBooks();
  books.push(book);
  fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2), 'utf8');
}

export {
  getBooks,
  addBook
};