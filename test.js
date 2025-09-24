// Este archivo es un script de pruebas automatizadas para nuestra API de Biblioteca.
// Su propósito es simular a un usuario enviando una secuencia predefinida de comandos
// al servidor para verificar que todas las funcionalidades (CRUD y errores) se comportan
// como se espera, sin necesidad de interacción manual.

// --- 1. IMPORTACIONES Y CONFIGURACIÓN ---
import net from 'net'; // Importamos el módulo 'net' para crear el cliente de prueba.

const PORT = 8080; // Puerto en el que el servidor está escuchando.
const HOST = '127.0.0.1'; // Dirección del servidor (nuestra propia máquina).

// --- 2. DATOS DE PRUEBA Y ESTADO ---
// Definimos los datos que usaremos para crear y actualizar un autor.
// Esto hace que las pruebas sean predecibles y consistentes.
const newAuthor = { name: "Autor de Prueba", nationality: "Digital" };
const updatedAuthor = { nationality: "Virtual" };

// Esta variable actuará como nuestra "memoria" para guardar el ID del autor que
// creemos durante la prueba, para poder usarlo en los pasos de ver, editar y eliminar.
let testAuthorId = '';

// --- 3. SECUENCIA DE PRUEBAS ---
// Este es el corazón del script. Es un array de objetos donde cada objeto
// representa un paso de la prueba.
const testSequence = [
  // --- Pruebas del "Happy Path" (cuando todo funciona bien) para Autores ---
  { description: "1. Listar autores iniciales", command: "listar autores" },
  {
    description: "2. Agregar un nuevo autor",
    command: `agregar autor ${JSON.stringify(newAuthor)}`,
    // 'onResponse' es una función especial que se ejecuta DESPUÉS de recibir la respuesta
    // de este comando. La usamos para "capturar" datos importantes como el nuevo ID.
    onResponse: (response) => {
      try {
        // Extraemos la parte JSON de la respuesta para poder parsearla.
        const jsonPart = response.substring(response.indexOf('{'));
        const jsonResponse = JSON.parse(jsonPart);
        // Si el objeto parseado tiene un 'id', lo guardamos en nuestra variable 'testAuthorId'.
        if (jsonResponse.id) {
          testAuthorId = jsonResponse.id;
          console.log(`[INFO] ID del autor de prueba capturado: ${testAuthorId}`);
        } else {
          console.log("[ERROR] El objeto de respuesta no contenía un ID.");
        }
      } catch (e) {
        console.log("[ERROR] No se pudo capturar el ID del nuevo autor de la respuesta.");
      }
    }
  },
  { description: "3. Verificar que el nuevo autor está en la lista", command: "listar autores" },
  { description: "4. Buscar el autor recién creado", command: `buscar autor ${newAuthor.name}` },
  // Usamos una función para 'command' cuando necesitamos construir el comando dinámicamente
  // con datos que obtuvimos en un paso anterior (como el 'testAuthorId').
  { description: "5. Ver los detalles del autor por su ID", command: () => `ver autor ${testAuthorId}` },
  { description: "6. Editar el autor recién creado", command: () => `editar autor ${testAuthorId} ${JSON.stringify(updatedAuthor)}` },
  { description: "7. Verificar los cambios viendo de nuevo al autor", command: () => `ver autor ${testAuthorId}` },
  { description: "8. Eliminar el autor de prueba", command: () => `eliminar autor ${testAuthorId}` },
  { description: "9. Verificar que el autor fue eliminado de la lista", command: "listar autores" },

  // --- Pruebas de Casos de Error (cuando las cosas deben fallar de forma controlada) ---
  { description: "10. Probar un comando desconocido", command: "comando-invalido" },
  { description: "11. Probar 'agregar' con JSON inválido", command: "agregar autor {esto-no-es-un-json}" },
  { description: "12. Probar 'buscar' sin término de búsqueda", command: "buscar autor" },
  { description: "13. Probar 'eliminar' un ID que no existe", command: "eliminar autor id-que-no-existe-123" },
  
  // --- Finalización de la prueba ---
  { description: "14. Finalizar la prueba", command: "salir" }
];

// --- 4. LÓGICA DE EJECUCIÓN DE PRUEBAS ---

let currentIndex = 0; // Contador para llevar la cuenta de en qué paso de la prueba estamos.
let isInitialMessage = true; // Flag para ignorar el primer mensaje de bienvenida del servidor.
let testsFinished = false; // Flag para evitar que el script procese más datos después de terminar.

const client = new net.Socket();

// Nos conectamos al servidor.
client.connect(PORT, HOST, () => {
  console.log('✅ Conectado al servidor para iniciar las pruebas...');
  // No hacemos nada más aquí; esperamos el mensaje de bienvenida.
});

// Este es el manejador de eventos principal. Se dispara CADA VEZ que el servidor envía datos.
client.on('data', (data) => {
  if (testsFinished) return; // Si ya terminamos, no hacemos nada.

  // Si es el primer mensaje, es la bienvenida. La ignoramos y empezamos la primera prueba.
  if (isInitialMessage) {
    console.log("--- [Mensaje de bienvenida recibido, iniciando pruebas] ---");
    isInitialMessage = false;
    runNextTest();
    return;
  }

  // Obtenemos la prueba actual de nuestra secuencia.
  const currentTest = testSequence[currentIndex];
  // Si no hay una prueba actual (porque ya terminamos), salimos para evitar un crash.
  if (!currentTest) {
    return;
  }
  
  // Mostramos en consola el resultado de la prueba actual.
  console.log(`\n--- [${currentTest.description}] ---`);
  const response = data.toString().trim();
  console.log(response);
  console.log('----------------------------------------------------');

  // Si la prueba actual tiene una función 'onResponse', la ejecutamos.
  if (currentTest.onResponse) {
    currentTest.onResponse(response);
  }

  // Avanzamos al siguiente índice para la próxima prueba.
  currentIndex++;
  // Llamamos a la función que ejecutará la siguiente prueba.
  runNextTest();
});

// Esta función controla el flujo, enviando un comando a la vez.
function runNextTest() {
  if (currentIndex < testSequence.length) {
    const currentTest = testSequence[currentIndex];
    // Obtenemos el comando. Si es una función, la ejecutamos para obtener el string.
    const commandToSend = typeof currentTest.command === 'function' ? currentTest.command() : currentTest.command;
    
    console.log(`\n▶️  Enviando comando #${currentIndex + 1}: "${commandToSend}"`);
    client.write(commandToSend);
  } else {
    // Si ya no hay más pruebas, finalizamos.
    console.log('\n🏁 Pruebas finalizadas.');
    testsFinished = true;
    client.end(); // Cierra la conexión.
  }
}

// Manejadores de eventos para el cierre de la conexión y errores.
client.on('close', () => console.log('🔌 Conexión cerrada.'));
client.on('error', (err) => console.error('❌ Error de conexión:', err.message));