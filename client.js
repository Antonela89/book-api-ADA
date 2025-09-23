import net from 'net';
import readline from 'readline';

const PORT = 8080;
const HOST = '127.0.0.1';

const client = new net.Socket();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Bandera para evitar duplicar el menú cuando se empieza la conexión con el servidor
let isInitialConnection = true;

// Función para manejar la respuesta del servidor
function handleServerResponse(data) {
  // Si es el primer mensaje que recibimos, es el de bienvenida.
  if (isInitialConnection) {
    //Imprimimos el mensaje de bienvenida.
    console.log(data.toString().trim());

    // Cambiamos la bandera para que las próximas respuestas se manejen de forma normal.
    isInitialConnection = false;

    // MOSTRAMOS EL MENÚ POR PRIMERA VEZ, solo después de recibir la bienvenida.
    showMenu();
  } else {
    // A partir de aquí, todas son respuestas a comandos del usuario.
    console.log('\n--- Respuesta del Servidor ---');
    console.log(data.toString().trim());
    console.log('----------------------------');

    // Volvemos a mostrar el menú después de un breve instante.
    setTimeout(showMenu, 500);
  }
}

client.connect(PORT, HOST, () => {
  console.log('Conectado al servidor de la Biblioteca.');
});

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
  console.log('4. Eliminar de una categoría');
  console.log('5. Salir');
  console.log('----------------------');
  console.log('Puedes escribir "ayuda" para ver la lista de comandos detallada');
  console.log('----------------------\n');

  rl.question('Selecciona una opción: ', (option) => {
    switch (option.trim()) {
      case '1': askCategory('listar'); break;
      case '2': askCategory('buscar'); break;
      case '3': askCategory('agregar'); break;
      case '4': askCategory('eliminar'); break;
      case '5': client.write('salir'); break;
      case 'ayuda':
        client.write('ayuda');
        break;
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

    // Normalizamos la entrada para que coincida con lo que espera el servidor
    let serverCategory = '';
    if (category.startsWith('autor')) serverCategory = 'autor';
    if (category.startsWith('libro')) serverCategory = 'libro';
    if (category.startsWith('editorial')) serverCategory = 'editorial';

    if (!serverCategory) {
      console.log('Categoría no válida.');
      showMenu();
      return;
    }

    // El comando 'listar' usa plural, los demás singular
    const commandCategory = command === 'listar' ? serverCategory + 'es' : serverCategory;

    if (command === 'listar') {
      client.write(`${command} ${commandCategory}`);
    } else if (command === 'buscar') {
      askSearchTerm(command, serverCategory);
    } else if (command === 'agregar') {
      askForNewItemData(command, serverCategory);
    } else if (command === 'eliminar') {
      askForIdToDelete(command, serverCategory);
    }
  });
}

function askSearchTerm(command, category) {
  const prompt = category === 'libro' ? 'Ingresa el título a buscar: ' : 'Ingresa el nombre a buscar: ';
  rl.question(prompt, (term) => {
    client.write(`${command} ${category} ${term.trim()}`);
  });
}

function askForIdToDelete(command, category) {
  console.log(`\nINFO: Para eliminar, primero busca el/la ${category} para obtener su ID.`);
  // Sugerimos al usuario que busque primero
  setTimeout(() => {
    rl.question(`Ingresa el ID del/de la ${category} a eliminar: `, (id) => {
      client.write(`${command} ${category} ${id.trim()}`);
    });
  }, 500);
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
    rl.question('Título del libro: ', (title) => {
      rl.question('Nombre exacto del autor: ', (authorName) => {
        rl.question('Nombre exacto de la editorial: ', (publisherName) => {
          const data = { title, authorName, publisherName };
          client.write(`${command} ${category} ${JSON.stringify(data)}`);
        });
      });
    });
  }
}