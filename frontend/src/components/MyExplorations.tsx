import React, { useState, useEffect } from 'react';
import { getExplorations, saveExploration, deleteExploration } from '../services/api';
import type { Exploration, GraphData, Node, Edge } from '../services/api';

interface MyExplorationsProps {
  onLoadExploration: (exploration: { name: string; nodes: Node[]; edges: Edge[] }) => void;
  currentGraph: GraphData | null;
}

const MyExplorations: React.FC<MyExplorationsProps> = ({ onLoadExploration, currentGraph }) => {
  const [explorations, setExplorations] = useState<Exploration[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState<string>('');

  const fetchExplorations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExplorations();
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

  useEffect(() => {
    const handleFocus = () => {
      fetchExplorations();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
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
      await saveExploration(saveName, currentGraph);
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
        await deleteExploration(id);
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