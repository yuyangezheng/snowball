import React, { useState, useContext, useEffect } from "react";
import { WalletContext } from "../pages/_app";
import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";

const SetForwarder = () => {
  const [wallet] = useContext(WalletContext);
  const [forwarderAddress, setForwarderAddress] = useState("");
  const [message, setMessage] = useState("");

  const { runContractFunction, error: contractError } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddresses[wallet.chainId]?.Snowball[0],
    functionName: "setForwarderAddress",
    params: { forwarderAddress },
  });

  const handleInputChange = (e) => {
    setForwarderAddress(e.target.value);
  };

  const handleSubmit = async () => {
    if (!forwarderAddress) {
      setMessage("Please enter a forwarder address");
      return;
    }

    try {
      await runContractFunction();
      setMessage("Forwarder address set successfully");
    } catch (error) {
      console.error("Error setting forwarder address:", error);
      setMessage("An error occurred");
    }
  };

  useEffect(() => {
    if (contractError) {
      console.error("Error during contract execution:", contractError);
    }
  }, [contractError]);

  return (
    <div>
      <input
        type="text"
        value={forwarderAddress}
        onChange={handleInputChange}
        placeholder="Enter forwarder address"
      />
      <button onClick={handleSubmit}>Set Forwarder Address</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SetForwarder;
