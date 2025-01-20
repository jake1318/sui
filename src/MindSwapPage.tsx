import { useState, useEffect } from "react";
import { HopApi, HopApiOptions } from "@hop.ag/sdk";
import { getFullnodeUrl } from "@mysten/sui/client";
import { useWallets } from "@mysten/dapp-kit";
import "./MindSwapPage.css";

// Initialize Hop SDK
const rpc_url = getFullnodeUrl("mainnet");
const hop_api_options: HopApiOptions = {
  api_key: "YOUR_API_KEY", // Replace with the actual API key
  fee_bps: 0, // No additional fees
  fee_wallet: "YOUR_SUI_ADDRESS", // Replace with your SUI wallet address
  charge_fees_in_sui: true, // Charge fees in SUI if possible
};
const hopSdk = new HopApi(rpc_url, hop_api_options);

function MindSwapPage() {
  const [coinList, setCoinList] = useState<string[]>([]);
  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(1); // Default slippage tolerance (1%)
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const wallets = useWallets();

  // Fetch tokens and populate the dropdowns
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const tokensResponse = await hopSdk.fetchTokens();
        const tokenAddresses = tokensResponse.tokens.map(
          (token: { address: string }) => token.address
        );
        setCoinList(tokenAddresses);
        setFromToken(tokenAddresses[0] || "");
        setToToken(tokenAddresses[1] || "");
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setStatusMessage("Failed to fetch tokens. Please try again.");
      }
    };

    fetchTokens();
  }, []);

  const handleSwap = async () => {
    setStatusMessage("");
    if (!wallets || wallets.length === 0) {
      setStatusMessage("No connected wallet found. Please connect a wallet.");
      return;
    }

    const activeWallet = wallets[0];
    const walletAddress = activeWallet.accounts[0]?.address;

    if (!walletAddress) {
      setStatusMessage("Failed to retrieve wallet address.");
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage("Fetching swap quote...");

      // Fetch swap quote
      const amountBigInt = BigInt(Math.floor(Number(amount) * 1e6)); // Adjust for decimals
      const quote = await hopSdk.fetchQuote({
        token_in: fromToken,
        token_out: toToken,
        amount_in: amountBigInt,
      });

      if (!quote || !quote.trade) {
        throw new Error("Failed to fetch quote. Please try again.");
      }

      setStatusMessage("Processing transaction...");

      // Create and send the swap transaction
      const tx = await hopSdk.fetchTx({
        trade: quote.trade,
        sui_address: walletAddress,
        gas_budget: 0.03e9, // Optional gas budget
        max_slippage_bps: slippage * 100, // Convert slippage to bps
        return_output_coin_argument: false,
      });

      const signedTx = await activeWallet.signTransaction(tx);
      const response = await activeWallet.executeTransaction(signedTx);

      if (response) {
        setStatusMessage("Swap successful!");
      } else {
        setStatusMessage("Swap failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during swap:", error);
      setStatusMessage("Swap failed. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mind-swap">
      <div className="swap-container">
        <h1 className="title">Mind Swap</h1>
        <p className="description">
          Swap your tokens using Hop Aggregator on SUI.
        </p>
        <div className="form-group">
          <label htmlFor="fromToken">From Token</label>
          <select
            id="fromToken"
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            className="dropdown"
          >
            {coinList.map((coin) => (
              <option key={coin} value={coin}>
                {coin}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="toToken">To Token</label>
          <select
            id="toToken"
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="dropdown"
          >
            {coinList
              .filter((coin) => coin !== fromToken)
              .map((coin) => (
                <option key={coin} value={coin}>
                  {coin}
                </option>
              ))}
          </select>
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
        <div className="form-group">
          <label htmlFor="slippage">Slippage Tolerance (%)</label>
          <input
            id="slippage"
            type="number"
            placeholder="e.g., 1"
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
            className="input-field"
          />
        </div>
        <button
          className="swap-button"
          onClick={handleSwap}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Swap"}
        </button>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </div>
  );
}

export default MindSwapPage;
