import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../pages/_app";
import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";
import SnowballStatus from "./SnowballStatus";
import { ethers } from "ethers";

const DisplaySnowball = ({ SnowballID }) => {
  const [wallet] = useContext(WalletContext);
  const [snowballData, setSnowballData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [toThreshold, setToThreshold] = useState(null);
  const [nextPayout, setNextPayout] = useState(null);

  const { runContractFunction: GetSnowball, error } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddresses[wallet.chainId]?.[1],
    functionName: "getSnowball",
    params: { snowballID: SnowballID },
  });

  useEffect(() => {
    const transactionSending = async () => {
      try {
        const transaction = await GetSnowball();
        console.log(transaction);
        setSnowballData({
          id: transaction[0].toNumber(),
          maxSlots: transaction[1].toNumber(),
          price: ethers.utils.formatEther(transaction[2]), // Format price as a string
          duration: transaction[3].toNumber(),
          payouts: extractPayouts(transaction[4]),
          thresholds: extractThresholds(transaction[5]),
          owner: transaction[6],
          startTime: transaction[7].toNumber(),
          snowballState: transaction[8].toNumber(),
          balance: ethers.utils.formatEther(transaction[9]), // Format balance as a string
          maxDiscount: transaction[10],
          numParticipants: transaction[11].toNumber(),
        });
      } catch (error) {
        console.log("Error in contract execution:", error);
      }
    };
    transactionSending();
  }, [SnowballID]);

  useEffect(() => {
    if (snowballData) {
      const endTime = snowballData.startTime + snowballData.duration;
      const updateRemainingTime = () => {
        const currentTime = Math.floor(Date.now() / 1000);
        const remaining = endTime - currentTime;

        const days = Math.floor(remaining / (24 * 60 * 60));
        const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((remaining % (60 * 60)) / 60);

        setTimeRemaining(
          `${days} day(s), ${hours} hour(s), ${minutes} minute(s)`
        );
      };

      updateRemainingTime();
      const interval = setInterval(updateRemainingTime, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [snowballData]);

  useEffect(() => {
    if (snowballData) {
      const { numParticipants, thresholds, payouts } = snowballData;
      let foundThreshold = null;
      let foundPayout = null;

      for (let i = 0; i < thresholds.length; i++) {
        if (thresholds[i] > numParticipants) {
          foundThreshold = thresholds[i];
          foundPayout = payouts[i];
          break;
        }
      }

      if (foundThreshold !== null) {
        setToThreshold(foundThreshold - numParticipants);
        setNextPayout(foundPayout);
      }
    }
  }, [snowballData]);

  const extractPayouts = (payouts) =>
    payouts.map((p) => ethers.utils.formatEther(p));
  const extractThresholds = (thresholds) => thresholds.map((t) => t.toNumber());

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  };

  const formatDuration = (duration) => {
    const days = Math.floor(duration / (24 * 60 * 60));
    const hours = Math.floor((duration % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((duration % (60 * 60)) / 60);
    return `${days} day(s), ${hours} hour(s), ${minutes} minute(s)`;
  };

  return (
    <div>
      <h1>Details for Snowball {SnowballID}</h1>
      {snowballData && (
        <>
          {snowballData.snowballState === 0 ? (
            <>
              <p>Time Remaining: {timeRemaining}</p>
            </>
          ) : (
            <p>This snowball has melted!</p>
          )}
          <h2>Snowball ID: {snowballData.id}</h2>
          <p>Max Slots: {snowballData.maxSlots}</p>
          <p>Current Price: {snowballData.price} ETH</p>
          <p>Duration: {formatDuration(snowballData.duration)}</p>
          <p>Owner: {snowballData.owner}</p>
          <p>Start Time: {formatDate(snowballData.startTime)}</p>
          <p>
            End Time:{" "}
            {formatDate(snowballData.startTime + snowballData.duration)}
          </p>
          <p>Snowball State: {snowballData.snowballState}</p>
          <p>Balance: {snowballData.balance} ETH</p>
          <p>Max Discount: {snowballData.maxDiscount.toString()}</p>
          <p>
            Available Slots Remaining:{" "}
            {snowballData.maxSlots - snowballData.numParticipants}
          </p>
          <h3>Payouts</h3>
          <ul>
            {snowballData.payouts.map((payout, index) => (
              <li key={index}>
                Step {index + 1}: {payout} ETH
              </li>
            ))}
          </ul>
          <h3>Thresholds</h3>
          <ul>
            {snowballData.thresholds.map((threshold, index) => (
              <li key={index}>
                Step {index + 1}: {threshold}
              </li>
            ))}
          </ul>
          {toThreshold !== null && nextPayout !== null && (
            <p>
              {toThreshold} additional purchases needed to save an additional{" "}
              {nextPayout} ETH!
            </p>
          )}
          <SnowballStatus Data={snowballData} />
        </>
      )}
    </div>
  );
};

export default DisplaySnowball;
