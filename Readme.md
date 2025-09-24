# API de Gestión de Biblioteca (Trabajo Práctico Integrador)

Este proyecto es una aplicación de consola completa para la gestión de una biblioteca, desarrollada en Node.js. Consiste en un servidor TCP que maneja la lógica de negocio y la persistencia de datos, y un cliente de terminal interactivo que permite a los usuarios interactuar con la API de una manera intuitiva y guiada.

La aplicación sigue el patrón de diseño **Modelo-Vista-Controlador (MVC)** para una clara separación de responsabilidades y un código mantenible.

## ✨ Características Principales

*   **Gestión CRUD Completa:** Soporte para Crear, Leer, Actualizar y Eliminar (CRUD) para tres categorías de datos: Autores, Libros y Editoriales.
*   **Cliente de Consola Interactivo:** Una interfaz de usuario amigable con menús numéricos que guía al usuario a través de todas las operaciones, eliminando la necesidad de escribir comandos complejos o JSON manualmente.
*   **Persistencia de Datos:** La información se almacena de forma persistente en archivos `.json` locales, manejados por el servidor.
*   **Búsqueda Parcial e Insensible a Mayúsculas:** La funcionalidad de búsqueda permite encontrar ítems incluso si no se escribe el nombre completo.
*   **Manejo de Relaciones:** El sistema gestiona las relaciones entre libros, autores y editoriales (ej: al agregar un libro, se valida que el autor y la editorial existan).
*   **Script de Pruebas Automatizado:** Incluye un script (`test.js`) que ejecuta una secuencia de pruebas para verificar la funcionalidad completa del CRUD y el manejo de errores de la API.

## 🏛️ Arquitectura del Proyecto

El proyecto está estructurado siguiendo el patrón **Modelo-Vista-Controlador (MVC)** para garantizar un código organizado, desacoplado y fácil de mantener.

*   **`models/` (Modelo):** Es la capa de datos. Su única responsabilidad es interactuar directamente con los archivos `json`. Contiene toda la lógica para leer, escribir, buscar, actualizar y eliminar registros. No sabe nada sobre los comandos del usuario.
*   **`views/` (Vista):** Es la capa de presentación. Su única responsabilidad es tomar los datos que le pasa el controlador y darles un formato legible para la terminal (por ejemplo, crear las tablas de texto). No realiza ninguna lógica de negocio.
*   **`controllers/` (Controlador):** Es el "cerebro" de la aplicación. Actúa como intermediario, recibiendo las peticiones del servidor, pidiendo los datos necesarios al modelo, y pasando esos datos a la vista para que prepare la respuesta final. Aquí residen las reglas de negocio (ej: para agregar un libro, primero validar que el autor exista).
*   **`server.js`:** Actúa como el "enrutador" o punto de entrada. Escucha las conexiones TCP, interpreta los comandos básicos del cliente y los delega al controlador correspondiente.
*   **`client.js`:** Es la interfaz de usuario final. Mantiene una conexión persistente con el servidor y proporciona un menú interactivo para construir y enviar los comandos.

### Principio DRY y Reutilización de Código

Durante el desarrollo, se exploraron dos enfoques para la capa de Modelo:

1.  **Modelos Autónomos:** Cada modelo (`authorsModel.js`, `booksModel.js`) contiene toda su lógica de lectura/escritura de archivos. Es funcional pero introduce duplicación de código.
2.  **Fábrica de Modelos (Enfoque Ideal):** Se propone una solución más avanzada utilizando un módulo de utilidades (`utils/utils.js`) y una "fábrica" (`models/createDataModel.js`). Este enfoque centraliza toda la lógica CRUD genérica en un solo lugar, eliminando el código repetido y haciendo el sistema mucho más mantenible y escalable, adhiriéndose estrictamente al principio **DRY (Don't Repeat Yourself)**.

## 📂 Estructura de Archivos

```
book-api/
├── data/
│   ├── authors.json
│   ├── books.json
│   └── publishers.json
├── src/
│   ├── controllers/
│   │   ├── authorsController.js
│   │   ├── booksController.js
│   │   └── publishersController.js
│   ├── models/
│   │   ├── authorsModel.js
│   │   ├── booksModel.js
|   |   ├── createDataModel.js
│   │   └── publishersModel.js
│   └── views/
│       └── responseFormatter.js
├── .gitignore
├── client.js
├── package.json
├── package-lock.json
├── Readme.md
├── server.js
└── test.js
```

## 🚀 Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto.

### Prerrequisitos

*   [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
*   npm (generalmente se instala con Node.js)

### Pasos

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/Antonela89/book-api-ADA
    ```
2.  **Navega a la carpeta del proyecto:**
    ```bash
    cd book-api
    ```
3.  **Instala las dependencias:**
    Este proyecto solo requiere la librería `uuid` para generar identificadores únicos.
    ```bash
    npm install
    ```

## 🏃 Modo de Uso

La aplicación requiere dos terminales: una para el servidor y otra para el cliente.

### 1. Iniciar el Servidor

En tu primera terminal, ejecuta el siguiente comando para iniciar el servidor. Permanecerá en espera de conexiones.

```bash
npm start
```
o alternativamente:
```bash
node server.js
```
Verás un mensaje de confirmación: `Servidor TCP escuchando en el puerto 8080`.

### 2. Iniciar el Cliente Interactivo

En una **segunda terminal**, ejecuta el siguiente comando para iniciar el cliente y conectarte al servidor.

```bash
node client.js
```
Aparecerá el menú principal y podrás empezar a interactuar con la aplicación.

## 📝 Ejemplos de Uso (Cliente Interactivo)

El cliente te guiará a través de menús numéricos para realizar todas las acciones.

### Ejemplo: Agregar un nuevo autor

1.  En el menú principal, selecciona la opción `3` (Agregar a una categoría).
2.  En el sub-menú, selecciona `1` (Autor).
3.  El programa te pedirá: `Nombre del autor:`. Escribe el nombre y presiona Enter.
4.  Luego te pedirá: `Nacionalidad:`. Escribe la nacionalidad y presiona Enter.
5.  Recibirás una respuesta del servidor confirmando que el autor fue añadido, incluyendo su nuevo ID.

### Ejemplo: Editar un libro

1.  Primero, busca el libro para obtener su ID. Selecciona la opción `2` (Buscar), luego `2` (Libro), y escribe parte del título.
2.  El servidor te devolverá una tabla con los resultados y sus IDs. Copia el ID del libro que deseas editar.
3.  Vuelve al menú principal. Selecciona la opción `4` (Editar en una categoría), y luego `2` (Libro).
4.  El programa te pedirá: `Ingresa el ID del/de la libro a editar:`. Pega el ID que copiaste y presiona Enter.
5.  El cliente te guiará para ingresar los nuevos datos (título, año, género), permitiéndote dejar campos en blanco para no cambiarlos.
6.  Recibirás una confirmación del servidor.

## 🧪 Pruebas Automatizadas

El proyecto incluye un script de pruebas automatizado que verifica el ciclo CRUD completo para la categoría de autores y prueba varios casos de error.

### Cómo ejecutar las pruebas:

1.  Asegúrate de que el **servidor esté corriendo** en una terminal (`npm start`).
2.  En una **segunda terminal**, ejecuta el siguiente comando:
    ```bash
    node test.js
    ```
3.  La terminal mostrará el progreso de cada prueba, el comando enviado y la respuesta del servidor, finalizando con un resumen.

## 👥 Autores

*   Maria Gabriela Martinez Herrero 
*   Antonela Borgogno
