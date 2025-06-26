import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { WalletContext } from "../pages/_app";
import React, { useContext, useEffect, useState } from "react";
import { abi, WCABI, contractAddresses } from "../constants";
import DisplaySnowball from "../components/DisplaySnowball";
import GetRequests from "../components/GetRequests";
import RequestLoan from "../components/RequestLoan";

export default function WCRequestPage() {
  const [wallet] = useContext(WalletContext);
  const [address, setAddress] = useState("");
  const [snowballs, setSnowballs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [fetchTriggered, setFetchTriggered] = useState(false);

  const { runContractFunction: GetSnowball, error } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddresses[wallet?.chainId]?.Snowball[0],
    functionName: "getSnowballsByOwner",
    params: {
      user: address,
    },
  });

  useEffect(() => {
    if (wallet?.account) {
      setAddress(wallet.account);
    }
  }, [wallet]);

  const handleClick = async () => {
    setFetchTriggered(true);
    setLoading(true);
    setFetchError(null);

    try {
      // Ensure address is set before calling contract function
      if (!address) {
        throw new Error("Wallet address not available");
      }

      const snowballs = await GetSnowball();
      console.log("Fetched snowballs:", snowballs);

      if (Array.isArray(snowballs)) {
        setSnowballs(snowballs.map((snowball) => snowball.toString()));
      } else {
        console.error("Unexpected response format:", snowballs);
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("Error fetching snowballs:", err);
      setFetchError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Your Active Snowball Contracts</h1>
      <button onClick={handleClick} disabled={fetchTriggered}>
        {fetchTriggered ? "Fetched..." : "Fetch Snowballs"}
      </button>
      {fetchTriggered && (
        <>
          {loading ? (
            <p>Loading...</p>
          ) : fetchError ? (
            <p>Error fetching snowball contracts: {fetchError.message}</p>
          ) : snowballs.length > 0 ? (
            <div>
              {snowballs.map((snowballId, index) => (
                <div key={index}>
                  <DisplaySnowball SnowballID={snowballId} />
                  <GetRequests SnowballID={snowballId} />
                  <RequestLoan SnowballID={snowballId} />
                </div>
              ))}
            </div>
          ) : (
            <p>No active snowball contracts found.</p>
          )}
        </>
      )}
    </div>
  );
}
