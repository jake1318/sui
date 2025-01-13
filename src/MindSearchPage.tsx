import { useState } from "react";
import "./MindSearchPage.css"; // Ensure to create and link this CSS file

function MindSearchPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const handleSearch = async () => {
    // Replace with an actual API call to ChatGPT or backend
    setResult(`Result for "${query}": This is a placeholder.`);
  };

  return (
    <div className="mind-search">
      <div className="container">
        <h1 className="title">Mind Search</h1>
        <p className="description">
          Experience the power of AI-enhanced search tailored to your needs.
        </p>
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Ask anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
        {result && <p className="search-result">{result}</p>}
      </div>
    </div>
  );
}

export default MindSearchPage;
