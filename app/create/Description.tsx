import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TextField } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { setSequenceDescription, selSequenceDescription } from './slice';

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
        <Typography paragraph>
          Share more information and context to help fellow Map the Paths users learn more about your sequence. 
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
