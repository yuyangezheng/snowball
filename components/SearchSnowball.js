import React, { useState, useEffect, useContext } from "react";
import styles from "../styles/CreateSnowball.module.css";
import DisplaySnowball from "./DisplaySnowball";
import SnowballReceiptDetails from "./SnowballReceiptDetails";
import { useWeb3Contract } from "react-moralis";
import {
  snowballManagerABI,
  ercTokenABI,
  receiptManagerABI,
  drawingManagerABI,
  seedManagerABI,
  contractAddresses,
} from "../constants";
import { WalletContext } from "../pages/_app";
import { ethers } from "ethers";

const SearchSnowball = () => {
  const [ID, setID] = useState(null);
  const [display, setDisplay] = useState(false);
  const [receiptIds, setReceiptIds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // State for selected receipt IDs
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false); // State for redeeming action

  const [wallet] = useContext(WalletContext);

  const { runContractFunction: getTokens, error } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
    functionName: "getPromotionReceipts",
    params: { promotionID: ID },
  });

  const { runContractFunction: redeemSnowballReceipts } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
    functionName: "redeemSnowballReceipts",
    params: { receiptIDs: selectedIds },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newID = parseInt(event.target.elements.Id.value, 10);
    setID(newID);
    setDisplay(true);

    setLoading(true);

    try {
      const result = await getTokens();
      console.log(result);
      const receiptIdsArray = result.map((receiptId) =>
        parseInt(receiptId.toString(), 10)
      );
      setReceiptIds(receiptIdsArray);
    } catch (error) {
      console.error("Error fetching receipt IDs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (selectedIds.length === 0) return;

    setRedeeming(true);
    try {
      await redeemSnowballReceipts();
      alert("Receipts redeemed successfully!");
      setSelectedIds([]); // Clear selected receipts after redemption
    } catch (error) {
      console.error("Error redeeming receipts:", error);
      alert("Failed to redeem receipts. Check console for details.");
    } finally {
      setRedeeming(false);
    }
  };

  const toggleSelection = (receiptId) => {
    setSelectedIds((prev) =>
      prev.includes(receiptId)
        ? prev.filter((id) => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  const isSelected = (receiptId) => selectedIds.includes(receiptId);

  return (
    <div className={styles.container}>
      <h1>View Snowball Details Via ID Number</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Enter a Snowball ID</label>
        <input
          type="text"
          name="Id"
          placeholder="100"
          required
          className={styles.inputField}
        />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Loading..." : "Check Snowball Status!"}
        </button>
      </form>
      Display Snowball Details
      {display && <DisplaySnowball SnowballID={ID} />}
      {receiptIds.length > 0 && (
        <div className={styles.receiptsContainer}>
          <h2>Associated Receipts:</h2>
          {receiptIds.map((receiptId) => (
            <div
              key={receiptId}
              className={`${styles.receiptDetails} ${
                isSelected(receiptId) ? styles.selected : ""
              }`}
              onClick={() => toggleSelection(receiptId)}
              style={{
                cursor: "pointer",
                border: isSelected(receiptId)
                  ? "2px solid green"
                  : "1px solid gray",
                padding: "10px",
                margin: "5px",
              }}
            >
              <SnowballReceiptDetails receiptId={receiptId} />
            </div>
          ))}
        </div>
      )}
      {selectedIds.length > 0 && (
        <button
          className={styles.batchSubmitButton}
          onClick={handleRedeem}
          disabled={redeeming}
        >
          {redeeming ? "Redeeming..." : "Batch Submit"}
        </button>
      )}
    </div>
  );
};

export default SearchSnowball;
