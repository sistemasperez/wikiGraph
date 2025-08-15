import { useState } from 'react';
import ReactFlowGraphDisplay from './components/ReactFlowGraphDisplay';
import MyExplorations from './components/MyExplorations';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import { useToast } from './hooks/useToast';
import './App.css';
import { searchArticles, exploreArticle, saveExploration } from './services/api';
import type { SearchResult, GraphData, Node, Edge } from './services/api';

type Breadcrumb = { type: 'search'; term: string } | { type: 'explore'; title: string };

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [exploredGraph, setExploredGraph] = useState<GraphData | null>(null);
  const [exploredGraphTitle, setExploredGraphTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'explorations'>('search');
  const [suggestedName, setSuggestedName] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [viewMode, setViewMode] = useState<'search' | 'graph'>('search');
  const [isSearchResultsCollapsed, setIsSearchResultsCollapsed] = useState<boolean>(false);
  const { toast, showToast } = useToast();

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]);
    setExploredGraph(null);
    try {
      const results = await searchArticles(searchTerm);
      setSearchResults(results);
      setBreadcrumbs([{ type: 'search', term: searchTerm }]);
      setViewMode('search');
      setIsSearchResultsCollapsed(false); // Expand search results on new search
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
      const newGraphData = await exploreArticle(articleTitle);

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
        setSuggestedName(articleTitle);
        setBreadcrumbs(prev => [...prev, { type: 'explore', title: articleTitle }]);
        setViewMode('graph');
        setIsSearchResultsCollapsed(true); // Collapse search results on explore
      } else {
        setExploredGraph(newGraphData);
        setExploredGraphTitle(articleTitle);
        setSuggestedName(articleTitle);
        setBreadcrumbs([{ type: 'search', term: articleTitle }, { type: 'explore', title: articleTitle }]);
        setViewMode('graph');
        setIsSearchResultsCollapsed(true); // Collapse search results on explore
      }
    } catch (e: any) {
      setError(`Fallo al explorar artículo: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExploration = async () => {
    if (!exploredGraph) {
      setError('No hay grafo para guardar.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await saveExploration(suggestedName, exploredGraph);
      showToast('Exploración guardada exitosamente!');
      setActiveTab('explorations');
    } catch (e: any) {
      setError(`Fallo al guardar exploración: ${e.message}`);
      showToast('Error al guardar la exploración', 'error');
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

  const handleBreadcrumbClick = (index: number) => {
    const breadcrumb = breadcrumbs[index];
    if (breadcrumb.type === 'search') {
      setSearchTerm(breadcrumb.term);
      handleSearch();
      setIsSearchResultsCollapsed(false); // Expand search results on breadcrumb click
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      handleExplore(breadcrumb.title);
      setIsSearchResultsCollapsed(true); // Collapse search results on breadcrumb click
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="App">
      {loading && <LoadingSpinner />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/src/assets/logo.png" alt="WikiGraph Logo" style={{ marginRight: '10px', height: '50px' }} />
          <h1>WikiGraph</h1>
        </div>
        <p style={{ fontSize: '1.1em', color: '#555', marginTop: '-1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
          Visualiza el conocimiento de Wikipedia como nunca antes. Explora conexiones y descubre insights con WikiGraph.
        </p>
      </div>

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

      <div className="breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            <a href="#" onClick={() => handleBreadcrumbClick(index)}>
              {crumb.type === 'search' ? `Search: "${crumb.term}"` : crumb.title}
            </a>
            {index < breadcrumbs.length - 1 && ' > '}
          </span>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}

      {activeTab === 'search' && (
        <>
          <div className="search-section">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar artículo de Wikipedia..."
            />
            <button onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          <div className="view-toggle">
            <button
              className={viewMode === 'search' ? 'active' : ''}
              onClick={() => setViewMode('search')}
            >
              Resultados de Búsqueda
            </button>
            <button
              className={viewMode === 'graph' ? 'active' : ''}
              onClick={() => setViewMode('graph')}
              disabled={!exploredGraph}
            >
              Vista de Grafo
            </button>
          </div>

          {viewMode === 'search' && (
            searchResults.length > 0 ? (
              <div className="search-results">
                <h2 onClick={() => setIsSearchResultsCollapsed(!isSearchResultsCollapsed)} style={{ cursor: 'pointer' }}>
                  Resultados de Búsqueda {isSearchResultsCollapsed ? '▼' : '▲'}
                </h2>
                {!isSearchResultsCollapsed && (
                  <>
                    <p style={{ backgroundColor: '#e0f2f7', padding: '10px', borderRadius: '5px', borderLeft: '5px solid #81d4fa', color: '#01579b' }}>
                      Elija un término de los encontrados para comenzar la exploración con un knowledge graph. Debe seleccionar uno haciendo clic en el término.
                    </p>
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
                  </>
                )}
              </div>
            ) : (
              !loading && searchTerm && <p>No se encontraron resultados para "{searchTerm}".</p>
            )
          )}

          {viewMode === 'graph' && exploredGraph && (
            <ReactFlowGraphDisplay
              graph={exploredGraph}
              onExploreNode={(title) => handleExplore(title, true)}
              exploredGraphTitle={exploredGraphTitle}
              suggestedName={suggestedName}
              setSuggestedName={setSuggestedName}
              handleSaveExploration={handleSaveExploration}
              loading={loading}
            />
          )}

          {viewMode === 'graph' && !exploredGraph && (
            <p>No hay grafo para mostrar. Realice una búsqueda y explore un artículo.</p>
          )}
        </>
      )}

      {activeTab === 'explorations' && (
        <MyExplorations onLoadExploration={handleLoadExploration} currentGraph={exploredGraph} />
      )}
    </div>
  );
}

export default App;
