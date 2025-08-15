import React from 'react';
import ReactFlowGraphDisplay from './ReactFlowGraphDisplay';
import type { GraphData, Node, Edge } from '../services/api';

interface GraphDisplaySectionProps {
  exploredGraph: GraphData | null;
  onExploreNode: (title: string, merge?: boolean) => void;
  exploredGraphTitle: string | null;
  suggestedName: string;
  setSuggestedName: (name: string) => void;
  handleSaveExploration: () => void;
  loading: boolean;
}

const GraphDisplaySection: React.FC<GraphDisplaySectionProps> = ({
  exploredGraph,
  onExploreNode,
  exploredGraphTitle,
  suggestedName,
  setSuggestedName,
  handleSaveExploration,
  loading,
}) => {
  if (!exploredGraph) {
    return <p>No hay grafo para mostrar. Realice una búsqueda y explore un artículo.</p>;
  }

  return (
    <ReactFlowGraphDisplay
      graph={exploredGraph}
      onExploreNode={onExploreNode}
      exploredGraphTitle={exploredGraphTitle}
      suggestedName={suggestedName}
      setSuggestedName={setSuggestedName}
      handleSaveExploration={handleSaveExploration}
      loading={loading}
    />
  );
};

export default GraphDisplaySection;
