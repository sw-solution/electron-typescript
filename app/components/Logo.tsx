import React from 'react';
import logoImg from '../assets/images/logo.png';

import styles from './Logo.css';

export default function Logo() {
  return (
    <div className={styles.wrapper}>
      <img src={logoImg} alt="TrekView" width="200" />
    </div>
  );
}
