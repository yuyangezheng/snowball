import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import Web3Modal from "web3modal";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Header from "../../components/Header.js";
import SearchSnowballUser from "../../components/SearchSnowballUser.js";
import SearchSeedUser from "../../components/SearchSeedUser.js";
import SearchDrawingUser from "../../components/SearchDrawingUser.js";
import PaymentRouter from "../../components/PaymentRouter.js";

export default function Test() {
  return (
    <div>
      <SearchSnowballUser />
      <SearchSeedUser />
      <SearchDrawingUser />
      <PaymentRouter />
    </div>
  );
}
