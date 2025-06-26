// sell-introduction.js
import React from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/sell-introduction.module.css";
import SellSidebar from "../components/SellSidebar";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Snowball Protocol - Blockchain eCommerce Platform</title>
        <meta
          name="description"
          content="Revolutionizing eCommerce with blockchain technology."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}></header>

      <div className={styles.content}>
        <SellSidebar />

        <main className={styles.main}>
          <h1 className={styles.title}>Introduction to Selling on Snowball</h1>
          <p className={styles.description}>
            Snowball Protocol is a blockchain-based eCommerce platform designed
            to revolutionize the way individuals and small-to-medium sized
            enterprises create promotions and market products. The protocol
            enables sellers to tailor innovative selling methods such as sales
            with dynamic volume-based pricing and even more engaging game-like
            logic such as offering 100% money back or other awards to randomly
            selected winners. Snowball’s blockchain infrastructure ensures that
            all promotions are transparent and verifiably fair – a relatively
            tough task representing a high fixed cost for most independent
            sellers using traditional methods.
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
                A sample promotion that returns the entire sale price (awards a
                free product) for one out every ten random users.
              </em>
            </p>
          </div>
          <p className={styles.description}>
            Because Snowball leverages the blockchain for its basic
            infrastructure, there are significant advantages over traditional
            payment systems like SWIFT and credit card networks in terms of both
            fees and censorship resistance. Snowball charges just 5 USDC per
            promotion and a{" "}
            <a href="/fees">2% flat fee on all revenue earned</a>, and the
            platform does not keep sellers’ earned revenues in custody nor does
            it have the power to freeze user funds. Anyone connected to Web3 can
            use the Snowball protocol to buy or sell products using USDC, by
            interacting with the Snowball protocol on chain - making Snowball an
            ideal platform for financially savvy and privacy-minded users.
          </p>
          <p className={styles.description}>
            As a fully web3-based decentralized eCommerce platform, Snowball
            attracts a sophisticated tech savvy user base, providing third-party
            sellers access to a premium customer base that may be more costly
            and difficult to target using broader, more generalized platforms.
          </p>
          <p className={styles.description}>
            Snowball further augments its blockchain-based tools with an
            eCommerce ecosystem that has a full suite of additional features:
          </p>
          <ul className={styles.features}>
            <li>
              Secure Communication: Integration with Mailchain allows secure and
              private conversations between buyers and sellers to manage
              eCommerce logistics efficiently.
            </li>
            <li>
              Targeted Marketing: Our marketing engine enables sellers to
              promote their products directly to Snowball's dedicated consumer
              base through our social media channels.
            </li>
            <li>
              Financial Innovation: Snowball has designed the world's first
              blockchain-based working capital credit provisions, giving sellers
              timely access to capital to support and grow their businesses and
              offering investors{" "}
              <a href="/working-capital">yield with no credit risk</a>.
            </li>
          </ul>
          <p className={styles.description}>
            Snowball is more than just a platform for listing products; it's a
            comprehensive solution for modern merchants looking to leverage
            blockchain technology to its fullest potential and reach a
            sophisticated crypto-native audience. Click the links on the left to
            learn more or get started directly and deploy your first Snowball
            promotion{" "}
            <a href="/create-promotion">deploy your first Snowball promotion</a>
            .
          </p>
        </main>
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2024 Snowball Protocol. All rights reserved.</p>
      </footer>
    </div>
  );
}
