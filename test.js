// Este archivo es un script de pruebas automatizadas. Su objetivo es actuar como un "robot"
// que prueba nuestra API para asegurarse de que todo funciona correctamente.

import net from 'net';

const PORT = 8080;
const HOST = '127.0.0.1';

// --- DATOS DE PRUEBA ---
// Los datos que se envían en el JSON no necesitan estar en mayúsculas, ya que nuestro controlador los normaliza.
const newAuthor = { name: "Autor de Prueba", nationality: "Digital" };
const updatedAuthor = { nationality: "Virtual" };
const existingAuthorName = "Jorge Luis Borges";
const authorWithBookId = "1d81f44c-95c8-4b7b-8018-b847c2a71c87";
let testAuthorId = '';

// --- SECUENCIA DE PRUEBAS ---
const testSequence = [
  { description: "1. Listar autores iniciales", command: "GET AUTHORS" },
  {
    description: "2. Agregar un nuevo autor de prueba",
    command: `POST AUTHOR ${JSON.stringify(newAuthor)}`,
    onResponse: (response) => {
      try {
        const jsonPart = response.substring(response.indexOf('{'));
        const jsonResponse = JSON.parse(jsonPart);
        if (jsonResponse.id) {
          testAuthorId = jsonResponse.id;
          console.log(`[INFO] ID del autor de prueba capturado: ${testAuthorId}`);
        } else { console.log("[ERROR] El objeto de respuesta no contenía un ID."); }
      } catch (e) { console.log("[ERROR] No se pudo capturar el ID del nuevo autor."); }
    }
  },
  { description: "3. Verificar que el nuevo autor está en la lista", command: "GET AUTHORS" },
  { description: "4. Buscar el autor recién creado", command: `SEARCH AUTHOR ${newAuthor.name}` },
  { description: "5. Ver los detalles del autor por su ID", command: () => `GET AUTHOR ${testAuthorId}` },
  { description: "6. Editar el autor recién creado", command: () => `PUT AUTHOR ${testAuthorId} ${JSON.stringify(updatedAuthor)}` },
  { description: "7. Verificar los cambios viendo de nuevo al autor", command: () => `GET AUTHOR ${testAuthorId}` },
  { description: "8. Eliminar el autor de prueba (debería funcionar)", command: () => `DELETE AUTHOR ${testAuthorId}` },
  { description: "9. Verificar que el autor fue eliminado de la lista", command: "GET AUTHORS" },

  // --- Pruebas de Reglas de Negocio ---
  {
    description: "10. Intentar agregar un autor que ya existe (debe ser rechazado)",
    command: `POST AUTHOR {"name":"${existingAuthorName}","nationality":"Argentina"}`
  },
  {
    description: "11. Intentar eliminar un autor con libros asociados (debe ser rechazado)",
    command: `DELETE AUTHOR ${authorWithBookId}`
  },

  // --- Pruebas de Casos de Error ---
  { description: "12. Probar un comando desconocido", command: "COMANDO-INVALIDO" },
  { description: "13. Probar 'POST' con un JSON mal formado", command: "POST AUTHOR {esto-no-es-un-json}" },
  { description: "14. Probar 'SEARCH' sin nada que buscar", command: "SEARCH AUTHOR" },
  { description: "15. Probar 'DELETE' con un ID que no existe", command: "DELETE AUTHOR id-que-no-existe-123" },
  
  // --- Finalización de la prueba ---
  { description: "16. Finalizar la prueba", command: "EXIT" }
];

// --- LÓGICA DE EJECUCIÓN (El "motor" de las pruebas) ---

let currentIndex = 0;
let isInitialMessage = true;
let testsFinished = false;

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log('✅ Conectado al servidor para iniciar las pruebas...');
});

client.on('data', (data) => {
  if (testsFinished) return;

  if (isInitialMessage) {
    console.log("--- [Mensaje de bienvenida recibido, iniciando pruebas] ---");
    isInitialMessage = false;
    runNextTest();
    return;
  }

  const currentTest = testSequence[currentIndex];
  if (!currentTest) return;
  
  console.log(`\n--- [${currentTest.description}] ---`);
  const response = data.toString().trim();
  console.log(response);
  console.log('----------------------------------------------------');

  if (currentTest.onResponse) {
    currentTest.onResponse(response);
  }

  currentIndex++;
  runNextTest();
});

function runNextTest() {
  if (currentIndex < testSequence.length) {
    const currentTest = testSequence[currentIndex];
    const commandToSend = typeof currentTest.command === 'function' ? currentTest.command() : currentTest.command;
    
    console.log(`\n▶️  Enviando comando #${currentIndex + 1}: "${commandToSend}"`);
    client.write(commandToSend);
  } else {
    console.log('\n🏁 Pruebas finalizadas.');
    testsFinished = true;
    client.end();
  }
}

client.on('close', () => console.log('🔌 Conexión cerrada.'));
client.on('error', (err) => console.error('❌ Error de conexión:', err.message));