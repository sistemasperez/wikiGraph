import React from 'react';
import type { SearchResult } from '../services/api';

interface SearchResultsDisplayProps {
  searchResults: SearchResult[];
  handleExplore: (title: string, merge?: boolean) => void;
  isSearchResultsCollapsed: boolean;
  setIsSearchResultsCollapsed: (collapsed: boolean) => void;
  loading: boolean;
  searchTerm: string;
}

const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({
  searchResults,
  handleExplore,
  isSearchResultsCollapsed,
  setIsSearchResultsCollapsed,
  loading,
  searchTerm,
}) => {
  return (
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
  );
};

export default SearchResultsDisplay;
