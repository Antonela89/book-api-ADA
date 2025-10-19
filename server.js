// Este es el archivo principal del SERVIDOR. Su trabajo es escuchar las conexiones de los clientes
// y actuar como un "enrutador" o "cartero". No contiene lógica de negocio, solo dirige
// las peticiones al controlador adecuado.

// --- IMPORTACIONES ---
import net from "net";
import { AuthorsController } from "./src/controllers/authorsController.js";
import { BooksController } from "./src/controllers/booksController.js";
import { PublishersController } from "./src/controllers/publishersController.js";
import { ResponseFormatter } from "./src/views/responseFormatter.js";

// --- CONFIGURACIÓN DEL SERVIDOR ---
const PORT = 8080;

const server = net.createServer((socket) => {
  const clientIdentifier = `[${socket.remoteAddress}:${socket.remotePort}]`;
  console.log(`Cliente conectado: ${clientIdentifier}`);
  socket.write("¡Bienvenido a la Biblioteca Virtual!\n");

  // --- MANEJO DE EVENTOS DEL SOCKET ---
  socket.on("data", (data) => {
    const message = data.toString().trim();
    console.log(`${clientIdentifier} Comando recibido: "${message}"`);

    // --- LÓGICA DE PARSEO DE COMANDOS v2 (Más Robusta) ---
    // Dividimos el mensaje usando ';;' como un separador explícito entre el comando y el JSON.
    const messageParts = message.split(';;');
    const commandPart = messageParts[0]; // La primera parte es siempre el comando.
    const jsonDataString = messageParts.length > 1 ? messageParts[1] : null; // La segunda, si existe, es el JSON.

    // Ahora, procesamos la parte del comando para obtener el método, categoría y parámetros.
    const commandTokens = commandPart.trim().split(" ");

    // Extraemos las partes y normalizamos a mayúsculas SOLO las que necesitamos.
    const method = (commandTokens[0] || '').toUpperCase();
    const category = (commandTokens[1] || '').toUpperCase();
    
    // El resto de los parámetros (ID, término de búsqueda) se unen.
    // Esto maneja correctamente IDs y términos de búsqueda multi-palabra.
    const param1 = commandTokens.slice(2).join(" ");

    let response = "";

    try {
      switch (method) {
        case "GET":
          if (!category) { response = ResponseFormatter.formatError("Comando GET requiere una categoría."); break; }
          
          if (param1) {
            if (category === "AUTHOR") response = AuthorsController.getAuthorById(param1);
            else if (category === "BOOK") response = BooksController.getBookById(param1);
            else if (category === "PUBLISHER") response = PublishersController.getPublisherById(param1);
            else response = ResponseFormatter.formatError(`Categoría no válida para GET by ID: "${category}".`);
          } else {
            if (category === "AUTHORS") response = AuthorsController.getAllAuthors();
            else if (category === "BOOKS") response = BooksController.getAllBooks();
            else if (category === "PUBLISHERS") response = PublishersController.getAllPublishers();
            else response = ResponseFormatter.formatError(`Categoría no válida para GET: "${category}".`);
          }
          break;

        case "SEARCH":
          if (!param1) response = ResponseFormatter.formatError("Falta un término para SEARCH.");
          else if (category === "AUTHOR") response = AuthorsController.getAuthorsByName(param1);
          else if (category === "BOOK") response = BooksController.getBooksByTitle(param1);
          else if (category === "PUBLISHER") response = PublishersController.getPublishersByName(param1);
          else response = ResponseFormatter.formatError(`Categoría no válida para SEARCH: "${category}".`);
          break;

        case "POST":
          if (!jsonDataString) response = ResponseFormatter.formatError("Faltan datos JSON para POST.");
          else try {
            const itemData = JSON.parse(jsonDataString);
            if (category === "AUTHOR") response = AuthorsController.addAuthor(itemData);
            else if (category === "BOOK") response = BooksController.addBook(itemData);
            else if (category === "PUBLISHER") response = PublishersController.addPublisher(itemData);
            else response = ResponseFormatter.formatError(`Categoría no válida para POST: "${category}".`);
          } catch (e) { response = ResponseFormatter.formatError("JSON inválido."); }
          break;

        case "PUT":
          if (!param1) response = ResponseFormatter.formatError("Falta el ID para PUT.");
          else if (!jsonDataString) response = ResponseFormatter.formatError("Faltan datos JSON para PUT.");
          else try {
            const itemData = JSON.parse(jsonDataString);
            // Nota: El ID para PUT (param1) se extrae de la parte del comando, no del JSON.
            if (category === "AUTHOR") response = AuthorsController.updateAuthor(param1, itemData);
            else if (category === "BOOK") response = BooksController.updateBook(param1, itemData);
            else if (category === "PUBLISHER") response = PublishersController.updatePublisher(param1, itemData);
            else response = ResponseFormatter.formatError(`Categoría no válida para PUT: "${category}".`);
          } catch (e) { response = ResponseFormatter.formatError("JSON inválido."); }
          break;

        case "DELETE":
          if (!param1) { response = ResponseFormatter.formatError("Falta el ID para DELETE."); break; }
          if (category === "AUTHOR") response = AuthorsController.deleteAuthor(param1);
          else if (category === "BOOK") response = BooksController.deleteBook(param1);
          else if (category === "PUBLISHER") response = PublishersController.deletePublisher(param1);
          else response = ResponseFormatter.formatError(`Categoría no válida para DELETE: "${category}".`);
          break;

        case "HELP":
          response = [
            '\n--- Menú de Ayuda ---',
            'Puedes usar el menú interactivo para realizar las siguientes acciones:',
            '',
            '  1. LISTAR:',
            '     Muestra una lista completa de todos los autores, libros o editoriales.',
            '  2. BUSCAR:',
            '     Busca ítems por su nombre o título.',
            '  3. VER POR ID:',
            '     Muestra los detalles completos de un ítem si conoces su ID.',
            '  4. AGREGAR:',
            '     Te guía para añadir un nuevo autor, libro o editorial.',
            '  5. EDITAR:',
            '     Te permite modificar los datos de un ítem existente.',
            '  6. ELIMINAR:',
            '     Elimina un ítem de la base de datos.',
            '  0. SALIR:',
            '     Cierra la conexión con el servidor.'
          ].join('\n');
          break;

        case "EXIT":
          socket.end("¡Hasta luego!\n");
          return;
          
        default:
          response = ResponseFormatter.formatError(`Comando desconocido: "${method}". Escribe "HELP".`);
          break;
      }
    } catch (error) {
      console.error("Error inesperado en el servidor:", error);
      response = ResponseFormatter.formatError("Ocurrió un error fatal en el servidor.");
    }

    socket.write(response + "\n");
  });

  socket.on("close", () => console.log(`Cliente desconectado: ${clientIdentifier}`));
  socket.on("error", (err) => console.error(`Error en socket ${clientIdentifier}: ${err.message}`));
});

server.listen(PORT, () => console.log(`Servidor TCP escuchando en el puerto ${PORT}`));