// Este es el archivo principal del SERVIDOR.

//  importaciones
import net from "net";
import { AuthorsController } from "./src/controllers/authorsController.js";
import { BooksController } from "./src/controllers/booksController.js";
import { PublishersController } from "./src/controllers/publishersController.js";
import { ResponseFormatter } from "./src/views/responseFormatter.js";

// configuraciones
const PORT = 8080;

const server = net.createServer((socket) => {
  const clientIdentifier = `[${socket.remoteAddress}:${socket.remotePort}]`;
  console.log(`Cliente conectado: ${clientIdentifier}`);
  socket.write("¡Bienvenido a la Biblioteca Virtual!\n"); // manejo de eventos

  socket.on("data", (data) => {
    // CONVERTIMOS TODO EL MENSAJE A MAYÚSCULAS PARA NORMALIZAR LOS COMANDOS
    const message = data.toString().trim().toUpperCase();
    console.log(`${clientIdentifier} Comando recibido: "${message}"`); // --- LÓGICA DE PARSEO DE COMANDOS ---

    const firstBraceIndex = message.indexOf("{");
    let commandPart;
    let jsonDataString = null;

    if (firstBraceIndex === -1) {
      commandPart = message;
    } else {
      commandPart = message.substring(0, firstBraceIndex).trim();
      jsonDataString = message.substring(firstBraceIndex);
    }

    const fullCommandParts = commandPart.split(" ");
    const [command, category] = fullCommandParts; // thirdParam será el ID o el Término de búsqueda (incluyendo espacios si hay)

    let thirdParam = fullCommandParts.slice(2).join(" ");

    // 🔥 CORRECCIÓN FINAL Y CRÍTICA: Cambiamos a 'let' y limpiamos los espacios al final (trim()).
    // Esto resuelve el problema de los IDs copiados con espacios residuales.
    thirdParam = thirdParam.trim();

    let response = "";

    try {
      // El 'switch' actúa como el enrutador principal de nuestra API.
      switch (command) {
        case "GET": // Maneja: Listar todos, Ver por ID y Buscar por término.
          if (category.endsWith("S")) {
            // 1. GET AUTHORS, GET BOOKS, etc. (Listar todos)
            if (category === "AUTHORS")
              response = AuthorsController.getAllAuthors();
            else if (category === "BOOKS")
              response = BooksController.getAllBooks();
            else if (category === "PUBLISHERS")
              response = PublishersController.getAllPublishers();
            else
              response = ResponseFormatter.formatError(
                `Comando GET / Categoría no válida: "${category}".`
              );
          } else if (
            category === "AUTHOR" ||
            category === "BOOK" ||
            category === "PUBLISHER"
          ) {
            // 2. GET <CATEGORY> <ID/TERM>
            if (!thirdParam) {
              response = ResponseFormatter.formatError(
                `Falta el ID o el término de búsqueda para GET ${category}.`
              );
              break;
            } // Ahora solo necesitamos .toLowerCase() porque thirdParam ya está .trim()

            const normalizedParam = thirdParam.toLowerCase(); // 1. Intentamos GET por ID primero, usando el parámetro normalizado.

            let itemByIdResponse = null;
            if (category === "AUTHOR")
              itemByIdResponse =
                AuthorsController.getAuthorById(normalizedParam);
            else if (category === "BOOK")
              itemByIdResponse = BooksController.getBookById(normalizedParam);
            else if (category === "PUBLISHER")
              itemByIdResponse =
                PublishersController.getPublisherById(normalizedParam); // Si el resultado por ID es un éxito (no tiene el mensaje de error de "no encontrado"), lo devolvemos.

            if (itemByIdResponse && itemByIdResponse.startsWith("✅ Éxito:")) {
              response = itemByIdResponse;
            } else {
              // 2. Si falló la búsqueda por ID (porque no existe o es inválido), asumimos que es un término de búsqueda.
              const searchTerm = normalizedParam; // Ya está normalizado y sin espacios.
              if (category === "AUTHOR")
                response = AuthorsController.getAuthorsByName(searchTerm);
              else if (category === "BOOK")
                response = BooksController.getBooksByTitle(searchTerm);
              else if (category === "PUBLISHER")
                response = PublishersController.getPublishersByName(searchTerm);
              else
                response = ResponseFormatter.formatError(
                  `Categoría no válida para búsqueda: "${category}".`
                );
            }
          } else {
            response = ResponseFormatter.formatError(
              `Comando GET / Categoría no válida: "${category}". Use GET AUTHORS, GET BOOKS, GET PUBLISHERS, o GET <CATEGORIA> <ID/TÉRMINO>.`
            );
          }
          break;

        case "POST":
          if (!jsonDataString) {
            response = ResponseFormatter.formatError(
              "Faltan los datos en formato JSON para POST."
            );
            break;
          }
          try {
            // El JSON se debe parsear y pasar al controlador. El controlador se encarga de la normalización.
            const itemData = JSON.parse(jsonDataString);
            if (category === "AUTHOR")
              response = AuthorsController.addAuthor(itemData);
            else if (category === "BOOK")
              response = BooksController.addBook(itemData);
            else if (category === "PUBLISHER")
              response = PublishersController.addPublisher(itemData);
            else
              response = ResponseFormatter.formatError(
                `Comando POST / Categoría no válida: "${category}".`
              );
          } catch (e) {
            console.error("Error parseando JSON en POST:", e);
            response = ResponseFormatter.formatError("JSON inválido.");
          }
          break;

        case "PUT":
          if (!thirdParam) {
            response = ResponseFormatter.formatError(
              "Falta el ID del elemento a EDITAR."
            );
            break;
          }
          if (!jsonDataString) {
            response = ResponseFormatter.formatError(
              "Faltan los datos JSON para EDITAR."
            );
            break;
          } // thirdParam ya está limpio (trim())
          const idToUpdate = thirdParam.toLowerCase();
          try {
            const itemData = JSON.parse(jsonDataString); // Usamos idToUpdate normalizado en lugar de thirdParam
            if (category === "AUTHOR")
              response = AuthorsController.updateAuthor(idToUpdate, itemData);
            else if (category === "BOOK")
              response = BooksController.updateBook(idToUpdate, itemData);
            else if (category === "PUBLISHER")
              response = PublishersController.updatePublisher(
                idToUpdate,
                itemData
              );
            else
              response = ResponseFormatter.formatError(
                `Comando PUT / Categoría no válida: "${category}".`
              );
          } catch (e) {
            console.error("Error parseando JSON en PUT:", e);
            response = ResponseFormatter.formatError("JSON inválido.");
          }
          break;

        case "DELETE":
          if (!thirdParam) {
            response = ResponseFormatter.formatError(
              "Falta el ID del elemento a ELIMINAR."
            );
            break;
          } // thirdParam ya está limpio (trim())
          const idToDelete = thirdParam.toLowerCase();
          if (category === "AUTHOR") {
            // Usamos idToDelete en lugar de thirdParam
            const booksCount = BooksController.countBooksByAuthorId(idToDelete);
            if (booksCount > 0) {
              response = ResponseFormatter.formatError(
                `No se puede eliminar el AUTHOR con ID ${idToDelete} porque está asociado a ${booksCount} BOOK(s).`
              );
            } else {
              response = AuthorsController.deleteAuthor(idToDelete);
            }
          } else if (category === "PUBLISHER") {
            // Usamos idToDelete
            const booksCount =
              BooksController.countBooksByPublisherId(idToDelete);
            if (booksCount > 0) {
              response = ResponseFormatter.formatError(
                `No se puede eliminar el PUBLISHER con ID ${idToDelete} porque está asociado a ${booksCount} BOOK(s).`
              );
            } else {
              response = PublishersController.deletePublisher(idToDelete);
            }
          } else if (category === "BOOK") {
            // Usamos idToDelete
            response = BooksController.deleteBook(idToDelete);
          } else
            response = ResponseFormatter.formatError(
              `Comando DELETE / Categoría no válida: "${category}".`
            );
          break;

        case "HELP":
          response = [
            "COMANDOS DISPONIBLES (INGLÉS/MAYÚSCULAS):",
            "  GET AUTHORS | GET BOOKS | GET PUBLISHERS",
            "  GET <CATEGORY> <ID>",
            "  GET <CATEGORY> <TÉRMINO DE BÚSQUEDA>",
            "  POST AUTHOR <JSON> | POST BOOK <JSON> | POST PUBLISHER <JSON>",
            "  PUT AUTHOR <ID> <JSON> | PUT BOOK <ID> <JSON> | PUT PUBLISHER <ID> <JSON>",
            "  DELETE AUTHOR <ID> | DELETE BOOK <ID> | DELETE PUBLISHER <ID>",
            "  EXIT",
          ].join("\n");
          break;
        case "EXIT":
          socket.end("¡Hasta luego!\n");
          return;

        default:
          response = ResponseFormatter.formatError(
            `Comando desconocido: "${command}". Escribe "HELP".`
          );
          break;
      }
    } catch (error) {
      console.error("Error inesperado en el servidor:", error);
      response = ResponseFormatter.formatError(
        "Ocurrió un error fatal en el servidor."
      );
    }

    socket.write(response + "\n");
  });

  socket.on("close", () =>
    console.log(`Cliente desconectado: ${clientIdentifier}`)
  );
  socket.on("error", (err) =>
    console.error(`Error en socket ${clientIdentifier}: ${err.message}`)
  );
});

server.listen(PORT, () =>
  console.log(`Servidor TCP escuchando en el puerto ${PORT}`)
);
