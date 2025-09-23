import net from 'net';
import { AuthorsController } from './src/controllers/authorsController.js';
import { BooksController } from './src/controllers/booksController.js';
import { PublishersController } from './src/controllers/publishersController.js';
import { ResponseFormatter } from './src/views/responseFormatter.js';

const PORT = 8080;

const server = net.createServer((socket) => {
  const clientIdentifier = `[${socket.remoteAddress}:${socket.remotePort}]`;
  console.log(`Cliente conectado: ${clientIdentifier}`);
  socket.write('¡Bienvenido! Escribe "ayuda" para ver la lista de comandos.\n');

  socket.on('data', (data) => {
    const message = data.toString().trim();
    console.log(`${clientIdentifier} Comando recibido: "${message}"`);

    const [command, category, param1, ...jsonDataParts] = message.split(' ');
    const jsonDataString = jsonDataParts.join(' ');

    let response = '';

    try {
      switch (command) {
        case 'listar':
          if (category === 'autores') response = AuthorsController.getAllAuthors();
          else if (category === 'libros') response = BooksController.getAllBooks();
          else if (category === 'editoriales') response = PublishersController.getAllPublishers();
          else response = ResponseFormatter.formatError(`Categoría no válida para listar: "${category}".`);
          break;

        case 'buscar':
          const searchTerm = message.split(' ').slice(2).join(' ');
          if (!searchTerm) response = ResponseFormatter.formatError('Falta un término de búsqueda.');
          else if (category === 'autor') response = AuthorsController.getAuthorsByName(searchTerm);
          else if (category === 'libro') response = BooksController.getBooksByTitle(searchTerm);
          else if (category === 'editorial') response = PublishersController.getPublishersByName(searchTerm);
          else response = ResponseFormatter.formatError(`Categoría no válida para buscar: "${category}".`);
          break;

        case 'ver':
          if (!param1) response = ResponseFormatter.formatError('Falta el ID del elemento a ver.');
          else if (category === 'autor') response = AuthorsController.getAuthorById(param1);
          else if (category === 'libro') response = BooksController.getBookById(param1);
          else if (category === 'editorial') response = PublishersController.getPublisherById(param1);
          else response = ResponseFormatter.formatError(`Categoría no válida para ver: "${category}".`);
          break;

        case 'agregar':
          if (!jsonDataString) {
            response = ResponseFormatter.formatError('Faltan los datos en formato JSON para agregar.');
            break;
          }
          try {
            const itemData = JSON.parse(jsonDataString);
            if (category === 'autor') response = AuthorsController.addAuthor(itemData);
            else if (category === 'libro') response = BooksController.addBook(itemData);
            else if (category === 'editorial') response = PublishersController.addPublisher(itemData);
            else response = ResponseFormatter.formatError(`Categoría no válida para agregar: "${category}".`);
          } catch (e) { response = ResponseFormatter.formatError('JSON inválido.'); }
          break;

        case 'eliminar':
          if (!param1) response = ResponseFormatter.formatError('Falta el ID del elemento a eliminar.');
          else if (category === 'autor') response = AuthorsController.deleteAuthor(param1);
          else if (category === 'libro') response = BooksController.deleteBook(param1);
          else if (category === 'editorial') response = PublishersController.deletePublisher(param1);
          else response = ResponseFormatter.formatError(`Categoría no válida para eliminar: "${category}".`);
          break;
        case 'ayuda':
          response = [
            'Comandos Disponibles:',
            '  listar <autores|libros|editoriales>',
            '  buscar <autor|libro|editorial> <nombre/título>',
            '  ver <autor|libro|editorial> <id>',
            '  agregar <autor|libro|editorial> {json}',
            '  editar <autor|libro|editorial> <id> {json}',
            '  eliminar <autor|libro|editorial> <id>',
            '  salir'
          ].join('\n');
          break;
        case 'salir':
          socket.end('¡Hasta luego!\n');
          return;

        default:
          response = ResponseFormatter.formatError(`Comando desconocido: "${command}". Escribe "ayuda".`);
          break;
      }
    } catch (e) {
      console.error("Error inesperado en el servidor:", e);
      response = ResponseFormatter.formatError("Ocurrió un error fatal en el servidor.");
    }

    socket.write(response + '\n');
  });

  socket.on('close', () => console.log(`Cliente desconectado: ${clientIdentifier}`));
  socket.on('error', (err) => console.error(`Error en socket ${clientIdentifier}: ${err.message}`));
});

server.listen(PORT, () => console.log(`Servidor TCP escuchando en el puerto ${PORT}`));