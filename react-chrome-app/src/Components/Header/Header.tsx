import React from "react";
import styles from "./header.module.css";

export default () => {
    return (
        <header className={styles.header}>
            <h1 className={styles.header__title}>Regex Download Data</h1>
            <p className={styles.header__version}> Version: 1.0.0</p>
        </header >
    )
}