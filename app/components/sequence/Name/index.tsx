import React from 'react';
import { TextField } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { setSequenceName, selSequenceName } from './slice';
import routes from '../../../constants/routes.json';

export default function SequenceName() {
  const propsName = useSelector(selSequenceName);
  const [name, setName] = React.useState<string>(propsName);
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const storeSequenceName = () => {
    dispatch(setSequenceName(name));
    dispatch(push(routes.CREATE.DESCRIPTION));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          What do you want to name this sequence?
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="outlined-basic"
          label="Sequence Name"
          variant="outlined"
          value={name}
          onChange={handleChange}
        />
        <Typography paragraph style={{ marginTop: '30px' }}>
          E.g. “North Downs Way: Farnham and Guildford”
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={storeSequenceName}
        >
          Next
        </Button>
      </Grid>
    </>
  );
}
