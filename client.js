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
    return; // Salimos de la función aquí
  }

  // --- LÓGICA CORREGIDA: IF/ELSE para flujos mutuamente excluyentes ---
  if (nextAction) {
    // ESTAMOS EN MEDIO DE UN FLUJO DE VARIOS PASOS (EDITAR/ELIMINAR)
    console.log('\n--- Paso 1: Resultados de la Búsqueda ---');
    console.log(response);
    console.log('---------------------------------------');

    const currentAction = nextAction; // Guardamos la acción actual
    nextAction = null; // Reseteamos el estado INMEDIATAMENTE

    // Usamos startsWith para ser más específicos. Nuestro formateador de errores usa "❌ Error:"
    if (response.startsWith('❌ Error:')) {
      console.log('\nLa búsqueda no produjo resultados. Volviendo al menú principal.');
      setTimeout(showMenu, 500); // Volvemos al menú
      return; // Detenemos la ejecución de esta función para no pedir el ID
    }

    if (currentAction.command === 'eliminar') {
      rl.question(`\nIngresa el ID del/de la ${currentAction.category} a eliminar (de la lista de arriba): `, (id) => {
        if (id.trim()) client.write(`eliminar ${currentAction.category} ${id.trim()}`);
        else showMenu();
      });
    } else if (currentAction.command === 'editar') {
      rl.question(`\nIngresa el ID del/de la ${currentAction.category} a editar (de la lista de arriba): `, (id) => {
        if (id.trim()) {
          if (currentAction.category === 'autor') askForUpdatedAuthorData(id.trim());
          else if (currentAction.category === 'editorial') askForUpdatedPublisherData(id.trim());
          else if (currentAction.category === 'libro') askForUpdatedBookData(id.trim());
        } else {
          showMenu();
        }
      });
    }
  } else {
    // ESTA ES UNA RESPUESTA A UN COMANDO SIMPLE (LISTAR, AGREGAR, BUSCAR, O EL PASO FINAL DE EDITAR/ELIMINAR)
    console.log('\n--- Respuesta del Servidor ---');
    console.log(response);
    console.log('----------------------------');
    setTimeout(showMenu, 500);
  }
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
  console.log('1. Listar por categoría');
  console.log('2. Buscar en una categoría');
  console.log('3. Agregar a una categoría');
  console.log('4. Editar en una categoría');
  console.log('5. Eliminar de una categoría');
  console.log('6. Salir');
  console.log('----------------------');
  console.log('Puedes escribir "ayuda" para ver la lista de comandos detallada');
  console.log('----------------------\n');

  rl.question('Selecciona una opción: ', (option) => {
    switch (option.trim().toLowerCase()) {
      case '1': askCategory('listar'); break;
      case '2': askCategory('buscar'); break;
      case '3': askCategory('agregar'); break;
      case '4': askCategory('editar'); break;
      case '5': askCategory('eliminar'); break;
      case '6': client.write('salir'); break;
      case 'ayuda': client.write('ayuda'); break;
      default:
        console.log('Opción no válida. Inténtalo de nuevo.');
        showMenu();
        break;
    }
  });
}

function askCategory(command) {
  rl.question('¿Sobre qué categoría? (autor, libro, editorial): ', (category) => {
    category = category.trim().toLowerCase();
    let serverCategory = '';
    if (category.startsWith('autor')) serverCategory = 'autor';
    if (category.startsWith('libro')) serverCategory = 'libro';
    if (category.startsWith('editorial')) serverCategory = 'editorial';

    if (!serverCategory) {
      console.log('Categoría no válida.');
      showMenu();
      return;
    }

    if (command === 'listar' || command === 'agregar' || command === 'buscar') {
      if (command === 'listar') {
        const vowels = 'aeiou';
        const lastChar = serverCategory.slice(-1);
        const commandCategory = vowels.includes(lastChar) ? serverCategory + 's' : serverCategory + 'es';
        client.write(`listar ${commandCategory}`);
      }
      if (command === 'agregar') askForNewItemData('agregar', serverCategory);
      if (command === 'buscar') askSearchTerm('buscar', serverCategory);
    } else {
      initiateMultiStepProcess(command, serverCategory);
    }
  });
}

function initiateMultiStepProcess(command, category) {
  const prompt = category === 'libro' ? `Ingresa el título a ${command}: ` : `Ingresa el nombre a ${command}: `;
  rl.question(prompt, (term) => {
    nextAction = { command, category };
    client.write(`buscar ${category} ${term.trim()}`);
  });
}

function askSearchTerm(command, category) {
  const prompt = category === 'libro' ? 'Ingresa el título a buscar: ' : 'Ingresa el nombre a buscar: ';
  rl.question(prompt, (term) => {
    client.write(`${command} ${category} ${term.trim()}`);
  });
}

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