import { useState, useEffect } from "react";
import { initCetusSDK } from "@cetusprotocol/cetus-sui-clmm-sdk";
import { useWallets } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import "./MindSwapPage.css";

// Initialize Cetus SDK
const cetusClmmSDK = initCetusSDK({
  network: "mainnet", // Use 'mainnet' for production
});

function MindSwapPage() {
  const [coinList, setCoinList] = useState<string[]>([]);
  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(5); // Default slippage tolerance
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [pool, setPool] = useState<null | any>(null); // Updated to accept pool or null
  const wallets = useWallets();

  // Fetch coin list from API
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch(
          "https://api-sui.cetus.zone/v2/sui/pools_info"
        );
        const data = await response.json();
        if (data.code === 200) {
          const coinSet = new Set<string>();
          for (const pool of data.data.lp_list) {
            if (!pool.is_closed) {
              coinSet.add(pool.coin_a.address);
              coinSet.add(pool.coin_b.address);
            }
          }
          setCoinList(Array.from(coinSet));
          setFromToken(Array.from(coinSet)[0]); // Set default value
          setToToken(Array.from(coinSet)[1]); // Set default value
        } else {
          console.error("Failed to fetch coin list:", data);
        }
      } catch (error) {
        console.error("Error fetching coin list:", error);
      }
    };

    fetchCoins();
  }, []);

  // Fetch pool dynamically
  useEffect(() => {
    if (fromToken && toToken) {
      const fetchPool = async () => {
        try {
          const pools = await cetusClmmSDK.Pool.getPools([], 0, 200);
          const matchingPool = pools.find(
            (p) => p.coinTypeA === fromToken && p.coinTypeB === toToken
          );
          setPool(matchingPool || null);
        } catch (error) {
          console.error("Error fetching pool:", error);
        }
      };

      fetchPool();
    }
  }, [fromToken, toToken]);

  const handleSwap = async () => {
    setStatusMessage("");
    if (!wallets || wallets.length === 0) {
      setStatusMessage("No connected wallet found. Please connect a wallet.");
      return;
    }

    if (!pool) {
      setStatusMessage("Pool not found for the selected token pair.");
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
      setStatusMessage("Processing your swap...");

      const tx = new Transaction();
      const amountIn = parseFloat(amount);

      // Calculate fee (0.3%)
      const fee = amountIn * 0.003;
      const amountAfterFee = amountIn - fee;

      if (amountAfterFee <= 0) {
        throw new Error("Amount after fee must be greater than 0.");
      }

      const feeRecipient =
        "0x4915973e28558c11904f9eae396df36cca9e25e914d701109ee8c8ada6e571d9"; // Replace with your wallet address

      // Add transfer for the fee
      tx.transferObjects([feeRecipient], fee.toString());

      // Pre-swap to calculate parameters
      const res = await cetusClmmSDK.Swap.preswap({
        pool: pool,
        currentSqrtPrice: pool.currentSqrtPrice,
        coinTypeA: fromToken,
        coinTypeB: toToken,
        decimalsA: 6, // Replace with actual decimals
        decimalsB: 6, // Replace with actual decimals
        a2b: fromToken < toToken,
        byAmountIn: true,
        amount: amountAfterFee.toString(),
      });

      const amountLimit = (res?.estimatedAmountOut || 0) * (1 - slippage / 100);

      // Execute the swap
      await cetusClmmSDK.Swap.createSwapTransactionPayload({
        pool_id: pool.poolAddress,
        coinTypeA: fromToken,
        coinTypeB: toToken,
        a2b: fromToken < toToken,
        by_amount_in: true,
        amount: amountAfterFee.toString(),
        amount_limit: amountLimit.toString(),
        swap_partner: "0xPartnerAddress", // Replace if you have a partner address
      });

      setStatusMessage("Swap successful!");
    } catch (error) {
      console.error("Swap failed:", error);
      setStatusMessage("Swap failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mind-swap">
      <div className="swap-container">
        <h1 className="title">Mind Swap</h1>
        <p className="description">
          Swap your tokens using the Cetus Protocol on SUI.
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
            placeholder="e.g., 5"
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
