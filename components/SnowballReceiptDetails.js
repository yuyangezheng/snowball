import React, { useState, useContext, useEffect } from "react";
import styles from "../styles/NFT.module.css";
import { useWeb3Contract } from "react-moralis";
import {
  snowballManagerABI,
  ercTokenABI,
  receiptManagerABI,
  drawingManagerABI,
  seedManagerABI,
  contractAddresses,
} from "../constants";
import { WalletContext } from "../pages/_app";
import { ethers } from "ethers";

const SnowballReceiptDetails = ({ receiptId }) => {
  const [receiptContext, setReceiptContext] = useState(null);
  const [receiptDetails, setReceiptDetails] = useState(null);
  const [receiptOwnerERC, setReceiptOwnerERC] = useState(null);
  const [receiptOwnerNonERC, setReceiptOwnerNonERC] = useState(null);
  const [receiver, setReceiver] = useState("8");
  const [wallet] = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [royaltyDetails, setRoyaltyDetails] = useState(null);
  const [URI, setURI] = useState(null);

  const { runContractFunction: getReceiptContext } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "tokenContexts",
    params: { "": receiptId },
  });

  const { runContractFunction: getSnowballReceipt } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
    functionName: "SnowballReceipts",
    params: { "": receiptId },
  });

  const { runContractFunction: transferToken } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "transferFrom",
    params: {
      from: wallet.account,
      to: receiver,
      tokenId: receiptId,
    },
  });

  const { runContractFunction: getERC721Owner } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "ownerOf",
    params: { tokenId: receiptId },
  });

  const { runContractFunction: royaltyInfo } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "royaltyInfo",
    params: {
      tokenId: receiptId,
      salePrice: 1000000,
    },
  });

  const { runContractFunction: getURI } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "tokenURI",
    params: { tokenID: receiptId },
  });

  const { runContractFunction: getNonERCSnowballOwner } = useWeb3Contract({
    abi: snowballManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.snowballManager[0],
    functionName: "unmintedReceiptsToOwners",
    params: { "": receiptId },
  });

  const getContext = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReceiptContext();
      console.log(result);
      setReceiptContext({
        promotionID: result.promotionID,
        participantNumber: result.participantNumber,
      });
    } catch (err) {
      setError("Failed to fetch receipt context.");
    } finally {
      setLoading(false);
    }
  };

  const handleSnowballReceipt = async () => {
    try {
      console.log("Hi");
      const result = await getSnowballReceipt();
      console.log(result);
      setReceiptDetails({
        snowballID: result.snowballID,
        effectivePricePaid: result.effectivePricePaid,
      });
      const tokenOwner = await getERC721Owner();
      console.log(tokenOwner);
      setReceiptOwnerERC(tokenOwner);
      const nonTokenOwner = await getNonERCSnowballOwner();
      console.log(nonTokenOwner);
      setReceiptOwnerNonERC(nonTokenOwner);

      console.log("About to get URI");
      const returnedURI = await getURI();
      console.log(returnedURI);
      setURI(returnedURI);
      const royalty = await royaltyInfo();
      console.log(royalty);
      setRoyaltyDetails(royalty);
    } catch (err) {
      setError("Failed to fetch snowball receipt.");
    }
  };

  const handleTransfer = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!receiver) {
        setError("Please enter a valid receiver address.");
        return;
      }
      console.log(receiver);
      console.log(wallet);
      console.log(wallet.account);
      const result = await transferToken();
      console.log("Transfer successful");
      setReceiver("");
      console.log(result);
    } catch (err) {
      console.error(err);
      setError("Failed to transfer token.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      receiptContext &&
      ethers.BigNumber.from(receiptContext.promotionID).lte(
        ethers.constants.MaxUint256.div(10)
      )
    ) {
      handleSnowballReceipt();
    }
  }, [receiptContext]);

  useEffect(() => {
    if (!wallet.chainId || !wallet.account) return;
    getContext();
  }, [wallet.chainId, wallet.account]);

  return (
    <div className={styles.receiptDetails}>
      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {receiptContext && (
        <div>
          <h2>Receipt Context</h2>
          <p>
            <strong>Promotion ID:</strong>{" "}
            {ethers.utils.formatUnits(receiptContext.promotionID, 0)}
          </p>
          <p>
            <strong>Participant Number:</strong>{" "}
            {ethers.utils.formatUnits(receiptContext.participantNumber, 0)}
          </p>
        </div>
      )}

      {receiptDetails && (
        <div>
          <h2>Snowball Receipt Details</h2>
          <p>
            <strong>Snowball ID:</strong>{" "}
            {ethers.utils.formatUnits(receiptDetails.snowballID, 0)}
          </p>
          <p>
            <strong>Effective Price Paid:</strong>{" "}
            {ethers.utils.formatUnits(receiptDetails.effectivePricePaid, 6)} ETH
          </p>
          <p>
            <strong>Owner (ERC721):</strong> {receiptOwnerERC}
          </p>
          <p>
            <strong>Owner (Non-ERC):</strong> {receiptOwnerNonERC}
          </p>
        </div>
      )}

      {URI && (
        <div>
          <h2>URI</h2>
          <p>{URI}</p>
        </div>
      )}

      {royaltyDetails && (
        <div>
          <h2>Royalty Details</h2>
          <p>
            <strong>Receiver:</strong> {royaltyDetails.receiver}
          </p>
          <p>
            <strong>Royalty Amount (per USDC):</strong>{" "}
            {ethers.utils.formatUnits(royaltyDetails.royaltyAmount, 6)} USDC
          </p>
        </div>
      )}

      <div className={styles.transferSection}>
        <h2>Transfer Token</h2>
        <input
          type="text"
          placeholder="Enter receiver address"
          value={receiver || ""}
          onChange={(e) => setReceiver(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleTransfer} className={styles.button}>
          Transfer
        </button>
      </div>
    </div>
  );
};

export default SnowballReceiptDetails;
