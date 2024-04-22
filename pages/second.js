import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { abi } from "../constants/abi";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";

let web3Modal;
let isWeb3Enabled;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: { 11155111: process.env.sepolia_RPC_URL }, // required
    },
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "Web 3 Modal Demo",
      rpc: { 11155111: process.env.sepolia_RPC_URL }, // required
      //infuraId: process.env.INFURA_KEY
    },
  },
};

if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions, // required
  });
}

export default function App() {
  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [network, setNetwork] = useState();

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      setProvider(provider);
      setLibrary(library);
      if (accounts) setAccount(accounts[0]);
      setNetwork(network);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshState = () => {
    setAccount();
    //setChainId();
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  return (
    <div className="App">
      <button onClick={connectWallet}>Connect Wallet</button>
      <div>Connection Status: ${!!account}</div>
      <div>Wallet Address: ${account}</div>
      {<button onClick={disconnect}>Disconnect</button>}
    </div>
  );
}
