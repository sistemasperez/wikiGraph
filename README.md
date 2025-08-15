# CrecerLab

This is a full-stack application for exploring and visualizing knowledge graphs.

## Setup

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the application:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## Project Structure

-   `backend/`: FastAPI application for API endpoints, business logic, and database interactions.
-   `frontend/`: React application for the user interface.
-   `docs/`: Project documentation and related files.

## Features

-   **Knowledge Graph Exploration**: Explore concepts and their relationships.
-   **Wikipedia Integration**: Fetch and integrate information from Wikipedia.
-   **Interactive Visualization**: Visualize graphs using React Flow.

## Technologies Used

### Backend

-   Python
-   FastAPI
-   Neo4j (Graph Database)


### Frontend

-   React
-   TypeScript
-   Vite
-   React Flow


## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/YourFeature`).
6.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Decisiones de Arquitectura y Diseño

Aquí se detallan las decisiones clave de arquitectura y diseño tomadas para este proyecto.

<details>
<summary>Esquema de la Base de Datos</summary>

Elegimos **[la Base de Datos Neo4j]** como nuestra base de datos principal por las siguientes razones:

*   **Naturaleza de los datos**: La información que manejamos, como de relaciones entre conceptos, entidades y sus conexiones, se adapta naturalmente a un modelo de grafos.
*   **[Rendimiento]**: Para las operaciones clave como Centralidad, búsqueda de caminos, consultas complejas entre nodos y edges, esta base de datos ofrece un rendimiento superior e integración con la libreria de NetworkX debido a su optimización para traversales de grafos.
*   **Escalabilidad/Flexibilidad**: Su flexibilidad nos permite añadir nuevos tipos de nodos y relaciones sin migraciones complejas.

</details>

<details>
<summary>Desafíos en el Modelado del Grafo</summary>

El modelado del grafo presentó varios desafíos interesantes, entre ellos:
*   **Integración con Patrones de Diseño**:
    *   **Patrón Repositorio**: La implementación de `Neo4jRepository` centraliza toda la lógica de interacción con la base de datos Neo4j. Esto desacopla la lógica de negocio del acceso a datos, facilitando el mantenimiento, las pruebas y la posible migración a otra base de datos en el futuro.
    *   **Gestión de Transacciones**: Las operaciones de escritura en la base de datos (ej. `save_exploration`) se envuelven en transacciones (`session.write_transaction`). Esto asegura la atomicidad de las operaciones, garantizando que todas las partes de una exploración (nodo principal, nodos de grafo, relaciones) se guarden o ninguna se guarde, manteniendo la consistencia de los datos.
    *   **Modelos Pydantic**: Se utilizan para definir la estructura de los datos (`GraphNode`, `GraphEdge`, `ExplorationCreate`, `ExplorationResponse`). Esto proporciona validación de datos automática, serialización/deserialización y una clara definición de la API, lo que mejora la robustez y la facilidad de uso del backend.
    *   **UUIDs para Identificadores**: El uso de `uuid4` para generar `exploration_id` asegura identificadores únicos globalmente, lo cual es crucial en sistemas distribuidos y para evitar colisiones.

</details>