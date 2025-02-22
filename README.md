# **📌 Documentación Completa del Proyecto WebApp de Validación de DAGs de Airflow**

## **🔹 Introducción**

Esta documentación detalla la arquitectura, funcionalidad y configuración de la WebApp de Validación de DAGs de Airflow. La aplicación permite a los usuarios cargar y validar DAGs de Airflow sin necesidad de ejecutar el servicio de Airflow, utilizando funciones como `DagBag` y el parser de Airflow.

La aplicación se compone de dos partes principales:

*   **Backend:** Desarrollado con FastAPI, se encarga de recibir los archivos DAG, validarlos y retornar los resultados en formato JSON.
*   **Frontend:** Construido con Vite, React y Tailwind CSS, proporciona una interfaz de usuario para subir los DAGs y visualizar los resultados de la validación.

---

## **📌 Arquitectura del Proyecto**

La arquitectura del proyecto sigue un patrón cliente-servidor, donde el frontend actúa como cliente y el backend como servidor. La comunicación entre ambos se realiza a través de una API REST.

```
/webapp
 ├── /backend
 │   ├── main.py               # Punto de entrada del backend (FastAPI)
 │   ├── dag_validator.py      # Lógica para validar DAGs
 │   ├── requirements.txt      # Dependencias
 │   ├── documentacion-backend.md # Documentación del backend
 │   ├── /tests                # Pruebas del backend
 │   ├── /dags                 # Carpeta donde se guardarán los DAGs subidos
 ├── /frontend
 │   ├── /src
 │   │   ├── App.jsx           # Componente principal
 │   │   ├── App.css           # Estilos globales
 │   │   ├── main.jsx          # Punto de entrada de React
 │   │   ├── index.css         # Estilos globales
 │   │   ├── /pages            # Páginas principales
 │   │   │   ├── Home.jsx      # Página de inicio
 │   │   │   ├── Upload.jsx    # Página para cargar DAGs
 │   │   │   ├── Validate.jsx  # Página de validación
 │   │   ├── /components       # Componentes reutilizables
 │   │   │   ├── Navbar.jsx    # Barra de navegación
 │   ├── package.json          # Dependencias de React
 │   ├── tailwind.config.js    # Configuración de Tailwind
 │   ├── postcss.config.js    # Configuración de PostCSS
 │   ├── index.html          # Página principal
 │   ├── vite.config.js        # Configuración de Vite
 ├── /docs
 │   ├── INSTRUCCIONES.md      # Guía de instalación y uso
 │   ├── CHANGELOG.md          # Registro de cambios
 ├── Etapas de Desarrollo.md   # Etapas de desarrollo del proyecto
 ├── Estructura del Proyecto.md   # Estructura del proyecto
```

---

## **📌 Backend (FastAPI)**

### **⚙️ Funcionalidad**

El backend, desarrollado con FastAPI, tiene las siguientes funciones principales:

1.  **Recibir archivos DAG:** A través de un endpoint (`/validate_dag/`), el backend recibe archivos DAG en formato `.py` desde el frontend.
2.  **Guardar archivos DAG:** Los archivos recibidos se guardan temporalmente en la carpeta `/dags`.
3.  **Validar DAGs:** Utiliza el módulo `dag_validator.py` para validar la sintaxis y estructura del DAG.
4.  **Retornar resultados:** Devuelve una respuesta estructurada en JSON, indicando si el DAG es válido o, en caso contrario, los errores encontrados.

### **🛠️ Instalación y Configuración**

1.  **Requisitos Previos:**
    *   WSL2 Ubuntu 22.04 (si estás en Windows).
    *   Python 3.9+.
    *   Pip y Virtualenv.
    *   FastAPI y Uvicorn.
    *   Apache Airflow 2.5 (sin ejecutar el servicio).
2.  **Instalación:**

    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```
3.  **Iniciar el Backend:**

    ```bash
    uvicorn main:app --reload
    ```

    Esto iniciará el backend en `http://127.0.0.1:8000`.

### **📂 Estructura de Archivos**

*   **`main.py`:** Punto de entrada de la API FastAPI. Define las rutas y gestiona la recepción y validación de DAGs.
*   **`dag_validator.py`:** Módulo que contiene la lógica para validar los DAGs, incluyendo la verificación de sintaxis con `ast` y la validación de la estructura con `DagBag`.
*   **`requirements.txt`:** Lista de dependencias necesarias para ejecutar el backend.
*   **`/dags`:** Carpeta donde se guardan los DAGs subidos para su validación.
*   **`/tests`:** (Opcional) Carpeta para pruebas unitarias del backend.

### **🔑 Explicación de los Archivos Clave**

#### **`main.py`**

Este archivo es el punto de entrada de la API FastAPI. Define las rutas y gestiona la recepción y validación de DAGs.

*   **Funcionalidad:**
    *   Recibe archivos DAG `.py` desde el frontend.
    *   Guarda los archivos en la carpeta `/dags`.
    *   Llama a `dag_validator.py` para analizar y validar el DAG.
    *   Devuelve el resultado en formato JSON.
*   **Endpoints:**

    *   `@app.get("/")`
    *   `@app.post("/validate_dag/")`

#### **`dag_validator.py`**

Este módulo contiene la lógica para validar los DAGs.

*   **Funcionalidad:**
    *   Verifica si el código tiene errores de sintaxis con `ast`.
    *   Usa `DagBag` para validar la estructura del DAG en Airflow.
    *   Extrae errores y los formatea para una mejor comprensión.
*   **Funciones principales:**

    *   `validate_python_syntax(file_path)`: Valida la sintaxis de Python.
    *   `validate_dag(file_path)`: Valida la estructura del DAG en Airflow.

### **💻 Uso de la API**

1.  **Probar en el Navegador:**

    Abrir `http://127.0.0.1:8000/docs` para probar la API con Swagger UI.
2.  **Subir un DAG y Validarlo:**

    Ejemplo de petición con `curl`:

    ```bash
    curl -X 'POST' 'http://127.0.0.1:8000/validate_dag/' \
     -F 'file=@simple_dag.py'
    ```

    Ejemplo de respuesta si el DAG es válido:

    ```json
    {
      "valid": true,
      "message": "El DAG es válido."
    }
    ```

    Ejemplo de respuesta si hay errores:

    ```json
    {
      "valid": false,
      "error": {
        "type": "SyntaxError",
        "line": 5,
        "message": "invalid syntax",
        "file": "invalid_dag.py"
      }
    }
    ```

### **📄 Ejemplo de `main.py`**

```python:backend/main.py
startLine: 1
endLine: 39
```

### **📄 Ejemplo de `dag_validator.py`**

```python:backend/dag_validator.py
startLine: 1
endLine: 28
```

---

## **📌 Frontend (React + Vite)**

### **⚙️ Funcionalidad**

El frontend proporciona una interfaz de usuario intuitiva para:

1. **Subir archivos DAG:** A través del componente `Upload.jsx`.
2. **Validar DAGs:** Comunicación con el backend mediante API REST.
3. **Mostrar resultados:** Visualización estructurada de éxitos y errores.
4. **Manejo de errores:** Sistema robusto para diferentes tipos de errores:
   - Errores de sintaxis Python
   - Errores de validación de Airflow
   - Errores de comunicación con el servidor

### **🛠️ Instalación y Configuración**

1.  **Requisitos Previos:**
    *   Node.js versión 18 o superior.
    *   npm o yarn instalado.
    *   Backend en ejecución (`uvicorn main:app --reload`).
2.  **Instalación:**

    ```bash
    cd frontend
    npm install
    ```
3.  **Iniciar el Frontend:**

    ```bash
    npm run dev
    ```

    Esto iniciará el frontend en `http://localhost:5173`.

### **📂 Estructura de Archivos**

*   **`App.jsx`:** Componente principal de la aplicación. Define las rutas y la estructura general.
*   **`main.jsx`:** Punto de entrada de React.
*   **`index.css`:** Estilos globales de Tailwind CSS.
*   **`App.css`:** Estilos específicos de la aplicación.
*   **`/pages`:**
    *   `Home.jsx`: Página de inicio.
    *   `Upload.jsx`: Página para subir DAGs.
    *   `Validate.jsx`: Página para mostrar los resultados de la validación.
*   **`/components`:**
    *   `Navbar.jsx`: Barra de navegación.
*   **`package.json`:** Dependencias de React.
*   **`tailwind.config.js`:** Configuración de Tailwind CSS.
*   **`postcss.config.cjs`:** Configuración de PostCSS.
*   **`index.html`:** Página principal HTML.
*   **`vite.config.js`:** Configuración de Vite.

### **🔑 Explicación de los Archivos Clave**

#### **`App.jsx`**

Este archivo es el componente principal de la aplicación.

*   **Funcionalidad:**
    *   Define las rutas principales con `react-router-dom`.
    *   Incluye el `Navbar` y las páginas de la app.

```javascript:frontend/src/App.jsx
startLine: 1
endLine: 24
```

#### **`Navbar.jsx`**

Este archivo define la barra de navegación.

*   **Funcionalidad:**
    *   Barra de navegación con enlaces a las secciones principales.

```javascript:frontend/src/App.jsx
startLine: 1
endLine: 7
```

#### **`Upload.jsx`**

Este archivo contiene la lógica para subir archivos DAG.

*   **Funcionalidad:**
    *   Permite seleccionar un archivo DAG desde el sistema de archivos.
    *   Muestra el contenido del archivo DAG.
    *   Envía el archivo DAG al backend para su validación.

#### **`Validate.jsx`**

Este archivo muestra los resultados de la validación.

*   **Funcionalidad:**
    *   Recibe los resultados de la validación desde el backend.
    *   Muestra un mensaje indicando si el DAG es válido o no.
    *   Si el DAG no es válido, muestra los errores detallados.

### **🎨 Estilos con Tailwind CSS**

El frontend utiliza Tailwind CSS para los estilos. Tailwind CSS es un framework CSS utility-first que permite crear interfaces de usuario de forma rápida y sencilla.

*   **`tailwind.config.js`:** Este archivo contiene la configuración de Tailwind CSS. Define las rutas de los archivos que se van a escanear para aplicar los estilos de Tailwind.

    ```javascript
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    };
    ```

*   **`index.css`:** Este archivo importa los estilos base de Tailwind CSS.

    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

### **💻 Uso del Frontend**

1.  **Subir un DAG y Validarlo:**

    Desde la página `Upload.jsx`, se envía un archivo al backend para su validación.

    ```javascript
    const handleUpload = async () => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch("http://127.0.0.1:8000/validate_dag/", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        console.log(result);
      } catch (error) {
        console.error("Error al subir el DAG:", error);
      }
    };
    ```

    El resultado se muestra en `Validate.jsx`.

---

## **📌 Flujo de Validación**

1.  El usuario sube un archivo DAG a través del frontend (`Upload.jsx`).
2.  El frontend envía el archivo al backend (`/validate_dag/`).
3.  El backend guarda el archivo en la carpeta `/dags`.
4.  El backend llama a la función `validate_dag` en `dag_validator.py` para validar el DAG.
5.  `validate_dag` utiliza `validate_python_syntax` para verificar la sintaxis de Python.
6.  `validate_dag` utiliza `DagBag` para validar la estructura del DAG en Airflow.
7.  El backend retorna el resultado de la validación en formato JSON.
8.  El frontend recibe el resultado y lo muestra en la página `Validate.jsx`.

---

## **📌 Conclusión**

Esta documentación proporciona una visión completa de la WebApp de Validación de DAGs de Airflow. Describe la arquitectura, funcionalidad, configuración y uso de la aplicación, así como la estructura de archivos y el flujo de validación. Esta información es esencial para el mantenimiento, la mejora y la expansión de la aplicación en el futuro.



# **📌 Documentación Técnica y Funcional del Backend**

## **🔹 Introducción**
Este documento detalla el funcionamiento del backend desarrollado en **FastAPI** para la validación de **DAGs de Airflow 2.5**.
El backend permite cargar, validar y analizar DAGs sin ejecutar el servicio de Airflow, utilizando funciones como **DagBag** y el **parser de Airflow**.

---

## **📌 Funcionalidad del Backend**

El backend tiene dos funciones principales:
1. **Validación de sintaxis Python**: Verifica si el DAG contiene errores de sintaxis utilizando `ast`.
2. **Validación con Airflow**: Usa `DagBag` para verificar si el DAG es estructuralmente correcto y puede ser ejecutado en Airflow.

Toda la comunicación se realiza a través de una **API REST**, que recibe archivos DAG en formato `.py`, los valida y devuelve una respuesta estructurada en JSON.

---

## **📌 Instalación y Configuración**
### **1️⃣ Requisitos Previos**
- **WSL2 Ubuntu 22.04** (Si estás en Windows).
- **Python 3.9+**.
- **Pip** y **Virtualenv**.
- **FastAPI y Uvicorn** para el servidor web.
- **Apache Airflow 2.5** (pero sin ejecutar el servicio).

### **2️⃣ Instalación del Backend**
Ejecuta los siguientes comandos:
```bash
cd backend
python3 -m venv venv  # Crear entorno virtual
source venv/bin/activate  # Activar entorno virtual
pip install -r requirements.txt  # Instalar dependencias
```

### **3️⃣ Iniciar el Backend**
Ejecuta:
```bash
uvicorn main:app --reload
```
Esto iniciará el backend en `http://127.0.0.1:8000`.

### **4️⃣ Configuración de CORS**
El backend está configurado para permitir peticiones desde el frontend mediante CORS (Cross-Origin Resource Sharing):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Esta configuración permite:
- Peticiones desde el frontend (puerto 5173)
- Todos los métodos HTTP
- Todas las cabeceras HTTP
- Credenciales en las peticiones

---

## **📌 Estructura del Proyecto**
```
/backend
 ├── main.py               # Punto de entrada de la API
 ├── dag_validator.py      # Módulo de validación de DAGs
 ├── requirements.txt      # Dependencias del proyecto
 ├── /dags                 # Carpeta donde se guardan los DAGs subidos
 ├── /tests                # (Opcional) Pruebas unitarias
```

---

## **📌 Explicación de los Archivos**

### **📂 `main.py` (Punto de entrada de FastAPI)**
**Funcionalidad:**
- Configura CORS para permitir peticiones desde el frontend
- Recibe archivos DAG `.py` desde el frontend
- Guarda los archivos en la carpeta `/dags`
- Llama a `dag_validator.py` para analizar y validar el DAG
- Devuelve el resultado en formato JSON

**Endpoints:**
```python
@app.get("/")
@app.post("/validate_dag/")  # Recibe el DAG y lo valida
```

---

### **📂 `dag_validator.py` (Validación de DAGs)**
**Funcionalidad:**
- Verifica si el código tiene errores de sintaxis con `ast`.
- Usa `DagBag` para validar la estructura del DAG en Airflow.
- Extrae errores y los formatea para una mejor comprensión.

**Funciones principales:**
```python
def validate_python_syntax(file_path):  # Valida sintaxis Python
def validate_dag(file_path):  # Valida estructura Airflow
```

---

## **📌 Uso de la API**
### **1️⃣ Probar en el Navegador**
Abrir `http://127.0.0.1:8000/docs` para probar la API con Swagger UI.

### **2️⃣ Subir un DAG y Validarlo**
Ejemplo de petición con **`curl`**:
```bash
curl -X 'POST' 'http://127.0.0.1:8000/validate_dag/' \
 -F 'file=@simple_dag.py'
```

Ejemplo de respuesta si el DAG es válido:
```json
{
  "valid": true,
  "message": "El DAG es válido."
}
```

Ejemplo de respuesta si hay errores:
```json
{
  "valid": false,
  "error": {
    "type": "SyntaxError",
    "line": 5,
    "message": "invalid syntax",
    "file": "invalid_dag.py"
  }
}
```

### **📌 Formato de Respuestas**

El backend proporciona respuestas estructuradas en JSON con los siguientes formatos:

**1. Validación Exitosa:**
```json
{
  "valid": true,
  "message": "El DAG es válido."
}
```

**2. Error de Sintaxis Python:**
```json
{
  "valid": false,
  "error": {
    "type": "SyntaxError",
    "line": 5,
    "message": "invalid syntax",
    "file": "invalid_dag.py"
  }
}
```

**3. Error de Validación Airflow:**
```json
{
  "valid": false,
  "error": {
    "type": "Airflow DAG ImportError",
    "details": [
      {
        "message": "Descripción del error",
        "file": "nombre_del_dag.py"
      }
    ]
  }
}
```

Esta estructura de respuesta permite al frontend mostrar mensajes de error detallados y útiles para el usuario.

---

## **📌 Conclusión**
El backend proporciona una API eficiente para validar DAGs sin ejecutar Airflow, mejorando el flujo de trabajo y evitando errores antes de subirlos al servidor.

---



# **📌 Documentación Técnica y Funcional del Frontend**

## **🔹 Introducción**
Este documento describe en detalle la configuración, estructura y funcionamiento del **frontend** de la aplicación web de validación de DAGs de Airflow.

El frontend está construido con **Vite + React + Tailwind CSS**, y se comunica con el backend mediante **FastAPI**.

---

## **📌 Instalación y Configuración**
### **1️⃣ Requisitos Previos**
- **Node.js** versión 18 o superior.
- **npm** o **yarn** instalado.
- **Backend en ejecución** (`uvicorn main:app --reload`).

### **2️⃣ Instalación del Frontend**
Ejecuta los siguientes comandos:
```bash
cd frontend
npm install  # Instala las dependencias
npm install react-hot-toast @heroicons/react  # Componentes adicionales para notificaciones y iconos
```

### **3️⃣ Iniciar el Frontend**
```bash
npm run dev
```
Esto iniciará el frontend en `http://localhost:5173`.

---

## **📌 Estructura del Proyecto**
```
/frontend
 ├── /src
 ├── App.jsx            # Componente principal
 ├── main.jsx           # Punto de entrada de React
 ├── index.css          # Estilos globales de Tailwind
 ├── App.css            # Estilos específicos de la app
 ├── /pages             # Páginas principales
 ├── Home.jsx       # Página de inicio
 ├── Upload.jsx     # Página para subir DAGs
 ├── Validate.jsx   # Página de validación
 ├── /components        # Componentes reutilizables
 ├── Navbar.jsx     # Barra de navegación
 ├── package.json          # Dependencias de React
 ├── tailwind.config.js    # Configuración de Tailwind
 ├── postcss.config.cjs    # Configuración de PostCSS
 ├── index.html            # Página principal
 ├── vite.config.js        # Configuración de Vite
```

---

## **📌 Configuración Clave**

### **1️⃣ Tailwind CSS (`tailwind.config.js`)**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```
📌 **Se escanean todos los archivos en `src/` para aplicar estilos de Tailwind.**

### **2️⃣ PostCSS (`postcss.config.cjs`)**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```
📌 **Permite que Tailwind funcione con PostCSS.**

### **3️⃣ Estilos Globales (`index.css`)**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-900 text-gray-100;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
    transition-all duration-200 transform hover:scale-105 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
  }

  .card {
    @apply bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700
    hover:border-gray-600 transition-all duration-200;
  }

  .input-file {
    @apply block w-full text-sm text-gray-400
    file:mr-4 file:py-2 file:px-4 file:rounded-lg
    file:border-0 file:text-sm file:font-semibold
    file:bg-blue-600 file:text-white
    hover:file:bg-blue-700 cursor-pointer;
  }
}
```

---

## **📌 Explicación de los Archivos**

### **📂 `App.jsx` (Componente Principal)**
**Funcionalidad:**
- Define las rutas principales con `react-router-dom`.
- Incluye el `Navbar` y las páginas de la app.
- Configura el sistema de notificaciones toast
- Implementa tema dark consistente

```javascript
import "./index.css";  // Importa Tailwind CSS
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Validate from "./pages/Validate";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/validate" element={<Validate />} />
        </Routes >
      </div>
    </Router >
  );
}
export default App;
```

---

### **📂 `Navbar.jsx` (Barra de Navegación)**
**Funcionalidad:**
- Logo y título de la aplicación con icono
- Indicador de página activa con subrayado y color
- Diseño responsive y animaciones
- Tema dark integrado
- Navegación simplificada y moderna

```javascript
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-gray-900 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <h1 className="text-xl font-bold">DAG Validator</h1>
        <div>
          <Link className="mx-2 hover:underline" to="/">Inicio</Link >
          <Link className="mx-2 hover:underline" to="/upload">Subir DAG</Link >
          <Link className="mx-2 hover:underline" to="/validate">Validar DAG</Link >
        </div>
      </div>
    </nav >
  );
}
export default Navbar;
```

---

## **📌 Uso del Frontend**
### **1️⃣ Subir un DAG y Validarlo**
Desde la página `Upload.jsx`, se envía un archivo al backend para su validación.

```javascript
const handleUpload = async () => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await fetch("http://127.0.0.1:8000/validate_dag/", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error("Error al subir el DAG:", error);
  }
};
```
📌 **El resultado se muestra en `Validate.jsx`.**

---

## **📌 Conclusión**
El frontend proporciona una interfaz moderna y profesional con:

✅ **Interfaz construida con Vite, React y Tailwind CSS**  
✅ **Integración con FastAPI para validar DAGs**  
✅ **Estructura modular y escalable**  
✅ **Diseño dark theme moderno y profesional**
✅ **Feedback visual inmediato con notificaciones toast**
✅ **Componentes interactivos y animados**
✅ **Sistema robusto de manejo de errores**
✅ **Experiencia de usuario mejorada**

📌 **Este documento sirve como referencia para futuras mejoras en la UI y optimización del frontend.** 🚀

## **📌 Componentes Principales**

### **1️⃣ App.jsx**
**Funcionalidad:**
- Define las rutas principales con `react-router-dom`
- Incluye el `Navbar` y las páginas de la app
- Configura el sistema de notificaciones toast
- Implementa tema dark consistente

### **2️⃣ Navbar.jsx**
**Nueva Implementación:**
- Logo y título de la aplicación con icono
- Indicador de página activa con subrayado y color
- Diseño responsive y animaciones
- Tema dark integrado
- Navegación simplificada y moderna

### **3️⃣ Home.jsx**
**Nueva Implementación:**
- Diseño moderno con cards informativas
- Iconos ilustrativos
- Llamada a la acción clara
- Grid responsive
- Animaciones suaves

### **4️⃣ Upload.jsx**
**Nueva Implementación:**
- Selector de archivo estilizado
- Botón de validación con estados de carga
- Indicador de progreso animado
- Sistema de notificaciones toast
- Manejo de errores mejorado

---

## **📌 Sistema de Notificaciones**
Implementado con `react-hot-toast`:
```javascript
```


# **📌 Guía de Instalación y Uso de la WebApp de Validación de DAGs de Airflow**

## **🔹 Introducción**

Esta guía proporciona instrucciones detalladas para instalar, configurar y utilizar la WebApp de Validación de DAGs de Airflow. La aplicación permite validar DAGs de Airflow sin necesidad de ejecutar el servicio de Airflow, utilizando funciones como `DagBag` y el parser de Airflow.

---

## **📌 Requisitos del Sistema**

Antes de comenzar, asegúrate de tener los siguientes requisitos:

*   **Sistema Operativo:**
    *   WSL2 Ubuntu 22.04 (si estás en Windows).
*   **Software:**
    *   Node.js versión 18 o superior.
    *   Python 3.9+.
    *   npm o yarn instalado.
*   **Dependencias Python:**
    *   Pip y Virtualenv.
    *   FastAPI y Uvicorn.
    *   Apache Airflow 2.5 (sin ejecutar el servicio).

---

## **📌 Instalación del Backend**

1.  **Configurar el entorno virtual:**

    ```bash
    cd backend
    python3 -m venv venv
    ```
2.  **Activar el entorno virtual:**

    ```bash
    source venv/bin/activate
    ```
3.  **Instalar las dependencias:**

    ```bash
    pip install -r requirements.txt
    ```

---

## **📌 Configuración del Backend**

1.  **Configurar CORS:**

    Asegúrate de que el backend esté configurado para permitir peticiones desde el frontend. Edita el archivo `backend/main.py` y verifica la configuración de CORS:

    ```python
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    ```

---

## **📌 Ejecución del Backend**

1.  **Iniciar el backend:**

    ```bash
    uvicorn main:app --reload
    ```

    Esto iniciará el backend en `http://127.0.0.1:8000`.

---

## **📌 Instalación del Frontend**

1.  **Navegar al directorio del frontend:**

    ```bash
    cd frontend
    ```
2.  **Instalar las dependencias:**

    ```bash
    npm install
    npm install react-hot-toast @heroicons/react
    ```

---

## **📌 Configuración del Frontend**

1.  **Configurar las variables de entorno:**

    Si es necesario, configura las variables de entorno en el archivo `.env` del frontend.

---

## **📌 Ejecución del Frontend**

1.  **Iniciar el frontend:**

    ```bash
    npm run dev
    ```

    Esto iniciará el frontend en `http://localhost:5173`.

---

## **📌 Uso de la Aplicación**

1.  **Subir un DAG:**

    *   Abre la aplicación en tu navegador (`http://localhost:5173`).
    *   Navega a la página "Subir DAG".
    *   Selecciona el archivo DAG que deseas validar.
    *   Haz clic en el botón "Validar DAG".
2.  **Ver el resultado de la validación:**

    *   El resultado de la validación se mostrará en la página "Validar DAG".
    *   Si el DAG es válido, se mostrará un mensaje indicando que el DAG es válido.
    *   Si el DAG no es válido, se mostrarán los errores detallados.

---

## **📌 Solución de Problemas Comunes**

*   **Error: No se puede conectar al backend:**

    *   Asegúrate de que el backend esté en ejecución.
    *   Verifica la configuración de CORS en el backend.
    *   Verifica que la URL del backend en el frontend sea correcta.
*   **Error: No se pueden instalar las dependencias del frontend:**

    *   Asegúrate de tener Node.js y npm instalados.
    *   Verifica que las versiones de las dependencias sean compatibles.
*   **Error: El DAG no es válido:**

    *   Revisa los errores detallados que se muestran en la página "Validar DAG".
    *   Corrige los errores en el archivo DAG y vuelve a subirlo.

---

## **📌 Despliegue en Producción**

1.  **Construir el frontend:**

    ```bash
    cd frontend
    npm run build
    ```
2.  **Servir los archivos estáticos del frontend:**

    Puedes utilizar un servidor web como Nginx o Apache para servir los archivos estáticos del frontend.
3.  **Desplegar el backend:**

    Puedes desplegar el backend en un servidor como Heroku, AWS o Google Cloud.

---

## **📌 Mantenimiento y Actualización**

*   **Actualizar las dependencias:**

    ```bash
    cd backend
    pip install --upgrade -r requirements.txt
    cd frontend
    npm update
    ```
*   **Realizar copias de seguridad:**

    Realiza copias de seguridad periódicas de los archivos DAG y de la base de datos.

---

## **📌 Conclusión**

Esta guía proporciona una visión completa de cómo instalar, configurar y utilizar la WebApp de Validación de DAGs de Airflow. Siguiendo estos pasos, podrás validar tus DAGs de Airflow de forma rápida y sencilla.

