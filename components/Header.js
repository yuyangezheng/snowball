import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Header.module.css";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import LanguageHamburger from "./LanguageHamburger";
import { useMoralis } from "react-moralis";
import { WalletContext } from "../pages/_app";

let web3Modal;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: { 11155111: process.env.sepolia_RPC_URL },
    },
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "Web 3 Modal Demo",
      rpc: { 11155111: process.env.sepolia_RPC_URL },
    },
  },
};

if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });
}

export default function Header() {
  const { enableWeb3 } = useMoralis();
  const router = useRouter();
  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();
  const [account, setAccount] = useState();
  const [chainId, setChainId] = useState();
  const [network, setNetwork] = useState();
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useContext(WalletContext);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);

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
      setChainId(network["chainId"]);
      setWallet({
        provider: provider,
        library: library,
        account: accounts[0],
        network: network,
        chainId: network["chainId"],
      });
      enableWeb3();
      setError(null); // Clear error if wallet connection is successful
    } catch (error) {
      setError("Failed to connect wallet. Please try again.");
      console.error(error);
    }
  };

  const refreshState = () => {
    setAccount(null);
    setProvider(null);
    setLibrary(null);
    setNetwork(null);
    setError(null);
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        setAccount(accounts[0]);
      };

      const handleChainChanged = (chainId) => {
        setChainId(chainId);
      };

      const handleDisconnect = () => {
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  const toggleAboutDropdown = () => {
    setShowAboutDropdown(!showAboutDropdown);
  };

  const toggleShopDropdown = () => {
    setShowShopDropdown(!showShopDropdown);
  };

  const toggleCommunityDropdown = () => {
    setShowCommunityDropdown(!showCommunityDropdown);
  };

  const closeDropdowns = () => {
    setShowAboutDropdown(false);
    setShowShopDropdown(false);
    setShowCommunityDropdown(false);
  };

  return (
    <div className={styles.Header}>
      <div className={styles.headerTop}>
        <div className={styles.logo}>
          {/* Assuming you have a logo */}
          <img src="/logo.jpg" alt="Logo" />
        </div>
        <div className={styles.headerContent}>
          <LanguageHamburger />
          <h1 className={styles.headerTitle}>
            Welcome to the Snowball Protocol!
          </h1>
        </div>
        <div className={styles.connectButton}>
          {account ? (
            <>
              <div>Connection Status: Connected</div>
              <div>Wallet Address: {account}</div>
              <button
                className={styles["disconnect-button"]}
                onClick={disconnect}
              >
                Disconnect
              </button>
            </>
          ) : (
            <a className={styles["connect-link"]} onClick={connectWallet}>
              Connect Wallet
            </a>
          )}
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>

      <div className={styles.links}>
        <div
          className={styles.menuItem}
          onMouseEnter={toggleShopDropdown}
          onMouseLeave={closeDropdowns}
        >
          <a href="#">Shop on Snowball</a>
          {showShopDropdown && (
            <div className={styles.dropdown}>
              <a href="/media">Fulfilled by Snowball Media</a>
              <a href="/listings">Ecosystem Listings</a>
            </div>
          )}
        </div>
        <div
          className={styles.menuItem}
          onMouseEnter={toggleAboutDropdown}
          onMouseLeave={closeDropdowns}
        >
          <a href="#">About Us</a>
          {showAboutDropdown && (
            <div className={styles.dropdown}>
              <a href="/whitepaper">WhitePaper</a>
              <a href="/contact">Contact</a>
            </div>
          )}
        </div>
        <div
          className={styles.menuItem}
          onMouseEnter={toggleCommunityDropdown}
          onMouseLeave={closeDropdowns}
        >
          <a href="#">Community</a>
          {showCommunityDropdown && (
            <div className={styles.dropdown}>
              <a href="/discord">Discord</a>
              <a href="/telegram">Telegram</a>
              <a href="/x">X</a>
            </div>
          )}
        </div>
        <a href="/developers">Developers</a>
        <a href="/faq">FAQ</a>
        <a href="/sell">Sell on Snowball</a>
        <a href="/finance">Snowball Finance</a>
      </div>
    </div>
  );
}
