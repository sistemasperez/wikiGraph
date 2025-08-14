from fastapi import APIRouter, Depends, HTTPException, status
from models.exploration import ExplorationCreate, ExplorationResponse, GraphNode, GraphEdge
from services.neo4j_repository import Neo4jRepository
from typing import List
from dependencies import get_neo4j_driver # Import the dependency function from dependencies.py
from neo4j import Driver # Import Driver for type hinting

router = APIRouter()

# Dependency for Neo4jRepository
def get_neo4j_repository(driver: Driver = Depends(get_neo4j_driver)): # Inject the driver here
    # Pass the injected driver instance to the repository
    repo = Neo4jRepository(driver=driver)
    # No need to close here, as the driver is managed by main.py's lifespan events
    yield repo

@router.post("/api/explorations", response_model=ExplorationResponse, status_code=status.HTTP_201_CREATED)
def create_exploration(
    exploration: ExplorationCreate,
    repo: Neo4jRepository = Depends(get_neo4j_repository)
):
    """
    Guarda una "instantánea" de un grafo (la colección de nodos y aristas) en la base de datos.
    """
    # Convert Pydantic models to dicts for storage
    nodes_data = [node.dict(by_alias=True) for node in exploration.nodes]
    edges_data = [edge.dict(by_alias=True) for edge in exploration.edges]

    saved_exploration = repo.save_exploration(exploration.name, nodes_data, edges_data)
    return ExplorationResponse(**saved_exploration)

@router.get("/api/explorations", response_model=List[ExplorationResponse])
def list_explorations(
    repo: Neo4jRepository = Depends(get_neo4j_repository)
):
    """
    Lista las exploraciones guardadas.
    """
    explorations = repo.get_all_explorations()
    return [ExplorationResponse(**exp) for exp in explorations]

@router.delete("/api/explorations/{exploration_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exploration(
    exploration_id: str,
    repo: Neo4jRepository = Depends(get_neo4j_repository)
):
    """
    Elimina una exploración guardada.
    """
    if not repo.delete_exploration(exploration_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exploration not found")
    return