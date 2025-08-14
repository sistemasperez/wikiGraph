import pytest
from unittest.mock import patch, Mock
from services.wikipedia_client import WikipediaClient, WIKIPEDIA_API_URL
from fastapi import HTTPException
import requests # Import requests to access its exceptions

# Fixture to provide a WikipediaClient instance for tests
@pytest.fixture
def wiki_client():
    return WikipediaClient()

def test_call_wikipedia_api_success(wiki_client):
    """
    Test _call_wikipedia_api for a successful response.
    """
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"success": True}
    mock_response.raise_for_status.return_value = None # Simulate no HTTP error

    with patch('requests.get', return_value=mock_response) as mock_get:
        result = wiki_client._call_wikipedia_api({"param": "value"})
        mock_get.assert_called_once_with(WIKIPEDIA_API_URL, params={"param": "value"})
        assert result == {"success": True}

def test_call_wikipedia_api_http_error(wiki_client):
    """
    Test _call_wikipedia_api for an HTTP error (e.g., 404, 500).
    """
    mock_response = Mock()
    mock_response.status_code = 404
    mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("Not Found")

    with patch('requests.get', return_value=mock_response):
        with pytest.raises(HTTPException) as exc_info:
            wiki_client._call_wikipedia_api({"param": "value"})
        assert exc_info.value.status_code == 503 # Our custom HTTPException status
        assert "Error connecting to Wikipedia API" in exc_info.value.detail

def test_call_wikipedia_api_connection_error(wiki_client):
    """
    Test _call_wikipedia_api for a connection error.
    """
    with patch('requests.get', side_effect=requests.exceptions.ConnectionError("No connection")):
        with pytest.raises(HTTPException) as exc_info:
            wiki_client._call_wikipedia_api({"param": "value"})
        assert exc_info.value.status_code == 503
        assert "Error connecting to Wikipedia API" in exc_info.value.detail

def test_search_articles_success(wiki_client):
    """
    Test search_articles for a successful search.
    """
    mock_call_api_result = {"query": {"search": [{"title": "Test Article"}]}}
    with patch.object(wiki_client, '_call_wikipedia_api', return_value=mock_call_api_result) as mock_call:
        result = wiki_client.search_articles("Test")
        mock_call.assert_called_once()
        assert result == mock_call_api_result

def test_get_article_summary_success(wiki_client):
    """
    Test get_article_summary for a successful summary retrieval.
    """
    mock_api_response = {"query": {"pages": {"123": {"extract": "This is a summary."}}}}
    with patch.object(wiki_client, '_call_wikipedia_api', return_value=mock_api_response) as mock_call:
        summary = wiki_client.get_article_summary("Article Title")
        mock_call.assert_called_once()
        assert summary == "This is a summary."

def test_get_article_summary_no_extract(wiki_client):
    """
    Test get_article_summary when no extract is found.
    """
    mock_api_response = {"query": {"pages": {"123": {}}}} # No 'extract' key
    with patch.object(wiki_client, '_call_wikipedia_api', return_value=mock_api_response):
        summary = wiki_client.get_article_summary("Article Title")
        assert summary == ""

def test_get_article_summary_page_not_found(wiki_client):
    """
    Test get_article_summary when the page is not found in the API response.
    """
    mock_api_response = {"query": {"pages": {}}} # Empty pages
    with patch.object(wiki_client, '_call_wikipedia_api', return_value=mock_api_response):
        summary = wiki_client.get_article_summary("NonExistent Article")
        assert summary == ""

def test_get_article_content_success(wiki_client):
    """
    Test get_article_content for successful retrieval of HTML and final title.
    """
    mock_api_response = {
        "parse": {
            "text": {"*": "<html><body><p>Content</p></body></html>"},
            "title": "Final Title"
        }
    }
    with patch.object(wiki_client, '_call_wikipedia_api', return_value=mock_api_response) as mock_call:
        html, title = wiki_client.get_article_content("Initial Title")
        mock_call.assert_called_once()
        assert html == "<html><body><p>Content</p></body></html>"
        assert title == "Final Title"

def test_get_article_content_not_found(wiki_client):
    """
    Test get_article_content when article is not found (API returns error).
    """
    mock_api_response = {"error": {"code": "missingtitle", "info": "Page does not exist."}}
    with patch.object(wiki_client, '_call_wikipedia_api', return_value=mock_api_response):
        with pytest.raises(HTTPException) as exc_info:
            wiki_client.get_article_content("NonExistent Article")
        assert exc_info.value.status_code == 404
        assert "Article \"NonExistent Article\" not found." in exc_info.value.detail

def test_get_article_content_key_error(wiki_client):
    """
    Test get_article_content when expected keys are missing from API response.
    """
    mock_api_response = {"parse": {}} # Missing 'text' or 'title'
    with patch.object(wiki_client, '_call_wikipedia_api', return_value=mock_api_response):
        with pytest.raises(HTTPException) as exc_info:
            wiki_client.get_article_content("Article Title")
        assert exc_info.value.status_code == 404
        assert "Content for \"Article Title\" could not be processed." in exc_info.value.detail

def test_extract_links_from_html(wiki_client):
    """
    Test extract_links_from_html extracts correct Wikipedia links.
    """
    html_content = """
    <html>
        <body>
            <a href="/wiki/Python">Python</a>
            <a href="/wiki/Programming_language">Programming Language</a>
            <a href="http://external.com">External Link</a>
            <a href="/wiki/Special:Random">Special Page</a>
            <a href="/wiki/Python#Section">Section Link</a>
            <a href="/wiki/Python?query=param">Query Link</a>
            <a href="/wiki/Python_(disambiguation)">Disambiguation</a>
        </body>
    </html>
    """
    current_title = "Python"
    expected_links = {
        "Programming Language",
        "Disambiguation"
    }
    # Note: "Python" itself is excluded as it's the current article
    # Special pages, external links, and links with # or ? are excluded by regex

    links = wiki_client.extract_links_from_html(html_content, current_title)
    assert links == expected_links

def test_extract_links_from_html_empty(wiki_client):
    """
    Test extract_links_from_html with no links.
    """
    html_content = "<html><body>No links here.</body></html>"
    links = wiki_client.extract_links_from_html(html_content, "Title")
    assert links == set()

def test_extract_links_from_html_self_link_excluded(wiki_client):
    """
    Test that a link to the current article itself is excluded.
    """
    html_content = """
    <html>
        <body>
            <a href="/wiki/Test_Article">Test Article</a>
        </body>
    </html>
    """
    links = wiki_client.extract_links_from_html(html_content, "Test Article")
    assert links == set()
