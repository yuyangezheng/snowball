import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Snowball Protocol</title>
        <meta name="description" content="Beckoning the new wave of Web3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>SNOWBALL PROTOCOL</h1>
        <p>BECKONING THE NEW WAVE OF WEB3</p>
        <div className={styles.mainProduct}>{/* Main product content */}</div>
        <h2>A fully on-chain decentralized ecommerce platform</h2>
        <ul>
          <li>Leveraging the blockchain for transparent & fair promotions</li>
          <li>Empowering merchants to create a social shopping experience</li>
          <li>
            Offering merchants the world's first blockchain-based working
            capital credit facilities
          </li>
        </ul>
      </main>

      <footer className={styles.footer}>{/* Footer content */}</footer>
    </div>
  );
}
