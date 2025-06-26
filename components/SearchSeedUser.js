import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/CreateSnowball.module.css";
import { useWeb3Contract } from "react-moralis";
import {
  ercTokenABI,
  receiptManagerABI,
  drawingManagerABI,
  seedManagerABI,
  contractAddresses,
} from "../constants";
import { WalletContext } from "../pages/_app";

const SearchSeedllUser = ({ placeholder = "0xf" }) => {
  const [searchAddress, setSearchAddress] = useState(null);
  const [toAprove, setToAprove] = useState(null);
  const [toRemove, setToRemove] = useState(null);
  const [operators, setOperators] = useState([]);
  const [ownedPromotions, setOwnedPromotions] = useState([]);
  const [wallet] = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { runContractFunction: GetSnowballPromos } = useWeb3Contract({
    abi: seedManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.seedManager[0],
    functionName: "getPromotionsByOwner",
    params: { promotionOwner: searchAddress },
  });

  // const { runContractFunction: GetDrawingManagerOnePromos } = useWeb3Contract({
  //   abi: drawingManagerABI,
  //   contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
  //   functionName: "getPromotionsByOwner",
  //   params: { promotionOwner: searchAddress },
  // });

  const { runContractFunction: ApproveSnowballOperator } = useWeb3Contract({
    abi: seedManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.seedManager[0],
    functionName: "approveOperator",
    params: { approvedOperator: toAprove },
  });

  const { runContractFunction: RemoveSnowballOperator } = useWeb3Contract({
    abi: seedManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.seedManager[0],
    functionName: "removeOperator",
    params: { toRemove: toRemove },
  });

  const { runContractFunction: GetApprovedOperators } = useWeb3Contract({
    abi: seedManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.seedManager[0],
    functionName: "getApprovedOperators",
    params: { masterAccount: searchAddress },
  });

  const fetchOperators = async (address) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching operators for address:", address);
      const result = await GetApprovedOperators();
      console.log("Operators fetched:", result);
      setOperators(result);
    } catch (error) {
      console.error("Error fetching operators:", error);
      setError("Error fetching operators. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async (address) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching promotions for address:", address);
      const promotionResults = await GetSnowballPromos();
      const drawingResults = []; // = await GetDrawingManagerOnePromos();

      console.log("Promotion Manager Results:", promotionResults);
      console.log("Drawing Manager Results:", drawingResults);

      // Combine both results into a single array
      const combinedPromotions = [
        ...(promotionResults || []),
        ...(drawingResults || []),
      ];
      setOwnedPromotions(combinedPromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setError("Error fetching promotions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Approving operator:", toAprove);
      const result = await ApproveSnowballOperator();
      console.log("Operator approved.", result);
      if (searchAddress) {
        fetchOperators(searchAddress);
      }
    } catch (error) {
      console.error("Error approving operator:", error);
      setError("Error approving operator. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (operator) => {
    setLoading(true);
    setError(null);
    setToRemove(operator);

    try {
      console.log("Removing operator:", operator);
      const result = await RemoveSnowballOperator();
      console.log("Operator removed.", result);
      if (searchAddress) {
        fetchOperators(searchAddress);
      }
    } catch (error) {
      console.error("Error removing operator:", error);
      setError("Error removing operator. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const newAddress = event.target.elements.searchAddress.value;
    console.log("Searching for address:", newAddress);
    setSearchAddress(newAddress);
  };

  useEffect(() => {
    if (searchAddress) {
      fetchOperators(searchAddress);
      fetchPromotions(searchAddress);
    }
  }, [searchAddress]);

  return (
    <div className={styles.container}>
      <h1>Find Approved Operators by Creator for Seed Contract</h1>
      <form onSubmit={handleSearchSubmit} className={styles.form}>
        <label>Enter User Address</label>
        <input
          type="text"
          name="searchAddress"
          placeholder={placeholder}
          required
          className={styles.inputField}
        />
        <button type="submit" className={styles.submitButton}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <form onSubmit={handleApprove} className={styles.form}>
        <label>Enter Operator Address to Approve</label>
        <input
          type="text"
          value={toAprove || ""}
          onChange={(e) => setToAprove(e.target.value)}
          placeholder="Operator Address"
          required
          className={styles.inputField}
        />
        <button type="submit" className={styles.submitButton}>
          {loading ? "Approving..." : "Approve"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {operators.length > 0 && (
        <div className={styles.operatorsList}>
          <h2>Approved Operators</h2>
          <ul>
            {operators.map((operator, index) => (
              <li key={index} className={styles.operatorItem}>
                {`Operator [${index + 1}]: ${operator}`}
                <button
                  onClick={() => handleRemove(operator)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ownedPromotions.length > 0 && (
        <div className={styles.promotionsList}>
          <h2>Owned Promotions</h2>
          <ul>
            {ownedPromotions.map((promotionId, index) => (
              <li key={index} className={styles.promotionItem}>
                {`Promotion ID: ${promotionId}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchSeedllUser;
