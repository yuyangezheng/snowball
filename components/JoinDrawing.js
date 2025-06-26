import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../pages/_app";
import { useWeb3Contract } from "react-moralis";
import {
  drawingManagerABI,
  contractAddresses,
  ercTokenABI,
} from "../constants";
import styles from "../styles/CreateSnowball.module.css";
import { ethers } from "ethers";

const JoinDrawing = ({ DrawingData, DrawingID }) => {
  console.log("Jooooooooooooooooooooooooooooooooooooooooooin");
  const [wallet] = useContext(WalletContext);
  const [slotsToPurchase, setSlotsToPurchase] = useState(1); // Default to 1 slot
  const [maxPurchasableAmount, setMaxPurchasableAmount] = useState(0);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);

  useEffect(() => {
    if (DrawingData) {
      console.log("DrawingData received:", DrawingData);
      setMaxPurchasableAmount(
        DrawingData.maxSlots - DrawingData.numParticipants
      );
    }
  }, [DrawingData]);

  useEffect(() => {
    console.log(
      "slotsToPurchase or DrawingData changed:",
      slotsToPurchase,
      DrawingData
    );
    if (DrawingData) {
      let totalPrice = 0;
      let remainingSlots = slotsToPurchase;
      let currentPrice = parseFloat(DrawingData.price);
      console.log("Initial current price:", currentPrice);

      totalPrice = currentPrice * remainingSlots;

      setTotalPurchaseAmount(totalPrice);
      console.log("Total purchase amount calculated:", totalPrice);
    }
  }, [slotsToPurchase, DrawingData]);

  const handleJoinDrawing = async () => {
    console.log("Join Drawing clicked!");
    try {
      console.log("Attempting to approve spending...");
      console.log(
        "Total purchase amount (in wei):",
        ethers.utils.parseUnits(totalPurchaseAmount.toString(), 6)
      );
      console.log(1);
      const approvalResult = await approve(); // Await the approval function
      console.log(2);
      console.log("Approval result:", approvalResult); // Log the result of approval

      console.log("Spending approved. Attempting to join contract...");
      console.log("Slots to purchase:", slotsToPurchase);
      console.log("DrawingID:", DrawingID);
      await joinDrawing();
      console.log(3);
      console.log("Successfully joined contract. Sending email...");
      await sendEmail();
      console.log("Email sent successfully.");
    } catch (error) {
      console.error("Error joining drawing:", error);
    }
  };

  const { runContractFunction: joinDrawing, error: contractError } =
    useWeb3Contract({
      abi: drawingManagerABI,
      contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
      functionName: "joinDrawing",
      params: { drawingID: DrawingID, numOrders: slotsToPurchase },
    });

  const { runContractFunction: approve, error: approveError } = useWeb3Contract(
    {
      abi: ercTokenABI,
      contractAddress: contractAddresses[wallet.chainId]?.MyToken[0], // Address of the ERC20 token
      functionName: "approve",
      params: {
        spender: contractAddresses[wallet.chainId]?.drawingManager[0], // Address of the Seed contract
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
          to: DrawingData.owner,
          subject: "Someone has joined your drawing!",
          text: "A new participant has joined your drawing.",
          html: `
            <p>A new participant has joined your drawing.</p>
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

  if (!DrawingData) {
    console.log("No drawing data available");
    return null;
  }

  const currentTime = Math.floor(Date.now() / 1000); // current timestamp in seconds
  const isJoinable =
    DrawingData.endTime > currentTime &&
    DrawingData.maxSlots > DrawingData.numParticipants;

  if (!DrawingData) {
    console.log("No drawing data available");
    return <div>No drawing data available</div>; // Change return null to a visible element
  }

  return (
    <div>
      <p>HI2</p>
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
            onClick={handleJoinDrawing}
          >
            Join this Drawing!
          </button>
          <p>Total Purchase Amount: {totalPurchaseAmount} Tokens</p>
        </>
      )}
      {DrawingData.snowballState === 1 && (
        <h2>This drawing has ended! Try and find another drawing to join!</h2>
      )}
    </div>
  );
};

export default JoinDrawing;
