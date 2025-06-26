import Head from "next/head";
import Image from "next/image";
import styles from "../../../../styles/Home.module.css";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useRouter } from "next/router";
import {
  promoManagerABI,
  receiptManagerABI,
  contractAddresses,
} from "../../../../constants/abi";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import React, { useState, useContext, useEffect } from "react";
import { useWeb3Contract } from "react-moralis";
import DisplayDrawing from "../../../../components/DisplayDrawing.js";

import { WalletContext } from "../../../_app";

export default function Test() {
  const [wallet] = useContext(WalletContext);

  const { runContractFunction: receiptTypes } = useWeb3Contract({
    abi: receiptManagerABI,
    //contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "receiptTypes",
    params: { "": wallet },
  });

  const router = useRouter();
  const { promotionID, cohortNumber } = router.query;

  console.log(promotionID);
  console.log(cohortNumber);
  console.log(wallet);
  return (
    <div>
      <DisplayDrawing DrawingID={promotionID} />
    </div>
  );
}
