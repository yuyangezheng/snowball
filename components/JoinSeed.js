import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../pages/_app";
import { useWeb3Contract } from "react-moralis";
import {
  ercTokenABI,
  receiptManagerABI,
  drawingManagerABI,
  seedManagerABI,
  contractAddresses,
} from "../constants";
import styles from "../styles/CreateSnowball.module.css";
import { ethers } from "ethers";

const SeedStatus = ({ Data, SeedID }) => {
  const [wallet] = useContext(WalletContext);
  const [slotsToPurchase, setSlotsToPurchase] = useState(1); // Default to 1 slot
  const [maxPurchasableAmount, setMaxPurchasableAmount] = useState(0);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);

  useEffect(() => {
    if (Data) {
      console.log("Data received:", Data);
      setMaxPurchasableAmount(Data.maxSlots - Data.numParticipants);
    }
  }, [Data]);

  useEffect(() => {
    console.log("slotsToPurchase or Data changed:", slotsToPurchase, Data);
    if (Data) {
      let totalPrice = 0;
      let remainingSlots = slotsToPurchase;
      let currentPrice = parseFloat(Data.price);
      console.log("Initial current price:", currentPrice);

      totalPrice = currentPrice * remainingSlots;

      setTotalPurchaseAmount(totalPrice);
      console.log("Total purchase amount calculated:", totalPrice);
    }
  }, [slotsToPurchase, Data]);

  const handleJoinSeed = async () => {
    console.log("Join Seed clicked!");
    try {
      console.log("Attempting to approve spending...");
      console.log(
        "Total purchase amount (in wei):",
        ethers.utils.parseUnits(totalPurchaseAmount.toString(), 6)
      );
      console.log("Token ABI:", ercTokenABI);
      const approvalResult = await approve(); // Await the approval function
      console.log("Approval result:", approvalResult); // Log the result of approval

      console.log("Spending approved. Attempting to join contract...");
      console.log("Slots to purchase:", slotsToPurchase);
      console.log("Data.ID:", Data.ID);
      await joinSeed();
      console.log("Successfully joined contract. Sending email...");
      await sendEmail();
      console.log("Email sent successfully.");
    } catch (error) {
      console.error("Error joining seed:", error);
    }
  };

  const { runContractFunction: joinSeed, error: contractError } =
    useWeb3Contract({
      abi: seedManagerABI,
      contractAddress: contractAddresses[wallet.chainId]?.seedManager[0],
      functionName: "joinSeed",
      params: { seedID: SeedID, numOrders: slotsToPurchase },
    });

  const { runContractFunction: approve, error: approveError } = useWeb3Contract(
    {
      abi: ercTokenABI,
      contractAddress: contractAddresses[wallet.chainId]?.MyToken[0], // Address of the ERC20 token
      functionName: "approve",
      params: {
        spender: contractAddresses[wallet.chainId]?.seedManager[0], // Address of the Seed contract
        value: ethers.utils.parseUnits(totalPurchaseAmount.toString(), 6), // Amount to approve
      },
    }
  );

  useEffect(() => {
    if (approveError) {
      console.error("Error during approval:", approveError);
    }
  }, [approveError]);

  useEffect(() => {
    if (contractError) {
      console.error("Error during contract join:", contractError);
    }
  }, [contractError]);

  const sendEmail = async () => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: Data.owner,
          subject: "Someone has joined your seed!",
          text: "A new participant has joined your seed. Please reply to this email with your shipping address.",
          html: `
            <p>A new participant has joined your seed. Please reply to this email with your <h1>shipping address.</h1></p>
            <form>
              <label for="shippingAddress">Shipping Address:</label><br>
              <input type="text" id="shippingAddress" name="shippingAddress"><br>
              <input type="submit" value="Submit">
            </form>
          `,
        }),
      });
      const data = await response.json();
      console.log("Email response data:", data);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const handleInputChange = (e) => {
    const value = Math.max(1, Math.min(maxPurchasableAmount, e.target.value));
    setSlotsToPurchase(value);
    console.log("Slots to purchase updated:", value);
  };

  if (!Data) {
    console.log("No data available");
    return null;
  }

  const currentTime = Math.floor(Date.now() / 1000); // current timestamp in seconds
  const isJoinable =
    Data.endTime > currentTime && Data.maxSlots > Data.numParticipants;

  return (
    <div>
      {isJoinable && (
        <>
          <input
            type="number"
            min="1"
            max={maxPurchasableAmount}
            value={slotsToPurchase}
            onChange={handleInputChange}
            placeholder="Number to purchase"
          />
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleJoinSeed}
          >
            Join this Seed!
          </button>
          <p>
            Total Purchase Amount: {(totalPurchaseAmount / 1000000).toString()}{" "}
            Tokens
          </p>
        </>
      )}
      {Data.seedState === 1 && (
        <h2>
          This seed has already melted! Try and find another seed to join!
        </h2>
      )}
    </div>
  );
};

export default SeedStatus;
