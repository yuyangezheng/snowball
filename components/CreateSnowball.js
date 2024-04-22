import React, { useState, useEffect, useContext } from "react";
import styles from "../styles/CreateSnowball.module.css";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers"; // ethers includes BigNumber
import { abi, contractAddresses } from "../constants";
import { WalletContext } from "../pages/_app";
import DisplaySnowball from "./DisplaySnowball";

const MakeSnowball = () => {
  const [wallet, setWallet] = useContext(WalletContext);
  const [formData, setFormData] = useState(null);
  const [snowballCreated, setSnowballCreated] = useState(false);
  const [newSnowballId, setNewSnowballId] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(15);

  const { runContractFunction: CreateSnowball, error } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddresses[wallet.chainId]?.[1],
    functionName: "createSnowball",
    params: formData,
  });

  const updateUIInputs = () => {
    const numSteps = parseInt(document.getElementById("steps").value);
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

  const handleSuccess = async (tx) => {
    try {
      const receipt = await tx.wait(1);
      const event = receipt.events.find((e) => e.event === "SnowballCreated");

      if (event) {
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
      console.log(error);
    }
  };

  const updateEndTime = () => {
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
    document.getElementById("steps").addEventListener("change", updateUIInputs);
    updateUIInputs();
    return () => {
      document
        .getElementById("steps")
        .removeEventListener("change", updateUIInputs);
    };
  }, []);

  useEffect(() => {
    if (formData !== null) {
      let transaction;
      const transactionSending = async () => {
        transaction = await CreateSnowball({
          onSuccess: handleSuccess,
        });
        if (error) {
          console.log(error);
        }
      };
      transactionSending();
    }
  }, [formData]);

  useEffect(() => {
    updateEndTime();
    const interval = setInterval(updateEndTime, 60000); // Update end time every 60 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [days, hours, minutes]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const _maxSlots = parseInt(event.target.elements.maxSlots.value, 10);
      const _price = parseInt(event.target.elements.price.value, 10); // Parse price as integer
      const steps = parseInt(event.target.elements.steps.value, 10);
      const _duration = days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60; // Convert to seconds

      const _thresholds = Array.from({ length: steps }, (_, i) => {
        const value = event.target.elements[`threshold${i}`].value;
        console.log("Threshold value:", value);
        return parseInt(value, 10);
      });
      const _payouts = Array.from({ length: steps }, (_, i) => {
        const value = event.target.elements[`payout${i}`].value;
        console.log("Payout value:", value);
        return parseInt(value, 10); // Parse payouts as integer
      });

      setFormData({
        _maxSlots,
        _price,
        _duration,
        _payouts,
        _thresholds,
      });
    } catch (error) {
      console.error("Error parsing form data:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create Snowball Contract</h2>
      <h2>{contractAddresses[wallet.chainId]}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="maxSlots">Maximum number of Participants:</label>
        <input
          type="text"
          name="maxSlots"
          placeholder="100"
          className={styles.inputField}
        />

        <label htmlFor="price">Initial price per slot (ETH):</label>
        <input
          type="text"
          name="price"
          placeholder="0.05"
          className={styles.inputField}
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
          name="steps"
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

        <label>Payout amounts in increasing order (ETH):</label>
        <div id="payoutInputs" className={styles.inputContainer}></div>

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
