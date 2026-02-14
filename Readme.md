# API de Gestión de Biblioteca (Trabajo Práctico Integrador)

Este proyecto es una aplicación de consola completa para la gestión de una biblioteca, desarrollada en Node.js. Consiste en un servidor TCP que maneja la lógica de negocio y la persistencia de datos, y un cliente de terminal interactivo que permite a los usuarios interactuar con la API de una manera intuitiva y guiada.

La aplicación sigue el patrón de diseño **Modelo-Vista-Controlador (MVC)** para una clara separación de responsabilidades y un código mantenible.

## ✨ Características Principales

- **Gestión CRUD Completa:** Soporte para Crear, Leer (listar y ver por ID), Actualizar y Eliminar para tres categorías: Autores, Libros y Editoriales.
- **Cliente de Consola Interactivo:** Interfaz de usuario amigable con menús numéricos que guía al usuario a través de todas las operaciones, eliminando la necesidad de escribir comandos complejos o JSON.
- **Persistencia de Datos:** La información se almacena en archivos `.json` locales.
- **Búsqueda Inteligente:** Búsqueda parcial e insensible a mayúsculas y minúsculas.
- **Reglas de Negocio Robustas:**
  - **Prevención de Duplicados:** No permite agregar autores, libros o editoriales con nombres/títulos idénticos.
  - **Restricción de Eliminación:** Protege la integridad de los datos impidiendo que se elimine un autor o editorial si tienen libros asociados.
- **Script de Pruebas Automatizado:** Incluye un script (`test.js`) que ejecuta una secuencia de pruebas para verificar la funcionalidad completa del CRUD y las reglas de negocio.

---

## 🏛️ Arquitectura del Proyecto

El proyecto está estructurado siguiendo el patrón **Modelo-Vista-Controlador (MVC)**.

- **`models/` (Modelo):** La capa de datos, responsable de interactuar directamente con los archivos `json`.
- **`views/` (Vista):** La capa de presentación (`responseFormatter.js`), responsable de formatear los datos para la terminal.
- **`controllers/` (Controlador):** El "cerebro" de la aplicación. Contiene la lógica de negocio y orquesta el flujo entre el Modelo y la Vista.
- **`server.js`:** Actúa como el enrutador. Escucha las conexiones TCP y delega las peticiones al controlador adecuado.
- **`client.js`:** La interfaz de usuario. Mantiene una conexión persistente y proporciona un menú interactivo.

### Principio DRY y Reutilización de Código

La solución implementada se adhiere estrictamente al principio DRY (Don't Repeat Yourself) mediante el uso extensivo de la carpeta src/utils/:

1. **Para los Modelos:** Se utiliza una "fábrica" (src/models/createDataModel.js) que centraliza toda la lógica de acceso a archivos, haciendo que los modelos individuales sean simples y declarativos.

2. **Para los Controladores:** Se extrajo la lógica común de manipulación de datos (como el formateo de texto y el parseo de objetos de entrada) a módulos como formatters.js y objectUtils.js. Esto limpia los controladores, permitiéndoles centrarse exclusivamente en las reglas de negocio.

---

## 📂 Estructura de Archivos

```
API-ADA/
├── .gitignore
├── client.js               # Interfaz de usuario interactiva
├── package-lock.json
├── package.json
├── README.md               # Documentación principal
├── server.js               # Punto de entrada del servidor TCP
├── test.js                 # Script de pruebas automatizadas
├── docs/
│   ├── img/                # Carpeta para imágenes de la documentación
│   └── documentacion.md    # Documentación técnica detallada
└── src/
    ├── controllers/
    │   ├── authorsController.js
    │   ├── booksController.js
    │   └── publishersController.js
    ├── data/
    │   ├── authors.json
    │   ├── books.json
    │   └── publishers.json
    ├── models/
    │   ├── authorsModel.js
    │   ├── booksModel.js
    │   ├── createDataModel.js
    │   └── publishersModel.js
    ├── utils/
    │   ├── formatters.js
    │   ├── objectUtils.js
    │   └── utils.js
    └── views/
        └── responseFormatter.js
```

---

## 🚀 Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto.

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- npm (incluido con Node.js)

### Pasos

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/Antonela89/book-api-ADA
    ```
2.  **Navega a la carpeta del proyecto:**
    ```bash
    cd book-api-ADA
    ```
3.  **Instala las dependencias:**
    Este proyecto solo requiere la librería `uuid`.
    ```bash
    npm install
    ```

---

## 🏃 Modo de Uso

La aplicación requiere dos terminales: una para el servidor y otra para el cliente.

### 1. Iniciar el Servidor

En tu primera terminal, ejecuta el siguiente comando.

```bash
npm start
```

o alternativamente:

```bash
node server.js
```

Verás un mensaje de confirmación: `Servidor TCP escuchando en el puerto 8080`.

### 2. Iniciar el Cliente Interactivo

En una **segunda terminal**, ejecuta el siguiente comando para conectarte al servidor.

```bash
node client.js
```

Aparecerá el menú principal para empezar a interactuar con la aplicación.

---

## 🚀 Prueba Interactiva Online (Replit)

Si no quieres clonar el repositorio, puedes probar la aplicación directamente en tu navegador:

1. Entra a este enlace: [https://replit.com/@AntonelaBorgogn/book-api-ADA]
2. Haz clic en el botón verde **"Run"** en la parte superior.
3. El servidor se iniciará automáticamente y, tras un par de segundos, aparecerá el **menú interactivo** en la consola de la derecha.
4. ¡Interactúa con el menú usando los números de tu teclado!

---

## 🧪 Pruebas Automatizadas

El proyecto incluye un script que prueba automáticamente el ciclo CRUD y las reglas de negocio.

### Cómo ejecutar las pruebas:

1.  Asegúrate de que el **servidor esté corriendo** en una terminal.
2.  En una **segunda terminal**, ejecuta:
    ```bash
    node test.js
    ```
3.  La terminal mostrará el progreso y el resultado de cada prueba.

---

## 🛠️ Tecnologías Usadas

<p>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/TCP%20(Net%20Module)-0078D4?style=for-the-badge&logo=windows&logoColor=white" alt="Módulo Net"/>
  <img src="https://img.shields.io/badge/Console%20I/O%20(Readline)-52994B?style=for-the-badge&logo=node.js&logoColor=white" alt="Módulo Readline"/>
  <img src="https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white" alt="JSON"/>
  <img src="https://img.shields.io/badge/UUID-6B5B95?style=for-the-badge&logo=uuid&logoColor=white" alt="UUID"/>
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git"/>
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</p>

---

## 🧑‍💻 Autoras

| Nombre                 | LinkedIn                                                            | GitHub                                      |
| ---------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| **BORGOGNO, Antonela** | [antonela-borgogno](https://www.linkedin.com/in/antonela-borgogno/) | [Antonela89](https://github.com/Antonela89) |
| **MARTINEZ, Gabriela** | [magamahe](https://www.linkedin.com/in/magamahe/)                   | [magamahe](https://github.com/magamahe)     |

---

## 📄 Institución Académica

<p align="center">
  <img src="docs/img/logo_ada.png" alt="Logo ADA" width="200"/>
</p>
<p align="center">
  Programa de formación en desarrollo web, Cohorte intro-js-202504
  <br>
  Proyecto educativo sin fines comerciales. Todos los derechos reservados © 2025.
</p>
