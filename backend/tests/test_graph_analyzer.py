import pytest
import networkx as nx
from services.graph_analyzer import GraphAnalyzer
from services.graph_strategies import DegreeCentralityStrategy, GraphAnalysisStrategy
from unittest.mock import Mock

# Fixture for a simple graph data
@pytest.fixture
def sample_graph_data():
    nodes = [
        {"id": "A", "label": "Node A"},
        {"id": "B", "label": "Node B"},
        {"id": "C", "label": "Node C"},
        {"id": "D", "label": "Node D"},
    ]
    edges = [
        {"from": "A", "to": "B"},
        {"from": "A", "to": "C"},
        {"from": "B", "to": "C"},
        {"from": "C", "to": "D"},
    ]
    return nodes, edges

# --- Tests for DegreeCentralityStrategy ---

def test_degree_centrality_strategy_analyze(sample_graph_data):
    """
    Test DegreeCentralityStrategy's analyze method directly.
    """
    nodes_data, edges_data = sample_graph_data
    
    # Create a NetworkX graph from the sample data
    G = nx.DiGraph()
    for node in nodes_data:
        G.add_node(node['id'])
    for edge in edges_data:
        G.add_edge(edge['from'], edge['to'])

    strategy = DegreeCentralityStrategy()
    centrality_scores = strategy.analyze(G)

    assert pytest.approx(centrality_scores['A']) == 0.6666666666666666
    assert pytest.approx(centrality_scores['B']) == 0.6666666666666666
    assert pytest.approx(centrality_scores['C']) == 1.0
    assert pytest.approx(centrality_scores['D']) == 0.3333333333333333

# --- Tests for GraphAnalyzer ---

def test_graph_analyzer_analyze_and_add_results(sample_graph_data):
    """
    Test GraphAnalyzer's analyze_and_add_results method with a concrete strategy.
    """
    nodes_data, edges_data = sample_graph_data

    # Instantiate GraphAnalyzer with DegreeCentralityStrategy
    analyzer = GraphAnalyzer(strategy=DegreeCentralityStrategy())

    # Call the async method
    modified_nodes = analyzer.analyze_and_add_results(nodes_data, edges_data)

    # Verify that degree_centrality was added to each node
    assert all('degree_centrality' in node for node in modified_nodes)

    # Verify the values (using the same expected values as above)
    node_a = next(node for node in modified_nodes if node['id'] == 'A')
    node_b = next(node for node in modified_nodes if node['id'] == 'B')
    node_c = next(node for node in modified_nodes if node['id'] == 'C')
    node_d = next(node for node in modified_nodes if node['id'] == 'D')

    assert pytest.approx(node_a['degree_centrality']) == 0.6666666666666666
    assert pytest.approx(node_b['degree_centrality']) == 0.6666666666666666
    assert pytest.approx(node_c['degree_centrality']) == 1.0
    assert pytest.approx(node_d['degree_centrality']) == 0.3333333333333333

def test_graph_analyzer_with_mock_strategy(sample_graph_data):
    """
    Test GraphAnalyzer's delegation to a mocked strategy.
    """
    nodes_data, edges_data = sample_graph_data
    
    # Mock a strategy
    mock_strategy = Mock(spec=GraphAnalysisStrategy)
    mock_strategy.analyze.return_value = {
        "A": 0.1, "B": 0.2, "C": 0.3, "D": 0.4
    }

    analyzer = GraphAnalyzer(strategy=mock_strategy)
    modified_nodes = analyzer.analyze_and_add_results(nodes_data, edges_data)

    # Verify that the strategy's analyze method was called
    mock_strategy.analyze.assert_called_once()

    # Verify that the mocked results were added to the nodes
    node_a = next(node for node in modified_nodes if node['id'] == 'A')
    assert node_a['degree_centrality'] == 0.1
