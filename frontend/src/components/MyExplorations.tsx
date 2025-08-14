import React, { useState, useEffect } from 'react';

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

interface Exploration {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

interface MyExplorationsProps {
  onLoadExploration: (exploration: { name: string; nodes: Node[]; edges: Edge[] }) => void;
  currentGraph: GraphData | null;
}

const API_BASE_URL = 'http://127.0.0.1:8000'; // Assuming backend runs on this URL

const MyExplorations: React.FC<MyExplorationsProps> = ({ onLoadExploration, currentGraph }) => {
  const [explorations, setExplorations] = useState<Exploration[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState<string>('');

  const fetchExplorations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/explorations`);
      if (!response.ok) {
        throw new Error(`Error HTTP! estado: ${response.status}`);
      }
      const data: Exploration[] = await response.json();
      setExplorations(data);
    } catch (e: any) {
      setError(`Fallo al obtener exploraciones: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorations();
  }, []);

  const handleSaveExploration = async () => {
    if (!currentGraph) {
      setError('Por favor, explora un grafo primero antes de guardar.');
      return;
    }
    if (!saveName.trim()) {
      setError('Por favor, introduce un nombre para tu exploración.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/explorations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: saveName, nodes: currentGraph.nodes, edges: currentGraph.edges }),
      });
      if (!response.ok) {
        throw new Error(`Error HTTP! estado: ${response.status}`);
      }
      setSaveName(''); // Limpiar input
      await fetchExplorations(); // Refrescar lista
    } catch (e: any) {
      setError(`Fallo al guardar exploración: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExploration = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta exploración?')) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/explorations/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        await fetchExplorations(); // Refrescar lista
      } catch (e: any) {
        setError(`Fallo al eliminar exploración: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="my-explorations">
      <h2>Mis Exploraciones Guardadas</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="save-exploration-section">
        <input
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Nombre para la exploración actual..."
          disabled={!currentGraph}
        />
        <button onClick={handleSaveExploration} disabled={loading || !currentGraph || !saveName.trim()}>
          {loading ? 'Guardando...' : 'Guardar Exploración Actual'}
        </button>
      </div>

      {loading && <p>Cargando exploraciones...</p>}
      {!loading && explorations.length === 0 && <p>No hay exploraciones guardadas aún.</p>}

      {!loading && explorations.length > 0 && (
        <ul>
          {explorations.map((exp) => (
            <li key={exp.id}>
              <span>{exp.name}</span>
              <button onClick={() => onLoadExploration(exp)} disabled={loading}>
                Cargar
              </button>
              <button onClick={() => handleDeleteExploration(exp.id)} disabled={loading}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyExplorations;
