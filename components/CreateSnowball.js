import React, { useState, useEffect, useContext, useRef } from "react";
import styles from "../styles/CreateSnowball.module.css";
import { useWeb3Contract } from "react-moralis";
import {
  snowballManagerABI,
  ercTokenABI,
  receiptManagerABI,
  drawingManagerABI,
  seedManagerABI,
  contractAddresses,
} from "../constants";
import DisplaySnowball from "./DisplaySnowball";
import { WalletContext } from "../pages/_app";

const MakeSnowball = () => {
  const [wallet] = useContext(WalletContext);
  const [formData, setFormData] = useState(null);
  const [snowballCreated, setSnowballCreated] = useState(false);
  const [newSnowballId, setNewSnowballId] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(15);

  const stepsRef = useRef(null);

  const { runContractFunction: createSnowball, error } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
    functionName: "createSnowball",
    params: formData,
  });

  const updateUIInputs = () => {
    console.log("Updating UI inputs...");
    const numSteps = parseInt(stepsRef.current.value, 10);
    const thresholdInputs = document.getElementById("thresholdInputs");
    const payoutInputs = document.getElementById("payoutInputs");

    thresholdInputs.innerHTML = "";
    payoutInputs.innerHTML = "";

    for (let i = 0; i < numSteps; i++) {
      const t = document.createElement("input");
      t.id = `threshold${i}`;
      t.className = styles.inputField;

      const p = document.createElement("input");
      p.id = `payout${i}`;
      p.className = styles.inputField;

      payoutInputs.appendChild(p);
      thresholdInputs.appendChild(t);
    }
  };

  const validateFormData = () => {
    console.log("Validating form data...");
    const maxSlots = parseInt(
      document.getElementsByName("maxSlots")[0].value,
      10
    );
    const price = parseFloat(document.getElementsByName("price")[0].value); // Parse price as float for decimals
    const steps = parseInt(stepsRef.current.value, 10);
    const thresholds = Array.from({ length: steps }, (_, i) => {
      return parseInt(document.getElementById(`threshold${i}`).value, 10);
    });
    const payouts = Array.from({ length: steps }, (_, i) => {
      return parseInt(document.getElementById(`payout${i}`).value, 10); // Parse payouts as integer
    });

    // Log inputs for debugging
    console.log("Max Slots:", maxSlots);
    console.log("Price:", price);
    console.log("Steps:", steps);
    console.log("Thresholds:", thresholds);
    console.log("Payouts:", payouts);

    // Validate price is greater than or equal to 5
    if (price < 5) {
      alert("Price per slot must be 5 USDC or more.");
      return false;
    }

    // Validate difference between price and sum of payouts is at least 5
    const sumPayouts = payouts.reduce((total, payout) => total + payout, 0);
    if (price - sumPayouts < 5) {
      alert(
        "The difference between the price and total payouts must be at least 5 USDC."
      );
      return false;
    }

    // Validate thresholds are unique, increasing, greater than 1, and <= maxSlots
    if (thresholds.length === 1) {
      // Handle single threshold case
      if (thresholds[0] <= 1 || thresholds[0] > maxSlots) {
        alert(
          "Threshold must be greater than 1 and less than or equal to maximum number of participants."
        );
        return false;
      }
    } else {
      // Handle multiple thresholds case
      for (let i = 1; i < thresholds.length; i++) {
        if (
          thresholds[i] <= thresholds[i - 1] ||
          thresholds[i] <= 1 ||
          thresholds[i] > maxSlots
        ) {
          alert(
            "Thresholds must be unique, increasing, greater than 1, and less than or equal to maximum number of participants."
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSuccess = async (tx) => {
    try {
      console.log("Transaction successful:", tx);
      const receipt = await tx.wait(1);
      console.log("Transaction receipt:", receipt);
      const event = receipt.events.find((e) => e.event === "SnowballCreated");

      if (event) {
        console.log("SnowballCreated event found:", event);
        setNewSnowballId(event.args.snowballId.toNumber());
        setSnowballCreated(true);
        const response = await fetch("/api/create-contract-message", {
          method: "POST",
          body: JSON.stringify({ address: wallet.account }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (!response.ok) {
          return alert(
            "Unable to send mail! However, the drop has been claimed!"
          );
        }
      } else {
        console.error("SnowballCreated event not found in transaction logs");
      }
    } catch (error) {
      console.error("Error handling success:", error);
    }
  };

  const updateEndTime = () => {
    console.log("Updating end time...");
    const currentTime = new Date();
    const endTime = new Date(currentTime);
    endTime.setDate(currentTime.getDate() + days);
    endTime.setHours(currentTime.getHours() + hours);
    endTime.setMinutes(currentTime.getMinutes() + minutes);

    const formattedEndTime = endTime.toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

    setEndTime(formattedEndTime);
  };

  useEffect(() => {
    console.log("Initializing component...");
    const stepsInput = stepsRef.current;
    if (stepsInput) {
      stepsInput.addEventListener("change", updateUIInputs);
      updateUIInputs();

      return () => {
        stepsInput.removeEventListener("change", updateUIInputs);
      };
    }
  }, []);

  useEffect(() => {
    console.log("Form data changed:", formData);
    if (formData !== null) {
      let transaction;
      const transactionSending = async () => {
        console.log("Sending transaction...");
        console.log(wallet);
        transaction = await createSnowball({
          onSuccess: handleSuccess,
        });
        if (error) {
          console.log("Error in transaction:", error);
          console.log(contractAddresses[wallet.chainId]?.snowballManager[0]);
          console.log(contractAddresses[wallet.chainId]);
        }
      };
      transactionSending();
    }
  }, [formData]);

  useEffect(() => {
    console.log("Updating end time effect...");
    updateEndTime();
    const interval = setInterval(updateEndTime, 60000); // Update end time every 60 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [days, hours, minutes]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log("Form submitted...");

      // Extract form inputs
      const maxSlots = parseInt(event.target.elements.maxSlots.value, 10);
      const price = parseFloat(event.target.elements.price.value) * 10 ** 6; // Convert price to smallest unit
      const steps = parseInt(stepsRef.current.value, 10);
      const duration = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60; // Convert to seconds

      // Get ERC-20 token address
      const erc20Token = event.target.elements.erc20Token.value;
      if (!/^0x[a-fA-F0-9]{40}$/.test(erc20Token)) {
        throw new Error("Invalid ERC-20 token address");
      }

      // Get owner address
      const owner = event.target.elements.snowballOwner.value;
      if (!/^0x[a-fA-F0-9]{40}$/.test(owner)) {
        throw new Error("Invalid owner address");
      }

      // Get thresholds and payouts
      const thresholds = Array.from({ length: steps }, (_, i) => {
        const value = event.target.elements[`threshold${i}`].value;
        console.log("Threshold value:", value);
        return parseInt(value, 10);
      });

      const payouts = Array.from({ length: steps }, (_, i) => {
        const value = event.target.elements[`payout${i}`].value;
        console.log("Payout value:", value);
        return parseInt(value, 10) * 10 ** 6; // Convert payouts to smallest unit
      });

      // Generate cohortPrices array
      const cohortPrices = [];
      cohortPrices[0] = price; // First value is the user inputted price

      for (let i = 0; i < payouts.length; i++) {
        cohortPrices[i + 1] = cohortPrices[i] - payouts[i]; // Subtract payout from the previous price
      }

      // Get "Mint Receipts" value
      const mintReceipts = event.target.elements.mintReceipts.value === "true";

      // Perform validation checks
      if (!validateFormData()) {
        return;
      }

      // Set the form data
      setFormData({
        _maxSlots: maxSlots,
        _duration: duration,
        _cohortPrices: cohortPrices, // Set the cohortPrices array
        _thresholds: thresholds,
        _owner: owner, // Set the owner address from the form
        _erc20Token: erc20Token, // Set the ERC-20 token address from the form
        _mintReceipts: mintReceipts, //Add something here!
      });
    } catch (error) {
      console.error("Error parsing form data:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create Snowball Contract</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="snowballOwner">Snowball Owner Address:</label>
        <input
          type="text"
          name="snowballOwner"
          placeholder="0x..."
          className={styles.inputField}
          pattern="^0x[a-fA-F0-9]{40}$"
          title="Please enter a valid Ethereum address"
          required
        />

        <label htmlFor="maxSlots">Maximum number of participants:</label>
        <input
          type="number"
          name="maxSlots"
          placeholder="100"
          className={styles.inputField}
          min="1"
          required
        />

        <label htmlFor="price">Initial price per slot (USDC):</label>
        <input
          type="number"
          name="price"
          placeholder="0.05"
          className={styles.inputField}
          min="5"
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
          title="Please enter a valid ERC-20 token address"
          required
        />

        <label htmlFor="days">Duration:</label>
        <div className={styles.durationContainer}>
          <select
            name="days"
            id="days"
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
            id="hours"
            className={styles.inputField}
            onChange={(e) => setHours(parseInt(e.target.value, 10))}
          >
            {Array.from({ length: 25 }, (_, i) => (
              <option key={i} value={i}>
                {i} hour(s)
              </option>
            ))}
          </select>
          <select
            name="minutes"
            id="minutes"
            className={styles.inputField}
            onChange={(e) => setMinutes(parseInt(e.target.value, 10))}
          >
            {[0, 15, 30, 45, 60].map((minute, i) => (
              <option key={i} value={minute}>
                {minute} minute(s)
              </option>
            ))}
          </select>
        </div>

        <label htmlFor="steps">Number of steps in payout structure:</label>
        <select
          ref={stepsRef}
          id="steps"
          className={styles.inputField}
          onChange={updateUIInputs}
        >
          {[1, 2, 3, 4].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        <label>Payout thresholds in increasing order:</label>
        <div id="thresholdInputs" className={styles.inputContainer}></div>

        <label>Payout amounts in increasing order (USDC):</label>
        <div id="payoutInputs" className={styles.inputContainer}></div>

        <label htmlFor="mintReceipts">Mint Receipts:</label>
        <select
          name="mintReceipts"
          id="mintReceipts"
          className={styles.inputField}
          required
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <button type="submit" className={styles.submitButton}>
          Create
        </button>
      </form>
      {endTime && <p>End Time: {endTime}</p>}
      {newSnowballId && (
        <>
          <h2>New Snowball Created!</h2>
          <DisplaySnowball SnowballID={newSnowballId} />
        </>
      )}
    </div>
  );
};

export default MakeSnowball;
