import { useRouter } from "next/router";
import React, { useEffect, useState, useContext } from "react";
import { useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../../constants";
import { WalletContext } from "../_app";
import DisplaySnowball from "../../components/DisplaySnowball";
import SearchUser from "../../components/SearchSnowballUser";
import styles from "../../styles/CreateSnowball.module.css";
import Header from "../../components/Header";

const UserSnowballs = () => {
  const router = useRouter();
  const { address } = router.query;
  const [snowballIds, setSnowballIds] = useState([]);
  const [wallet] = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { runContractFunction: getSnowballsByOwner } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddresses[wallet.chainId]?.Snowball[0],
    functionName: "getSnowballsByOwner",
    params: { user: address },
  });

  useEffect(() => {
    if (address) {
      console.log(address);
      const fetchSnowballs = async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await getSnowballsByOwner();
          console.log(result);
          setSnowballIds(result || []);
        } catch (err) {
          console.error("Error fetching snowballs:", err);
          setError("Failed to fetch snowballs. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchSnowballs();
    }
  }, [address, getSnowballsByOwner]);

  return (
    <div>
      <div className={styles.container}>
        <SearchUser placeholder={address || "0xf"} />
        <h1>Snowballs Owned by {address}</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : snowballIds.length > 0 ? (
          <ul>
            {snowballIds.map((id, index) => (
              <li key={index}>
                <DisplaySnowball SnowballID={id.toNumber()} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No snowballs found for this address.</p>
        )}
      </div>
    </div>
  );
};

export default UserSnowballs;
