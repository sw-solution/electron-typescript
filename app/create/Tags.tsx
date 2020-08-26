import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import ChipInput from 'material-ui-chip-input';
import { Alert, AlertTitle } from '@material-ui/lab';

import { setSequenceTags, selSequenceTags, setCurrentStep } from './slice';

interface State {
  tags: string[];
  showError: boolean;
}

export default function SequenceTags() {
  const propsTags = useSelector(selSequenceTags);
  const [state, setState] = React.useState<State>({
    tags: propsTags,
    showError: false,
  });

  const { tags, showError } = state;

  const dispatch = useDispatch();

  const handleAddTag = (tag: string) => {
    if (/^[A-Za-z\-0-9]*$/.test(tag)) {
      setState({
        ...state,
        tags: [...tags, tag],
        showError: false,
      });
    } else {
      setState({
        ...state,
        showError: true,
      });
    }
  };

  const handleDeleteTag = (tag: string) => {
    setState({
      ...state,
      tags: tags.filter((t) => t !== tag),
      showError: false,
    });
  };

  const storeSequenceTags = () => {
    dispatch(setSequenceTags(tags));
    dispatch(setCurrentStep('type'));
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Tags
        </Typography>
        <Typography paragraph>
          Tags help people discover your sequence on Map the Paths. Good example
          of tags include what you saw, the weather, or anything else people
          would use to search. For example “sun”, “daffodils”. Tags can only
          contain letters, numbers and the "-" character.
        </Typography>
        {showError && (
          <Alert severity="error">
            Your tag contained invalid tag characters. Tags can only contain
            letters, numbers and the "-" character
          </Alert>
        )}
      </Grid>
      <Grid item xs={12}>
        <ChipInput
          value={tags}
          onAdd={(tag: string) => handleAddTag(tag)}
          onDelete={(tag: string) => handleDeleteTag(tag)}
          newChipKeyCodes={[13, 32]}
        />
      </Grid>
      <Grid item xs={12} />
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={storeSequenceTags}
        >
          Next
        </Button>
      </Grid>
    </>
  );
}
