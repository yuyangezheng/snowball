import { useState, useContext, useEffect } from "react";
import { useWeb3Contract } from "react-moralis";
import {
  snowballManagerABI,
  ercTokenABI,
  receiptManagerABI,
  drawingManagerABI,
  seedManagerABI,
  contractAddresses,
} from "../constants";
import { WalletContext } from "./_app";
import { ethers } from "ethers";
import ApprovedCallers from "../components/ApprovedCallers";

export default function Test() {
  const [wallet] = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [earnedCommissions, setEarnedCommissions] = useState(null);
  const [withdrawnCommissions, setWithdrawnCommissions] = useState(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [inputTokenAddress, setInputTokenAddress] = useState("");
  const [owner, setOwnerValue] = useState("");
  const [bank, setBankValue] = useState("");
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [newBankAddress, setNewBankAddress] = useState("");
  const [managerBalance, setManagerBalance] = useState(1666666);

  const { runContractFunction: getDrawingEarnedCommissions } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "earnedCommissions",
    params: { "": tokenAddress },
  });

  const { runContractFunction: getDrawingWithdrawnCommissions } =
    useWeb3Contract({
      abi: drawingManagerABI,
      contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
      functionName: "withdrawnCommissions",
      params: { "": tokenAddress },
    });

  const { runContractFunction: getOwner } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "owner",
  });

  const { runContractFunction: getBank } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "bank",
  });

  const { runContractFunction: setOwner } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "setOwner",
    params: { newOwner: newOwnerAddress },
  });

  const { runContractFunction: setBank } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "setBank",
    params: { newBank: newBankAddress },
  });

  const { runContractFunction: withdrawCommissions } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "withdrawCommissions",
    params: { erc20Token: tokenAddress },
  });

  const { runContractFunction: balanceOf } = useWeb3Contract({
    abi: ercTokenABI,
    contractAddress: contractAddresses[wallet.chainId]?.MyToken[0],
    functionName: "balanceOf",
    params: {
      account: contractAddresses[wallet.chainId]?.drawingManager[0],
    },
  });

  useEffect(() => {
    const fetchOwnerAndBank = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching owner...");
        const ownerResult = await getOwner();
        console.log("Owner:", ownerResult);
        setOwnerValue(ownerResult);

        console.log("Fetching bank...");
        const bankResult = await getBank();
        console.log("Bank:", bankResult);
        setBankValue(bankResult);
      } catch (error) {
        console.error("Error fetching owner and bank:", error);
        setError("Error fetching owner and bank. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTokenAmount = async () => {
      try {
        console.log("Fetching token balances...");
        const balance = await balanceOf();
        console.log(balance);
        setManagerBalance(balance);
      } catch (error2) {
        console.error("Error fetching balance", error2);
      }
    };

    fetchOwnerAndBank();
    fetchTokenAmount();
  }, [earnedCommissions]);

  const handleWithdraw = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Withdrawing commissions...");
      await withdrawCommissions();
      console.log("Commissions withdrawn successfully.");
    } catch (error) {
      console.error("Error withdrawing commissions:", error);
      setError("Error withdrawing commissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissions = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Getting Drawing Earned Commissions");
      const drawingEarned = await getDrawingEarnedCommissions();
      console.log(drawingEarned);
      setEarnedCommissions(drawingEarned);

      console.log("Getting Drawing Withdrawn Commissions");
      const drawingWithdrawn = await getDrawingWithdrawnCommissions();
      console.log(drawingWithdrawn);
      setWithdrawnCommissions(drawingWithdrawn);

      const owner = await getOwner();
      console.log(owner);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      setError("Error fetching commissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTokenAddress(inputTokenAddress);
    fetchCommissions();
  };

  const handleSetOwner = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log("Setting new owner...");
      await setOwner();
      console.log("Owner updated successfully.");
    } catch (error) {
      console.error("Error updating owner:", error);
      setError("Error updating owner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetBank = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log("Setting new bank...");
      await setBank();
      console.log("Bank updated successfully.");
    } catch (error) {
      console.error("Error updating bank:", error);
      setError("Error updating bank. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ApprovedCallers />
      <h1>Commissions and Manager Details for Drawings</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Owner and Bank Details</h2>
      <p>
        <strong>Owner:</strong> {owner}
      </p>
      <p>
        <strong>Bank:</strong> {bank}
      </p>
      {managerBalance && (
        <p>
          <strong>Manager Total Balance:</strong>{" "}
          {ethers.utils.formatUnits(managerBalance, 6)}
        </p>
      )}

      <form onSubmit={handleSetOwner}>
        <label htmlFor="newOwner">New Owner Address:</label>
        <input
          type="text"
          id="newOwner"
          value={newOwnerAddress}
          onChange={(e) => setNewOwnerAddress(e.target.value)}
          placeholder="Enter new owner address"
        />
        <button type="submit" disabled={loading}>
          Update Owner
        </button>
      </form>

      <form onSubmit={handleSetBank}>
        <label htmlFor="newBank">New Bank Address:</label>
        <input
          type="text"
          id="newBank"
          value={newBankAddress}
          onChange={(e) => setNewBankAddress(e.target.value)}
          placeholder="Enter new bank address"
        />
        <button type="submit" disabled={loading}>
          Update Bank
        </button>
      </form>

      <form onSubmit={handleSubmit}>
        <label htmlFor="tokenAddress">Token Address:</label>
        <input
          type="text"
          id="tokenAddress"
          value={inputTokenAddress}
          onChange={(e) => setInputTokenAddress(e.target.value)}
          placeholder="Enter token address"
        />
        <button type="submit" disabled={loading}>
          Fetch Commissions
        </button>
      </form>

      {earnedCommissions && withdrawnCommissions && (
        <div>
          <h2>Commissions Details</h2>
          <p>
            <strong>Earned Commissions:</strong>{" "}
            {ethers.utils.formatUnits(earnedCommissions, 6)} ETH
          </p>
          <p>
            <strong>Withdrawn Commissions:</strong>{" "}
            {ethers.utils.formatUnits(withdrawnCommissions, 6)} ETH
          </p>
          <button onClick={handleWithdraw} disabled={loading}>
            Withdraw Commissions
          </button>
        </div>
      )}
    </div>
  );
}
