import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import WalletConnectProvider from "@walletconnect/web3-provider";
import React, { useState, useContext } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const WalletContext = React.createContext();

export default function App({ Component, pageProps }) {
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

  const [wallet, setWallet] = useState({
    provider: 0,
    library: 0,
    account: 0,
    network: 0,
    chainId: 0,
  });

  return (
    <MoralisProvider initializeOnMount={false}>
      <WalletContext.Provider value={[wallet, setWallet]}>
        <Header></Header>
        <Component {...pageProps} />
        <Footer></Footer>
      </WalletContext.Provider>
    </MoralisProvider>
  );
}
