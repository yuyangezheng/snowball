import React, { useState } from "react";
import styles from "../styles/LanguageHamburger.module.css";

const LanguageHamburger = () => {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const toggleLanguageMenu = () => {
    setLanguageMenuOpen(!languageMenuOpen);
  };

  const hideLanguageMenu = () => {
    setLanguageMenuOpen(false);
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "zh-CN", label: "简体中文" },
    { code: "zh-TW", label: "繁體中文" },
    { code: "es", label: "Español" },
  ];

  return (
    <div className={styles.LanguageHamburger} onMouseLeave={hideLanguageMenu}>
      <div
        className={`${styles["menu-icon"]} ${
          languageMenuOpen ? styles.open : ""
        }`}
        onClick={toggleLanguageMenu}
        aria-label="Toggle language menu"
      >
        {[...Array(3)].map((_, index) => (
          <div key={index} className={styles["menu-line"]} />
        ))}
      </div>
      <div
        className={`${styles.LanguageMenu} ${
          languageMenuOpen ? styles.open : ""
        }`}
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={styles.LanguageButton}
            onClick={() => console.log(`Language changed to ${lang.label}`)}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageHamburger;
