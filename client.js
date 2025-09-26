// CLIENTE – interfaz de usuario para interactuar con el servidor

import net from 'net';
import readline from 'readline';

const PORT = 8080;
const HOST = '127.0.0.1';

const client = new net.Socket();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let isInitialConnection = true;
let nextAction = null;

function handleServerResponse(data) {
  const response = data.toString().trim();

  if (isInitialConnection) {
    console.log(response);
    isInitialConnection = false;
    showMenu();
    return;
  }

  if (nextAction) {
    console.log('\n--- Resultados de la Búsqueda ---');
    console.log(response);
    console.log('---------------------------------------');

    if (response.startsWith('❌ Error:')) {
      console.log('\nLa búsqueda no produjo resultados. Volviendo al menú principal.');
      nextAction = null; 
      setTimeout(showMenu, 500); 
      return; 
    }

    rl.question('Ingresa el ID (completo) del elemento que deseas modificar: ', (id) => {
      if (!id.trim()) {
        console.log('ID no ingresado. Volviendo al menú principal.');
        nextAction = null;
        showMenu();
        return;
      }
      
      const { command, serverCategory } = nextAction;
      nextAction = null;

      if (command === 'PUT') {
        if (serverCategory === 'AUTHOR') askForUpdatedAuthorData(id.trim());
        else if (serverCategory === 'BOOK') askForUpdatedBookData(id.trim());
        else if (serverCategory === 'PUBLISHER') askForUpdatedPublisherData(id.trim());
      } else if (command === 'DELETE') {
        client.write(`DELETE ${serverCategory} ${id.trim()}`);
      }
    });

    return;
  }
  
  console.log('\n--- Respuesta del Servidor ---');
  console.log(response);
  console.log('------------------------------');
  setTimeout(showMenu, 500);
}

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

function showMenu() {
  console.log('\n--- MENÚ PRINCIPAL ---');
  console.log('1. Listar todos (GET /<CATEGORY>S)');
  console.log('2. Buscar por TÉRMINO/Nombre (GET <CATEGORY> <TERM>)');
  console.log('3. Buscar por ID (GET_ID <CATEGORY> <ID>)');
  console.log('4. Agregar (POST <CATEGORY>)');
  console.log('5. Editar (PUT <CATEGORY>)');
  console.log('6. Eliminar (DELETE <CATEGORY>)');
  console.log('0. Salir (EXIT)');
  console.log('----------------------\n');

  rl.question('Selecciona una opción: ', (option) => {
    switch (option.trim()) {
      case '1': askCategory('GET_ALL'); break; 
      case '2': askCategory('GET_TERM'); break;
      case '3': askCategory('GET_ID'); break;
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

function askCategory(command) {
  console.log('\n--- SELECCIONA UNA CATEGORÍA ---');
  console.log('1. Autor (AUTHOR)');
  console.log('2. Libro (BOOK)');
  console.log('3. Editorial (PUBLISHER)');
  console.log('4. Volver al menú principal');
  console.log('--------------------------------');

  rl.question('Elige una categoría (1-4): ', (option) => {
    let serverCategory = '';
    let clientCategory = '';
    switch (option.trim()) {
      case '1': serverCategory = 'AUTHOR'; clientCategory = 'autor'; break;
      case '2': serverCategory = 'BOOK'; clientCategory = 'libro'; break;
      case '3': serverCategory = 'PUBLISHER'; clientCategory = 'editorial'; break;
      case '4': showMenu(); return;
      default: console.log('Opción de categoría no válida.'); showMenu(); return;
    }

    if (command === 'GET_ALL') {
      client.write(`GET ${serverCategory}S`);
    } else if (command === 'GET_TERM') {
      askForTermOrIdToView('GET', serverCategory, clientCategory, false);
    } else if (command === 'GET_ID') {
      askForTermOrIdToView('GET_ID', serverCategory, clientCategory, true);
    } else if (command === 'POST') {
      askForNewItemData('POST', serverCategory, clientCategory);
    } else { 
      initiateMultiStepProcess(command, serverCategory, clientCategory);
    }
  });
}

function askForTermOrIdToView(command, serverCategory, clientCategory, isIdSearch) {
  let prompt = isIdSearch
    ? `Ingresa el ID completo del ${clientCategory} a buscar: `
    : (clientCategory === 'libro' ? 'Ingresa el Título o Término de Búsqueda: ' : 'Ingresa el Nombre o Término de Búsqueda: ');

  rl.question(prompt, (term) => {
    if (term.trim()) {
      client.write(`${command} ${serverCategory} ${term.trim()}`);
    } else {
      console.log('El parámetro no puede estar vacío.');
      showMenu();
    }
  });
}

function initiateMultiStepProcess(command, serverCategory, clientCategory) {
  const actionText = command === 'PUT' ? 'editar' : 'eliminar';
  const categoryText = clientCategory === 'libro' ? 'título' : 'nombre';
  
  rl.question(`Ingresa el ${categoryText} a buscar (para ${actionText} después): `, (term) => {
    if (!term.trim()) {
      console.log('Búsqueda cancelada. Volviendo al menú principal.');
      showMenu();
      return;
    }
    
    nextAction = { command, serverCategory }; 
    client.write(`GET ${serverCategory} ${term.trim()}`);
  });
}

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
