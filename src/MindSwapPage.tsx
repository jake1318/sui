import { useState, useEffect } from "react";
import { HopApi, HopApiOptions } from "@hop.ag/sdk";
import { getFullnodeUrl } from "@mysten/sui/client";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
  ConnectButton,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import "./MindSwapPage.css";

// Initialize Hop SDK
const rpc_url = getFullnodeUrl("mainnet");
const hop_api_options: HopApiOptions = {
  api_key: "YOUR_API_KEY", // Replace with your Hop API key
  fee_bps: 0, // No additional fees
  fee_wallet: "YOUR_SUI_ADDRESS", // Replace with your SUI wallet address
  charge_fees_in_sui: true, // Charge fees in SUI if possible
};
const hopSdk = new HopApi(rpc_url, hop_api_options);

function MindSwapPage() {
  const [coinList, setCoinList] = useState<any[]>([]);
  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [digest, setDigest] = useState<string>("");

  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const tokensResponse = await hopSdk.fetchTokens();
        setCoinList(tokensResponse.tokens || []);
        if (tokensResponse.tokens.length > 0) {
          setFromToken(tokensResponse.tokens[0]?.id || "");
          setToToken(tokensResponse.tokens[1]?.id || "");
        }
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setStatusMessage("Failed to fetch tokens. Please reload.");
      }
    };

    fetchTokens();
  }, []);

  const handleSwap = async () => {
    setStatusMessage("");
    if (!currentAccount) {
      setStatusMessage("No connected wallet. Please connect a wallet first.");
      return;
    }

    const walletAddress = currentAccount.address;

    if (!walletAddress) {
      setStatusMessage("Failed to retrieve wallet address.");
      return;
    }

    if (!fromToken || !toToken || !amount || Number(amount) <= 0) {
      setStatusMessage("Please fill out all fields with valid values.");
      return;
    }

    try {
      setIsLoading(true);
      setStatusMessage("Fetching swap quote...");

      const amountBigInt = BigInt(Math.floor(Number(amount) * 1e6));
      const quote = await hopSdk.fetchQuote({
        token_in: fromToken,
        token_out: toToken,
        amount_in: amountBigInt,
      });

      if (!quote || !quote.trade) {
        throw new Error("Failed to fetch quote.");
      }

      setStatusMessage("Processing transaction...");

      const tx = await hopSdk.fetchTx({
        trade: quote.trade,
        sui_address: walletAddress,
        gas_budget: 0.03e9,
        max_slippage_bps: slippage * 100,
      });

      signAndExecuteTransaction(
        {
          transaction: Transaction.deserialize(tx),
          chain: "sui:mainnet",
        },
        {
          onSuccess: (result) => {
            console.log("Transaction successful:", result);
            setDigest(result.digest);
            setStatusMessage("Swap successful!");
          },
          onError: (error) => {
            console.error("Transaction error:", error);
            setStatusMessage("Swap failed. Please try again.");
          },
        }
      );
    } catch (error) {
      console.error("Error during swap:", error);
      setStatusMessage("Swap failed. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mind-swap">
      <div className="swap-container">
        <ConnectButton />
        <h1 className="title">Mind Swap</h1>
        <p className="description">Swap tokens using Hop Aggregator on SUI.</p>
        <div className="form-group">
          <label htmlFor="fromToken">From Token</label>
          <select
            id="fromToken"
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
          >
            {coinList.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol})
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
          >
            {coinList
              .filter((coin) => coin.id !== fromToken)
              .map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol})
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
          />
        </div>
        <div className="form-group">
          <label htmlFor="slippage">Slippage (%)</label>
          <input
            id="slippage"
            type="number"
            placeholder="1"
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
          />
        </div>
        <button onClick={handleSwap} disabled={isLoading}>
          {isLoading ? "Processing..." : "Swap"}
        </button>
        {statusMessage && <p>{statusMessage}</p>}
        {digest && <p>Transaction Digest: {digest}</p>}
      </div>
    </div>
  );
}

export default MindSwapPage;
