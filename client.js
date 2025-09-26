// Este es el archivo principal del CLIENTE. Es la interfaz con la que interactúa el usuario.
// Su trabajo es mostrar menús, pedir datos, construir los comandos y enviarlos al servidor.
// También se encarga de recibir las respuestas del servidor y mostrarlas.

// importaciones
import net from 'net';
import readline from 'readline';

// configuración
const PORT = 8080;
const HOST = '127.0.0.1';

// creacion del cliente
const client = new net.Socket();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// --- MANEJO DE ESTADO DEL CLIENTE ---
let isInitialConnection = true; // Flag para manejar el primer mensaje de bienvenida.
let nextAction = null; // Variable de estado para recordar flujos de varios pasos.

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

    const currentAction = nextAction;
    nextAction = null;

    // Si la búsqueda falló, detenemos el flujo y volvemos al menú.
    if (response.startsWith('❌ Error:')) {
      console.log('\nLa búsqueda no produjo resultados. Volviendo al menú principal.');
      setTimeout(showMenu, 500);
      return;
    }

    // Si la búsqueda tuvo éxito, pedimos el ID para la acción final.
    rl.question('Ingresa el ID (completo) del elemento que deseas modificar: ', (id) => {
      if (!id.trim()) {
        console.log('\nOperación cancelada. Volviendo al menú principal.');
        showMenu();
        return;
      }
      
      const { command, serverCategory } = currentAction;
      
      // Ejecuta la acción final (PUT o DELETE) con el ID.
      if (command === 'PUT') {
        if (serverCategory === 'AUTHOR') askForUpdatedAuthorData(id.trim());
        else if (serverCategory === 'BOOK') askForUpdatedBookData(id.trim());
        else if (serverCategory === 'PUBLISHER') askForUpdatedPublisherData(id.trim());
      } else if (command === 'DELETE') {
        client.write(`DELETE ${serverCategory} ${id.trim()}`);
      }
    });

    return; // Salimos porque ya hemos manejado la respuesta dentro de este flujo.
  }
  
  // Para respuestas a comandos de un solo paso, simplemente mostramos y volvemos al menú.
  console.log('\n--- Respuesta del Servidor ---');
  console.log(response);
  console.log('------------------------------');
  setTimeout(showMenu, 500);
}

// --- MANEJO DE EVENTOS DEL CLIENTE ---
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

// --- LÓGICA DE LA INTERFAZ DE USUARIO ---

/**
 * Muestra el menú principal de opciones.
 */
function showMenu() {
  console.log('\n--- MENÚ PRINCIPAL ---');
  console.log('1. Listar todo');
  console.log('2. Buscar por término');
  console.log('3. Ver por ID');
  console.log('4. Agregar');
  console.log('5. Editar');
  console.log('6. Eliminar');
  console.log('7. Ayuda');
  console.log('0. Salir');
  console.log('----------------------\n');

  rl.question('Selecciona una opción: ', (option) => {
    switch (option.trim()) {
      case '1': askCategory('GET_ALL'); break;
      case '2': askCategory('SEARCH'); break;
      case '3': askCategory('GET_ID'); break;
      case '4': askCategory('POST'); break;
      case '5': askCategory('PUT'); break;
      case '6': askCategory('DELETE'); break;
      case '7': client.write('HELP'); break;
      case '0': client.write('EXIT'); break;
      default: console.log('Opción no válida.'); showMenu(); break;
    }
  });
}

/**
 * Muestra un sub-menú para que el usuario elija la categoría.
 * @param {string} command - La acción principal seleccionada (GET_ALL, SEARCH, etc.).
 */
function askCategory(command) {
  console.log('\n--- SELECCIONA UNA CATEGORÍA ---');
  console.log('1. Autor');
  console.log('2. Libro');
  console.log('3. Editorial');
  console.log('4. Volver al menú');
  console.log('--------------------------------');

  rl.question('Elige una categoría (1-4): ', (option) => {
    let serverCategory = '', clientCategory = '';
    switch (option.trim()) {
      case '1': serverCategory = 'AUTHOR'; clientCategory = 'autor'; break;
      case '2': serverCategory = 'BOOK'; clientCategory = 'libro'; break;
      case '3': serverCategory = 'PUBLISHER'; clientCategory = 'editorial'; break;
      case '4': showMenu(); return;
      default: console.log('Opción no válida.'); showMenu(); return;
    }

    // Enrutamos al siguiente paso según el comando seleccionado.
    if (command === 'GET_ALL') {
      client.write(`GET ${serverCategory}S`); // GET AUTHORS, BOOKS, PUBLISHERS
    } else if (command === 'SEARCH') {
      askForTerm('SEARCH', serverCategory, clientCategory);
    } else if (command === 'GET_ID') {
      askForId('GET', serverCategory, clientCategory);
    } else if (command === 'POST') {
      askForNewItemData(serverCategory, clientCategory);
    } else { // PUT o DELETE inician el flujo de varios pasos
      initiateMultiStepProcess(command, serverCategory, clientCategory);
    }
  });
}

/**
 * Pide un término de búsqueda para un comando 'SEARCH'.
 * @param {string} command - El comando ('SEARCH').
 * @param {string} serverCategory - La categoría para el servidor (ej. 'AUTHOR').
 * @param {string} clientCategory - La categoría para el usuario (ej. 'autor').
 */
function askForTerm(command, serverCategory, clientCategory) {
  const prompt = clientCategory === 'libro' ? 'Ingresa el Título a buscar: ' : 'Ingresa el Nombre a buscar: ';
  rl.question(prompt, (term) => {
    if (term.trim()) client.write(`${command} ${serverCategory} ${term.trim()}`);
    else { console.log('El término no puede estar vacío.'); showMenu(); }
  });
}

/**
 * Pide un ID para un comando 'GET' por ID.
 * @param {string} command - El comando ('GET').
 * @param {string} serverCategory - La categoría para el servidor.
 * @param {string} clientCategory - La categoría para el usuario.
 */
function askForId(command, serverCategory, clientCategory) {
  rl.question(`Ingresa el ID del/de la ${clientCategory} a ver: `, (id) => {
    if (id.trim()) client.write(`${command} ${serverCategory} ${id.trim()}`);
    else { console.log('El ID no puede estar vacío.'); showMenu(); }
  });
}

/**
 * Inicia un flujo de varios pasos (PUT/DELETE) pidiendo un término de búsqueda.
 * @param {string} command - El comando original ('PUT' o 'DELETE').
 * @param {string} serverCategory - La categoría para el servidor.
 * @param {string} clientCategory - La categoría para el usuario.
 */
function initiateMultiStepProcess(command, serverCategory, clientCategory) {
  const actionText = command === 'PUT' ? 'editar' : 'eliminar';
  const categoryText = clientCategory === 'libro' ? 'título' : 'nombre';
  rl.question(`Ingresa el ${categoryText} a buscar (para ${actionText} después): `, (term) => {
    if (!term.trim()) { console.log('Búsqueda cancelada.'); showMenu(); return; }
    // 1. Guardamos la acción final que queremos hacer.
    nextAction = { command, serverCategory, clientCategory };
    // 2. Enviamos un comando SEARCH para el primer paso.
    client.write(`SEARCH ${serverCategory} ${term.trim()}`);
  });
}

// --- FUNCIONES PARA PEDIR DATOS ---
// (Estas funciones piden los datos al usuario y construyen el comando final)

function askForNewItemData(command, serverCategory) {
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