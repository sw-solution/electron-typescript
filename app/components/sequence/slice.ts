import { createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';

const sequenceSlice = createSlice({
  name: 'sequence',
  initialState: {
    currentStep: 'name',
    name: '',
    description: '',
    type: '',
    method: '',
    camera: '',
    attachType: '',
    imagePath: [],
    gpxPath: [],
    startTime: '2020-01-01:00:00:01',
    modifyTime: '0',
  },
  reducers: {
    setCurrentStep: (state, { payload }) => {
      state.currentStep = payload;
    },
    setName: (state, { payload }) => {
      state.name = payload;
    },
    setDescription: (state, { payload }) => {
      state.description = payload;
    },
    setType: (state, { payload }) => {
      state.type = payload;
    },
    setMethod: (state, { payload }) => {
      state.method = payload;
    },
    setCamera: (state, { payload }) => {
      state.camera = payload;
    },
    setAttachType: (state, { payload }) => {
      state.attachType = payload;
    },
    setImagePath: (state, { payload }) => {
      state.imagePath = payload;
    },
    setGpxPath: (state, { payload }) => {
      state.gpxPath = payload;
    },
    setStartTime: (state, { payload }) => {
      state.startTime = payload;
    },
    setModifyTime: (state, { payload }) => {
      state.modifyTime = payload;
    },
  },
});

export const {
  setName,
  setDescription,
  setType,
  setMethod,
  setCamera,
  setAttachType,
  setCurrentStep,
  setImagePath,
  setGpxPath,
  setStartTime,
  setModifyTime,
} = sequenceSlice.actions;

export const setSequenceName = (name: string): AppThunk => {
  return (dispatch) => {
    dispatch(setName(name));
    dispatch(setCurrentStep('description'));
  };
};

export const setSequenceDescription = (description: string): AppThunk => {
  return (dispatch) => {
    dispatch(setDescription(description));
    dispatch(setCurrentStep('type'));
  };
};

export const setSequenceType = (type: string): AppThunk => {
  return (dispatch) => {
    dispatch(setType(type));
    dispatch(setCurrentStep('method'));
  };
};

export const setSequenceMethod = (method: string): AppThunk => {
  return (dispatch) => {
    dispatch(setMethod(method));
    dispatch(setCurrentStep('camera'));
  };
};

export const setSequenceCamera = (camera: string): AppThunk => {
  return (dispatch) => {
    dispatch(setCamera(camera));
    dispatch(setCurrentStep('attachType'));
  };
};

export const setSequenceAttachType = (attachType: string): AppThunk => {
  return (dispatch) => {
    dispatch(setAttachType(attachType));
    dispatch(setCurrentStep('imagePath'));
  };
};

export const setSequenceCurrentStep = (currentStep: string): AppThunk => {
  return (dispatch) => {
    dispatch(setCurrentStep(currentStep));
  };
};

export const setSequenceImagePath = (uploadPath: string[]): AppThunk => {
  return (dispatch) => {
    dispatch(setImagePath(uploadPath));
    dispatch(setCurrentStep('gpxPath'));
  };
};

export const setSequenceGpxPath = (uploadPath: string[]): AppThunk => {
  return (dispatch) => {
    dispatch(setGpxPath(uploadPath));
    dispatch(setCurrentStep('startTime'));
  };
};

export const setSequenceStartTime = (startTime: string): AppThunk => {
  return (dispatch) => {
    dispatch(setGpxPath(startTime));
    dispatch(setCurrentStep('modifyTime'));
  };
};

export const setSequenceModifyTime = (modifyTime: string): AppThunk => {
  return (dispatch) => {
    dispatch(setGpxPath(modifyTime));
    dispatch(setCurrentStep('modifySpace'));
  };
};

export default sequenceSlice.reducer;

export const selSequenceName = (state: RootState) => state.sequence.name;

export const selSequenceDescription = (state: RootState) =>
  state.sequence.description;

export const selSequenceType = (state: RootState) => state.sequence.type;

export const selSequenceMethod = (state: RootState) => state.sequence.method;

export const selSequenceCamera = (state: RootState) => state.sequence.camera;

export const selSequenceAttachType = (state: RootState) =>
  state.sequence.attachType;

export const getPrevStep = (state: RootState) => {
  const pages = Object.keys(state.sequence).filter((k) => k !== 'currentStep');

  const idx = pages.indexOf(state.sequence.currentStep);
  if (idx - 1 < 0) {
    return '';
  }
  return pages[idx - 1];
};

export const selStartTime = (state: RootState) => state.sequence.startTime;
export const selModifyTime = (state: RootState) => state.sequence.modifyTime;

export const selCurrentStep = (state: RootState) => state.sequence.currentStep;
