import { useState } from 'react';
import MyExplorations from './components/MyExplorations';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import SearchInputSection from './components/SearchInputSection';
import ViewToggleButtons from './components/ViewToggleButtons';
import SearchResultsDisplay from './components/SearchResultsDisplay';
import GraphDisplaySection from './components/GraphDisplaySection';
import { useToast } from './hooks/useToast';
import { useApiCall } from './hooks/useApiCall';
import './App.css';
import { searchArticles, exploreArticle, saveExploration } from './services/api';
import type { SearchResult, GraphData, Node, Edge } from './services/api';
import { TAB_SEARCH, TAB_EXPLORATIONS, VIEW_MODE_SEARCH, VIEW_MODE_GRAPH, WIKIGRAPH_LOGO_PATH, WIKIGRAPH_TAGLINE } from './constants';

type Breadcrumb = { type: typeof VIEW_MODE_SEARCH; term: string } | { type: typeof VIEW_MODE_GRAPH; title: string };

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [exploredGraph, setExploredGraph] = useState<GraphData | null>(null);
  const [exploredGraphTitle, setExploredGraphTitle] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<typeof TAB_SEARCH | typeof TAB_EXPLORATIONS>(TAB_SEARCH);
  const [suggestedName, setSuggestedName] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [viewMode, setViewMode] = useState<typeof VIEW_MODE_SEARCH | typeof VIEW_MODE_GRAPH>(VIEW_MODE_SEARCH);
  const [isSearchResultsCollapsed, setIsSearchResultsCollapsed] = useState<boolean>(false);
  const { toast, showToast } = useToast();

  const { execute: searchApi, loading: searchLoading, error: searchError } = useApiCall(searchArticles);
  const { execute: exploreApi, loading: exploreLoading, error: exploreError } = useApiCall(exploreArticle);
  const { execute: saveApi, loading: saveLoading, error: saveError } = useApiCall(saveExploration);

  const loading = searchLoading || exploreLoading || saveLoading;
  const error = searchError || exploreError || saveError;

  const handleSearch = async () => {
    setSearchResults([]);
    setExploredGraph(null);
    try {
      const results = await searchApi(searchTerm);
      setSearchResults(results || []);
      setBreadcrumbs([{ type: VIEW_MODE_SEARCH, term: searchTerm }]);
      setViewMode(VIEW_MODE_SEARCH);
      setIsSearchResultsCollapsed(false); // Expand search results on new search
    } catch (e: any) {
      // Error already set by useApiCall
    }
  };

  const handleExplore = async (articleTitle: string, merge: boolean = false) => {
    console.log('handleExplore called with:', articleTitle, merge);
    try {
      const newGraphData = await exploreApi(articleTitle);

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
        setBreadcrumbs(prev => [...prev, { type: VIEW_MODE_GRAPH, title: articleTitle }]);
        setViewMode(VIEW_MODE_GRAPH);
        setIsSearchResultsCollapsed(true); // Collapse search results on explore
      } else {
        setExploredGraph(newGraphData);
        setExploredGraphTitle(articleTitle);
        setSuggestedName(articleTitle);
        setBreadcrumbs([{ type: VIEW_MODE_SEARCH, term: articleTitle }, { type: VIEW_MODE_GRAPH, title: articleTitle }]);
        setViewMode(VIEW_MODE_GRAPH);
        setIsSearchResultsCollapsed(true); // Collapse search results on explore
      }
    } catch (e: any) {
      // Error already set by useApiCall
    }
  };

  const handleSaveExploration = async () => {
    if (!exploredGraph) {
      showToast('No hay grafo para guardar.', 'error');
      return;
    }
    try {
      await saveApi(suggestedName, exploredGraph);
      showToast('Exploración guardada exitosamente!');
      setActiveTab(TAB_EXPLORATIONS);
    } catch (e: any) {
      showToast('Error al guardar la exploración', 'error');
    }
  };

  const handleLoadExploration = (exploration: { name: string; nodes: Node[]; edges: Edge[] }) => {
    setExploredGraph({ nodes: exploration.nodes, edges: exploration.edges });
    setExploredGraphTitle(exploration.name);
    setSearchResults([]); // Limpiar resultados de búsqueda al cargar un grafo guardado
    setActiveTab(TAB_SEARCH); // Cambiar a la pestaña de búsqueda para ver el grafo cargado
  };

  const handleBreadcrumbClick = (index: number) => {
    const breadcrumb = breadcrumbs[index];
    if (breadcrumb.type === VIEW_MODE_SEARCH) {
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
          <img src={WIKIGRAPH_LOGO_PATH} alt="WikiGraph Logo" style={{ marginRight: '10px', height: '50px' }} />
          <h1>WikiGraph</h1>
        </div>
        <p style={{ fontSize: '1.1em', color: '#555', marginTop: '-1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
          {WIKIGRAPH_TAGLINE}
        </p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === TAB_SEARCH ? 'active' : ''}
          onClick={() => setActiveTab(TAB_SEARCH)}
        >
          Búsqueda en Wikipedia
        </button>
        <button
          className={activeTab === TAB_EXPLORATIONS ? 'active' : ''}
          onClick={() => setActiveTab(TAB_EXPLORATIONS)}
        >
          Mis Exploraciones
        </button>
      </div>

      <div className="breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            <a href="#" onClick={() => handleBreadcrumbClick(index)}>
              {crumb.type === VIEW_MODE_SEARCH ? `Search: "${crumb.term}"` : crumb.title}
            </a>
            {index < breadcrumbs.length - 1 && ' > '}
          </span>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}

      {activeTab === TAB_SEARCH && (
        <>
          <SearchInputSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            loading={searchLoading}
            handleKeyDown={handleKeyDown}
          />

          <ViewToggleButtons
            viewMode={viewMode}
            setViewMode={setViewMode}
            exploredGraph={exploredGraph}
          />

          {viewMode === VIEW_MODE_SEARCH && (
            <SearchResultsDisplay
              searchResults={searchResults}
              handleExplore={handleExplore}
              isSearchResultsCollapsed={isSearchResultsCollapsed}
              setIsSearchResultsCollapsed={setIsSearchResultsCollapsed}
              loading={searchLoading}
              searchTerm={searchTerm}
            />
          )}

          {viewMode === VIEW_MODE_GRAPH && (
            <GraphDisplaySection
              exploredGraph={exploredGraph}
              onExploreNode={handleExplore}
              exploredGraphTitle={exploredGraphTitle}
              suggestedName={suggestedName}
              setSuggestedName={setSuggestedName}
              handleSaveExploration={handleSaveExploration}
              loading={saveLoading}
            />
          )}
        </>
      )}

      {activeTab === TAB_EXPLORATIONS && (
        <MyExplorations onLoadExploration={handleLoadExploration} currentGraph={exploredGraph} />
      )}
    </div>
  );
}

export default App;