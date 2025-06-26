// SellSidebar.js
import React from "react";
import styles from "../styles/sell-introduction.module.css";

const FinanceSidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <h2>
        <a href="/snowball-finance">About Snowball Finance</a>
      </h2>
      <ul className={styles.sidebarList}>
        <li>
          <a href="#why-sell">Getting Started</a>
        </li>
        <li>
          <a href="/finance/active-requests">Active Working Capital Requests</a>
        </li>
        <li>
          <a href="/finance/outstanding-loans">Outstanding Loans</a>
        </li>
        <li>
          <a href="make-wc-request">Make a Request</a>
        </li>
      </ul>
    </aside>
  );
};

export default FinanceSidebar;
