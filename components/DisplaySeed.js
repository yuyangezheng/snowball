import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../pages/_app";
import { useWeb3Contract } from "react-moralis";
import { seedManagerABI, contractAddresses } from "../constants";
import JoinSeed from "./JoinSeed";
import { ethers } from "ethers";

const DisplaySeed = ({ SeedID }) => {
  const [wallet] = useContext(WalletContext);
  const [seedData, setSeedData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [URIRoot, setURIRoot] = useState("");
  const [basisPoints, setBasisPoints] = useState("");

  const { runContractFunction: GetSeed } = useWeb3Contract({
    abi: seedManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.seedManager[0],
    functionName: "Seeds",
    params: { "": SeedID },
  });

  const { runContractFunction: GetSeedParticipants } = useWeb3Contract({
    abi: seedManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.seedManager[0],
    functionName: "getPromotionReceipts",
    params: { promotionID: SeedID },
  });

  const { runContractFunction: CancelSeed } = useWeb3Contract({
    abi: seedManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.seedManager[0],
    functionName: "cancelSeed",
    params: { seedID: SeedID },
  });

  const { runContractFunction: setRoyalty } = useWeb3Contract({
    abi: seedManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.seedManager[0],
    functionName: "setRoyalty",
    params: {
      promotionID: SeedID,
      basisPoints: basisPoints,
    },
  });

  const { runContractFunction: setURI } = useWeb3Contract({
    abi: seedManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.seedManager[0],
    functionName: "setPromotionURI",
    params: {
      promotionID: SeedID,
      newURIRoot: URIRoot,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transaction = await GetSeed();
        console.log("Seed Data:", transaction);
        const participants = await GetSeedParticipants();

        const numParticipants = participants.length; //revise
        console.log(transaction);

        const maxSlots = transaction.maxSlots.toNumber();
        const numSeeds = transaction.numSeeds.toNumber();
        const sharedAmount = ethers.utils.formatUnits(
          transaction.sharedAmount,
          6
        );
        const earnedAmount = ethers.utils.formatUnits(
          transaction.earnedAmount,
          6
        );

        setSeedData({
          maxSlots,
          price: transaction.price,
          numSeeds,
          sharedAmount,
          earnedAmount,
          owner: transaction.owner,
          endTime: transaction.endTime.toNumber(),
          ID: SeedID,
          numParticipants: numParticipants,
        });

        if (transaction.endTime.toNumber() > Math.floor(Date.now() / 1000)) {
          setTimeRemaining(
            `${Math.floor(
              (transaction.endTime.toNumber() - Math.floor(Date.now() / 1000)) /
                3600
            )} hours remaining`
          );
        } else {
          console.log(transaction.endTime.toNumber());
          setTimeRemaining("This seed has melted!");
        }
      } catch (error) {
        console.error("Error fetching seed data:", error);
      }
    };

    fetchData();
  }, [SeedID, GetSeed]);

  const handleCancelSeed = async () => {
    try {
      await CancelSeed();
      alert("Promotion successfully canceled!");
    } catch (error) {
      console.error("Error canceling promotion:", error);
    }
  };

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
      console.log("clicked for new URI");
      await setURI();
      alert("URI updated successfully!");
    } catch (error) {
      console.error("Error setting URI:", error);
    }
  };

  return (
    <div>
      <h1>Details for Seed {SeedID}</h1>
      {seedData ? (
        <>
          <p>{timeRemaining}</p>
          <h2>Seed ID: {SeedID}</h2>
          <p>Max Slots: {seedData.maxSlots}</p>
          <p>
            Current Price: {ethers.utils.formatUnits(seedData.price, 6)} Token
          </p>
          <p>Owner: {seedData.owner}</p>
          <p>End Time: {new Date(seedData.endTime * 1000).toLocaleString()}</p>
          <p>Shared Amount: {seedData.sharedAmount} Token</p>
          <p>
            Earned Amount Per Seed: {seedData.earnedAmount / seedData.numSeeds}{" "}
            Token
          </p>
          <p>Earned Amount Total: {seedData.earnedAmount} Token</p>
          <p>Number of Seeds: {seedData.numSeeds} Token</p>
          <p>Number of Participants: {seedData.numParticipants} Token</p>
          <button onClick={handleCancelSeed}>Cancel Promotion</button>
          <h3>Set Royalty (Basis Points):</h3>
          <input
            type="number"
            value={basisPoints}
            onChange={(e) => setBasisPoints(e.target.value)}
            placeholder="Enter basis points"
          />
          <button onClick={handleSetRoyalty}>Set Royalty</button>
          <JoinSeed Data={seedData} SeedID={SeedID} />

          <h3>Set URI:</h3>
          <input
            type="text"
            value={URIRoot}
            onChange={(e) => setURIRoot(e.target.value)}
            placeholder="Enter new URI"
          />
          <button onClick={handleSetURI}>Set URI</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DisplaySeed;
