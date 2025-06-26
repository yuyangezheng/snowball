import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/CreateSnowball.module.css";
import { useWeb3Contract } from "react-moralis";
import { WCABI, contractAddresses } from "../constants";
import { WalletContext } from "../pages/_app";
import DisplayRequest from "./DisplayRequest"; // Ensure you have this component
import { ethers } from "ethers"; // Import ethers

const GetRequests = ({ SnowballID }) => {
  const [requestList, setRequestList] = useState([]);
  const [wallet] = useContext(WalletContext);
  const router = useRouter();

  const { runContractFunction: getRequestsBySnowballID } = useWeb3Contract({
    abi: WCABI,
    contractAddress:
      contractAddresses[wallet.chainId]?.SnowballWorkingCapital[0],
    functionName: "getRequestsBySnowballID",
    params: { snowballID: SnowballID },
  });

  useEffect(() => {
    const fetchRequestList = async () => {
      try {
        if (!SnowballID || !wallet?.chainId) return;
        console.log("Fetching requests for SnowballID:", SnowballID);

        const list = await getRequestsBySnowballID();
        console.log("Fetched request list:", list);
        setRequestList(list);
      } catch (error) {
        console.error("Error fetching request list:", error);
      }
    };

    fetchRequestList();
  }, [SnowballID, wallet?.chainId]);

  return (
    <div className={styles.container}>
      <h1>Active Requests</h1>
      {requestList.length > 0 ? (
        <>
          {requestList
            .filter((requestID) => {
              console.log("Checking requestID:", requestID);
              return (
                requestID !== 0 &&
                requestID !== "0" &&
                requestID !== "0x0" &&
                !ethers.BigNumber.from(requestID).isZero()
              );
            })
            .map((requestID, index) => (
              <div key={index}>
                <DisplayRequest RequestID={requestID} />
                <p>Request ID: {requestID.toString()}</p>
              </div>
            ))}
        </>
      ) : (
        <p>No active requests for this snowball.</p>
      )}
    </div>
  );
};

export default GetRequests;
