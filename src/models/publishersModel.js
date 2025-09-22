import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construye la ruta al archivo de editoriales de forma absoluta y segura
const publishersFilePath = path.join(__dirname, '..', 'data', 'publishers.json');

// Función para obtener todas las editoriales
function getPublishers() {
  try {
    const data = fs.readFileSync(publishersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo de editoriales:', error);
    return [];
  }
}

// Función para añadir una nueva editorial
function addPublisher(publisher) {
  const publishers = getPublishers();
  publishers.push(publisher);
  fs.writeFileSync(publishersFilePath, JSON.stringify(publishers, null, 2), 'utf8');
}

function findPublisherByName(name) {
  const publishers = getPublishers();
  return publishers.find(publisher => publisher.name.toLowerCase() === name.toLowerCase());
}

export {
  getPublishers,
  addPublisher,
  findPublisherByName
};