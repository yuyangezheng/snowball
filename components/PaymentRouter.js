import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/CreateSnowball.module.css";
import { useWeb3Contract } from "react-moralis";
import {
  snowballManagerABI,
  ercTokenABI,
  receiptManagerABI,
  drawingManagerABI,
  seedManagerABI,
  contractAddresses,
  promotionsManagerABI,
} from "../constants";
import { WalletContext } from "../pages/_app";

const PaymentRouter = ({ placeholder = "0xf" }) => {
  const [wallet] = useContext(WalletContext);

  // State for Update Receiver Form
  const [tokenAddress, setTokenAddress] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");

  // State for Get Receiver Form
  const [userAddress, setUserAddress] = useState("");
  const [getTokenAddress, setGetTokenAddress] = useState("");
  const [receiverResult, setReceiverResult] = useState(null); // To store the result of getReceiver

  // Contract function to update receiver address
  const { runContractFunction: updateReceiver } = useWeb3Contract({
    abi: promotionsManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.promotionsManager[0],
    functionName: "updateReceiverAddress",
    params: { tokenAddress: tokenAddress, receiverAddress: receiverAddress },
  });

  // Contract function to get receiver address
  const { runContractFunction: getReceiver } = useWeb3Contract({
    abi: promotionsManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.promotionsManager[0],
    functionName: "getReceiverAddress",
    params: { userAddress: userAddress, tokenAddress: getTokenAddress },
  });

  // Handle Update Receiver Form Submission
  const handleUpdateReceiver = async (e) => {
    e.preventDefault();
    console.log("Updating Receiver Address...");
    console.log("Token Address:", tokenAddress);
    console.log("Receiver Address:", receiverAddress);

    try {
      const tx = await updateReceiver();
      console.log("Transaction Result:", tx);
    } catch (error) {
      console.error("Error updating receiver address:", error);
    }
  };

  // Handle Get Receiver Form Submission
  const handleGetReceiver = async (e) => {
    e.preventDefault();
    console.log("Fetching Receiver Address...");
    console.log("User Address:", userAddress);
    console.log("Token Address:", getTokenAddress);

    try {
      const result = await getReceiver();
      setReceiverResult(result); // Store the result in state
      console.log("Receiver Address Result:", result);
    } catch (error) {
      console.error("Error fetching receiver address:", error);
    }
  };

  return (
    <div className={styles.container}>
      <p> Token address 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512</p>
      {/* Form 1: Update Receiver Address */}
      <form onSubmit={handleUpdateReceiver} className={styles.form}>
        <h2>Update Receiver Address</h2>
        <label>Token Address</label>
        <input
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="Token Address"
          required
          className={styles.inputField}
        />
        <label>Receiver Address</label>
        <input
          type="text"
          value={receiverAddress}
          onChange={(e) => setReceiverAddress(e.target.value)}
          placeholder="Receiver Address"
          required
          className={styles.inputField}
        />
        <button type="submit" className={styles.submitButton}>
          Update Receiver
        </button>
      </form>

      {/* Form 2: Get Current Receiver Address */}
      <form onSubmit={handleGetReceiver} className={styles.form}>
        <h2>Get Current Receiver</h2>
        <label>User Address</label>
        <input
          type="text"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          placeholder="User Address"
          required
          className={styles.inputField}
        />
        <label>Token Address</label>
        <input
          type="text"
          value={getTokenAddress}
          onChange={(e) => setGetTokenAddress(e.target.value)}
          placeholder="Token Address"
          required
          className={styles.inputField}
        />
        <button type="submit" className={styles.submitButton}>
          Get Receiver
        </button>
      </form>

      {/* Display Receiver Result in a Table */}
      {receiverResult && (
        <div className={styles.resultContainer}>
          <h3>Receiver Details</h3>
          <div className={styles.resultItem}>
            <strong>User Address:</strong> {userAddress}
          </div>
          <div className={styles.resultItem}>
            <strong>Token Address:</strong> {getTokenAddress}
          </div>
          <div className={styles.resultItem}>
            <strong>Receiver Address:</strong> {receiverResult}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentRouter;
