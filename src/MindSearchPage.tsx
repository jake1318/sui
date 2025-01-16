import { useState } from "react";
import "./MindSearchPage.css";

function MindSearchPage() {
  const [query, setQuery] = useState<string>(""); // Query input state
  const [result, setResult] = useState<string>(""); // API result state
  const [error, setError] = useState<string | null>(null); // Error state
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading indicator

  const handleSearch = async () => {
    setError(null); // Reset error state
    setIsLoading(true); // Set loading to true

    try {
      // Make POST request to the backend
      const response = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.result); // Set the result from the response
      } else {
        setError(data.error || "An error occurred while fetching the results.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Unable to fetch results. Please try again.");
    } finally {
      setIsLoading(false); // Reset loading state
    }
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
            disabled={isLoading} // Disable input while loading
          />
          <button
            className="search-button"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
        {result && (
          <div className="search-result">
            <h2>Search Result:</h2>
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MindSearchPage;
