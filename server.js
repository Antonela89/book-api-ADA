// Este es el archivo principal del SERVIDOR. Su trabajo es escuchar las conexiones de los clientes
//  No contiene lógica de negocio, solo dirige las peticiones al controlador adecuado.

//  importaciones
import net from 'net';
import { AuthorsController } from './src/controllers/authorsController.js';
import { BooksController } from './src/controllers/booksController.js';
import { PublishersController } from './src/controllers/publishersController.js';
import { ResponseFormatter } from './src/views/responseFormatter.js';

// configuraciones
const PORT = 8080;

// net.createServer() crea el servidor. La función que le pasamos se ejecutará CADA VEZ que un nuevo cliente se conecte.
// 'socket' es el objeto que representa la conexión única y directa con UN cliente.f
const server = net.createServer((socket) => {
  const clientIdentifier = `[${socket.remoteAddress}:${socket.remotePort}]`;
  console.log(`Cliente conectado: ${clientIdentifier}`);
  socket.write('¡Bienvenido a la Biblioteca Virtual!\n');

  // manejo de eventos
  // El evento 'data' se dispara cada vez que el cliente envía un mensaje.
  socket.on('data', (data) => {
    const message = data.toString().trim();
    console.log(`${clientIdentifier} Comando recibido: "${message}"`);

    // --- LÓGICA DE PARSEO DE COMANDOS ---
    // Esta es la parte más compleja: separamos el comando del JSON.
    const firstBraceIndex = message.indexOf('{');
    let commandPart;
    let jsonDataString = null; // Inicia como null

    if (firstBraceIndex === -1) {
      // Si no hay '{', todo el mensaje es la parte del comando
      commandPart = message;
    } else {
      // Si hay '{',  dividimos el mensaje en dos partes.
      commandPart = message.substring(0, firstBraceIndex).trim();
      jsonDataString = message.substring(firstBraceIndex);
    }

    const [command, category, param1] = commandPart.split(' ');

    let response = '';

    try {
      // El 'switch' actúa como el enrutador principal de nuestra API.
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

        case 'editar':
          if (!param1) {
            response = ResponseFormatter.formatError('Falta el ID del elemento a editar.');
            break;
          }
          if (!jsonDataString) {
            response = ResponseFormatter.formatError('Faltan los datos JSON para editar.');
            break;
          }
          try {
            const itemData = JSON.parse(jsonDataString);
            if (category === 'autor') response = AuthorsController.updateAuthor(param1, itemData);
            else if (category === 'libro') response = BooksController.updateBook(param1, itemData);
            else if (category === 'editorial') response = PublishersController.updatePublisher(param1, itemData);
            else response = ResponseFormatter.formatError(`Categoría no válida para editar: "${category}".`);
          } catch (e) {
            response = ResponseFormatter.formatError('JSON inválido.');
          }
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
            '\n--- Menú de Ayuda ---',
            'Puedes usar el menú interactivo para realizar las siguientes acciones:',
            '', 
            '  1. LISTAR:',
            '     Muestra una lista completa de todos los autores, libros o editoriales.',
            '',
            '  2. BUSCAR:',
            '     Busca ítems por su nombre o título. Es útil para encontrar el ID de un ítem específico.',
            '',
            '  3. VER POR ID:',
            '     Muestra los detalles completos de un ítem si conoces su ID.',
            '',
            '  4. AGREGAR:',
            '     Te guía para añadir un nuevo autor, libro o editorial a la base de datos.',
            '',
            '  5. EDITAR:',
            '     Te permite modificar los datos de un autor, libro o editorial existente. Primero te pedirá buscarlo para obtener su ID.',
            '',
            '  6. ELIMINAR:',
            '     Elimina un autor, libro o editorial de la base de datos. También te pedirá buscarlo primero para obtener su ID.',
            '',
            '  0. SALIR:',
            '     Cierra la conexión con el servidor de forma segura.'
          ].join('\n');
          break;
        case 'salir':
          socket.end('¡Hasta luego!\n'); // cierra la conexión
          return;

        default:
          response = ResponseFormatter.formatError(`Comando desconocido: "${command}". Escribe "ayuda".`);
          break;
      }
    } catch (error) {
      console.error("Error inesperado en el servidor:", error);
      response = ResponseFormatter.formatError("Ocurrió un error fatal en el servidor.");
    }

    // Enviamos la respuesta (preparada por el controlador) de vuelta al cliente.
    socket.write(response + '\n');
  });

  // El evento 'close' se dispara cuando la conexión con este cliente se cierra.
  socket.on('close', () => console.log(`Cliente desconectado: ${clientIdentifier}`));
  // El evento 'error' se dispara si hay un problema con la conexión de este cliente.
  socket.on('error', (err) => console.error(`Error en socket ${clientIdentifier}: ${err.message}`));
});

// Ponemos al servidor a escuchar en el puerto definido.
server.listen(PORT, () => console.log(`Servidor TCP escuchando en el puerto ${PORT}`));