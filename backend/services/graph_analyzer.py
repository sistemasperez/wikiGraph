import networkx as nx
from services.graph_strategies import GraphAnalysisStrategy # Import the strategy

class GraphAnalyzer:
    def __init__(self, strategy: GraphAnalysisStrategy):
        self._strategy = strategy

    def analyze_and_add_results(self, nodes: list, edges: list) -> list:
        G = nx.DiGraph()

        for node_data in nodes:
            G.add_node(node_data['id'])

        for edge_data in edges:
            G.add_edge(edge_data['from'], edge_data['to'])

        # Delegate analysis to the strategy
        analysis_results = self._strategy.analyze(G)

        # Add analysis results to the nodes
        for node in nodes:
            node_id = node['id']
            # For simplicity, hardcoding 'degree_centrality' key for now.
            # A more robust solution would have the strategy define the key.
            node['degree_centrality'] = analysis_results.get(node_id, 0.0)

        return nodes