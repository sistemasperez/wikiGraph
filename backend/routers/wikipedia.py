from fastapi import APIRouter, Depends, HTTPException
from services.wikipedia_client import WikipediaClient
from services.graph_analyzer import GraphAnalyzer
from services.graph_strategies import DegreeCentralityStrategy
import os # Import os

router = APIRouter()

# Read MAX_NEIGHBORS from environment variable, default to 15 if not set
MAX_NEIGHBORS = int(os.getenv("MAX_NEIGHBORS", "15"))

# Dependency for WikipediaClient
def get_wikipedia_client():
    return WikipediaClient()

# Dependency for GraphAnalyzer (now takes a strategy)
def get_graph_analyzer():
    return GraphAnalyzer(strategy=DegreeCentralityStrategy())

@router.get("/api/search")
def search_wikipedia(term: str, wiki_client: WikipediaClient = Depends(get_wikipedia_client)):
    """
    Search Wikipedia for a given term.
    """
    return wiki_client.search_articles(term)

@router.get("/api/explore/{article_title}")
async def explore_article(
    article_title: str,
    depth: int = 1,
    wiki_client: WikipediaClient = Depends(get_wikipedia_client),
    graph_analyzer: GraphAnalyzer = Depends(get_graph_analyzer)
):
    """
    Explore a Wikipedia article and return its graph of linked articles.
    Calculates degree centrality for each node.
    """
    if depth != 1:
        raise HTTPException(status_code=400, detail="Only depth=1 is currently supported.")

    # 1. Get content and summary of the root article
    html_content, final_article_title = wiki_client.get_article_content(article_title)
    root_summary = wiki_client.get_article_summary(final_article_title)

    # 2. Extract links from the HTML
    links = wiki_client.extract_links_from_html(html_content, final_article_title)

    # 3. Build the initial graph structure (nodes and edges)
    nodes = [{"id": final_article_title, "label": final_article_title, "summary": root_summary}]
    edges = []

    # Use the configured MAX_NEIGHBORS
    for neighbor_title in list(links)[:MAX_NEIGHBORS]:
        neighbor_summary = wiki_client.get_article_summary(neighbor_title)
        if neighbor_summary:
            nodes.append({"id": neighbor_title, "label": neighbor_title, "summary": neighbor_summary})
            edges.append({"from": final_article_title, "to": neighbor_title})

    # 4. Calculate centrality using NetworkX in a separate function
    nodes = await graph_analyzer.analyze_and_add_results(nodes, edges)

    return {"nodes": nodes, "edges": edges}
