import React, { useState, useEffect, useContext } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../../../styles/sell-introduction.module.css";
import FinanceSidebar from "../../../components/FinanceSidebar";
import { WCABI, contractAddresses } from "../../../constants";
import { useWeb3Contract } from "react-moralis";
import { WalletContext } from "../../../pages/_app";
import { ethers } from "ethers";
import DisplayRequest from "../../../components/DisplayRequest"; // Ensure this path is correct

export default function Finance() {
  const [wallet] = useContext(WalletContext);
  const [actives, setActives] = useState([]);

  const { runContractFunction: getActiveRequests } = useWeb3Contract({
    abi: WCABI,
    contractAddress:
      contractAddresses[wallet?.chainId]?.SnowballWorkingCapital[0],
    functionName: "getActiveRequests",
    params: { numberToReturn: 5 },
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!wallet?.chainId) {
          console.log("Waiting for wallet to be available...");
          return;
        }

        // Introduce a 1-second delay before calling getActiveRequests
        setTimeout(async () => {
          let listOfActives = await getActiveRequests();
          console.log("Active requests:", listOfActives);
          console.log(WCABI);

          if (Array.isArray(listOfActives)) {
            setActives(listOfActives);
          } else {
            console.error("Unexpected response format:", listOfActives);
          }
        }, 1000); // 1 second delay
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, [wallet]);

  useEffect(() => {
    console.log("Actives updated:", actives);
  }, [actives]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <FinanceSidebar />
        <main className={styles.main}>
          <h1 className={styles.title}>List of Active Requests</h1>
          {Array.isArray(actives) && actives.length > 0 ? (
            actives.map((requestID, index) => (
              <DisplayRequest key={index} RequestID={requestID} />
            ))
          ) : (
            <p>No active requests found.</p>
          )}
        </main>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Snowball Protocol. All rights reserved.</p>
      </footer>
    </div>
  );
}
