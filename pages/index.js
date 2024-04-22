import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { abi } from "../constants";
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

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [signer, setSigner] = useState(undefined);

  useEffect(() => {
    console.log("hi");
  });

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });

  async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
        const web3ModalProvider = await web3Modal.connect();
        setIsConnected(true);
        const provider = new ethers.providers.Web3Provider(web3ModalProvider);
        setSigner(provider.getSigner());
      } catch (e) {
        console.log(e);
      }
    } else {
      setIsConnected(false);
    }
  }

  async function execute() {
    if (typeof window.ethereum !== "undefined") {
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        await contract.store(42);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  const refreshState = () => {
    setAccount();
    //setChainId();
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  return (
    <div>
      {hasMetamask ? (
        isConnected ? (
          "Connected! "
        ) : (
          <button onClick={() => connect()}>Connect</button>
        )
      ) : (
        "Please install metamask"
      )}

      {isConnected ? <button onClick={() => execute()}>Execute</button> : ""}
      {<button onClick={disconnect}>Disconnect</button>}
    </div>
  );
}
