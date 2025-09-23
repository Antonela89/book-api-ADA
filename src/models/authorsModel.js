// importacion de modulos necesarios
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtiene la ruta del archivo actual y su directorio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construye la ruta al archivo de autores de forma absoluta y segura
const authorsFilePath = path.join(__dirname, '..', 'data', 'authors.json');

// creación del objeto AuthorsModel para encapsular metodos 
const AuthorsModel = {

  // Función para obtener todos los autores
  getAuthors() {
    try {
      const data = fs.readFileSync(authorsFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al leer el archivo de autores:', error);
      return [];
    }
  },

  // Función para añadir un nuevo autor
  addAuthor(author) {
    const authors = this.getAuthors();
    authors.push(author);
    fs.writeFileSync(authorsFilePath, JSON.stringify(authors, null, 2), 'utf8');
  },

  // Función para encontrar un autor por su nombre
  findAuthorByName(name) {
    const authors = this.getAuthors();
    return authors.find(author => author.name.toLowerCase() === name.toLowerCase());
  },

  // Función para editar un autor
  updateAuthor() {

  },

  // Función para eliminar un autor
  deleteAuthor() {

  }
}

// exportar el objeto
export {AuthorsModel}

// -----------------------------------------------------------------------------------
// Opcion usando el archivo utils.js y el archivo createDataModel.js
// -----------------------------------------------------------------------------------

// import { createDataModel } from './createDataModel.js'; 

// Creamos un modelo de datos genérico para 'authors.json'
// const AuthorsBaseModel = createDataModel('authors.json');

// Extendemos el objeto base con métodos específicos si son necesarios
//const AuthorsModel = {
    //...AuthorsBaseModel, // Copiamos todos los métodos del modelo base

    // Añadimos/Sobreescribimos métodos específicos para autores
    //findAuthorByName(name) {
        // Reutilizamos el findBy genérico
        //return this.findBy('name', name);
    //},

    // Si un autor tiene una propiedad 'alias'
    // findAuthorByAlias(alias) {
    //     const authors = this.getAll();
    //     return authors.find(author => author.alias && author.alias.toLowerCase() === alias.toLowerCase());
    // }
// };

// export { AuthorsModel };