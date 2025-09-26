// Este es el archivo principal del CLIENTE. Es la interfaz con la que interactúa el usuario.

// importaciones
import net from 'net';
import readline from 'readline';

// configuracion del cliente
const PORT = 8080;
const HOST = '127.0.0.1';

// creamos la instancia del cliente
const client = new net.Socket();
// creamos la interfaz para leer y escribir en la consola.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Manejo de estado del cliente
let isInitialConnection = true; // bandera -> manejar el primer mensaje de bienvenida.
let nextAction = null; // Variable de estado para recordar flujos de varios pasos (editar/eliminar).

/**
 * Función central que maneja TODAS las respuestas recibidas del servidor.
 * @param {Buffer} data - Los datos recibidos del servidor.
 */
function handleServerResponse(data) {
  const response = data.toString().trim();

  // Si es la primera conexión, solo muestra la bienvenida y luego el menú.
  if (isInitialConnection) {
    console.log(response);
    isInitialConnection = false;
    showMenu();
    return;
  }

  // Si 'nextAction' tiene un valor, estamos en medio de un flujo de edición/eliminación.
  if (nextAction) {
    console.log('\n--- Resultados de la Búsqueda ---');
    console.log(response);
    console.log('---------------------------------------');

    // Si la búsqueda falló, detenemos el flujo y volvemos al menú.
    if (response.startsWith('❌ Error:')) {
      console.log('\nLa búsqueda no produjo resultados. Volviendo al menú principal.');
      nextAction = null; 
      setTimeout(showMenu, 500); 
      return; 
    }

    // Si la búsqueda tuvo éxito, pedimos el ID para la acción final.
    rl.question('Ingresa el ID (completo) del elemento que deseas modificar: ', (id) => {
      if (!id.trim()) {
        console.log('ID no ingresado. Volviendo al menú principal.');
        nextAction = null;
        showMenu();
        return;
      }
      
      const { command, serverCategory } = nextAction;
      nextAction = null; // Limpiar el estado después de obtener el ID.

      // Ejecutar la acción final (PUT o DELETE) con el ID.
      // Aquí solo limpiamos el ID (id.trim()), el servidor se encarga de toLowerCase().
      if (command === 'PUT') {
        if (serverCategory === 'AUTHOR') askForUpdatedAuthorData(id.trim());
        else if (serverCategory === 'BOOK') askForUpdatedBookData(id.trim());
        else if (serverCategory === 'PUBLISHER') askForUpdatedPublisherData(id.trim());
      } else if (command === 'DELETE') {
        client.write(`DELETE ${serverCategory} ${id.trim()}`);
      }
    });

    return; // Ya hemos procesado la respuesta dentro del flujo nextAction.
  }
  
  // Para comandos de un solo paso (GET, POST, etc.)
  console.log('\n--- Respuesta del Servidor ---');
  console.log(response);
  console.log('------------------------------');
  setTimeout(showMenu, 500);
}

// manejo de eventos del cliente
client.connect(PORT, HOST, () => console.log('Conectado al servidor de la Biblioteca.'));
client.on('data', handleServerResponse);
client.on('close', () => {
  console.log('Desconectado del servidor.');
  rl.close();
  process.exit(0);
});
client.on('error', (err) => {
  console.error('Error de conexión:', err.message);
  process.exit(1);
});

// Interfaz de Usuario
/**
 * Muestra el menú principal de opciones.
 */
function showMenu() {
  console.log('\n--- MENÚ PRINCIPAL ---');
  // Se separan las opciones de búsqueda para eliminar la ambigüedad en el servidor
  console.log('1. Listar todos (GET /<CATEGORY>S)');
  console.log('2. Buscar por TÉRMINO/Nombre (GET <CATEGORY> <TERM>)'); // Nuevo: solo por término
  console.log('3. Buscar por ID (GET <CATEGORY> <ID>)');             // Nuevo: solo por ID
  console.log('4. Agregar (POST <CATEGORY>)');                       // Opción 3 anterior -> 4
  console.log('5. Editar (PUT <CATEGORY>)');                         // Opción 4 anterior -> 5
  console.log('6. Eliminar (DELETE <CATEGORY>)');                     // Opción 5 anterior -> 6
  console.log('0. Salir (EXIT)');
  console.log('----------------------\n');

  rl.question('Selecciona una opción: ', (option) => {
    switch (option.trim()) {
      case '1': askCategory('GET_ALL'); break; 
      case '2': askCategory('GET_TERM'); break;    // Nuevo comando
      case '3': askCategory('GET_ID'); break;      // Nuevo comando
      case '4': askCategory('POST'); break; 
      case '5': askCategory('PUT'); break; 
      case '6': askCategory('DELETE'); break; 
      case '0': client.write('EXIT'); break;
      default:
        console.log('Opción no válida. Inténtalo de nuevo.');
        showMenu();
        break;
    }
  });
}

/**
 * Muestra un sub-menú para que el usuario elija la categoría.
 * @param {string} command - La acción principal seleccionada (GET_ALL, GET_TERM, GET_ID, POST, PUT, DELETE).
 */
function askCategory(command) {
  console.log('\n--- SELECCIONA UNA CATEGORÍA ---');
  console.log('1. Autor (AUTHOR)');
  console.log('2. Libro (BOOK)');
  console.log('3. Editorial (PUBLISHER)');
  console.log('4. Volver al menú principal');
  console.log('--------------------------------');

  rl.question('Elige una categoría (1-4): ', (option) => {
    let serverCategory = '';
    let clientCategory = ''; // Nombre en español para los prompts.
    switch (option.trim()) {
      case '1': 
        serverCategory = 'AUTHOR'; 
        clientCategory = 'autor'; 
        break;
      case '2': 
        serverCategory = 'BOOK'; 
        clientCategory = 'libro'; 
        break;
      case '3': 
        serverCategory = 'PUBLISHER'; 
        clientCategory = 'editorial'; 
        break;
      case '4':
        showMenu(); 
        return;
      default:
        console.log('Opción de categoría no válida.');
        showMenu();
        return;
    }

    // Lógica de Flujo
    if (command === 'GET_ALL') {
      // GET AUTHORS, GET BOOKS, GET PUBLISHERS
      client.write(`GET ${serverCategory}S`);
    } else if (command === 'GET_TERM') {
      // Opción 2: Buscar por término (false = no es ID)
      askForTermOrIdToView('GET', serverCategory, clientCategory, false);
    } else if (command === 'GET_ID') {
      // Opción 3: Buscar por ID (true = es ID)
      askForTermOrIdToView('GET', serverCategory, clientCategory, true);
    } else if (command === 'POST') {
      // POST <CATEGORY> <JSON>
      askForNewItemData('POST', serverCategory, clientCategory);
    } else { 
      // PUT o DELETE: Inicia el flujo de dos pasos (primero busca con GET)
      initiateMultiStepProcess(command, serverCategory, clientCategory);
    }
  });
}

/**
 * Pide un ID o un término de búsqueda, dependiendo del modo.
 * Reemplaza la antigua askForIdOrTermToView.
 * @param {string} command - La acción principal ('GET').
 * @param {string} serverCategory - La categoría (AUTHOR, BOOK, etc.).
 * @param {string} clientCategory - El nombre local de la categoría ('autor', 'libro', etc.).
 * @param {boolean} isIdSearch - Si es true, pide un ID. Si es false, pide un término/nombre.
 */
function askForTermOrIdToView(command, serverCategory, clientCategory, isIdSearch) {
  let prompt;
  if (isIdSearch) {
    prompt = `Ingresa el ID completo del ${clientCategory} a buscar: `;
  } else if (clientCategory === 'libro') {
    prompt = 'Ingresa el Título o Término de Búsqueda: ';
  } else {
    prompt = 'Ingresa el Nombre o Término de Búsqueda: ';
  }
  
  rl.question(prompt, (term) => {
    if (term.trim()) {
      // Envía: GET AUTHOR <ID> o GET AUTHOR <TERM>
      client.write(`${command} ${serverCategory} ${term.trim()}`);
    } else {
      console.log('El parámetro no puede estar vacío.');
      showMenu();
    }
  });
}

/**
 * Inicia un flujo de varios pasos pidiendo un término de búsqueda (PUT/DELETE).
 */
function initiateMultiStepProcess(command, serverCategory, clientCategory) {
  const actionText = command === 'PUT' ? 'editar' : 'eliminar';
  const categoryText = clientCategory === 'libro' ? 'título' : 'nombre';
  
  rl.question(`Ingresa el ${categoryText} a buscar (para ${actionText} después): `, (term) => {
    if (!term.trim()) {
      console.log('Búsqueda cancelada. Volviendo al menú principal.');
      showMenu();
      return;
    }
    
    // 1. Guardar la acción real (PUT/DELETE) y la categoría para el segundo paso.
    nextAction = { command, serverCategory }; 
    
    // 2. Enviar SIEMPRE el comando de BÚSQUEDA (GET) para el primer paso.
    client.write(`GET ${serverCategory} ${term.trim()}`);
  });
}

// Funciones para pedir datos (mantienen el envío de POST/PUT en inglés)

function askForNewItemData(command, serverCategory) {
  // Simplificado para el ejemplo. En tu código completo, asegúrate de que use las categorías en español para los prompts.
  const category = serverCategory.toLowerCase();
  
  if (category === 'author') {
    const newData = {};
    rl.question('Nombre del autor: ', (name) => {
      newData.name = name.trim();
      rl.question('Nacionalidad: ', (nationality) => {
        newData.nationality = nationality.trim();
        client.write(`POST AUTHOR ${JSON.stringify(newData)}`);
      });
    });
  } else if (category === 'publisher') {
    const newData = {};
    rl.question('Nombre de la editorial: ', (name) => {
      newData.name = name.trim();
      rl.question('País: ', (country) => {
        newData.country = country.trim();
        client.write(`POST PUBLISHER ${JSON.stringify(newData)}`);
      });
    });
  } else if (category === 'book') {
    const newData = {};
    rl.question('Título del libro: ', (title) => {
      newData.title = title.trim();
      rl.question('Nombre exacto del autor: ', (authorName) => {
        newData.authorName = authorName.trim();
        rl.question('Nombre exacto de la editorial: ', (publisherName) => {
          newData.publisherName = publisherName.trim();
          rl.question('Año de publicación: ', (year) => {
            newData.year = parseInt(year.trim(), 10);
            rl.question('Género: ', (genre) => {
              newData.genre = genre.trim();
              client.write(`POST BOOK ${JSON.stringify(newData)}`);
            });
          });
        });
      });
    });
  }
}

function askForUpdatedAuthorData(id) {
  const updatedData = {};
  rl.question('Nuevo nombre (deja en blanco para no cambiar): ', (name) => {
    if (name.trim()) updatedData.name = name.trim();
    rl.question('Nueva nacionalidad (deja en blanco para no cambiar): ', (nationality) => {
      if (nationality.trim()) updatedData.nationality = nationality.trim();

      if (Object.keys(updatedData).length > 0) {
        client.write(`PUT AUTHOR ${id} ${JSON.stringify(updatedData)}`);
      } else {
        console.log('No se realizaron cambios.');
        showMenu();
      }
    });
  });
}

function askForUpdatedPublisherData(id) {
  const updatedData = {};
  rl.question('Nuevo nombre (deja en blanco para no cambiar): ', (name) => {
    if (name.trim()) updatedData.name = name.trim();
    rl.question('Nuevo país (deja en blanco para no cambiar): ', (country) => {
      if (country.trim()) updatedData.country = country.trim();

      if (Object.keys(updatedData).length > 0) {
        client.write(`PUT PUBLISHER ${id} ${JSON.stringify(updatedData)}`);
      } else {
        console.log('No se realizaron cambios.');
        showMenu();
      }
    });
  });
}

function askForUpdatedBookData(id) {
  const updatedData = {};
  rl.question('Nuevo título (deja en blanco para no cambiar): ', (title) => {
    if (title.trim()) updatedData.title = title.trim();
    rl.question('Nuevo año de publicación (deja en blanco para no cambiar): ', (year) => {
      if (year.trim()) updatedData.year = parseInt(year.trim(), 10);
      rl.question('Nuevo género (deja en blanco para no cambiar): ', (genre) => {
        if (genre.trim()) updatedData.genre = genre.trim();

        if (Object.keys(updatedData).length > 0) {
          client.write(`PUT BOOK ${id} ${JSON.stringify(updatedData)}`);
        } else {
          console.log('No se realizaron cambios.');
          showMenu();
        }
      });
    });
  });
}