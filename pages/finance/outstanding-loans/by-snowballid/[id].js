import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import styles from "../../../../styles/sell-introduction.module.css";
import FinanceSidebar from "../../../../components/FinanceSidebar";
import { LoanFactoryABI, contractAddresses, abi } from "../../../../constants";
import { useWeb3ExecuteFunction } from "react-moralis";
import { WalletContext } from "../../../../pages/_app";
import DisplayLoan from "../../../../components/DisplayLoan"; // Ensure this path is correct

const LoanDetailPage = () => {
  const router = useRouter();
  const { id } = router.query; // This will be the snowballID
  const [snowballID, setSnowballID] = useState(null);
  const [loanIDs, setLoanIDs] = useState([]);
  const [loanDetails, setLoanDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wallet] = useContext(WalletContext);

  const { fetch: getLoans } = useWeb3ExecuteFunction({
    abi: abi,
    contractAddress: contractAddresses[wallet?.chainId]?.Snowball[0],
    functionName: "getLoansbySnowballID",
    params: { snowballID: snowballID },
  });

  const { fetch: getLoan } = useWeb3ExecuteFunction({
    abi: LoanFactoryABI,
    contractAddress: contractAddresses[wallet?.chainId]?.LoanFactory[0],
    functionName: "Loans",
  });

  useEffect(() => {
    if (id) {
      setSnowballID(id);
    }
  }, [id]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        if (snowballID) {
          console.log(snowballID);
          const result = await getLoans();
          console.log("Fetched loan IDs:", result);
          if (Array.isArray(result)) {
            setLoanIDs(result);
          } else {
            console.error("Unexpected response format:", result);
          }
        }
      } catch (error) {
        console.error("Error fetching loans:", error);
      }
    };

    if (snowballID) {
      fetchLoans();
    }
  }, [snowballID, getLoans]);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      const details = [];
      for (const loanID of loanIDs) {
        try {
          const loanDetail = await getLoan({ params: { "": loanID } });
          console.log(loanDetail);
          details.push({ loanID, ...loanDetail });
        } catch (error) {
          console.error("Error fetching loan details:", error);
        }
      }
      setLoanDetails(details);
      setLoading(false);
    };

    if (loanIDs.length > 0) {
      fetchLoanDetails();
    }
  }, [loanIDs, getLoan]);

  const totalDebt = loanDetails.reduce(
    (sum, loan) => sum + parseFloat(loan.faceAmount || 0),
    0
  );

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
                <>
                  <h2>Total Snowball Debt: {totalDebt}</h2>
                  {loanDetails.map((loanDetail, index) => (
                    <div key={index}>
                      <p>
                        Tranche #{index + 1}: Loan ID{" "}
                        {loanDetail.loanID.toString()}, Face Amount:{" "}
                        {loanDetail.faceAmount}
                      </p>
                      <DisplayLoan LoanID={loanDetail.loanID} />
                    </div>
                  ))}
                </>
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
