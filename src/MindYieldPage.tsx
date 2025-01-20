import { useState } from "react";
import "./MindYieldPage.css";

function MindYieldPage() {
  const [amount, setAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleStake = () => {
    if (amount && parseFloat(amount) > 0) {
      setSuccessMessage(`Successfully staked ${amount} SUI!`);
      setAmount(""); // Reset the input field
    } else {
      setSuccessMessage("Please enter a valid amount to stake.");
    }
  };

  return (
    <div className="mind-yield">
      <div className="yield-container">
        <h1 className="title">Mind Yield</h1>
        <p className="description">
          Earn attractive yields by staking your tokens.
        </p>
        <div className="staking-form">
          <h2>Stake Your SUI Tokens</h2>
          <input
            type="number"
            placeholder="Enter amount to stake"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleStake} className="stake-button">
            Stake Tokens
          </button>
        </div>
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </div>
  );
}

export default MindYieldPage;
