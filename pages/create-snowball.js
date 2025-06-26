import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Header from "../components/Header.js";
import CreateSnowball from "../components/CreateSnowball.js";
import LanguageHamburger from "../components/LanguageHamburger.js";

export default function sell() {
  return (
    <div>
      <CreateSnowball />
    </div>
  );
}
