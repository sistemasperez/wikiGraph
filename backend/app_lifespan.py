from fastapi import FastAPI
from neo4j import GraphDatabase
import os
from dependencies import set_global_neo4j_driver, get_global_neo4j_driver

async def startup_db_client():
    uri = os.getenv("NEO4J_URI")
    username = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")

    if not uri or not username or not password:
        raise ValueError("Neo4j connection environment variables (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD) must be set.")

    driver = None
    try:
        driver = GraphDatabase.driver(uri, auth=(username, password))
        driver.verify_connectivity()
        print("Neo4j driver connected successfully!")
    except Exception as e:
        print(f"Neo4j driver connection failed: {e}")
        raise
    
    set_global_neo4j_driver(driver)

async def shutdown_db_client():
    driver = get_global_neo4j_driver()
    if driver:
        driver.close()
        print("Neo4j driver closed.")
