import React from 'react';
import Typography from '@material-ui/core/Typography';

import styles from './Logo.css';

export default function Logo() {
  return (
    <div className={styles.wrapper}>
      <Typography className={styles.logo} variant="h5">
        TrekView
      </Typography>
    </div>
  );
}
