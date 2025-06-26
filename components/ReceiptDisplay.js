import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/CreateSnowball.module.css";
import { useWeb3Contract } from "react-moralis";
import { receiptManagerABI, contractAddresses } from "../constants";
import { WalletContext } from "../pages/_app";
import ReceiptDetails from "./SnowballReceiptDetails"; // Import the new component
import { BigNumber } from "ethers"; // Import BigNumber from ethers

const ReceiptDisplay = ({ placeholder = "0xf" }) => {
  const [searchAddress, setSearchAddress] = useState(null);
  const [wallet] = useContext(WalletContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receipts, setReceipts] = useState([]); // State to store the results
  const [selectedReceiptIDs, setSelectedReceiptIDs] = useState([]); // State to store selected receipt IDs
  const [toRedeem, setToRedeem] = useState([]); // State to store selected receipt IDs

  const { runContractFunction } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "tokensOfOwner",
    params: { owner: searchAddress },
  });

  const { runContractFunction: redeemReceipts, isLoading: redeemLoading } =
    useWeb3Contract({
      abi: receiptManagerABI,
      contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
      functionName: "redeemReceipts",
      params: { tokenIDs: toRedeem },
    });

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await runContractFunction();
      setReceipts(result); // Save the result in state
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setError("Error fetching receipts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchAddress) fetchReceipts();
  }, [searchAddress]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newAddress = event.target.elements.Id.value;
    setSearchAddress(newAddress);
    console.log(newAddress);
  };

  const handleCheckboxChange = (receiptId) => {
    const receiptIdString = receiptId.toString(); // Convert BigNumber to string

    setSelectedReceiptIDs((prevSelected) => {
      if (prevSelected.includes(receiptIdString)) {
        // If already selected, remove it from the array
        return prevSelected.filter((id) => id !== receiptIdString);
      } else {
        // If not selected, add it to the array
        return [...prevSelected, receiptIdString];
      }
    });

    const ID = receiptId; // Convert BigNumber to string

    setToRedeem((prevSelected) => {
      if (prevSelected.includes(ID)) {
        // If already selected, remove it from the array
        return prevSelected.filter((id) => id !== ID);
      } else {
        // If not selected, add it to the array
        return [...prevSelected, ID];
      }
    });
  };

  const handleRedeem = async () => {
    //const toRedeem = selectedReceiptIDs.map((id) => BigNumber.from(id)); // Convert to BigNumber array

    try {
      await redeemReceipts();
      console.log("Receipts redeemed:", toRedeem);
    } catch (error) {
      console.error("Error redeeming receipts:", error);
    }
  };

  return (
    <div className={styles.container}>
      {/* <h1>Find receipts by account</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Enter User Address</label>
        <input
          type="text"
          name="Id"
          placeholder={placeholder}
          required
          className={styles.inputField}
        />
        <button type="submit" className={styles.submitButton}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>} */}

      {/* Display ReceiptDetails components with checkboxes */}
      {receipts.length > 0 &&
        receipts.map((receiptId, index) => (
          <div key={index} className={styles.receiptContainer}>
            <SnowballReceiptDetails receiptId={receiptId} />
            <label>
              <input
                type="checkbox"
                checked={selectedReceiptIDs.includes(receiptId.toString())}
                onChange={() => handleCheckboxChange(receiptId)}
              />
              Select
            </label>
          </div>
        ))}

      {/* Display selected receipt IDs */}
      {selectedReceiptIDs.length > 0 && (
        <div className={styles.selectedReceipts}>
          <h3>Selected Receipt IDs:</h3>
          <ul>
            {selectedReceiptIDs.map((id, index) => (
              <li key={index}>{id}</li> // Render receipt ID as a string
            ))}
          </ul>
          <button
            onClick={handleRedeem}
            className={styles.submitButton}
            disabled={redeemLoading}
          >
            {redeemLoading ? "Redeeming..." : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReceiptDisplay;
