import React, { useState, useContext, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/CreateSnowball.module.css";
import { useWeb3Contract } from "react-moralis";
import { contractAddresses, LoanFactoryABI, abi } from "../constants";
import { WalletContext } from "../pages/_app";
import { ethers } from "ethers";
import Base64 from "base-64";

const DisplayLoan = ({ LoanID }) => {
  const [loanDetails, setLoanDetails] = useState(null);
  const [SnowballID, setSnowballID] = useState(null);
  const [snowballDetails, setSnowballDetails] = useState(null);
  const [svgImage, setSvgImage] = useState(null);
  const [wallet] = useContext(WalletContext);

  const { runContractFunction: getLoan } = useWeb3Contract({
    abi: LoanFactoryABI,
    contractAddress: contractAddresses[wallet?.chainId]?.LoanFactory[0],
    functionName: "Loans",
    params: { "": LoanID },
  });

  const { runContractFunction: fetchSnowball } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddresses[wallet?.chainId]?.Snowball[0],
    functionName: "getSnowball",
    params: { snowballID: SnowballID },
  });

  const { runContractFunction: fetchTokenURI } = useWeb3Contract({
    abi: LoanFactoryABI,
    contractAddress: contractAddresses[wallet?.chainId]?.LoanFactory[0],
    functionName: "tokenURI",
    params: { tokenID: LoanID },
  });

  const fetchLoan = async () => {
    try {
      if (!LoanID || !wallet?.chainId) return;
      console.log("Fetching request details for LoanID:", LoanID);

      const loan = await getLoan();
      console.log("Fetched loan details:", loan);

      setLoanDetails({
        discount: ethers.BigNumber.from(loan.discount),
        faceAmount: loan.faceAmount.toString(),
        owner: loan.owner,
        snowballID: loan.snowballID.toString(),
      });
      setSnowballID(loan.snowballID);

      const uri = await fetchTokenURI();
      const base64JSON = uri.split(",")[1];
      const decodedJSON = JSON.parse(Base64.decode(base64JSON));
      const base64SVG = decodedJSON.image.split(",")[1];
      const decodedSVG = Base64.decode(base64SVG);

      setSvgImage(decodedSVG);
    } catch (error) {
      console.error("Error fetching request details:", error);
    }
  };

  const fetchSnowballDetails = async () => {
    try {
      if (!loanDetails?.snowballID || !wallet?.chainId) return;
      console.log(
        "Fetching snowball details for SnowballID:",
        loanDetails.snowballID
      );
      console.log(SnowballID);
      const snowball = await fetchSnowball();
      console.log("Fetched snowball details:", snowball);

      setSnowballDetails({
        maxSlots: snowball[0].toString(),
        price: snowball[1].toString(),
        duration: snowball[2].toString(),
        payouts: snowball[3].map((payout) => payout.toString()),
        thresholds: snowball[4].map((threshold) => threshold.toString()),
        snowballOwner: snowball[5],
        startTime: snowball[6].toString(),
        balance: snowball[7].toString(),
        numParticipants: snowball[8].toString(),
        cohortPrices: snowball[9].map((price) => price.toString()),
      });
    } catch (error) {
      console.error("Error fetching snowball details:", error);
    }
  };

  useEffect(() => {
    fetchLoan();
  }, [LoanID, wallet?.chainId]);

  useEffect(() => {
    fetchSnowballDetails();
  }, [SnowballID, wallet?.chainId]);

  const formatDiscount = (discount) => {
    const percentage = discount / 10000;
    return percentage.toFixed(2) + "%";
  };

  const formatFaceAmount = (faceAmount) => {
    const amount = ethers.utils.formatUnits(faceAmount, 6);
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className={styles.container}>
      <h1>Loan Details</h1>
      {loanDetails ? (
        <div>
          <p>
            <strong>Loan ID:</strong> {LoanID.toString()}
          </p>
          <p>
            <strong>Discount:</strong> {formatDiscount(loanDetails.discount)}
          </p>
          <p>
            <strong>Face Amount Outstanding:</strong>{" "}
            {formatFaceAmount(loanDetails.faceAmount)}
          </p>
          <p>
            <strong>Owner:</strong> {loanDetails.owner}
          </p>
          <p>
            <strong>Snowball ID:</strong>{" "}
            <Link href={`/snowball/${loanDetails.snowballID.toString()}`}>
              <a>{loanDetails.snowballID}</a>
            </Link>
          </p>
          {svgImage && <div dangerouslySetInnerHTML={{ __html: svgImage }} />}
        </div>
      ) : (
        <p>Loading loan details...</p>
      )}
      <h2>Snowball Details</h2>
      {snowballDetails ? (
        <div>
          <p>
            <strong>Max Slots:</strong> {snowballDetails.maxSlots}
          </p>
          <p>
            <strong>Price:</strong> {formatFaceAmount(snowballDetails.price)}
          </p>
          <p>
            <strong>Duration:</strong> {snowballDetails.duration}
          </p>
          <p>
            <strong>Payouts:</strong> {snowballDetails.payouts.join(", ")}
          </p>
          <p>
            <strong>Thresholds:</strong> {snowballDetails.thresholds.join(", ")}
          </p>
          <p>
            <strong>Owner:</strong> {snowballDetails.snowballOwner}
          </p>
          <p>
            <strong>Start Time:</strong> {snowballDetails.startTime}
          </p>
          <p>
            <strong>Balance:</strong>{" "}
            {formatFaceAmount(snowballDetails.balance)}
          </p>
          <p>
            <strong>Number of Participants:</strong>{" "}
            {snowballDetails.numParticipants}
          </p>
          <p>
            <strong>Cohort Prices:</strong>{" "}
            {snowballDetails.cohortPrices.join(", ")}
          </p>
        </div>
      ) : (
        <p>Loading snowball details...</p>
      )}
    </div>
  );
};

export default DisplayLoan;
