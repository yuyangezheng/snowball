import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../pages/_app";
import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import styles from "../styles/CreateSnowball.module.css";
import { ethers } from "ethers";

const SnowballStatus = ({ Data }) => {
  const [wallet, setWallet] = useContext(WalletContext);

  const { runContractFunction: joinContract, error: contractError } =
    useWeb3Contract({
      abi: abi,
      contractAddress: contractAddresses[wallet.chainId]?.[0],
      functionName: "joinContract",
      msgValue: ethers.utils.parseEther(Data.price),
      params: { id: Data.id },
    });

  const handleJoinSnowball = async () => {
    console.log("Join Snowball clicked!");
    console.log(Data.price);
    try {
      await joinContract();
      await sendEmail();
    } catch (error) {
      console.error("Error joining snowball:", error);
    }
  };

  const sendEmail = async () => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: Data.owner,
          subject: "Someone has joined your snowball!",
          text: "A new participant has joined your snowball. Please reply to this email with your shipping address.",
          html: `
            <p>A new participant has joined your snowball. Please reply to this email with your <h1>shipping address.</h1></p>
            <form>
              <label for="shippingAddress">Shipping Address:</label><br>
              <input type="text" id="shippingAddress" name="shippingAddress"><br>
              <input type="submit" value="Submit">
            </form>
          `,
        }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  if (!Data) {
    return null;
  }

  if (Data.snowballState === 0) {
    return (
      <button
        type="button"
        className={styles.submitButton}
        onClick={handleJoinSnowball}
      >
        Join this Snowball!
      </button>
    );
  }

  if (Data.snowballState === 1) {
    return (
      <h2>
        This snowball has already melted! Try and find another snowball to join!
      </h2>
    );
  }

  return null;
};

export default SnowballStatus;
