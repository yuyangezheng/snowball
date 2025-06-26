import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import styles from "../../../../styles/sell-introduction.module.css";
import FinanceSidebar from "../../../../components/FinanceSidebar";
import { LoanFactoryABI, contractAddresses, abi } from "../../../../constants";
import { useWeb3Contract } from "react-moralis";
import { WalletContext } from "../../../../pages/_app";
import DisplayLoan from "../../../../components/DisplayLoan"; // Ensure this path is correct

const LoanDetailPage = () => {
  const router = useRouter();
  const { id } = router.query; // This will be the snowballID
  const [snowballID, setSnowballID] = useState(null);
  const [loanIDs, setLoanIDs] = useState([]);
  const [loanDetails, setLoanDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet] = useContext(WalletContext);
  const [LoanID, setLoanID] = useState([]);

  const { runContractFunction: getLoans } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddresses[wallet?.chainId]?.Snowball[0],
    functionName: "getLoansbySnowballID",
    params: { snowballID: snowballID },
  });

  const { runContractFunction: getLoan } = useWeb3Contract({
    abi: LoanFactoryABI,
    contractAddress: contractAddresses[wallet?.chainId]?.LoanFactory[0],
    functionName: "Loans",
    params: { "": LoanID },
  });

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        if (snowballID) {
          const result = await getLoans();
          console.log("Fetched loan IDs:", result);
          if (Array.isArray(result)) {
            setLoanIDs(result);

            // Fetch loan details for each loanID
            const details = await Promise.all(
              result.map(async (loanID) => {
                const loanDetail = await getLoan({ params: { "": loanID } });
                return {
                  loanID,
                  ...loanDetail,
                };
              })
            );

            setLoanDetails(details);
          } else {
            console.error("Unexpected response format:", result);
          }
        }
      } catch (error) {
        console.error("Error fetching loans:", error);
      } finally {
        setLoading(false);
      }
    };

    if (snowballID) {
      fetchLoans();
    }
  }, [snowballID, getLoans, getLoan]);

  useEffect(() => {
    if (id) {
      setSnowballID(id);
    }
  }, [id]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <FinanceSidebar />
        <main className={styles.main}>
          <h1 className={styles.title}>Loans for Snowball ID: {snowballID}</h1>
          {loading ? (
            <p>Loading loan details...</p>
          ) : (
            <>
              {loanDetails.length > 0 ? (
                loanDetails.map((loanDetail, index) => (
                  <DisplayLoan key={index} LoanID={loanDetail.loanID} />
                ))
              ) : (
                <p>No loans found for this Snowball ID.</p>
              )}
            </>
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
