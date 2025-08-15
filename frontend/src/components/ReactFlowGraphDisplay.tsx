import React, { useState } from 'react';
import { GraphCanvas } from 'reagraph';
import type { Node, Edge } from 'reagraph';
import type { GraphData, Node as GraphNode } from '../services/api';

interface ReagraphDisplayProps {
  graph: GraphData | null;
  onExploreNode: (articleTitle: string, merge?: boolean) => void;
  exploredGraphTitle?: string | null;
  suggestedName: string;
  setSuggestedName: (name: string) => void;
  handleSaveExploration: () => void;
  loading: boolean;
}

const ReactFlowGraphDisplay: React.FC<ReagraphDisplayProps> = ({ graph, onExploreNode, exploredGraphTitle, suggestedName, setSuggestedName, handleSaveExploration, loading }) => {
  const [selectedNodeData, setSelectedNodeData] = useState<GraphNode | null>(null);

  if (!graph) {
    return null;
  }

  const nodes: Node[] = graph.nodes.map(node => {
    const baseSize = 5;
    const maxSize = 20; // Set a max size to prevent nodes from being too large
    const centrality = node.degree_centrality || 0;
    const size = Math.min(baseSize + (centrality * 50), maxSize);

    return {
      id: node.id,
      label: node.label,
      size: size
    };
  });

  const edges: Edge[] = graph.edges.map((edge, index) => ({
    id: `e-${edge.from}-${edge.to}-${index}`,
    source: edge.from,
    target: edge.to
  }));

  const handleNodeClick = (node: Node) => {
    const fullNode = graph.nodes.find(n => n.id === node.id) || null;
    setSelectedNodeData(fullNode);
    onExploreNode(node.id, true);
  };

  return (
    <div className="graph-display">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Grafo Explorado: {exploredGraphTitle}</h2>
        <div className="save-exploration-section">
          <input
            type="text"
            value={suggestedName}
            onChange={(e) => setSuggestedName(e.target.value)}
            placeholder="Nombre para la exploración..."
            className="exploration-name-input"
          />
          <button onClick={handleSaveExploration} disabled={loading} className="save-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-save" viewBox="0 0 16 16">
              <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zM1 2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V2z"/>
              <path d="M4.5 1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 .5-.5zM8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            {loading ? 'Guardando...' : 'Guardar Exploración'}
          </button>
        </div>
      </div>
      <div className="graph-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="visual-graph-container" style={{ width: '100%', height: '600px' }}>
           <div className="visual-graph-canvas" style={{ position: 'relative', width: '100%', height: '600px' }}>
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              onNodeClick={handleNodeClick}
              layoutType="nooverlap"
              cameraMode={null}
            />
          </div>
        </div>
        <div className="textual-graph-details" style={{ width: '100%', marginTop: '2rem' }}>
          <div className="nodes-list">
            <h3>Nodos:</h3>
            <ul>
              {graph.nodes.map((node) => (
                <li
                  key={node.id}
                  onClick={() => setSelectedNodeData(node)}
                  className={selectedNodeData?.id === node.id ? 'selected' : ''}
                >
                  <strong>{node.label}</strong> (ID: {node.id})
                  {node.degree_centrality !== undefined && (
                    <p>Centralidad: {node.degree_centrality.toFixed(2)}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="edges-list">
            <h3>Aristas:</h3>
            <ul>
              {graph.edges.map((edge, index) => (
                <li key={index}>
                  {edge.from} {'-->'} {edge.to}
                </li>
              ))}
            </ul>
          </div>

          {selectedNodeData && (
            <div className="node-details">
              <h3>Detalles para {selectedNodeData.label}:</h3>
              {selectedNodeData.summary ? (
                <p>{selectedNodeData.summary}</p>
              ) : (
                <p>Resumen no disponible.</p>
              )}
              {selectedNodeData.degree_centrality !== undefined && (
                <p>Centralidad: {selectedNodeData.degree_centrality.toFixed(2)}</p>
              )}
              <button onClick={() => onExploreNode(selectedNodeData.id, true)}>
                Expandir {selectedNodeData.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactFlowGraphDisplay;
