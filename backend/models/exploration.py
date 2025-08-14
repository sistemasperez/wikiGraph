from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class GraphNode(BaseModel):
    id: str
    label: str
    summary: Optional[str] = None
    degree_centrality: Optional[float] = None

class GraphEdge(BaseModel):
    from_node: str = Field(alias="from") # Use Field(alias="from") to map 'from' key
    to_node: str = Field(alias="to")     # Use Field(alias="to") to map 'to' key

    class Config:
        allow_population_by_field_name = True # Allow initialization by field name

class ExplorationCreate(BaseModel):
    name: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class ExplorationResponse(BaseModel):
    id: str
    name: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]
