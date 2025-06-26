import React, { useState, useEffect, useContext } from "react";
import styles from "../styles/CreateSnowball.module.css";
import DisplayDrawing from "./DisplayDrawing";
import DrawingReceiptDetails from "./DrawingReceiptDetails";
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

const SearchDrawing = () => {
  const [ID, setID] = useState(null);
  const [display, setDisplay] = useState(false);
  const [receiptIds, setReceiptIds] = useState([]); // State to store receipt IDs
  const [loading, setLoading] = useState(false); // State to manage loading
  const [selectedIds, setSelectedIds] = useState([]); // State for selected receipt IDs
  const [redeeming, setRedeeming] = useState(false); // State for redeeming action

  const [wallet] = useContext(WalletContext); // Get wallet context

  // Fetch tokens of promotions (receipt IDs) based on the Snowball ID
  const { runContractFunction: getTokens } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "getPromotionReceipts",
    params: { promotionID: ID },
  });

  const { runContractFunction: redeemDrawingReceipts } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "redeemDrawingReceipts",
    params: { receiptIDs: selectedIds },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newID = parseInt(event.target.elements.Id.value, 10);
    setID(newID);
    setDisplay(true);

    setLoading(true); // Set loading state

    try {
      const result = await getTokens(); // Run the getTokens function
      console.log(ID);
      console.log(newID);
      console.log("Receipt IDs fetched:", result);

      // Convert the BigNumber receipt IDs to regular integers
      const receiptIdsArray = result.map((receiptId) =>
        parseInt(receiptId.toString(), 10)
      );

      setReceiptIds(receiptIdsArray); // Update state with receipt IDs
    } catch (error) {
      console.error("Error fetching receipt IDs:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleRedeem = async () => {
    if (selectedIds.length === 0) return;

    setRedeeming(true);
    try {
      await redeemDrawingReceipts();
      alert("Receipts redeemed successfully!");
      setSelectedIds([]); // Clear selected receipts after redemption
    } catch (error) {
      console.error("Error redeeming receipts:", error);
      alert("Failed to redeem receipts. Check console for details.");
    } finally {
      setRedeeming(false);
    }
  };

  const isSelected = (receiptId) => selectedIds.includes(receiptId);

  const toggleSelection = (receiptId) => {
    setSelectedIds((prev) =>
      prev.includes(receiptId)
        ? prev.filter((id) => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  return (
    <div className={styles.container}>
      <h1>View Drawing Details Via ID Number</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Enter a Drawing ID</label>
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

      {/* Display Drawing Details */}
      {display && <DisplayDrawing DrawingID={ID} />}

      {/* Display ReceiptDetails components based on the fetched receipt IDs */}
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
              <DrawingReceiptDetails receiptId={receiptId} />
            </div>
          ))}
        </div>
      )}

      {/* Batch Submit Button */}
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

export default SearchDrawing;
