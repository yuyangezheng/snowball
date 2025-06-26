import { useState, useContext, useEffect } from "react";
import { useWeb3Contract } from "react-moralis";
import { receiptManagerABI, contractAddresses } from "../constants";
import { WalletContext } from "../pages/_app";

const ApprovedCallers = () => {
  const [wallet] = useContext(WalletContext);
  const [toAdd, setToAdd] = useState(""); // Address to add
  const [toRemove, setToRemove] = useState(""); // Address to remove
  const [owner, setOwner] = useState(""); // Current owner
  const [newOwner, setNewOwner] = useState(""); // New owner input
  const [approvedCallers, setApprovedCallers] = useState([]); // List of approved addresses

  // Function to get approved callers
  const { runContractFunction: getApproved } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "getApprovedCallers",
  });

  // Function to set a new owner
  const { runContractFunction: setReceiptOwner } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "setOwner",
    params: { newOwner },
  });

  // Function to get the current owner
  const { runContractFunction: getReceiptOwner } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "contractOwner",
  });

  // Function to add an approved caller
  const { runContractFunction: addApproved } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "addApprovedCaller",
    params: { _toApprove: toAdd },
  });

  // Function to remove an approved caller
  const { runContractFunction: removeApproved } = useWeb3Contract({
    abi: receiptManagerABI,
    contractAddress: contractAddresses[wallet.chainId]?.receiptManager[0],
    functionName: "removeApprovedCaller",
    params: { _toRemove: toRemove },
  });

  // Fetch approved callers and update the state
  const fetchApprovedCallers = async () => {
    try {
      const result = await getApproved();
      setApprovedCallers(result || []); // Ensure a fallback to an empty array
      const ownerResult = await getReceiptOwner();
      setOwner(ownerResult || ""); // Set the current owner
    } catch (error) {
      console.error("Error fetching approved callers or owner:", error);
    }
  };

  // Add an approved caller
  const handleAddApproved = async () => {
    if (!toAdd) {
      alert("Please enter a valid address!");
      return;
    }
    try {
      await addApproved();
      alert(`Address ${toAdd} added successfully!`);
      setToAdd(""); // Clear input
      fetchApprovedCallers(); // Refresh approved callers
    } catch (error) {
      console.error("Error adding approved caller:", error);
    }
  };

  // Remove an approved caller
  const handleRemoveApproved = async () => {
    if (!toRemove) {
      alert("Please select an address to remove!");
      return;
    }
    try {
      await removeApproved();
      alert(`Address ${toRemove} removed successfully!`);
      setToRemove(""); // Clear selected address
      fetchApprovedCallers(); // Refresh approved callers
    } catch (error) {
      console.error("Error removing approved caller:", error);
    }
  };

  // Set a new owner
  const handleSetNewOwner = async (e) => {
    e.preventDefault();
    if (!newOwner) {
      alert("Please enter a valid address for the new owner!");
      return;
    }
    try {
      await setReceiptOwner();
      alert(`New owner ${newOwner} set successfully!`);
      setNewOwner(""); // Clear input
      fetchApprovedCallers(); // Refresh owner and approved callers
    } catch (error) {
      console.error("Error setting new owner:", error);
    }
  };

  // Fetch the approved callers and current owner on component mount
  useEffect(() => {
    fetchApprovedCallers();
  }, []);

  return (
    <div>
      <h3>Approved Caller and Owner Information for Receipt Manager</h3>

      {/* Display current owner */}
      <div>
        <h4>Current Owner</h4>
        <p>{owner || "Loading..."}</p>
      </div>

      {/* Button to manually refresh approved callers */}
      <button onClick={fetchApprovedCallers} style={{ marginBottom: "10px" }}>
        Search Approved Callers
      </button>

      {/* Input and button to add approved callers */}
      <div>
        <input
          type="text"
          value={toAdd}
          onChange={(e) => setToAdd(e.target.value)}
          placeholder="Enter address to approve"
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleAddApproved}>Add Approved Caller</button>
      </div>

      <h4>Approved Callers (Contracts)</h4>

      {/* Display list of approved callers */}
      <ul>
        {approvedCallers.length > 0 ? (
          approvedCallers.map((caller, index) => (
            <li
              key={index}
              style={{
                cursor: "pointer",
                color: toRemove === caller ? "red" : "black",
              }}
              onClick={() => setToRemove(caller)} // Select the address for removal
            >
              {caller}
            </li>
          ))
        ) : (
          <p>No approved callers found.</p>
        )}
      </ul>

      {/* Button to remove selected approved caller */}
      {toRemove && (
        <div>
          <p>Selected for removal: {toRemove}</p>
          <button onClick={handleRemoveApproved}>Remove Approved Caller</button>
        </div>
      )}

      {/* Input to set a new owner */}
      <div style={{ marginTop: "20px" }}>
        <h4>Set New Owner</h4>
        <form onSubmit={handleSetNewOwner}>
          <input
            type="text"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            placeholder="Enter new owner address"
            style={{ marginRight: "10px" }}
          />
          <button type="submit">Set New Owner</button>
        </form>
      </div>
    </div>
  );
};

export default ApprovedCallers;
