import React, { useState, useEffect } from "react";
import styles from "../styles/CreateSnowball.module.css";
import DisplaySnowball from "./DisplaySnowball";

const SearchSnowball = () => {
  const [ID, setID] = useState(null);
  const [display, setDisplay] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newID = parseInt(event.target.elements.Id.value, 10);
    setID(newID);
    setDisplay(true);
  };

  // useEffect(() => {}, [display]);

  return (
    <div className={styles.container}>
      <h1>View Snowball Details Via ID Number</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Enter a Snowball ID</label>
        <input
          type="text"
          name="Id"
          placeholder="100"
          required
          className={styles.inputField}
        />
        <button type="submit" className={styles.submitButton}>
          Check Snowball Status!
        </button>
      </form>
      {display && <DisplaySnowball SnowballID={ID} />}
    </div>
  );
};

export default SearchSnowball;
