// Importamos los módulos necesarios
import net from 'net';
import readline from 'readline';

// Definimos los datos de conexión
const PORT = 8080;
const HOST = '127.0.0.1';

// Función para enviar comandos
function sendCommand(command, data = null) {
  const client = new net.Socket();

  client.connect(PORT, HOST, () => {
    console.log(`\nConectado al servidor para enviar el comando: ${command}`);

    let message = command;
    if (data) {
      message += ` ${JSON.stringify(data)}`;
    }

    client.write(message + '\n');
  });

  client.on('data', (data) => {
    console.log('\nRespuesta del servidor:');
    console.log(data.toString());
    client.destroy();
  });

  client.on('close', () => {
    console.log('Conexión cerrada.');
    showMenu();
  });

  client.on('error', (err) => {
    console.error('\nError de conexión:', err);
    showMenu();
  });
}

// Creamos la interfaz de lectura para el menú
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para mostrar el menú y manejar la entrada del usuario
function showMenu() {
  console.log('\n--- Bienvenido al cliente de Book-API ---');
  console.log('1. Obtener todos los autores');
  console.log('2. Obtener todas las editoriales');
  console.log('3. Obtener todos los libros');
  console.log('4. Añadir un nuevo libro (ingresar datos)'); // Nuevo
  console.log('5. Añadir un nuevo autor (ingresar datos)');
  console.log('6. Añadir una nueva editorial (ingresar datos)');
  console.log('7. Salir');
  console.log('-----------------------------------------');

  rl.question('Selecciona una opción (1-7): ', (answer) => {
    switch (answer) {
      case '1':
        sendCommand('GET AUTHORS');
        break;
      case '2':
        sendCommand('GET PUBLISHERS');
        break;
      case '3':
        sendCommand('GET BOOKS');
        break;
      case '4': // Nueva opción para añadir libro
        rl.question('Ingresa el título del libro: ', (bookTitle) => {
          rl.question('Ingresa el nombre del autor: ', (authorName) => {
            rl.question('Ingresa el nombre de la editorial: ', (publisherName) => {
              const newBook = {
                title: bookTitle,
                authorName: authorName,
                publisherName: publisherName,
              };
              sendCommand('ADD BOOK', newBook);
            });
          });
        });
        break;
      case '5':
        // Pedimos los datos para el nuevo autor
        rl.question('Ingresa el nombre del autor: ', (authorName) => {
          rl.question('Ingresa la nacionalidad del autor: ', (authorNationality) => {
            const newAuthor = {
              name: authorName,
              nationality: authorNationality
            };
            sendCommand('ADD AUTHOR', newAuthor);
          });
        });
        break;
      case '6':
        // Pedimos los datos para la nueva editorial
        rl.question('Ingresa el nombre de la editorial: ', (publisherName) => {
          rl.question('Ingresa el país de la editorial: ', (publisherCountry) => {
            const newPublisher = {
              name: publisherName,
              country: publisherCountry
            };
            sendCommand('ADD PUBLISHER', newPublisher);
          });
        });
        break;
      case '7':
        console.log('Saliendo del programa.');
        rl.close();
        break;
      default:
        console.log('Opción no válida. Por favor, selecciona un número del 1 al 7.');
        showMenu();
        break;
    }
  });
}

// Inicia la aplicación mostrando el menú por primera vez
showMenu();