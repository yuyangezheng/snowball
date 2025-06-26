import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../pages/_app";
import { useWeb3Contract } from "react-moralis";
import {
  snowballManagerABI,
  ercTokenABI,
  receiptManagerABI,
  drawingManagerABI,
  seedManagerABI,
  contractAddresses,
} from "../constants";
import JoinSnowball from "./JoinSnowball";
import { ethers } from "ethers";

const DisplaySnowball = ({ SnowballID }) => {
  const [wallet] = useContext(WalletContext);
  const [snowballData, setSnowballData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [toThreshold, setToThreshold] = useState(null);
  const [nextPayout, setNextPayout] = useState(null);
  const [excessCustody, setExcessCustody] = useState(null); // State for excess custody
  const [URIRoot, setURIRoot] = useState("");
  const [basisPoints, setBasisPoints] = useState("");

  const { runContractFunction: GetSnowball } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
    functionName: "getSnowball",
    params: { snowballID: SnowballID },
  });

  const { runContractFunction: GetSnowballParticipants } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
    functionName: "getPromotionReceipts",
    params: { promotionID: SnowballID },
  });

  const { runContractFunction: CalculateExcessSnowballCustody } =
    useWeb3Contract({
      abi: snowballManagerABI,
      contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
      functionName: "calculateExcessSnowballCustody",
      params: { snowballID: SnowballID },
    });

  const { runContractFunction: CancelSnowball } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
    functionName: "cancelSnowball",
    params: { snowballID: SnowballID },
  });

  const { runContractFunction: RetrieveExcessSnowballCustody } =
    useWeb3Contract({
      abi: snowballManagerABI,
      contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
      functionName: "retrieveExcessSnowballCustody",
      params: { snowballID: SnowballID },
    });

  const { runContractFunction: setRoyalty } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
    functionName: "setRoyalty",
    params: {
      promotionID: SnowballID,
      basisPoints: basisPoints,
    },
  });

  const { runContractFunction: setURI } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
    functionName: "setPromotionURI",
    params: {
      promotionID: SnowballID,
      newURIRoot: URIRoot,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transaction = await GetSnowball();
        const participants = await GetSnowballParticipants();
        console.log(transaction);
        console.log(participants);
        const maxSlots = transaction.maxSlots.toNumber();
        const numParticipants = participants.length; //revise
        console.log(numParticipants);
        const thresholds = extractThresholds(transaction.thresholds);
        console.log(1);
        const cohortPrices = extractCohortPrices(transaction.cohortPrices);
        console.log(1);

        const payouts = cohortPrices
          .slice(1)
          .map((price, index) => -1 * (price - cohortPrices[index]));

        let price = cohortPrices[0];
        for (let i = 0; i < thresholds.length; i++) {
          if (numParticipants >= thresholds[i]) {
            price = cohortPrices[i + 1];
          } else {
            break;
          }
        }
        console.log(1);

        const custodyValue = await CalculateExcessSnowballCustody();
        console.log(custodyValue);
        setExcessCustody(ethers.utils.formatUnits(custodyValue, 6)); // Store custody value
        console.log(1);

        setSnowballData({
          maxSlots: maxSlots,
          price: price,
          thresholds: thresholds,
          cohortPrices: cohortPrices,
          payouts: payouts,
          owner: transaction.owner,
          endTime: transaction.endTime,
          custodyBalance: ethers.utils.formatUnits(custodyValue, 6),
          numParticipants: numParticipants,
          ID: SnowballID,
        });
      } catch (error) {
        console.log("Error in contract execution:", error);
      }
    };

    fetchData();
  }, [SnowballID]);

  const handleCancelSnowball = async () => {
    try {
      await CancelSnowball();
      alert("Promotion successfully canceled!");
    } catch (error) {
      console.error("Error canceling promotion:", error);
    }
  };

  const handleRetrieveCustody = async () => {
    try {
      await RetrieveExcessSnowballCustody();
      alert("Excess custody successfully retrieved!");
    } catch (error) {
      console.error("Error retrieving excess custody:", error);
    }
  };

  const extractCohortPrices = (cohortPrices) =>
    Object.values(cohortPrices).map((bigNumber) =>
      parseFloat(ethers.utils.formatUnits(bigNumber, 6))
    );

  const extractThresholds = (thresholds) =>
    Object.values(thresholds).map((bigNumber) =>
      parseInt(bigNumber.toString(), 10)
    );

  const handleSetRoyalty = async () => {
    try {
      await setRoyalty();
      alert("Royalty updated successfully!");
    } catch (error) {
      console.error("Error setting royalty:", error);
    }
  };

  const handleSetURI = async () => {
    try {
      await setURI();
      alert("URI updated successfully!");
    } catch (error) {
      console.error("Error setting URI:", error);
    }
  };

  return (
    <div>
      <h1>Details for Snowball {SnowballID}</h1>
      {snowballData ? (
        snowballData.startTime === 0 ? (
          <p>Invalid Snowball ID</p>
        ) : (
          <>
            {snowballData.endTime > Math.floor(Date.now() / 1000) &&
            snowballData.numParticipants < snowballData.maxSlots ? (
              <p>Time Remaining: {timeRemaining}</p>
            ) : (
              <p>This snowball has melted!</p>
            )}
            <h2>Snowball ID: {SnowballID}</h2>
            <p>Max Slots: {snowballData.maxSlots}</p>
            <p>Current Price: {snowballData.price} Token</p>
            <p>Owner: {snowballData.owner}</p>
            <p>Current Number of Sales: {snowballData.numParticipants}</p>
            <p>
              End Time: {new Date(snowballData.endTime * 1000).toLocaleString()}
            </p>
            <p>Balance: {snowballData.custodyBalance} Token</p>
            <h3>Thresholds:</h3>
            <ul>
              {snowballData.thresholds.map((threshold, index) => (
                <li key={index}>
                  Threshold {index + 1}: {threshold}
                </li>
              ))}
            </ul>
            <h3>Cohort Prices:</h3>
            <ul>
              {snowballData.cohortPrices.map((cohortPrice, index) => (
                <li key={index}>
                  Price {index + 1}: {cohortPrice}
                </li>
              ))}
            </ul>
            <p>Excess Custody: {excessCustody} Token</p>
            <button onClick={handleCancelSnowball}>Cancel Promotion</button>
            <button onClick={handleRetrieveCustody}>
              Retrieve Excess Custody
            </button>

            <h3>Set Royalty (Basis Points):</h3>
            <input
              type="number"
              value={basisPoints}
              onChange={(e) => setBasisPoints(e.target.value)}
              placeholder="Enter basis points"
            />
            <button onClick={handleSetRoyalty}>Set Royalty</button>

            <h3>Set URI:</h3>
            <input
              type="text"
              value={URIRoot}
              onChange={(e) => setURIRoot(e.target.value)}
              placeholder="Enter new URI"
            />
            <button onClick={handleSetURI}>Set URI</button>
            <JoinSnowball Data={snowballData} SnowballID={SnowballID} />
          </>
        )
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DisplaySnowball;
