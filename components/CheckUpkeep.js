import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../pages/_app";
import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants";

const CheckUpkeep = () => {
  const [wallet] = useContext(WalletContext);
  const [message, setMessage] = useState("");

  const { runContractFunction, error: contractError } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddresses[wallet.chainId]?.Snowball[0],
    functionName: "checkUpkeep",
  });

  const handleCheckUpkeep = async () => {
    try {
      await runContractFunction();
      setMessage("Check Upkeep executed successfully");
    } catch (error) {
      console.error("Error executing Check Upkeep:", error);
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
      <button onClick={handleCheckUpkeep}>Check Upkeep</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CheckUpkeep;
