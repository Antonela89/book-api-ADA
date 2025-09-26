// Este es el archivo principal del CLIENTE. Es la interfaz con la que interactúa el usuario.
// Su trabajo es mostrar menús, pedir datos, construir los comandos y enviarlos al servidor.
// También se encarga de recibir las respuestas del servidor y mostrarlas.


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

    const currentAction = nextAction; // Guardamos la acción actual
    nextAction = null; // Reseteamos el estado INMEDIATAMENTE para la próxima respuesta.

    // Si la búsqueda falló, detenemos el flujo y volvemos al menú.
    // Usamos startsWith para ser más específicos. Nuestro formateador de errores usa "❌ Error:"
    if (response.startsWith('❌ Error:')) {
      console.log('\nLa búsqueda no produjo resultados. Volviendo al menú principal.');
      setTimeout(showMenu, 500); // Volvemos al menú
      return; // Detenemos la ejecución de esta función para no pedir el ID
    }

    // Si la búsqueda fue exitosa, continuamos con el siguiente paso.
    if (currentAction.command === 'eliminar') {
      rl.question(`\nIngresa el ID del/de la ${currentAction.category} a eliminar (de la lista de arriba): `, (id) => {
        if (id.trim()) {
          client.write(`eliminar ${currentAction.category} ${id.trim()}`)
        } else {
          // Si el usuario presiona Enter sin escribir nada, volvemos al menú.
          console.log('\nOperación cancelada. Volviendo al menú principal.');
          showMenu();
        }
      });
    } else if (currentAction.command === 'editar') {
      rl.question(`\nIngresa el ID del/de la ${currentAction.category} a editar (de la lista de arriba): `, (id) => {
        if (id.trim()) {
          if (currentAction.category === 'autor') askForUpdatedAuthorData(id.trim());
          else if (currentAction.category === 'editorial') askForUpdatedPublisherData(id.trim());
          else if (currentAction.category === 'libro') askForUpdatedBookData(id.trim());
        } else {
          console.log('\nOperación cancelada. Volviendo al menú principal.');
          showMenu();
        }
      });
    }
  } else {
    // Si no hay una acción pendiente, es una respuesta final a un comando.
    console.log('\n--- Respuesta del Servidor ---');
    console.log(response);
    console.log('----------------------------');
    setTimeout(showMenu, 500);
  }
}

// manejo de eventos del cliente
// conexion
client.connect(PORT, HOST, () => console.log('Conectado al servidor de la Biblioteca.'));
// evento data -> cuando recibe respuesta del servidor, aqui llamamos a la función central que maneja todas las respuestas
client.on('data', handleServerResponse);
// evento close -> cunado se cierra la conexión
client.on('close', () => {
  console.log('Desconectado del servidor.');
  rl.close();
  process.exit(0);
});
// evento error -> cuando ocurre un error en la conexión
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
  console.log('1. Listar por categoría');
  console.log('2. Buscar en una categoría');
  console.log('3. Ver por ID');
  console.log('4. Agregar a una categoría');
  console.log('5. Editar en una categoría');
  console.log('6. Eliminar de una categoría');
  console.log('0. Salir');
  console.log('----------------------');
  console.log('Puedes escribir "ayuda" para ver la lista de comandos detallada');
  console.log('----------------------\n');

  rl.question('Selecciona una opción: ', (option) => {
    switch (option.trim().toLowerCase()) {
      case '1': askCategory('listar'); break;
      case '2': askCategory('buscar'); break;
      case '3': askCategory('ver'); break;
      case '4': askCategory('agregar'); break;
      case '5': askCategory('editar'); break;
      case '6': askCategory('eliminar'); break;
      case '0': client.write('salir'); break;
      case 'ayuda': client.write('ayuda'); break;
      default:
        console.log('Opción no válida. Inténtalo de nuevo.');
        showMenu();
        break;
    }
  });
}

/**
 * Muestra un sub-menú para que el usuario elija la categoría con un número.
 * @param {string} command - La acción principal seleccionada (listar, buscar, etc.).
 */
function askCategory(command) {
  console.log('\n--- SELECCIONA UNA CATEGORÍA ---');
  console.log('1. Autor');
  console.log('2. Libro');
  console.log('3. Editorial');
  console.log('4. Volver al menú principal');
  console.log('--------------------------------');

  rl.question('Elige una categoría (1-4): ', (option) => {
    let serverCategory = '';
    switch (option.trim()) {
      case '1': serverCategory = 'autor'; break;
      case '2': serverCategory = 'libro'; break;
      case '3': serverCategory = 'editorial'; break;
      case '4':
        showMenu(); // Vuelve al menú principal
        return;
      default:
        console.log('Opción de categoría no válida.');
        showMenu();
        return;
    }

    // Una vez que tenemos la categoría, continuamos con el flujo original
    // Decide si es un comando de un paso o de varios (primero buscar y mostrar al usuario los datos y despues eliminar o editar)
//     if (command === 'listar' || command === 'agregar' || command === 'buscar') {
//       if (command === 'listar') {
//         const vowels = 'aeiou';
//         const lastChar = serverCategory.slice(-1);
//         const commandCategory = vowels.includes(lastChar) ? serverCategory + 's' : serverCategory + 'es';
//         client.write(`listar ${commandCategory}`);
//       }
//       if (command === 'agregar') askForNewItemData('agregar', serverCategory);
//       if (command === 'buscar') askSearchTerm('buscar', serverCategory);
//       if (command === 'ver') askForIdToView('ver', serverCategory);
//     } else { // Para editar y eliminar
//       initiateMultiStepProcess(command, serverCategory);
//     }

 const singleStepCommands = ['listar', 'buscar', 'ver', 'agregar'];

    if (singleStepCommands.includes(command)) {
      // Si el comando es de un solo paso, lo manejamos aquí
      switch (command) {
        case 'listar':
          const vowels = 'aeiou';
          const lastChar = serverCategory.slice(-1);
          const commandCategory = vowels.includes(lastChar) ? serverCategory + 's' : serverCategory + 'es';
          client.write(`listar ${commandCategory}`);
          break;
        case 'buscar':
          askSearchTerm('buscar', serverCategory);
          break;
        case 'ver':
          askForIdToView('ver', serverCategory);
          break;
        case 'agregar':
          askForNewItemData('agregar', serverCategory);
          break;
      }
    } else {
      // Si no, es un comando de varios pasos (editar, eliminar)
      initiateMultiStepProcess(command, serverCategory);
    }
  });

}

/**
 * Inicia un flujo de varios pasos pidiendo un término de búsqueda.
 * @param {string} command - El comando original ('editar' o 'eliminar').
 * @param {string} category - La categoría sobre la que se actúa.
 */
function initiateMultiStepProcess(command, category) {
  const prompt = category === 'libro' ? `Ingresa el título a ${command}: ` : `Ingresa el nombre a ${command}: `;
  rl.question(prompt, (term) => {
    // Establece la próxima acción y envía el comando de búsqueda.
    nextAction = { command, category };
    client.write(`buscar ${category} ${term.trim()}`);
  });
}

/**
 * Pide un término de búsqueda para un comando 'buscar' simple.
 * @param {string} command - El comando 'buscar'.
 * @param {string} category - La categoría en la que se busca.
 */
function askSearchTerm(command, category) {
  const prompt = category === 'libro' ? 'Ingresa el título a buscar: ' : 'Ingresa el nombre a buscar: ';
  rl.question(prompt, (term) => {
    client.write(`${command} ${category} ${term.trim()}`);
  });
}

/**
 * Pide al usuario el ID del ítem que desea ver.
 * @param {string} command - El comando 'ver'.
 * @param {string} category - La categoría del ítem a ver.
 */
function askForIdToView(command, category) {
  console.log(`\nINFO: Para ver un ítem específico, necesitas su ID. Puedes obtenerlo con la opción 'buscar'.`);
  rl.question(`Ingresa el ID del/de la ${category} a ver: `, (id) => {
    if (id.trim()) {
      client.write(`${command} ${category} ${id.trim()}`);
    } else {
      console.log('El ID no puede estar vacío.');
      showMenu();
    }
  });
}

/**
 * Guía al usuario para ingresar los datos de un nuevo ítem.
 * @param {string} command - El comando 'agregar'.
 * @param {string} category - La categoría del ítem a agregar.
 */
function askForNewItemData(command, category) {
  if (category === 'autor') {
    rl.question('Nombre del autor: ', (name) => {
      rl.question('Nacionalidad: ', (nationality) => {
        const data = { name, nationality };
        client.write(`${command} ${category} ${JSON.stringify(data)}`);
      });
    });
  } else if (category === 'editorial') {
    rl.question('Nombre de la editorial: ', (name) => {
      rl.question('País: ', (country) => {
        const data = { name, country };
        client.write(`${command} ${category} ${JSON.stringify(data)}`);
      });
    });
  } else if (category === 'libro') {
    // preguntamos por el título
    rl.question('Título del libro: ', (title) => {
      // preguntamos por el autor
      rl.question('Nombre exacto del autor: ', (authorName) => {
        // preguntamos por la editorial
        rl.question('Nombre exacto de la editorial: ', (publisherName) => {
          // preguntamos por el año de publicación
          rl.question('Año de publicación: ', (year) => {
            // preguntamos por el género
            rl.question('Género: ', (genre) => {
              // Construimos el objeto completo con los nuevos datos
              const data = {
                title,
                authorName,
                publisherName,
                // Convertimos el año a número, por si acaso
                year: parseInt(year, 10),
                genre
              };
              client.write(`${command} ${category} ${JSON.stringify(data)}`);
            });
          });
        });
      });
    });
  }
}

/**
 * Pide interactivamente los nuevos datos para un autor.
 * @param {string} id - El ID del autor a editar.
 */
function askForUpdatedAuthorData(id) {
  const updatedData = {};
  rl.question('Nuevo nombre (deja en blanco para no cambiar): ', (name) => {
    if (name.trim()) updatedData.name = name.trim();
    rl.question('Nueva nacionalidad (deja en blanco para no cambiar): ', (nationality) => {
      if (nationality.trim()) updatedData.nationality = nationality.trim();

      // Si el objeto no está vacío, significa que el usuario cambió al menos un campo.
      if (Object.keys(updatedData).length > 0) {
        client.write(`editar autor ${id} ${JSON.stringify(updatedData)}`);
      } else {
        console.log('No se realizaron cambios.');
        showMenu();
      }
    });
  });
}

/**
 * Pide interactivamente los nuevos datos para una editorial.
 * @param {string} id - El ID de la editorial a editar.
 */
function askForUpdatedPublisherData(id) {
  const updatedData = {};
  rl.question('Nuevo nombre (deja en blanco para no cambiar): ', (name) => {
    if (name.trim()) updatedData.name = name.trim();
    rl.question('Nuevo país (deja en blanco para no cambiar): ', (country) => {
      if (country.trim()) updatedData.country = country.trim();

      if (Object.keys(updatedData).length > 0) {
        client.write(`editar editorial ${id} ${JSON.stringify(updatedData)}`);
      } else {
        console.log('No se realizaron cambios.');
        showMenu();
      }
    });
  });
}

/**
 * Pide interactivamente los nuevos datos para un libro.
 * @param {string} id - El ID del libro a editar.
 */
function askForUpdatedBookData(id) {
  const updatedData = {};
  rl.question('Nuevo título (deja en blanco para no cambiar): ', (title) => {
    if (title.trim()) updatedData.title = title.trim();
    rl.question('Nuevo año de publicación (deja en blanco para no cambiar): ', (year) => {
      if (year.trim()) updatedData.year = parseInt(year.trim(), 10);
      rl.question('Nuevo género (deja en blanco para no cambiar): ', (genre) => {
        if (genre.trim()) updatedData.genre = genre.trim();

        if (Object.keys(updatedData).length > 0) {
          client.write(`editar libro ${id} ${JSON.stringify(updatedData)}`);
        } else {
          console.log('No se realizaron cambios.');
          showMenu();
        }
      });
    });
  });
}