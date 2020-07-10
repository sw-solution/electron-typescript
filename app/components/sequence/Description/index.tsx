import React from 'react';
import { push } from 'connected-react-router';
import { useDispatch, useSelector } from 'react-redux';

import { TextField } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import { setSequenceDescription, selSequenceDescription } from './slice';
import routes from '../../../constants/routes.json';

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
    dispatch(push(routes.CREATE.TYPE));
  };

  return (
    <>
      <Box position="absolute" top={20} left={20} zIndex="modal">
        <IconButton>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
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
