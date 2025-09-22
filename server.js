// Importamos los módulos y controladores necesarios
import net from 'net';
import { v4 as uuidv4 } from 'uuid';

// Importamos los controladores
import * as booksController from './src/controllers/booksController.js';
import * as authorsController from './src/controllers/authorsController.js';
import * as publishersController from './src/controllers/publishersController.js';

// Importamos el formateador de respuestas
import * as responseFormatter from './src/views/responseFormatter.js';

// Creamos una instancia del servidor TCP
const server = net.createServer((socket) => {
  console.log('Cliente conectado.');

  socket.on('data', (data) => {
    // Limpiamos y normalizamos el mensaje para eliminar caracteres inesperados
    const fullMessage = data.toString().replace(/[^a-zA-Z0-9\s\{\}\[\]":,._-]/g, '').trim();

    // Dividimos el comando principal y el tipo de dato
    const parts = fullMessage.split(' ');
    const command = parts[0];
    const itemType = parts.length > 1 ? parts[1] : '';

    console.log(`Comando recibido: ${command} ${itemType}`);

    // Manejamos los comandos principales
    switch (command) {
      case 'GET':
        if (itemType === '') {
          socket.write(responseFormatter.formatError('Falta el subcomando para GET. Ej: GET BOOKS'));
          break;
        }
        switch (itemType) {
          case 'BOOKS':
            const books = booksController.getBooks();
            socket.write(responseFormatter.formatSuccess('Lista de libros obtenida.', books));
            break;
          case 'AUTHORS':
            const authors = authorsController.getAuthors();
            socket.write(responseFormatter.formatSuccess('Lista de autores obtenida.', authors));
            break;
          case 'PUBLISHERS':
            const publishers = publishersController.getPublishers();
            socket.write(responseFormatter.formatSuccess('Lista de editoriales obtenida.', publishers));
            break;
          default:
            socket.write(responseFormatter.formatError('Comando GET no válido.'));
            break;
        }
        break;

      case 'ADD':
        // Encontramos el inicio del objeto JSON
        const jsonStartIndex = fullMessage.indexOf('{');
        if (jsonStartIndex === -1) {
          socket.write(responseFormatter.formatError('Faltan datos para el comando ADD. Ej: ADD BOOK {"title":"Mi Libro"}'));
          break;
        }

        const dataString = fullMessage.substring(jsonStartIndex);
        
        try {
          const itemData = JSON.parse(dataString);
          itemData.id = uuidv4();

          switch (itemType) {
            case 'BOOK':
                if (!itemData.title || !itemData.authorName || !itemData.publisherName) {
                    socket.write(responseFormatter.formatError('Faltan campos obligatorios para el libro (title, authorName, publisherName).'));
                    break;
                }
                const result = booksController.addBook(itemData);
                if (result.success) {
                    socket.write(responseFormatter.formatSuccess(result.message, result.data));
                } else {
                    socket.write(responseFormatter.formatError(result.message));
                }
                break;
            case 'AUTHOR':
              authorsController.addAuthor(itemData);
              socket.write(responseFormatter.formatSuccess('Autor añadido con éxito.', itemData));
              break;
            case 'PUBLISHER':
              publishersController.addPublisher(itemData);
              socket.write(responseFormatter.formatSuccess('Editorial añadida con éxito.', itemData));
              break;
            default:
              socket.write(responseFormatter.formatError('Comando ADD no válido.'));
              break;
          }
        } catch (e) {
          console.error('Error al parsear JSON:', e);
          socket.write(responseFormatter.formatError('Datos no válidos. Deben ser un objeto JSON.'));
        }
        break;
      default:
        socket.write(responseFormatter.formatError('Comando no reconocido.'));
        break;
    }
  });

  socket.on('end', () => {
    console.log('Cliente desconectado.');
  });

  socket.on('error', (err) => {
    console.error(`Error de conexión: ${err.message}`);
  });
});

const PORT = 8080;

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});