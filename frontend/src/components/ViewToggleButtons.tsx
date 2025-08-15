import React from 'react';
import { VIEW_MODE_SEARCH, VIEW_MODE_GRAPH } from '../constants';
import type { GraphData } from '../services/api';

interface ViewToggleButtonsProps {
  viewMode: typeof VIEW_MODE_SEARCH | typeof VIEW_MODE_GRAPH;
  setViewMode: (mode: typeof VIEW_MODE_SEARCH | typeof VIEW_MODE_GRAPH) => void;
  exploredGraph: GraphData | null;
}

const ViewToggleButtons: React.FC<ViewToggleButtonsProps> = ({
  viewMode,
  setViewMode,
  exploredGraph,
}) => {
  return (
    <div className="view-toggle">
      <button
        className={viewMode === VIEW_MODE_SEARCH ? 'active' : ''}
        onClick={() => setViewMode(VIEW_MODE_SEARCH)}
      >
        Resultados de Búsqueda
      </button>
      <button
        className={viewMode === VIEW_MODE_GRAPH ? 'active' : ''}
        onClick={() => setViewMode(VIEW_MODE_GRAPH)}
        disabled={!exploredGraph}
      >
        Vista de Grafo
      </button>
    </div>
  );
};

export default ViewToggleButtons;
