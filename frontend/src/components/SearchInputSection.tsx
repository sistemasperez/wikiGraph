import React from 'react';

interface SearchInputSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  loading: boolean;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchInputSection: React.FC<SearchInputSectionProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  loading,
  handleKeyDown,
}) => {
  return (
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
  );
};

export default SearchInputSection;
