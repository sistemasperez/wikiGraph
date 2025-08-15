const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export interface SearchResult {
  title: string;
  snippet: string;
}

export interface Node {
  id: string;
  label: string;
  summary?: string;
  degree_centrality?: number;
}

export interface Edge {
  from: string;
  to: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface Exploration extends GraphData {
  id: string;
  name: string;
}

export const searchArticles = async (term: string): Promise<SearchResult[]> => {
  const response = await fetch(`${API_BASE_URL}/api/search?term=${encodeURIComponent(term)}`);
  if (!response.ok) {
    throw new Error(`Error HTTP! estado: ${response.status}`);
  }
  const data = await response.json();
  return data.query?.search || [];
};

export const exploreArticle = async (articleTitle: string): Promise<GraphData> => {
  const response = await fetch(`${API_BASE_URL}/api/explore/${encodeURIComponent(articleTitle)}?depth=1`);
  if (!response.ok) {
    throw new Error(`Error HTTP! estado: ${response.status}`);
  }
  return response.json();
};

export const getExplorations = async (): Promise<Exploration[]> => {
  const response = await fetch(`${API_BASE_URL}/api/explorations`);
  if (!response.ok) {
    throw new Error(`Error HTTP! estado: ${response.status}`);
  }
  return response.json();
};

export const saveExploration = async (name: string, graph: GraphData): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/explorations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, ...graph }),
  });
  if (!response.ok) {
    throw new Error(`Error HTTP! estado: ${response.status}`);
  }
};

export const deleteExploration = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/explorations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Error HTTP! estado: ${response.status}`);
  }
};
