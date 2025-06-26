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

const SearchSnowballUser = ({ placeholder = "0xf" }) => {
  const [searchAddress, setSearchAddress] = useState(null);
  const [toAprove, setToAprove] = useState(null);
  const [toRemove, setToRemove] = useState(null);
  const [parentAccount, setParentAccount] = useState(null);
  const [operators, setOperators] = useState([]);
  const [ownedPromotions, setOwnedPromotions] = useState([]);
  const [wallet] = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [administrators, setAdministrators] = useState("");
  const [asOperator, setAsOperator] = useState(true);

  const { runContractFunction: GetSnowballPromos } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
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
    abi: promotionsManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.promotionsManager[0],
    functionName: "approveOperator",
    params: { approvedOperator: toAprove, parentAccount: parentAccount },
  });

  const { runContractFunction: ApproveSnowballAdministrator } = useWeb3Contract(
    {
      abi: promotionsManagerABI,
      contractAddress: contractAddresses[wallet.chainId]?.promotionsManager[0],
      functionName: "approveAdministrator",
      params: { approvedAdministrator: toAprove, addOperator: asOperator },
    }
  );

  const { runContractFunction: RemoveSnowballOperator } = useWeb3Contract({
    abi: promotionsManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.promotionsManager[0],
    functionName: "removeOperator",
    params: { toRemove: toRemove, parentAccount: parentAccount },
  });

  const { runContractFunction: RemoveSnowballAdministrator } = useWeb3Contract({
    abi: promotionsManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.promotionsManager[0],
    functionName: "removeAdministrator",
    params: { toRemove: toRemove, removeAsOperator: asOperator },
  });

  const { runContractFunction: GetApprovedOperators } = useWeb3Contract({
    abi: promotionsManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.promotionsManager[0],
    functionName: "getApprovedOperators",
    params: { masterAccount: searchAddress },
  });

  const { runContractFunction: GetApprovedAdministrators } = useWeb3Contract({
    abi: promotionsManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.promotionsManager[0],
    functionName: "getApprovedAdministrators",
    params: { masterAccount: searchAddress },
  });

  const fetchOperators = async (address) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching operators for address:", address);
      console.log(contractAddresses[wallet.chainId]?.promotionsManager[0]);
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

  const fetchAdministrators = async (address) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching administrators for address:", address);
      console.log(contractAddresses[wallet.chainId]?.promotionsManager[0]);
      const result = await GetApprovedAdministrators();
      console.log("Admins fetched:", result);
      setAdministrators(result);
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

  const handleApproveAdmin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Approving Admin:", toAprove);
      const result = await ApproveSnowballAdministrator();
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

  const handleRemove = async (operator, parentAccount) => {
    setLoading(true);
    setError(null);
    setToRemove(operator);

    try {
      console.log("Removing operator:", operator);
      console.log(toRemove);
      console.log(parentAccount);
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

  const handleRemoveAdministrator = async (administrator) => {
    setLoading(true);
    setError(null);
    setToRemove(administrator);

    try {
      console.log("Removing admin:", administrator);
      console.log(toRemove);
      console.log(parentAccount);
      const result = await RemoveSnowballAdministrator();
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
      fetchAdministrators(searchAddress);
    }
  }, [searchAddress]);

  return (
    <div className={styles.container}>
      <h1>Find Approved Operators by Creator for Snowball Contract</h1>
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
      <p>Operators</p>

      <form onSubmit={handleApprove} className={styles.form}>
        {/* Operator Address Input */}
        <label>Enter Operator Address to Approve</label>
        <input
          type="text"
          value={toAprove || ""}
          onChange={(e) => setToAprove(e.target.value)}
          placeholder="Operator Address"
          required
          className={styles.inputField}
        />

        {/* Parent Account Input */}
        <label>Enter Parent Account</label>
        <input
          type="text"
          value={parentAccount || ""}
          onChange={(e) => setParentAccount(e.target.value)}
          placeholder="Parent Account"
          required
          className={styles.inputField}
        />

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton}>
          {loading ? "Approving..." : "Approve"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <p>Administrators</p>

      <form onSubmit={handleApproveAdmin} className={styles.form}>
        {/* Operator Address Input */}
        <label>Enter Administrator Address to Approve</label>
        <input
          type="text"
          value={toAprove || ""}
          onChange={(e) => setToAprove(e.target.value)}
          placeholder="Operator Address"
          required
          className={styles.inputField}
        />

        {/* Parent Account Input */}
        <label>Enter Parent Account</label>
        <input
          type="text"
          value={parentAccount || ""}
          onChange={(e) => setParentAccount(e.target.value)}
          placeholder="Parent Account"
          required
          className={styles.inputField}
        />

        {/* Switch for "Add as Operator" */}
        <label>
          Add as Operator
          <input
            type="checkbox"
            checked={asOperator}
            onChange={(e) => setAsOperator(e.target.checked)}
            className={styles.switch}
          />
        </label>

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton}>
          {loading ? "Approving..." : "Approve"}
        </button>
      </form>

      {operators.length > 0 && (
        <div className={styles.operatorsList}>
          <h2>Approved Operators</h2>
          <ul>
            {operators.map((operator, index) => {
              return (
                <li key={index} className={styles.operatorItem}>
                  {`Operator [${index + 1}]: ${operator}`}
                  <input
                    type="text"
                    value={parentAccount || ""}
                    onChange={(e) => setParentAccount(e.target.value)}
                    placeholder="Parent Account"
                    className={styles.inputField}
                  />
                  <button
                    onClick={() => handleRemove(operator, parentAccount)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {administrators.length > 0 && (
        <div className={styles.operatorsList}>
          <h2>Approved Administrators</h2>
          <ul>
            {administrators.map((Administrator, index) => {
              return (
                <li key={index} className={styles.operatorItem}>
                  {`Administrator [${index + 1}]: ${Administrator}`}
                  {/* Switch for "Add as Operator" */}
                  <label>
                    Add as Operator
                    <input
                      type="checkbox"
                      checked={asOperator}
                      onChange={(e) => setAsOperator(e.target.checked)}
                      className={styles.switch}
                    />
                  </label>

                  <button
                    onClick={() => handleRemoveAdministrator(Administrator)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
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

export default SearchSnowballUser;
