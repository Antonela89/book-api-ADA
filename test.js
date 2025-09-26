// Este archivo es un script de pruebas automatizadas. Su objetivo es actuar como un "robot"
// que prueba nuestra API para asegurarse de que todo funciona correctamente. En lugar de que
// una persona escriba los comandos a mano, este script los envía uno por uno y muestra
// los resultados.

// --- 1. IMPORTACIONES Y CONFIGURACIÓN ---

// Importamos el módulo 'net' de Node.js para poder crear un cliente TCP que se conecte a nuestro servidor.
import net from 'net';

// Definimos el puerto y la dirección del servidor. Deben ser los mismos que en server.js.
const PORT = 8080;
const HOST = '127.0.0.1'; // '127.0.0.1' significa "esta misma máquina".

// --- 2. DATOS DE PRUEBA ---

// Preparamos los datos que usaremos en las pruebas. Tenerlos aquí hace que las pruebas sean
// consistentes y fáciles de modificar.
const newAuthor = { name: "Autor de Prueba", nationality: "Digital" };
const updatedAuthor = { nationality: "Virtual" };
const existingAuthorName = "Jorge Luis Borges"; // Un autor que sabemos que está en los datos iniciales.
const authorWithBookId = "1d81f44c-95c8-4b7b-8018-b847c2a71c87"; // El ID de un autor que tiene libros asociados.

// Esta variable la usaremos como una "memoria" para guardar el ID del autor que creemos
// y así poder usarlo en los pasos siguientes de la prueba (ver, editar, eliminar).
let testAuthorId = '';

// --- 3. SECUENCIA DE PRUEBAS ---

// Creamos un array que es el "guion" de nuestra prueba. Cada objeto en el array es un paso.
const testSequence = [
  // --- Pruebas del "Camino Feliz" (cuando todo debe funcionar bien) ---
  { description: "1. Listar autores iniciales", command: "listar autores" },
  {
    description: "2. Agregar un nuevo autor de prueba",
    command: `agregar autor ${JSON.stringify(newAuthor)}`,
    // 'onResponse' es una función especial que se ejecuta justo después de recibir la respuesta
    // de este comando. La usamos para "leer" la respuesta y extraer datos.
    onResponse: (response) => {
      try {
        // Buscamos el inicio del JSON en la respuesta del servidor.
        const jsonPart = response.substring(response.indexOf('{'));
        // Convertimos ese texto JSON a un objeto de JavaScript.
        const jsonResponse = JSON.parse(jsonPart);
        // Si el objeto tiene una propiedad 'id', la guardamos en nuestra variable 'testAuthorId'.
        if (jsonResponse.id) {
          testAuthorId = jsonResponse.id;
          console.log(`[INFO] ID del autor de prueba capturado: ${testAuthorId}`);
        } else { console.log("[ERROR] El objeto de respuesta no contenía un ID."); }
      } catch (e) { console.log("[ERROR] No se pudo capturar el ID del nuevo autor de la respuesta."); }
    }
  },
  { description: "3. Verificar que el nuevo autor está en la lista", command: "listar autores" },
  { description: "4. Buscar el autor recién creado", command: `buscar autor ${newAuthor.name}` },
  // Usamos una función para el comando cuando necesita un valor dinámico, como el ID que acabamos de capturar.
  { description: "5. Ver los detalles del autor por su ID", command: () => `ver autor ${testAuthorId}` },
  { description: "6. Editar el autor recién creado", command: () => `editar autor ${testAuthorId} ${JSON.stringify(updatedAuthor)}` },
  { description: "7. Verificar los cambios viendo de nuevo al autor", command: () => `ver autor ${testAuthorId}` },
  { description: "8. Eliminar el autor de prueba (debería funcionar porque no tiene libros)", command: () => `eliminar autor ${testAuthorId}` },
  { description: "9. Verificar que el autor fue eliminado de la lista", command: "listar autores" },

  // --- Pruebas de Reglas de Negocio (comportamientos específicos que deben fallar) ---
  {
    description: "10. Intentar agregar un autor que ya existe (debe ser rechazado)",
    command: `agregar autor {"name":"${existingAuthorName}","nationality":"Argentina"}`
  },
  {
    description: "11. Intentar eliminar un autor con libros asociados (debe ser rechazado)",
    command: `eliminar autor ${authorWithBookId}`
  },

  // --- Pruebas de Casos de Error (cuando el usuario hace algo mal) ---
  { description: "12. Probar un comando desconocido", command: "comando-invalido" },
  { description: "13. Probar 'agregar' con un JSON mal formado", command: "agregar autor {esto-no-es-un-json}" },
  { description: "14. Probar 'buscar' sin nada que buscar", command: "buscar autor" },
  { description: "15. Probar 'eliminar' con un ID que no existe", command: "eliminar autor id-que-no-existe-123" },
  
  // --- Finalización de la prueba ---
  { description: "16. Finalizar la prueba", command: "salir" }
];

// --- 4. LÓGICA DE EJECUCIÓN (El "motor" de las pruebas) ---

let currentIndex = 0; // Un contador para saber por cuál paso de la prueba vamos.
let isInitialMessage = true; // Una bandera para saber si ya recibimos el mensaje de bienvenida.
let testsFinished = false; // Una bandera para detener el script cuando las pruebas terminen.

const client = new net.Socket();

// Se conecta al servidor.
client.connect(PORT, HOST, () => {
  console.log('✅ Conectado al servidor para iniciar las pruebas...');
  // No enviamos el primer comando aquí, esperamos el mensaje de bienvenida.
});

// Esta función se ejecuta CADA VEZ que el servidor nos envía un mensaje.
client.on('data', (data) => {
  if (testsFinished) return; // Si ya terminamos, ignoramos cualquier dato extra.

  // Si es el primer mensaje (bienvenida), lo ignoramos y empezamos las pruebas.
  if (isInitialMessage) {
    console.log("--- [Mensaje de bienvenida recibido, iniciando pruebas] ---");
    isInitialMessage = false;
    runNextTest();
    return;
  }

  // Obtenemos la descripción y el comando del paso actual de la prueba.
  const currentTest = testSequence[currentIndex];
  if (!currentTest) return; // Seguridad para evitar un crash al final.
  
  // Mostramos los resultados en la consola.
  console.log(`\n--- [${currentTest.description}] ---`);
  const response = data.toString().trim();
  console.log(response);
  console.log('----------------------------------------------------');

  // Si este paso de la prueba tenía una función 'onResponse', la ejecutamos ahora.
  if (currentTest.onResponse) {
    currentTest.onResponse(response);
  }

  // Pasamos al siguiente paso de la prueba.
  currentIndex++;
  // Llamamos a la función para que envíe el siguiente comando.
  runNextTest();
});

// Esta función es el "director de orquesta": envía un comando a la vez.
function runNextTest() {
  if (currentIndex < testSequence.length) {
    const currentTest = testSequence[currentIndex];
    // Obtenemos el comando. Si es una función, la llamamos para obtener el string.
    const commandToSend = typeof currentTest.command === 'function' ? currentTest.command() : currentTest.command;
    
    console.log(`\n▶️  Enviando comando #${currentIndex + 1}: "${commandToSend}"`);
    client.write(commandToSend); // Enviamos el comando al servidor.
  } else {
    // Si ya no hay más pasos en nuestro "guion", terminamos.
    console.log('\n🏁 Pruebas finalizadas.');
    testsFinished = true;
    client.end(); // Cerramos la conexión.
  }
}

// Manejadores para eventos de cierre y error de la conexión.
client.on('close', () => console.log('🔌 Conexión cerrada.'));
client.on('error', (err) => console.error('❌ Error de conexión:', err.message));