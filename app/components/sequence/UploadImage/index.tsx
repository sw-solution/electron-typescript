import React, { useRef } from 'react';
// import { useDispatch } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

// import { setSequenceUploadImage } from '../slice';

export default function SequenceUploadImage() {
  // const dispatch = useDispatch();

  const uploadRef = useRef(null);

  openFileDialog = () => {
    uploadRef.current.click();
  };

  return (
    <>
      <input ref={uploadRef} type="file" style={{ display: 'hidden' }} />
      <Grid item xs={12}>
        <Typography variant="h6" align="center" color="textSecondary">
          Please upload the [timelapse photos | video file]
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <IconButton onClick={openFileDialog}>
          <CloudUploadIcon />
        </IconButton>
        <Typography color="primary">Upload</Typography>
      </Grid>
      <Grid item xs={12} style={{ paddingBottom: '30px' }}>
        <Typography variant="h6" align="center" color="textSecondary">
          Or use an existing file
        </Typography>
      </Grid>
    </>
  );
}
