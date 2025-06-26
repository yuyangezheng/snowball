import React, { useState, useEffect, useContext, useRef } from "react";
import styles from "../styles/CreateSnowball.module.css";
import { useWeb3Contract } from "react-moralis";
import { drawingManagerABI, contractAddresses } from "../constants";
import { WalletContext } from "../pages/_app";

const MakeDrawing = () => {
  const [wallet] = useContext(WalletContext);
  const [formData, setFormData] = useState(null);
  const [drawingCreated, setDrawingCreated] = useState(false);
  const [newDrawingId, setNewDrawingId] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(15);

  const stepsRef = useRef(null);

  const { runContractFunction: createDrawing, error } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "createDrawing",
    params: formData,
  });

  const handleSuccess = async (tx) => {
    try {
      const receipt = await tx.wait(1);
      const event = receipt.events.find((e) => e.event === "DrawingCreated");

      if (event) {
        setNewDrawingId(event.args.drawingId.toNumber());
        setDrawingCreated(true);
        alert("Drawing contract created successfully!");
      } else {
        console.error("DrawingCreated event not found in transaction logs");
      }
    } catch (error) {
      console.error("Error handling success:", error);
    }
  };

  const updateEndTime = () => {
    const currentTime = new Date();
    const updatedEndTime = new Date(currentTime);
    updatedEndTime.setDate(currentTime.getDate() + days);
    updatedEndTime.setHours(currentTime.getHours() + hours);
    updatedEndTime.setMinutes(currentTime.getMinutes() + minutes);

    setEndTime(
      updatedEndTime.toLocaleString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    );
  };

  useEffect(() => {
    if (formData) {
      console.log("formset");
      createDrawing({
        onSuccess: handleSuccess,
        onError: (err) => console.error("Transaction error:", err),
      });
    }
  }, [formData]);

  useEffect(() => {
    updateEndTime();
    const interval = setInterval(updateEndTime, 60000);
    return () => clearInterval(interval);
  }, [days, hours, minutes]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log("clicked");
      const cohortSize = parseInt(event.target.elements.cohortSize.value, 10);
      const maxSlots = parseInt(event.target.elements.maxSlots.value, 10);
      const price = parseFloat(event.target.elements.price.value) * 10 ** 6; // Convert price to smallest unit
      const sharedAmount =
        parseFloat(event.target.elements.sharedAmount.value) * 10 ** 6;
      const duration = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60; // Convert to seconds

      const erc20Token = event.target.elements.erc20Token.value;
      const owner = event.target.elements.drawingOwner.value;
      const mintsNFTs =
        event.target.elements.mintsNFTs.value === "true" ? true : false;

      if (!/^0x[a-fA-F0-9]{40}$/.test(erc20Token)) {
        throw new Error("Invalid ERC-20 token address");
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(owner)) {
        throw new Error("Invalid owner address");
      }
      console.log("here");

      setFormData({
        _maxSlots: maxSlots,
        _duration: duration,
        _price: price,
        _cohortSize: cohortSize,
        _rebateAmount: sharedAmount,
        _owner: owner,
        _erc20Token: erc20Token,
        _mintsNFTs: mintsNFTs,
      });
    } catch (error) {
      console.error("Error parsing form data:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create Drawing Contract</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="drawingOwner">Drawing Owner Address:</label>
        <input
          type="text"
          name="drawingOwner"
          placeholder="0x..."
          className={styles.inputField}
          pattern="^0x[a-fA-F0-9]{40}$"
          title="Please enter a valid Ethereum address"
          required
        />

        <label htmlFor="cohortSize">Drawing/Cohort Size:</label>
        <input
          type="number"
          name="cohortSize"
          placeholder="100"
          className={styles.inputField}
          min="1"
          required
        />

        <label htmlFor="maxSlots">Max Participants:</label>
        <input
          type="number"
          name="maxSlots"
          placeholder="100"
          className={styles.inputField}
          min="1"
          required
        />

        <label htmlFor="price">Price per Slot (USDC):</label>
        <input
          type="number"
          name="price"
          placeholder="5"
          className={styles.inputField}
          min="5"
          step="0.01"
          required
        />

        <label htmlFor="sharedAmount">
          Drawing prize amount per purchase (USDC):
        </label>
        <input
          type="number"
          name="sharedAmount"
          placeholder="0.05"
          className={styles.inputField}
          min="0.01"
          step="0.01"
          required
        />

        <label htmlFor="erc20Token">ERC-20 Token Address:</label>
        <input
          type="text"
          name="erc20Token"
          placeholder="0x..."
          className={styles.inputField}
          pattern="^0x[a-fA-F0-9]{40}$"
          title="Please enter a valid Ethereum address"
          required
        />

        <label htmlFor="mintsNFTs">Mints NFTs:</label>
        <select name="mintsNFTs" className={styles.inputField} required>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <label>Duration:</label>
        <div className={styles.durationContainer}>
          <select
            name="days"
            className={styles.inputField}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 101 }, (_, i) => (
              <option key={i} value={i}>
                {i} day(s)
              </option>
            ))}
          </select>
          <select
            name="hours"
            className={styles.inputField}
            onChange={(e) => setHours(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i} hour(s)
              </option>
            ))}
          </select>
          <select
            name="minutes"
            className={styles.inputField}
            onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 60 }, (_, i) => (
              <option key={i} value={i}>
                {i} minute(s)
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className={styles.submitButton}>
          Create Drawing
        </button>
      </form>
      {drawingCreated && (
        <p>
          Drawing created successfully! ID: <strong>{newDrawingId}</strong>
        </p>
      )}
    </div>
  );
};

export default MakeDrawing;
