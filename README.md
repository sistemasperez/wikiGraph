# WikiGraph

Este es un proyecto para CrecerLab que permite explorar artículos de Wikipedia y visualizar sus conexiones como un grafo.

## Arquitectura

El proyecto está dividido en dos componentes principales:

- **Backend**: Una API construida con FastAPI (Python) que se encarga de interactuar con la API de Wikipedia, procesar los datos y gestionar la persistencia en una base de datos de grafos Neo4j.
- **Frontend**: Una aplicación de una sola página (SPA) construida con React y TypeScript que consume la API del backend para visualizar los grafos de manera interactiva.

---

## Backend

El backend está construido con FastAPI y proporciona endpoints para buscar artículos y explorar sus relaciones.

### Configuración del Entorno

**IMPORTANTE**: Este proyecto requiere una base de datos Neo4j. 

1.  Crea una cuenta en [Neo4j AuraDB](https://neo4j.com/cloud/platform/aura-database/) o instala una instancia local.
2.  En el directorio `backend`, renombra el archivo `.env.example` a `.env`.
3.  Abre el archivo `.env` y completa las siguientes variables con tus credenciales de Neo4j:

    ```
    NEO4J_URI="neo4j+s://xxxxxxxx.databases.neo4j.io"
    NEO4J_USERNAME="neo4j"
    NEO4J_PASSWORD="TUSUPERPASSWORD"
    NEO4J_DATABASE="neo4j" # O el nombre de tu base de datos
    ```

### Instalación

1.  Navega al directorio `backend`.
2.  Instala las dependencias de Python:
    ```bash
    pip install -r requirements.txt
    ```

### Ejecución

Para iniciar el servidor de desarrollo, ejecuta desde el directorio `backend`:

```bash
uvicorn main:app --reload
```
El servidor estará disponible en `http://127.0.0.1:8000`.

### Endpoints de la API

Para una descripción detallada de los endpoints, consulta el archivo `backend/specs.md`.

---

## Frontend

El frontend es una aplicación React que utiliza Vite como herramienta de construcción.

### Instalación

1.  Navega al directorio `frontend`.
2.  Instala las dependencias de Node.js:
    ```bash
    npm install
    ```

### Ejecución

Para iniciar el servidor de desarrollo, ejecuta desde el directorio `frontend`:

```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique Vite).
