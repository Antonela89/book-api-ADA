// SERVIDOR – archivo principal

import net from "net";
import { AuthorsController } from "./src/controllers/authorsController.js";
import { BooksController } from "./src/controllers/booksController.js";
import { PublishersController } from "./src/controllers/publishersController.js";
import { ResponseFormatter } from "./src/views/responseFormatter.js";

const PORT = 8080;

const server = net.createServer((socket) => {
  const clientIdentifier = `[${socket.remoteAddress}:${socket.remotePort}]`;
  console.log(`Cliente conectado: ${clientIdentifier}`);
  socket.write("¡Bienvenido a la Biblioteca Virtual!\n");

  socket.on("data", (data) => {
    const rawMessage = data.toString().trim();
    console.log(`${clientIdentifier} Comando recibido: "${rawMessage}"`);

    const firstBraceIndex = rawMessage.indexOf("{");
    let commandPart;
    let jsonDataString = null;

    if (firstBraceIndex === -1) {
      commandPart = rawMessage;
    } else {
      commandPart = rawMessage.substring(0, firstBraceIndex).trim();
      jsonDataString = rawMessage.substring(firstBraceIndex);
    }

    const fullCommandParts = commandPart.split(" ");
    const command = fullCommandParts[0]?.toUpperCase(); // GET, GET_ID, POST, etc.
    const category = fullCommandParts[1]?.toUpperCase(); // AUTHOR, BOOK, etc.
    let thirdParam = fullCommandParts.slice(2).join(" ").trim(); // ID o término

    let response = "";

    try {
      switch (command) {
        case "GET":
          if (category.endsWith("S")) {
            if (category === "AUTHORS") response = AuthorsController.getAllAuthors();
            else if (category === "BOOKS") response = BooksController.getAllBooks();
            else if (category === "PUBLISHERS") response = PublishersController.getAllPublishers();
            else response = ResponseFormatter.formatError(`Categoría no válida: "${category}".`);
          } else if (category === "AUTHOR" || category === "BOOK" || category === "PUBLISHER") {
            if (!thirdParam) {
              response = ResponseFormatter.formatError(`Falta el ID o término para GET ${category}.`);
              break;
            }
            const searchTerm = thirdParam.toLowerCase();
            if (category === "AUTHOR") response = AuthorsController.getAuthorsByName(searchTerm);
            else if (category === "BOOK") response = BooksController.getBooksByTitle(searchTerm);
            else if (category === "PUBLISHER") response = PublishersController.getPublishersByName(searchTerm);
          } else {
            response = ResponseFormatter.formatError(`Categoría no válida: "${category}".`);
          }
          break;

        case "GET_ID":
          if (!thirdParam) {
            response = ResponseFormatter.formatError(`Falta el ID para GET_ID ${category}.`);
            break;
          }
          const idToFind = thirdParam.toLowerCase();
          if (category === "AUTHOR") response = AuthorsController.getAuthorById(idToFind);
          else if (category === "BOOK") response = BooksController.getBookById(idToFind);
          else if (category === "PUBLISHER") response = PublishersController.getPublisherById(idToFind);
          else response = ResponseFormatter.formatError(`Categoría no válida para GET_ID: "${category}".`);
          break;

        case "POST":
          if (!jsonDataString) {
            response = ResponseFormatter.formatError("Faltan los datos en formato JSON para POST.");
            break;
          }
          try {
            const itemData = JSON.parse(jsonDataString);
            if (category === "AUTHOR") response = AuthorsController.addAuthor(itemData);
            else if (category === "BOOK") response = BooksController.addBook(itemData);
            else if (category === "PUBLISHER") response = PublishersController.addPublisher(itemData);
            else response = ResponseFormatter.formatError(`Categoría no válida: "${category}".`);
          } catch (e) {
            console.error("Error parseando JSON en POST:", e);
            response = ResponseFormatter.formatError("JSON inválido.");
          }
          break;

        case "PUT":
          if (!thirdParam) {
            response = ResponseFormatter.formatError("Falta el ID para EDITAR.");
            break;
          }
          if (!jsonDataString) {
            response = ResponseFormatter.formatError("Faltan los datos JSON para EDITAR.");
            break;
          }
          const idToUpdate = thirdParam.toLowerCase();
          try {
            const itemData = JSON.parse(jsonDataString);
            if (category === "AUTHOR") response = AuthorsController.updateAuthor(idToUpdate, itemData);
            else if (category === "BOOK") response = BooksController.updateBook(idToUpdate, itemData);
            else if (category === "PUBLISHER") response = PublishersController.updatePublisher(idToUpdate, itemData);
            else response = ResponseFormatter.formatError(`Categoría no válida: "${category}".`);
          } catch (e) {
            console.error("Error parseando JSON en PUT:", e);
            response = ResponseFormatter.formatError("JSON inválido.");
          }
          break;

        case "DELETE":
          if (!thirdParam) {
            response = ResponseFormatter.formatError("Falta el ID para ELIMINAR.");
            break;
          }
          const idToDelete = thirdParam.toLowerCase();
          if (category === "AUTHOR") {
            const booksCount = BooksController.countBooksByAuthorId(idToDelete);
            response = booksCount > 0
              ? ResponseFormatter.formatError(`No se puede eliminar el AUTHOR con ID ${idToDelete}, tiene ${booksCount} BOOK(s).`)
              : AuthorsController.deleteAuthor(idToDelete);
          } else if (category === "PUBLISHER") {
            const booksCount = BooksController.countBooksByPublisherId(idToDelete);
            response = booksCount > 0
              ? ResponseFormatter.formatError(`No se puede eliminar el PUBLISHER con ID ${idToDelete}, tiene ${booksCount} BOOK(s).`)
              : PublishersController.deletePublisher(idToDelete);
          } else if (category === "BOOK") {
            response = BooksController.deleteBook(idToDelete);
          } else {
            response = ResponseFormatter.formatError(`Categoría no válida: "${category}".`);
          }
          break;

        case "HELP":
          response = [
            "COMANDOS DISPONIBLES:",
            "  GET AUTHORS | GET BOOKS | GET PUBLISHERS",
            "  GET_ID AUTHOR <ID> | GET_ID BOOK <ID> | GET_ID PUBLISHER <ID>",
            "  GET TERM AUTHOR <NOMBRE> | GET TERM BOOK <TÍTULO> | GET TERM PUBLISHER <NOMBRE>",
            "  POST AUTHOR <JSON> | POST BOOK <JSON> | POST PUBLISHER <JSON>",
            "  PUT AUTHOR <ID> <JSON> | PUT BOOK <ID> <JSON> | PUT PUBLISHER <ID> <JSON>",
            "  DELETE AUTHOR <ID> | DELETE BOOK <ID> | DELETE PUBLISHER <ID>",
            "  EXIT",
          ].join("\n");
          break;

        case "EXIT":
          socket.end("¡Hasta luego!\n");
          return;

        default:
          response = ResponseFormatter.formatError(`Comando desconocido: "${command}". Escribe HELP.`);
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
