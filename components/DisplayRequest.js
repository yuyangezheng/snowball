import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/CreateSnowball.module.css";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { WCABI, contractAddresses, TokenABI } from "../constants";
import { WalletContext } from "../pages/_app";
import { ethers } from "ethers";

const DisplayRequests = ({ RequestID }) => {
  const { Moralis } = useMoralis();
  const [requestDetails, setRequestDetails] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [wallet] = useContext(WalletContext);
  const [currentAccount, setCurrentAccount] = useState(wallet?.account);
  const [loanAmount, setLoanAmount] = useState(0);

  const { runContractFunction: getRequest } = useWeb3Contract({
    abi: WCABI,
    contractAddress:
      contractAddresses[wallet?.chainId]?.SnowballWorkingCapital[0],
    functionName: "getRequest",
    params: { requestID: RequestID },
  });

  const { runContractFunction: deleteRequests } = useWeb3Contract({
    abi: WCABI,
    contractAddress:
      contractAddresses[wallet?.chainId]?.SnowballWorkingCapital[0],
    functionName: "deleteRequests",
    params: { requestIDs: toDelete },
  });

  const { runContractFunction: makeLoan } = useWeb3Contract({
    abi: WCABI,
    contractAddress:
      contractAddresses[wallet?.chainId]?.SnowballWorkingCapital[0],
    functionName: "acceptRequest",
    params: { requestID: RequestID },
  });

  const { runContractFunction: approve, error: approveError } = useWeb3Contract(
    {
      abi: TokenABI,
      contractAddress: contractAddresses[wallet.chainId]?.MyToken[0], // Address of the ERC20 token
      functionName: "approve",
      params: {
        spender: contractAddresses[wallet.chainId]?.SnowballWorkingCapital[0], // Address of the Snowball contract
        value: loanAmount * 1_000_000, // Amount to approve
      },
    }
  );

  const fetchRequest = async () => {
    try {
      if (!RequestID || !wallet?.chainId) return;
      console.log("Fetching request details for RequestID:", RequestID);

      const request = await getRequest();
      console.log("Fetched request details:", request);

      const discountPercentage = parseFloat(request.requestDiscount) / 10000;
      const formattedDiscountPercentage = (discountPercentage * 100).toFixed(2);
      const amount = parseFloat(
        ethers.utils.formatUnits(request.requestAmount, 6)
      );
      const amountToTransfer = (amount * (1 - discountPercentage)).toFixed(6);

      const startTime = parseInt(request.startTime.toString(), 10);
      const duration = parseInt(request.requestActiveDuration.toString(), 10);
      const expirationTime = new Date((startTime + duration) * 1000);
      const timeRemaining = Math.max(expirationTime - new Date(), 0);

      setRequestDetails({
        snowballID: ethers.BigNumber.from(request.snowballID),
        amount: amount.toFixed(6),
        discount: formattedDiscountPercentage,
        amountToTransfer,
        snowballOwner: request.owner.toString(),
        expirationTime: expirationTime.toLocaleString(),
        timeRemaining: new Date(timeRemaining).toISOString().substr(11, 8), // Format as HH:MM:SS
      });
      setLoanAmount(
        amount * (1 - discountPercentage) +
          (amount * (1 - discountPercentage) * 20) / 10000
      );
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [RequestID, wallet?.chainId]);

  useEffect(() => {
    const handleAccountChange = (accounts) => {
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      } else {
        setCurrentAccount(null);
      }
    };

    Moralis.onAccountChanged(handleAccountChange);

    // Clean up the listener on component unmount
    return () => {
      Moralis.onAccountChanged(handleAccountChange);
    };
  }, [Moralis]);

  useEffect(() => {
    if (currentAccount) {
      fetchRequest();
    }
  }, [currentAccount]);

  const handleCancel = () => {
    setToDelete([RequestID]);
  };

  useEffect(() => {
    const cancelRequest = async () => {
      if (!toDelete) return;
      try {
        await deleteRequests();
        console.log("Request cancelled successfully.");
        // Optionally, refresh or update the state here
        setToDelete(null); // Reset the toDelete state after deletion
      } catch (error) {
        console.error("Error cancelling request:", error);
      }
    };

    cancelRequest();
  }, [toDelete]);

  const handleMakeLoan = async () => {
    try {
      console.log(loanAmount);
      await approve();
      await makeLoan();
      console.log("Loan made successfully.");
    } catch (error) {
      console.error("Error making loan:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Request Details</h1>
      {requestDetails ? (
        <div>
          <p>Request ID: {RequestID.toString()}</p>
          <p>Snowball ID: {requestDetails.snowballID.toString()}</p>
          <p>Face Amount: {requestDetails.amount} USDC</p>
          <p>Discount Percentage: {requestDetails.discount}%</p>
          <p>Amount to Transfer: {requestDetails.amountToTransfer} USDC</p>
          <p>
            Snowball Owner:{" "}
            <a
              href={`https://etherscan.io/address/${requestDetails.snowballOwner}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {requestDetails.snowballOwner}
            </a>
          </p>
          <p>Expiration Time: {requestDetails.expirationTime}</p>
          <p>Time Remaining: {requestDetails.timeRemaining}</p>
          {currentAccount === requestDetails.snowballOwner ? (
            <button onClick={handleCancel}>Cancel Request</button>
          ) : (
            <button onClick={handleMakeLoan}>Make Loan</button>
          )}
        </div>
      ) : (
        <p>Loading request details...</p>
      )}
    </div>
  );
};

export default DisplayRequests;
