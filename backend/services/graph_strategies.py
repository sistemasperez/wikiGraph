from abc import ABC, abstractmethod
import networkx as nx

class GraphAnalysisStrategy(ABC):
    @abstractmethod
    def analyze(self, graph: nx.Graph) -> dict:
        """
        Abstract method to perform graph analysis.
        Returns a dictionary where keys are node IDs and values are analysis results.
        """
        pass

class DegreeCentralityStrategy(GraphAnalysisStrategy):
    def analyze(self, graph: nx.DiGraph) -> dict:
        """
        Calculates degree centrality for a given graph.
        """
        return nx.degree_centrality(graph)
