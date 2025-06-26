import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import styles from "../../../styles/sell-introduction.module.css";
import FinanceSidebar from "../../../components/FinanceSidebar";
import { LoanFactoryABI, contractAddresses } from "../../../constants";
import { useWeb3Contract } from "react-moralis";
import { WalletContext } from "../../../pages/_app";
import DisplayLoan from "../../../components/DisplayLoan"; // Ensure this path is correct

export default function Finance() {
  const [wallet] = useContext(WalletContext);
  const [actives, setActives] = useState([]);
  const [loanID, setLoanID] = useState("");
  const [snowballID, setSnowballID] = useState("");
  const [loanIDError, setLoanIDError] = useState("");
  const [snowballIDError, setSnowballIDError] = useState("");
  const [searchLoanID, setSearchLoanID] = useState(null);
  const router = useRouter();

  const { runContractFunction: getActiveLoans } = useWeb3Contract({
    abi: LoanFactoryABI,
    contractAddress: contractAddresses[wallet?.chainId]?.LoanFactory[0],
    functionName: "getActiveLoansRange",
    params: { start: 0, end: 5 },
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!wallet?.chainId) {
          console.log("Waiting for wallet to be available...");
          return;
        }

        // Introduce a 1-second delay before calling getActiveLoans
        setTimeout(async () => {
          let listOfActives = await getActiveLoans();
          console.log("Active requests:", listOfActives);

          if (Array.isArray(listOfActives)) {
            setActives(listOfActives);
          } else {
            console.error("Unexpected response format:", listOfActives);
          }
        }, 1000); // 1 second delay
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, [wallet]);

  useEffect(() => {
    console.log("Actives updated:", actives);
  }, [actives]);

  const handleSearchLoanID = () => {
    if (loanID > 0) {
      setLoanIDError("");
      router.push(`/finance/outstanding-loans/by-loanid/${loanID}`);
    } else {
      setLoanIDError("Invalid ID");
    }
  };

  const handleSearchSnowballID = () => {
    if (snowballID >= 0) {
      setSnowballIDError("");
      router.push(`/finance/outstanding-loans/by-snowballid/${snowballID}`);
    } else {
      setSnowballIDError("Invalid ID");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <FinanceSidebar />
        <main className={styles.main}>
          <h1 className={styles.title}>List of Active Loans</h1>

          <div className={styles.searchContainer}>
            <div>
              <input
                type="number"
                value={loanID}
                onChange={(e) => setLoanID(e.target.value)}
                placeholder="Search with LoanID"
              />
              <button onClick={handleSearchLoanID}>Search</button>
              {loanIDError && <p className={styles.error}>{loanIDError}</p>}
            </div>
            <div>
              <input
                type="number"
                value={snowballID}
                onChange={(e) => setSnowballID(e.target.value)}
                placeholder="Search with Snowball ID"
              />
              <button onClick={handleSearchSnowballID}>Search</button>
              {snowballIDError && (
                <p className={styles.error}>{snowballIDError}</p>
              )}
            </div>
          </div>

          {searchLoanID && (
            <div>
              <h2>Search Result for Loan ID: {searchLoanID}</h2>
              <DisplayLoan LoanID={searchLoanID} />
            </div>
          )}

          {Array.isArray(actives) && actives.length > 0 ? (
            actives.map((requestID, index) => (
              <DisplayLoan key={index} LoanID={requestID} />
            ))
          ) : (
            <p>No active requests found.</p>
          )}
        </main>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Snowball Protocol. All rights reserved.</p>
      </footer>
    </div>
  );
}
