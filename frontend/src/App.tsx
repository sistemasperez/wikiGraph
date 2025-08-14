import { useState } from 'react';
import ReactFlowGraphDisplay from './components/ReactFlowGraphDisplay';
import MyExplorations from './components/MyExplorations';
import './App.css';

interface SearchResult {
  title: string;
  snippet: string;
}

interface Node {
  id: string;
  label: string;
  summary?: string;
  degree_centrality?: number;
}

interface Edge {
  from: string;
  to: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [exploredGraph, setExploredGraph] = useState<GraphData | null>(null);
  const [exploredGraphTitle, setExploredGraphTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'explorations'>('search');

  const API_BASE_URL = 'http://127.0.0.1:8000'; // Assuming backend runs on this URL

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setExploredGraph(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/search?term=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`Error HTTP! estado: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data.query?.search || []);
    } catch (e: any) {
      setError(`Fallo al buscar resultados: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExplore = async (articleTitle: string, merge: boolean = false) => {
    console.log('handleExplore called with:', articleTitle, merge);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/explore/${encodeURIComponent(articleTitle)}?depth=1`);
      if (!response.ok) {
        throw new Error(`Error HTTP! estado: ${response.status}`);
      }
      const newGraphData: GraphData = await response.json();

      if (merge && exploredGraph) {
        const existingNodeIds = new Set(exploredGraph.nodes.map(node => node.id));
        const existingEdgeKeys = new Set(exploredGraph.edges.map(edge => `${edge.from}-${edge.to}`));

        const mergedNodes = [...exploredGraph.nodes];
        newGraphData.nodes.forEach(newNode => {
          if (!existingNodeIds.has(newNode.id)) {
            mergedNodes.push(newNode);
          }
        });

        const mergedEdges = [...exploredGraph.edges];
        newGraphData.edges.forEach(newEdge => {
          const edgeKey = `${newEdge.from}-${newEdge.to}`;
          if (!existingEdgeKeys.has(edgeKey)) {
            mergedEdges.push(newEdge);
          }
        });

        setExploredGraph({ nodes: mergedNodes, edges: mergedEdges });
        setExploredGraphTitle(articleTitle);
      } else {
        setExploredGraph(newGraphData);
        setExploredGraphTitle(articleTitle);
      }
    } catch (e: any) {
      setError(`Fallo al explorar artículo: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadExploration = (exploration: { name: string; nodes: Node[]; edges: Edge[] }) => {
    setExploredGraph({ nodes: exploration.nodes, edges: exploration.edges });
    setExploredGraphTitle(exploration.name);
    setSearchResults([]); // Limpiar resultados de búsqueda al cargar un grafo guardado
    setActiveTab('search'); // Cambiar a la pestaña de búsqueda para ver el grafo cargado
  };

  return (
    <div className="App">
      <h1>WikiGraph</h1>

      <div className="tabs">
        <button
          className={activeTab === 'search' ? 'active' : ''}
          onClick={() => setActiveTab('search')}
        >
          Búsqueda en Wikipedia
        </button>
        <button
          className={activeTab === 'explorations' ? 'active' : ''}
          onClick={() => setActiveTab('explorations')}
        >
          Mis Exploraciones
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {activeTab === 'search' && (
        <>
          <div className="search-section">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar artículo de Wikipedia..."
            />
            <button onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              <h2>Resultados de Búsqueda:</h2>
              <ul>
                {searchResults.map((result) => (
                  <li key={result.title}>
                    <a href="#" onClick={() => handleExplore(result.title)}>
                      {result.title}
                    </a>
                    <p dangerouslySetInnerHTML={{ __html: result.snippet }}></p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ReactFlowGraphDisplay graph={exploredGraph} onExploreNode={(title) => handleExplore(title, true)} exploredGraphTitle={exploredGraphTitle} />
        </>
      )}

      {activeTab === 'explorations' && (
        <MyExplorations onLoadExploration={handleLoadExploration} currentGraph={exploredGraph} />
      )}
    </div>
  );
}

export default App;
