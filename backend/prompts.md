# Historial de Prompts del Usuario

Este documento contiene un registro de las instrucciones clave proporcionadas por el usuario para el desarrollo del backend de exploración de Wikipedia, en el orden en que fueron dadas.

---

## 1. Generar Endpoint de Búsqueda

"tengo este backend. Puedes generar este endpoint que se comunique con el API de Wikipedia? GET /api/search?term={query}"

---

## 2. Generar Endpoint de Exploración de Grafo

"ok. ahora como hago este otro endpoint: Recibe un término de búsqueda, consulta la API de Wikipedia y devuelve una lista de artículos sugeridos para que el usuario elija su "nodo de inicio". •Endpoint de Exploración del Grafo: GET /api/explore/{article_title}?depth={level} Este es el endpoint principal. Recibe el título de un artículo (nodo raíz) y un nivel de profundidad (ej. depth=1). oLógica: Obtiene el contenido del artículo principal (article_title). Extrae todos los enlaces a otros artículos de Wikipedia que contiene. Estos son sus vecinos de profundidad=1. Opcional pero recomendado: Para cada vecino, obtén también su resumen. oRespuesta: Debe devolver una estructura de datos de grafo en JSON que el frontend pueda visualizar. Formato sugerido: { "nodes": [ { "id": "Albert Einstein", "label": "Albert Einstein", "summary": "..." }, { "id": "Theory of relativity", "label": "Theory of relativity", "summary": "..." } ], "edges": [ { "from": "Albert Einstein", "to": "Theory of relativity" } ] }"

---

## 3. Refactorizar: Reutilizar Código o Función Común

"Es posible que esta parte del codigo por ejemplo reuse el primer endpoint GET /api/search?term={query} en el segundo? O crear una funcion comun para ambas para no repetir codigo?"

---

## 4. Consulta sobre Límite de Profundidad

"Ahora quiero saber si hay un limite o la profundidad puede ser mayor que 1 en el segundo endpoint?"

---

## 5. Consulta sobre Formato de Salida del Grafo

"ok. comprendo. Por ahora dejare ese limite. Pero porque no me devuelve en este formato como un Graph? { "nodes": [ { "id": "Albert Einstein", "label": "Albert Einstein", "summary": "..." }, { "id": "Theory of relativity", "label": "Theory of relativity", "summary": "..." } ], "edges": [ { "from": "Albert Einstein", "to": "Theory of relativity" } ] } ."

---

## 6. Consulta sobre Integración con NetworkX para Análisis

"Es cierto. Es que no lo veia. Puedo esta data utilizarla con NetworkX para analizar centralidad, ││    distancias y otras cosas que me ayuden a graficar en el frontend luego?"

---

## 7. Integrar Cálculo de Centralidad en Endpoint Async

"ok. es posible una funcion async donde en el GET /api/explore/{article_title}?depth={level} pueda tambien llamar a esta funcion para calcular (sin el sumary) la centralidad de cada nodo con NetworkX?"

---

## 8. Separar Cálculo de Centralidad en Función Asíncrona

"ok. puedes separar la parte de NewrokX para calcular la centralidad en una funcion aparte async?"

---

## 9. Organizar Código con Principios SOLID (Servicios y Routers)

"ok. perfecto.Funciona bien. Es posible que me escribas en un archivo "prompts.md" las instrucciones que te he dado para llegar a este punto en el mismo orden?"
