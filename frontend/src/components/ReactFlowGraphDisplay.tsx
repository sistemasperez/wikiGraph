import React, { useState } from 'react';
import { GraphCanvas } from 'reagraph';
import type { Node, Edge } from 'reagraph';

interface GraphNode {
  id: string;
  label: string;
  summary?: string;
  degree_centrality?: number;
}

interface GraphEdge {
  from: string;
  to: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface ReagraphDisplayProps {
  graph: GraphData | null;
  onExploreNode: (articleTitle: string, merge?: boolean) => void;
  exploredGraphTitle?: string | null;
}

const ReactFlowGraphDisplay: React.FC<ReagraphDisplayProps> = ({ graph, onExploreNode, exploredGraphTitle }) => {
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
      <h2>Grafo Explorado: {exploredGraphTitle}</h2>
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
