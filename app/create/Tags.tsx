import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import ChipInput from 'material-ui-chip-input';

import {
  setSequenceTags,
  selSequenceTags,
  setCurrentStep,
  isRequiredNadir,
} from './slice';

export default function SequenceTags() {
  const propsTags = useSelector(selSequenceTags);
  const [tags, setTags] = React.useState<string[]>(propsTags);
  const dispatch = useDispatch();
  const isrequirednadir = useSelector(isRequiredNadir);

  const handleAddTag = (tag: string) => {
    setTags([...tags, tag]);
  };

  const handleDeleteTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const storeSequenceTags = () => {
    dispatch(setSequenceTags(tags));
    if (isrequirednadir) {
      dispatch(setCurrentStep('nadir'));
    } else {
      dispatch(setCurrentStep('blur'));
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          How would you classify this sequence?
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ChipInput
          value={tags}
          onAdd={(tag: string) => handleAddTag(tag)}
          onDelete={(tag: string) => handleDeleteTag(tag)}
          newChipKeyCodes={[13, 32]}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography paragraph>
          We have automatically identified some objects in your images. Tags
          help people discover your sequence. They should highlight what you saw
          in the sequence “sun”, “daffodils”. You can add any we have missed.
        </Typography>
      </Grid>
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
