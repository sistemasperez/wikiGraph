from neo4j import Driver
from fastapi import Depends
from typing import Optional

_global_neo4j_driver: Optional[Driver] = None # Global variable for Neo4j driver

def set_global_neo4j_driver(driver: Driver):
    """
    Sets the global Neo4j driver instance.
    """
    global _global_neo4j_driver
    _global_neo4j_driver = driver

def get_global_neo4j_driver() -> Optional[Driver]:
    """
    Returns the global Neo4j driver instance.
    """
    global _global_neo4j_driver
    return _global_neo4j_driver

def get_neo4j_driver() -> Driver:
    """
    FastAPI dependency that yields the global Neo4j driver instance.
    """
    global _global_neo4j_driver
    if _global_neo4j_driver is None:
        raise RuntimeError("Neo4j driver not initialized.")
    yield _global_neo4j_driver