import React from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/sell-introduction.module.css";
import FinanceSidebar from "../../components/FinanceSidebar";

export default function Finance() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Snowball Protocol - Blockchain eCommerce Platform</title>
        <meta
          name="description"
          content="The world's first blockchain-based working capital credit provisions"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}></header>

      <div className={styles.content}>
        <FinanceSidebar />

        <main className={styles.main}>
          <h1 className={styles.title}>Introduction to Snowball Finance</h1>
          <h2>Motivation and Background</h2>
          <p className={styles.description}>
            Volume-based discounting and random draws associated with Snowball
            promotions give rise to sellers' potential future liabilities to
            their customers. Snowball Protocol holds these potential liabilities
            in custody on the blockchain until promotions reach their discount
            tiers or expire, at which time funds are released to either buyers
            or sellers as determined by the outcome of the promotions.
          </p>
          <p className={styles.description}>
            The amount of potential liabilities that Snowball Protocol holds in
            custody associated with a single snowball is equal to the maximum
            additional discounting that each participating buyer may receive.
            For promotions with volume-based discounting and multiple
            discounting tiers, the custody amount held for each buyer is
            progressively lowered, as discount tiers are reached and discounts
            are incoporated into lower initial sale prices.
          </p>
          <div className={styles.imageContainer}>
            <Image
              src="/promotion-sample.png"
              alt="Sample Promotion"
              width={600}
              height={400}
            />
            <p>
              <em>
                An example of potential future liabilities arising from
                volume-based discounting. (1) If the final number of sales 25,
                the liabilities are realized, and the custody amount is sent to
                buyers. (2) If the final number of sales 25, the liabilities are
                never realized, and the seller receives the full custody amount
                net of commissions.
              </em>
            </p>
          </div>

          <p className={styles.description}>
            Potential liabilities must be held in custody as Snowball Protocol
            is a decentralized platform that relies entirely on the blockchain
            to enforce promotion terms. If full payment amounts were instead
            immediately transferred to sellers, there would be no way to compel
            sellers to honor promotion terms and send discounts/rebates to
            earlier buyers once discount tiers are reached.
          </p>
          <p className={styles.description}>
            Depending on the structure of specific promotions, custody amounts
            can become significant and have a negative impact on sellers'
            liquidity and ability to meet orders. However using Snowball
            Protocol's finance implementation, sellers can instead access
            liquidity through blockchain-based working capital credit provisions
            that lend against the "equity" earned in the sellers' snowball
            promotions.
          </p>
          <h2>Implementation</h2>
          <p className={styles.description}>
            Based on promotion-specific factors such as the custody amount,
            maximum number of purchases, discount tiers & rates, outstanding
            debt, etc., Snowball Protocol can calculate the amount of "equity"
            in each Snowball promotion. Snowball equity - or the maximum amount
            available to be securitized - is equal to the minimum remaining
            revenue that the seller is guaranteed to receive from the promotion.
            This amount is equal to the minimum of the payments to the seller in
            the scenarios in which (1) the snowball generates zero additional
            sales and (2) total amount of sales corresponds to a discount tier.
          </p>

          <div className={styles.imageContainer}>
            <Image
              src="/promotion-sample.png"
              alt="Sample Promotion"
              width={600}
              height={400}
            />
            <p>
              <em>
                Because the price for Snowball promotions only change at
                discount tiers, the revenue received by sellers is linearly
                increasing with the amount of sales, with kinks at each discount
                tier. Thus the minimum future revenue to a seller at any time is
                equal to the minimum of revenue received at these kinks and in
                the case of no additional sales.
              </em>
            </p>
          </div>
          <p className={styles.description}>
            Snowball owners can only make requests for working capital amounts
            that are less than the current equity in each snowball. For each
            request, snowball owners must specify a loan face amount (less than
            snowball equity) and a discount percentage of the loan face amount.
            When creditors accept requests and originate loans, snowball owners
            receive the loan face amount discounted by the discount percentage,
            and a debt equal to the loan face amount is applied to the snowball.
            Future earned revenues associated with the snowball will then first
            be sent to the creditor until the loan amount is recouped, and thus
            the total return for the creditor is the discount percentage of the
            loan. Provided that snowballs have sufficient equity, snowball
            owners can make several loan requests, and each accepted request
            will be subordinate to outstanding loans for the snowball - meaning
            each snowball can have several tranches of debt with the top
            tranches having priority in repayment. In addition, the loan
            origination is paired with the minting of an ERC721 token that
            represents the ownership of the specific tranche of debt associated
            with the loan, the face value outstanding, and the total return. As
            with bonds and securitized debt liabilities in traditional capital
            markets, tokenization of working capital credit facilities leads to
            securities that can be traded on secondary markets. Deeper secondary
            markets for snowball loans can help facilitate the creation of more
            liquid capital sources for borrowers and creditors alike on the
            Snowball Protocol.
          </p>

          <h2>Benefits</h2>
          <p className={styles.description}>
            Unlike traditional debt obligations, Snowball's working capital
            credit provisions do not have repayment risks tied to the borrower's
            liquidity or financial posititons since the originated loans are
            overcapitalized and repayment is guaranteed by Snowball Protocol's
            code on the blockchain. As a result, this structure can lead to
            lower discounts/interest rates for snowball owners, as creditors do
            not need to underwrite or assume credit risks, and in theory there
            does not need to be a credit spread for loans originated on the
            Snowball Protocol. In addition, Snowball Protocol represents a new
            potential source for generating safe yields on USDC, so that USDC
            holders do not lose out yields that dollar deposits could be earning
            in traditional finance. Instead of borrowers' credit ratings,
            lenders on Snowball will likely be more concerned with uncertainty
            regarding repayment times, as at the time of loan origination, the
            minimum IRR/YTM of each loan is already known. The minimum IRR/YTM
            is realized when the underlying snowball does not generate
            additional sales, and the balance of the working capital credit
            provision is repaid using the snowball custody balance at snowball
            expiration. However depending on the success and popuarity of the
            promotion, it is possible for the underlying snowball to generate
            additional sales which lead to faster repayment of the credit
            provision and uplift to IRR/YTM for creditors. Thus as with snowball
            customers who may wish to share snowball promotions with friends to
            help draw customers and help a promotion reach higher discount
            tiers, snowball creditors are also financially aligned with snowball
            owners and incentivized to promote snowball promotions to generate
            higher annualized returns on their debt investments. Thus Snowball
            Protocol's financial implementation is another component of the
            overall marketing engine that aligns buyers, sellers, and creditors
            to help grow the overall amount of sales of products listed on the
            protocol.
          </p>
        </main>
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2024 Snowball Protocol. All rights reserved.</p>
      </footer>
    </div>
  );
}
