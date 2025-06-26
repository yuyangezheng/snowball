// SellSidebar.js
import React from "react";
import styles from "../styles/sell-introduction.module.css";

const SellSidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <h2>
        <a href="/sell-on-snowball-introduction">Sellers Guide to Snowball</a>
      </h2>
      <ul className={styles.sidebarList}>
        <li>
          <a href="#why-sell">Why Sell on Snowball</a>
        </li>
        <li>
          <a href="#getting-started">Getting Started</a>
        </li>
        <li>
          <a href="#fees">Fees Schedule</a>
        </li>
        <li>
          <a href="#working-capital">Working Capital Platform</a>
        </li>
        <li>
          <a href="/sell">Create Your Own Snowball</a>
        </li>
      </ul>
    </aside>
  );
};

export default SellSidebar;
