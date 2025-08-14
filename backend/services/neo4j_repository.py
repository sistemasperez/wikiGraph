import os
from neo4j import GraphDatabase, Driver # Import Driver for type hinting
import json
from typing import List, Dict, Any, Optional
from uuid import uuid4

class Neo4jRepository:
    def __init__(self, driver: Driver): # Accept driver as parameter
        self._driver = driver
        self._database = os.getenv("NEO4J_DATABASE", "neo4j") # Still get database name from env

    # Removed close() method

    def save_exploration(self, name: str, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Dict[str, Any]:
        exploration_id = str(uuid4())

        def _create_exploration_tx(tx, exploration_id, name, nodes, edges):
            # 1. Create the main Exploration node
            tx.run("CREATE (e:Exploration {id: $id, name: $name})", id=exploration_id, name=name)

            # 2. Create GraphNodes and link them to Exploration
            for node_data in nodes:
                tx.run("""
                    MERGE (gn:GraphNode {id: $node_id})
                    ON CREATE SET gn.label = $label, gn.summary = $summary, gn.degree_centrality = $degree_centrality
                    ON MATCH SET gn.label = $label, gn.summary = $summary, gn.degree_centrality = $degree_centrality
                    WITH gn
                    MATCH (e:Exploration {id: $exploration_id})
                    MERGE (e)-[:CONTAINS_NODE]->(gn)
                    """,
                    node_id=node_data['id'],
                    label=node_data.get('label'),
                    summary=node_data.get('summary'),
                    degree_centrality=node_data.get('degree_centrality'),
                    exploration_id=exploration_id
                )

            # 3. Create relationships between GraphNodes
            for edge_data in edges:
                tx.run("""
                    MATCH (from_node:GraphNode {id: $from_id})
                    MATCH (to_node:GraphNode {id: $to_id})
                    MERGE (from_node)-[:LINKS_TO]->(to_node)
                    """,
                    from_id=edge_data['from'],
                    to_id=edge_data['to']
                )
            
            # Return the created exploration details
            return {
                "id": exploration_id,
                "name": name,
                "nodes": nodes, # Return original nodes/edges for simplicity in response
                "edges": edges
            }

        with self._driver.session(database=self._database) as session:
            return session.write_transaction(_create_exploration_tx, exploration_id, name, nodes, edges)

    def get_all_explorations(self) -> List[Dict[str, Any]]:
        query = """
        MATCH (e:Exploration)
        OPTIONAL MATCH (e)-[:CONTAINS_NODE]->(gn:GraphNode)
        OPTIONAL MATCH (gn)-[r:LINKS_TO]->(gn2:GraphNode)
        RETURN e.id AS id, e.name AS name,
               COLLECT(DISTINCT {id: gn.id, label: gn.label, summary: gn.summary, degree_centrality: gn.degree_centrality}) AS nodes,
               COLLECT(DISTINCT {from: gn.id, to: gn2.id}) AS edges
        """
        with self._driver.session(database=self._database) as session:
            results = session.read_transaction(lambda tx: tx.run(query).data())
            
            parsed_results = []
            for record in results:
                # Filter out null nodes/edges if no graph data is associated
                nodes = [n for n in record["nodes"] if n['id'] is not None]
                edges = [e for e in record["edges"] if e['from'] is not None and e['to'] is not None]
                
                parsed_results.append({
                    "id": record["id"],
                    "name": record["name"],
                    "nodes": nodes,
                    "edges": edges
                })
            return parsed_results

    def delete_exploration(self, exploration_id: str) -> bool:
        query = """
        MATCH (e:Exploration {id: $id})
        DETACH DELETE e
        RETURN count(e) AS deleted_count
        """
        with self._driver.session(database=self._database) as session:
            result = session.write_transaction(lambda tx: tx.run(query, id=exploration_id).single())
            return result["deleted_count"] > 0
