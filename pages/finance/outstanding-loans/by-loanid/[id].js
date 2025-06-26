import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import styles from "../../../../styles/sell-introduction.module.css";
import FinanceSidebar from "../../../../components/FinanceSidebar";
import { LoanFactoryABI, contractAddresses } from "../../../../constants";
import { useWeb3Contract } from "react-moralis";
import { WalletContext } from "../../../../pages/_app";
import DisplayLoan from "../../../../components/DisplayLoan"; // Ensure this path is correct

const LoanDetailPage = () => {
  const router = useRouter();
  const { id } = router.query; // Extract LoanID from URL
  const [loanID, setLoanID] = useState(null);
  const [error, setError] = useState("");
  const [loanDetails, setLoanDetails] = useState(null);
  const [wallet] = useContext(WalletContext);

  const { runContractFunction: getLoan } = useWeb3Contract({
    abi: LoanFactoryABI,
    contractAddress: contractAddresses[wallet?.chainId]?.LoanFactory[0],
    functionName: "Loans",
    params: { "": loanID },
  });

  useEffect(() => {
    if (id) {
      const validID = parseInt(id, 10);
      if (validID > 0) {
        setLoanID(validID);
      } else {
        setError("Invalid Loan ID");
      }
    }
  }, [id]);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        if (loanID) {
          const loan = await getLoan();
          setLoanDetails(loan);
        }
      } catch (error) {
        console.error("Error fetching loan details:", error);
      }
    };

    fetchLoanDetails();
  }, [loanID, getLoan]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <FinanceSidebar />
        <main className={styles.main}>
          <h1 className={styles.title}>Loan Details</h1>
          {error && <p className={styles.error}>{error}</p>}
          {loanDetails ? (
            <DisplayLoan LoanID={loanID} />
          ) : (
            <p>Loading loan details...</p>
          )}
        </main>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Snowball Protocol. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoanDetailPage;
