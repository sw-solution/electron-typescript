import React from 'react';
import { TextField } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { setSequenceName, selSequenceName } from './slice';

interface State {
  name: string;
  errorText: string | null;
}

export default function SequenceName() {
  const propsName = useSelector(selSequenceName);
  const [state, setState] = React.useState<State>({
    name: propsName,
    errorText: null,
  });
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const regex = /^[A-Za-z\s0-9]*$/g;

    if (regex.test(event.target.value) && event.target.value.length < 30) {
      setState({
        name: event.target.value,
        errorText: null,
      });
    } else {
      setState({
        ...state,
        errorText: 'Between 6 ~ 30 charts. No special chars',
      });
    }
  };

  const storeSequenceName = () => {
    dispatch(setSequenceName(state.name));
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
          error={state.errorText !== null}
          label="Sequence Name"
          variant="outlined"
          value={state.name}
          onChange={handleChange}
          helperText={state.errorText}
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
          disabled={
            state.name === '' || state.errorText || state.name.length < 6
          }
        >
          Next
        </Button>
      </Grid>
    </>
  );
}
