import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TextField } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { setSequenceDescription, selSequenceDescription } from '../slice';

export default function SequenceDescription() {
  const propsDescription = useSelector(selSequenceDescription);
  const [description, setDescription] = React.useState<string>(
    propsDescription
  );
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const storeSequenceDescription = () => {
    dispatch(setSequenceDescription(description));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          How would you describe this sequence?
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="outlined-basic"
          label="Sequence Description"
          fullWidth
          variant="outlined"
          multiline
          value={description}
          onChange={handleChange}
        />
        <Typography paragraph style={{ marginTop: '30px' }}>
          E.g. “A Sunday morning stroll. Ended up being very muddy in places due
          to the rain. The trees we’re just starting to bud with Spring in full
          flow.”
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={storeSequenceDescription}
        >
          Next
        </Button>
      </Grid>
    </>
  );
}
