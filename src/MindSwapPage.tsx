import { useState } from "react";
import "./MindSwapPage.css"; // Ensure this CSS file is created and linked

function MindSwapPage() {
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");

  const handleSwap = () => {
    // Placeholder for swap logic
    alert(
      `Swapping ${amount} ${fromToken} to ${toToken}. This is a placeholder logic.`
    );
  };

  return (
    <div className="mind-swap">
      <div className="swap-container">
        <h1 className="title">Mind Swap</h1>
        <p className="description">
          Seamlessly swap your tokens using the power of DeepBook on SUI.
        </p>
        <div className="form-group">
          <label htmlFor="fromToken">From Token</label>
          <input
            id="fromToken"
            type="text"
            placeholder="Enter token symbol (e.g., SUI)"
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="toToken">To Token</label>
          <input
            id="toToken"
            type="text"
            placeholder="Enter token symbol (e.g., USDT)"
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            placeholder="Enter amount to swap"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field"
          />
        </div>
        <button className="swap-button" onClick={handleSwap}>
          Swap
        </button>
      </div>
    </div>
  );
}

export default MindSwapPage;
