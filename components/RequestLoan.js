import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../pages/_app";
import { useWeb3Contract } from "react-moralis";
import { WCABI, contractAddresses } from "../constants";
import { ethers } from "ethers";

// Utility function to create a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RequestLoan = ({ SnowballID }) => {
  const [wallet] = useContext(WalletContext);
  const [snowballMetrics, setSnowballMetrics] = useState({
    price: 0,
    maxSlots: 0,
    duration: 0,
    totalDebt: 0,
    owner: 0,
    startTime: 0,
    numParticipants: 0,
    balance: 0,
    cohortTicketAmounts: [0],
    cohortPrices: [0],
    thresholds: [0],
  });
  const [availableCapital, setAvailableCapital] = useState(null);
  const [amountToRequest, setAmountToRequest] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [requestDurations, setRequestDurations] = useState("");
  const [requestActiveTime, setRequestActiveTime] = useState({
    days: "",
    hours: "",
    minutes: "",
  });
  const [requestParams, setRequestParams] = useState({
    snowballID: 0,
    discount: 0,
    amount: 0,
    duration: 0,
    transactions: 0,
  });

  const { runContractFunction: getMetrics } = useWeb3Contract({
    abi: WCABI,
    contractAddress:
      contractAddresses[wallet?.chainId]?.SnowballWorkingCapital[0],
    functionName: "getSnowballMetrics",
    params: {
      snowballID: SnowballID,
    },
  });

  const { runContractFunction: availableWorkingCapital } = useWeb3Contract({
    abi: WCABI,
    contractAddress:
      contractAddresses[wallet?.chainId]?.SnowballWorkingCapital[0],
    functionName: "availableWorkingCapital",
    params: {
      metrics: [
        snowballMetrics.price,
        snowballMetrics.maxSlots,
        snowballMetrics.duration,
        snowballMetrics.totalDebt,
        snowballMetrics.owner,
        snowballMetrics.startTime,
        snowballMetrics.numParticipants,
        snowballMetrics.balance,
        snowballMetrics.cohortTicketAmounts,
        snowballMetrics.cohortPrices,
        snowballMetrics.thresholds,
      ],
    },
  });

  const { runContractFunction: makeRequest } = useWeb3Contract({
    abi: WCABI,
    contractAddress:
      contractAddresses[wallet?.chainId]?.SnowballWorkingCapital[0],
    functionName: "RequestWorkingCapital",
    params: {
      snowballID: requestParams.snowballID,
      discount: requestParams.discount,
      amount: requestParams.amount,
      duration: requestParams.duration,
      transactions: requestParams.transactions,
    },
  });

  const reformatMetrics = (metrics) => {
    return {
      price: ethers.BigNumber.from(metrics.price),
      maxSlots: ethers.BigNumber.from(metrics.maxSlots),
      duration: ethers.BigNumber.from(metrics.duration),
      totalDebt: ethers.BigNumber.from(metrics.totalDebt),
      owner: metrics.owner,
      startTime: ethers.BigNumber.from(metrics.startTime),
      numParticipants: ethers.BigNumber.from(metrics.numParticipants),
      balance: ethers.BigNumber.from(metrics.balance),
      cohortTicketAmounts: metrics.cohortTicketAmounts.map((amount) =>
        ethers.BigNumber.from(amount)
      ),
      cohortPrices: metrics.cohortPrices.map((price) =>
        ethers.BigNumber.from(price)
      ),
      thresholds: metrics.thresholds.map((threshold) =>
        ethers.BigNumber.from(threshold)
      ),
    };
  };

  useEffect(() => {
    const calculateLoanable = async () => {
      try {
        if (!snowballMetrics) return;
        console.log(
          "Fetching available working capital for metrics:",
          snowballMetrics
        );
        await delay(1000); // Wait for 1 second
        const capital = await availableWorkingCapital();
        console.log("Available working capital fetched:", capital);
        setAvailableCapital(capital);
        setAmountToRequest(ethers.utils.formatUnits(capital, 6)); // Set default value for amountToRequest
      } catch (error) {
        console.error("Error fetching available working capital:", error);
      }
    };

    if (wallet?.chainId && snowballMetrics.owner != 0) {
      calculateLoanable();
    }
  }, [snowballMetrics]);

  useEffect(() => {
    const fetchSnowballMetrics = async () => {
      try {
        console.log("Fetching metrics for SnowballID:", SnowballID);
        await delay(1000); // Wait for 1 second
        const metrics = await getMetrics();
        console.log("Metrics fetched:", metrics);
        console.log(metrics.totalDebt);
        let reformatted = reformatMetrics(metrics);
        setSnowballMetrics(reformatted);
      } catch (error) {
        console.error("Error fetching snowball metrics:", error);
      }
    };

    if (wallet?.chainId && SnowballID) {
      fetchSnowballMetrics();
    }
  }, [wallet?.chainId, SnowballID]);

  const handleMaxClick = () => {
    if (availableCapital) {
      setAmountToRequest(availableCapital);
    }
  };

  const handleMaxDurationsClick = () => {
    const maxDurations =
      snowballMetrics.maxSlots - snowballMetrics.numParticipants;
    setRequestDurations(maxDurations.toString());
  };

  const handleSubmit = async () => {
    const durationInSeconds =
      parseInt(requestActiveTime.days) * 24 * 60 * 60 +
      parseInt(requestActiveTime.hours) * 60 * 60 +
      parseInt(requestActiveTime.minutes) * 60;
    const discountInBasisPoints = parseFloat(discountPercentage) * 100;
    await delay(1000); // Wait for 1 second
    setRequestParams({
      snowballID: SnowballID,
      discount: discountInBasisPoints,
      amount: parseFloat(amountToRequest) * 1000000,
      duration: durationInSeconds,
      transactions: requestDurations,
    });
  };

  useEffect(() => {
    const submitRequest = async () => {
      try {
        console.log("Submitting Request for", SnowballID);
        console.log("Updated params to:", requestParams);
        let result = await makeRequest();
        console.log(result);
      } catch (error) {
        console.error("Error fetching snowball metrics:", error);
      }
    };

    if (wallet?.chainId) {
      submitRequest();
    }
  }, [wallet?.chainId, requestParams]);

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setRequestActiveTime((prevTime) => ({ ...prevTime, [name]: value }));
  };

  return (
    <div>
      <h2>Snowball ID: {SnowballID}</h2>
      <h3>
        Available Working Capital:{" "}
        {availableCapital
          ? ethers.utils.formatUnits(availableCapital, 6)
          : "Loading..."}
      </h3>
      <div>
        <label>Amount to Request:</label>
        <input
          type="text"
          value={amountToRequest}
          onChange={(e) => setAmountToRequest(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleMaxClick}>Max</button>
      </div>
      <div>
        <label>Discount Percentage:</label>
        <input
          type="number"
          step="0.01"
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(e.target.value)}
        />
      </div>
      <div>
        <label>Request Active Transactions:</label>
        <input
          type="text"
          value={requestDurations}
          onChange={(e) => setRequestDurations(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleMaxDurationsClick}>Max</button>
      </div>
      <div>
        <label>Request Active Time (Days):</label>
        <input
          type="number"
          name="days"
          value={requestActiveTime.days}
          onChange={handleTimeChange}
        />
      </div>
      <div>
        <label>Request Active Time (Hours):</label>
        <input
          type="number"
          name="hours"
          value={requestActiveTime.hours}
          onChange={handleTimeChange}
        />
      </div>
      <div>
        <label>Request Active Time (Minutes):</label>
        <input
          type="number"
          name="minutes"
          value={requestActiveTime.minutes}
          onChange={handleTimeChange}
        />
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default RequestLoan;
