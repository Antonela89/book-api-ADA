import * as authorsModel from '../models/authorsModel.js'; // Importación corregida con .js

function getAuthors() {
  return authorsModel.getAuthors();
}

function addAuthor(author) {
  authorsModel.addAuthor(author);
}

export {
  getAuthors,
  addAuthor
};