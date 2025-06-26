import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../pages/_app";
import { useWeb3Contract } from "react-moralis";
import {
  drawingManagerABI,
  contractAddresses,
  VRFCoordinatorABI,
} from "../constants";
import JoinDrawing from "./JoinDrawing";
import ReceiptDetails from "./SnowballReceiptDetails"; // Assume you have a component for displaying receipt details
import { ethers } from "ethers";

const DisplayDrawing = ({ DrawingID }) => {
  const [wallet] = useContext(WalletContext);
  const [DrawingData, setDrawingData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [cohort, setCohort] = useState(""); // Cohort input
  const [requestID, setRequestID] = useState(0); // Cohort input
  const [cohortTokens, setCohortTokens] = useState([]); // To store the cohort tokens
  const [cohortDrawn, setCohortDrawn] = useState(null); // To store the cohort tokens
  const [isEligible, setIsEligible] = useState(false); // Eligibility state
  const [basisPoints, setBasisPoints] = useState("");
  const [URIRoot, setURIRoot] = useState("");

  // NEW STATE: Inputs for batch initiation
  const [drawingsInput, setDrawingsInput] = useState("");
  const [cohortsInput, setCohortsInput] = useState("");
  const [IDsToInitiate, setIDsToInitiate] = useState([]);
  const [cohortsToInitiate, setCohortsToInitiate] = useState([]);

  const { runContractFunction: GetDrawing } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "Drawings",
    params: { "": DrawingID },
  });

  const { runContractFunction: fulfillRandomWords } = useWeb3Contract({
    abi: VRFCoordinatorABI,
    contractAddress: contractAddresses[wallet.chainId]?.VRFMock[0],
    functionName: "fulfillRandomWords",
    params: {
      _requestId: parseInt(requestID),
      _consumer: contractAddresses[wallet.chainId]?.drawingManager[0],
    },
  });

  const { runContractFunction: CancelDrawing } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "cancelDrawing",
    params: { drawingID: DrawingID },
  });

  const { runContractFunction: retrieveExcessDrawingCustody } = useWeb3Contract(
    {
      abi: drawingManagerABI,
      contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
      functionName: "retrieveExcessDrawingCustody",
      params: { drawingID: DrawingID },
    }
  );

  const { runContractFunction: drawingEligibility } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "drawingEligibility",
    params: { drawingID: DrawingID, cohort: parseInt(cohort) },
  });

  const { runContractFunction: drawingInitiate, error } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "initiateDrawings",
    params: {
      arrayOfDrawingIDs: IDsToInitiate,
      arrayOfcohorts: cohortsToInitiate,
    },
  });

  const { runContractFunction: GetDrawingParticipants } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "getPromotionReceipts",
    params: { promotionID: DrawingID },
  });

  const { runContractFunction: setRoyalty } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "setRoyalty",
    params: {
      promotionID: DrawingID,
      basisPoints: basisPoints,
    },
  });

  const { runContractFunction: setURI } = useWeb3Contract({
    abi: drawingManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.drawingManager[0],
    functionName: "setPromotionURI",
    params: {
      promotionID: DrawingID,
      newURIRoot: URIRoot,
    },
  });

  useEffect(() => {
    const fetchDrawingData = async () => {
      try {
        const transaction = await GetDrawing();
        console.log(transaction);
        console.log(ethers.utils.formatUnits(transaction.price, 6));
        const participants = await GetDrawingParticipants();
        const numParticipants = participants.length;

        setDrawingData({
          maxSlots: transaction.maxSlots.toNumber(),
          endTime: transaction.endTime.toNumber(),
          price: ethers.utils.formatUnits(transaction.price, 6), // Adjust decimals
          cohortSize: transaction.cohortSize.toNumber(),
          rebateAmount: ethers.utils.formatUnits(transaction.rebateAmount, 6), // Adjust decimals
          owner: transaction.owner,
          returnedCustody: transaction.returnedCustody,
          loading: transaction.loading,
          numParticipants: numParticipants,
        });
      } catch (error) {
        console.log("Error in contract execution:", error);
      }
    };

    fetchDrawingData();
  }, [DrawingID]);

  useEffect(() => {
    if (DrawingData) {
      const updateRemainingTime = () => {
        const currentTime = Math.floor(Date.now() / 1000);
        console.log("testing");
        console.log(currentTime);
        console.log(DrawingData.endTime);
        const remaining = DrawingData.endTime - currentTime;

        if (remaining <= 0) {
          setTimeRemaining("Ended");
          return;
        }

        const days = Math.floor(remaining / (24 * 60 * 60));
        const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((remaining % (60 * 60)) / 60);

        setTimeRemaining(
          `${days} day(s), ${hours} hour(s), ${minutes} minute(s)`
        );
      };

      updateRemainingTime();
      const interval = setInterval(updateRemainingTime, 60000);
      return () => clearInterval(interval);
    }
  }, [DrawingData]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  };

  const handleFulfill = async (event) => {
    event.preventDefault();
    try {
      // Check eligibility after fetching tokens
      const transaction = await fulfillRandomWords();
      console.log(eligibility);
    } catch (error) {
      console.log("Fulfilling random words", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Check eligibility after fetching tokens
      const eligibility = await drawingEligibility();
      console.log(eligibility);
      setIsEligible(eligibility);
      console.log(eligibility);
    } catch (error) {
      console.log("Error fetching cohort tokens or eligibility:", error);
    }
  };

  const handleCancelDrawing = async () => {
    try {
      await CancelDrawing();
      alert("Promotion successfully canceled!");
    } catch (error) {
      console.error("Error canceling promotion:", error);
    }
  };

  const handleSetRoyalty = async () => {
    try {
      await setRoyalty();
      alert("Royalty updated successfully!");
    } catch (error) {
      console.error("Error setting royalty:", error);
    }
  };

  const handleSetURI = async () => {
    try {
      console.log("clicked for new URI");
      await setURI();
      alert("URI updated successfully!");
    } catch (error) {
      console.error("Error setting URI:", error);
    }
  };

  const initiateDrawing = async () => {
    try {
      const result = await drawingInitiate();
      console.log("DrawingID:", DrawingID);
      console.log("Cohort:", cohort);
      console.log("Result:", result);
      console.log(error);
    } catch (error) {
      console.error("Error initiating drawing:");

      if (error.message) {
        // Print the error message
        console.error("Error message:", error.message);
      }

      if (error.data) {
        // Decode the error data if it exists
        try {
          const reason = ethers.utils.defaultAbiCoder.decode(
            ["string"],
            error.data.slice(4) // Remove "0x" and function selector
          )[0];
          console.error("Revert reason:", reason);
        } catch (e) {
          console.error("Error decoding revert reason:", e.message);
        }
      }
    }
  };

  // NEW: Handle parsing of comma-separated inputs
  const parseInputArrays = () => {
    try {
      // Parse drawings input
      const drawingsArray = drawingsInput
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id !== "")
        .map((id) => Number(id));

      // Parse cohorts input
      const cohortsArray = cohortsInput
        .split(",")
        .map((cohort) => cohort.trim())
        .filter((cohort) => cohort !== "")
        .map((cohort) => Number(cohort));

      // Set state arrays
      setIDsToInitiate(drawingsArray);
      setCohortsToInitiate(cohortsArray);

      return { drawingsArray, cohortsArray };
    } catch (error) {
      console.error("Error parsing input arrays:", error);
      return { drawingsArray: [], cohortsArray: [] };
    }
  };

  // NEW: Handle batch initiation
  const handleBatchInitiate = async (event) => {
    event.preventDefault();

    // Parse inputs
    const { drawingsArray, cohortsArray } = parseInputArrays();

    // Validate inputs
    if (drawingsArray.length === 0 || cohortsArray.length === 0) {
      alert("Please enter valid Drawing IDs and Cohorts");
      return;
    }

    if (drawingsArray.length !== cohortsArray.length) {
      alert("Number of Drawing IDs must match number of Cohorts");
      return;
    }

    try {
      const result = await drawingInitiate();
      console.log("Initiation Result:", result);
    } catch (error) {
      console.error("Error initiating drawings:", error);

      if (error.data) {
        try {
          const reason = ethers.utils.defaultAbiCoder.decode(
            ["string"],
            error.data.slice(4)
          )[0];
          console.error("Revert reason:", reason);
          alert(`Error: ${reason}`);
        } catch (e) {
          console.error("Error decoding revert reason:", e.message);
        }
      }
    }
  };

  return (
    <div>
      <h1>Details for Drawing {DrawingID}</h1>
      {DrawingData ? (
        DrawingData.startTime === 0 ? (
          <p>Invalid Drawing ID</p>
        ) : (
          <>
            {DrawingData.endTime > Math.floor(Date.now() / 1000) &&
            DrawingData.numParticipants < DrawingData.maxSlots ? (
              <p>Time Remaining: {timeRemaining}</p>
            ) : (
              <p>This drawing has ended!</p>
            )}
            <h2>Drawing ID: {DrawingID}</h2>
            <p>Max Slots: {DrawingData.maxSlots}</p>
            <p>Current Price: {DrawingData.price} Token</p>
            <p>Owner: {DrawingData.owner}</p>
            <p>Current Number of Participants: {DrawingData.numParticipants}</p>
            <p>End Time: {formatDate(DrawingData.endTime)}</p>
            <p>Cohort Size: {DrawingData.cohortSize}</p>
            <p>Rebate Amount: {DrawingData.rebateAmount} Token</p>
            <p>
              Returned Custody: {DrawingData.returnedCustody ? "Yes" : "No"}
            </p>
            <p>Loading: {DrawingData.loading ? "Yes" : "No"}</p>

            <button onClick={handleCancelDrawing}>Cancel Promotion</button>

            <h3>Set Royalty (Basis Points):</h3>
            <input
              type="number"
              value={basisPoints}
              onChange={(e) => setBasisPoints(e.target.value)}
              placeholder="Enter basis points"
            />
            <button onClick={handleSetRoyalty}>Set Royalty</button>

            <h3>Set URI:</h3>
            <input
              type="text"
              value={URIRoot}
              onChange={(e) => setURIRoot(e.target.value)}
              placeholder="Enter new URI"
            />
            <button onClick={handleSetURI}>Set URI</button>

            <JoinDrawing DrawingData={DrawingData} DrawingID={DrawingID} />

            {/* REMOVED: Single cohort input form and eligibility check */}

            {/* Button to retrieve excess drawing custody */}
            <button
              onClick={async () => {
                try {
                  await retrieveExcessDrawingCustody();
                  alert("Excess drawing custody retrieved successfully!");
                } catch (error) {
                  console.error(
                    "Error retrieving excess drawing custody:",
                    error
                  );
                  alert("Failed to retrieve excess drawing custody.");
                }
              }}
            >
              Retrieve Excess Drawing Custody
            </button>

            <form onSubmit={handleFulfill}>
              <label>
                Enter Request ID:
                <input
                  type="number"
                  value={requestID}
                  onChange={(e) => setRequestID(e.target.value)}
                />
              </label>
              <button type="submit">Submit</button>
            </form>

            {/* NEW: Batch initiation form */}
            <div>
              <h3>Initiate Multiple Drawings</h3>
              <form onSubmit={handleBatchInitiate}>
                <div>
                  <label>
                    Drawing IDs (comma-separated):
                    <input
                      type="text"
                      value={drawingsInput}
                      onChange={(e) => setDrawingsInput(e.target.value)}
                      placeholder="e.g., 1,2,3"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Cohorts (comma-separated):
                    <input
                      type="text"
                      value={cohortsInput}
                      onChange={(e) => setCohortsInput(e.target.value)}
                      placeholder="e.g., 1,1,2"
                    />
                  </label>
                </div>
                <button type="submit">Initiate Drawings</button>
              </form>

              {/* Display parsed values for debugging */}
              <div>
                <p>IDs to Initiate: {IDsToInitiate.join(", ")}</p>
                <p>Cohorts to Initiate: {cohortsToInitiate.join(", ")}</p>
              </div>
            </div>
          </>
        )
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DisplayDrawing;
