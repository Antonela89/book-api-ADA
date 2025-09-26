// Este es el archivo principal del SERVIDOR. Su trabajo es escuchar las conexiones de los clientes
// y actuar como un "enrutador" o "cartero". No contiene lógica de negocio, solo dirige
// las peticiones al controlador adecuado.

// --- IMPORTACIONES ---
// Módulo 'net' de Node.js, que nos permite crear servidores y clientes TCP.
import net from "net";
// Importamos todos nuestros controladores, que son los que contienen la lógica de negocio.
import { AuthorsController } from "./src/controllers/authorsController.js";
import { BooksController } from "./src/controllers/booksController.js";
import { PublishersController } from "./src/controllers/publishersController.js";
// Importamos nuestra vista para formatear respuestas de error de manera consistente.
import { ResponseFormatter } from "./src/views/responseFormatter.js";

// --- CONFIGURACIÓN DEL SERVIDOR ---
const PORT = 8080; // El "puerto" es como una puerta numerada en la que el servidor espera a los clientes.

// net.createServer() crea el servidor. La función que le pasamos se ejecutará
// CADA VEZ que un nuevo cliente se conecte.
const server = net.createServer((socket) => {
  // 'socket' es el objeto que representa la conexión única y directa con UN cliente.
  const clientIdentifier = `[${socket.remoteAddress}:${socket.remotePort}]`;
  console.log(`Cliente conectado: ${clientIdentifier}`);
  socket.write("¡Bienvenido a la Biblioteca Virtual!\n");

  // --- MANEJO DE EVENTOS DEL SOCKET ---

  // El evento 'data' se dispara cada vez que el cliente envía un mensaje.
  socket.on("data", (data) => {
    // Convertimos los datos crudos (Buffer) a un string limpio.
    const message = data.toString().trim();
    console.log(`${clientIdentifier} Comando recibido: "${message}"`);

    // --- LÓGICA DE PARSEO DE COMANDOS ---
    // Esta lógica separa la parte del comando (ej: "PUT AUTHOR <id>") de los datos JSON.
    const firstBraceIndex = message.indexOf("{");
    let commandPart, jsonDataString = null;

    if (firstBraceIndex !== -1) {
      // Si hay un '{', dividimos el mensaje en dos partes.
      commandPart = message.substring(0, firstBraceIndex).trim();
      jsonDataString = message.substring(firstBraceIndex);
    } else {
      // Si no hay '{', todo el mensaje es el comando.
      commandPart = message;
    }

    // NORMALIZAMOS SOLO LA PARTE DEL COMANDO A MAYÚSCULAS para que sea case-insensitive.
    const commandParts = commandPart.toUpperCase().split(" ");
    const [method, category, ...params] = commandParts;
    // Unimos el resto de los parámetros para permitir términos de búsqueda con espacios (ej: "Cien años de soledad").
    const param1 = params.join(" ");

    let response = "";

    // Usamos un 'try...catch' como red de seguridad. Si algo inesperado falla, el servidor no se caerá.
    try {
      // El 'switch' actúa como el enrutador principal de nuestra API, basado en el método (GET, POST, etc.).
      switch (method) {
        case "GET": // Maneja "Listar Todos" y "Ver por ID".
          if (!category) { response = ResponseFormatter.formatError("Comando GET requiere una categoría."); break; }
          
          if (param1) { // GET con un parámetro significa "Ver por ID".
            if (category === "AUTHOR") response = AuthorsController.getAuthorById(param1);
            else if (category === "BOOK") response = BooksController.getBookById(param1);
            else if (category === "PUBLISHER") response = PublishersController.getPublisherById(param1);
            else response = ResponseFormatter.formatError(`Categoría no válida para GET by ID: "${category}".`);
          } else { // GET sin parámetro significa "Listar Todos".
            if (category === "AUTHORS") response = AuthorsController.getAllAuthors();
            else if (category === "BOOKS") response = BooksController.getAllBooks();
            else if (category === "PUBLISHERS") response = PublishersController.getAllPublishers();
            else response = ResponseFormatter.formatError(`Categoría no válida para GET: "${category}".`);
          }
          break;

        case "SEARCH": // Comando explícito para búsquedas por texto, para evitar ambigüedades.
          if (!param1) response = ResponseFormatter.formatError("Falta un término para SEARCH.");
          else if (category === "AUTHOR") response = AuthorsController.getAuthorsByName(param1);
          else if (category === "BOOK") response = BooksController.getBooksByTitle(param1);
          else if (category === "PUBLISHER") response = PublishersController.getPublishersByName(param1);
          else response = ResponseFormatter.formatError(`Categoría no válida para SEARCH: "${category}".`);
          break;

        case "POST": // Maneja la creación de nuevos ítems.
          if (!jsonDataString) response = ResponseFormatter.formatError("Faltan datos JSON para POST.");
          else try {
            const itemData = JSON.parse(jsonDataString);
            if (category === "AUTHOR") response = AuthorsController.addAuthor(itemData);
            else if (category === "BOOK") response = BooksController.addBook(itemData);
            else if (category === "PUBLISHER") response = PublishersController.addPublisher(itemData);
            else response = ResponseFormatter.formatError(`Categoría no válida para POST: "${category}".`);
          } catch (e) { response = ResponseFormatter.formatError("JSON inválido."); }
          break;

        case "PUT": // Maneja la actualización de ítems existentes.
          if (!param1) response = ResponseFormatter.formatError("Falta el ID para PUT.");
          else if (!jsonDataString) response = ResponseFormatter.formatError("Faltan datos JSON para PUT.");
          else try {
            const itemData = JSON.parse(jsonDataString);
            if (category === "AUTHOR") response = AuthorsController.updateAuthor(param1, itemData);
            else if (category === "BOOK") response = BooksController.updateBook(param1, itemData);
            else if (category === "PUBLISHER") response = PublishersController.updatePublisher(param1, itemData);
            else response = ResponseFormatter.formatError(`Categoría no válida para PUT: "${category}".`);
          } catch (e) { response = ResponseFormatter.formatError("JSON inválido."); }
          break;

        case "DELETE": // Maneja la eliminación de ítems.
          if (!param1) { response = ResponseFormatter.formatError("Falta el ID para DELETE."); break; }
          // El servidor simplemente delega la acción. La lógica de negocio (como la restricción de eliminación)
          // está correctamente encapsulada dentro del controlador.
          if (category === "AUTHOR") response = AuthorsController.deleteAuthor(param1);
          else if (category === "BOOK") response = BooksController.deleteBook(param1);
          else if (category === "PUBLISHER") response = PublishersController.deletePublisher(param1);
          else response = ResponseFormatter.formatError(`Categoría no válida para DELETE: "${category}".`);
          break;

        case "HELP": // Proporciona ayuda al usuario.
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
        case "EXIT": // Cierra la conexión.
          socket.end("¡Hasta luego!\n");
          return;
        default: // Maneja cualquier comando que no reconozcamos.
          response = ResponseFormatter.formatError(`Comando desconocido: "${method}". Escribe "HELP".`);
          break;
      }
    } catch (error) {
      console.error("Error inesperado en el servidor:", error);
      response = ResponseFormatter.formatError("Ocurrió un error fatal en el servidor.");
    }

    // Finalmente, enviamos la respuesta (preparada por el controlador y la vista) de vuelta al cliente.
    socket.write(response + "\n");
  });

  // El evento 'close' se dispara cuando este cliente se desconecta.
  socket.on("close", () => console.log(`Cliente desconectado: ${clientIdentifier}`));
  // El evento 'error' se dispara si hay un problema con la conexión de este cliente.
  socket.on("error", (err) => console.error(`Error en socket ${clientIdentifier}: ${err.message}`));
});

// Ponemos al servidor a "escuchar" en el puerto definido, listo para recibir conexiones.
server.listen(PORT, () => console.log(`Servidor TCP escuchando en el puerto ${PORT}`));