import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../store';
import { IGeoPoint } from '../types/IGeoPoint';

const initialState = {
  step: {
    current: 'name',
    passed: [],
  },
  steps: {
    name: '',
    description: '',
    type: '',
    method: '',
    camera: '',
    attachType: '',
    imagePath: '',
    gpx: {
      required: true,
      path: '',
      points: [],
      import: false,
    },
    startTime: '',
    modifyTime: 0,
    modifySpace: {
      frame: 0,
      position: 0,
    },
    outlier: {
      meters: 0,
      mode: '',
    },
    processPage: '',
    azimuth: 0,
    tags: [],
    nadirPath: '',
    previewnadir: '',
  },
  points: [],
  error: null,
};

const createSequenceSlice = createSlice({
  name: 'create',
  initialState: {
    ...initialState,
  },
  reducers: {
    setCurrentStep: (state, { payload }) => {
      const passed =
        state.step.current === 'processPage'
          ? state.step.passed
          : [
              ...state.step.passed.filter(
                (step) => step !== state.step.current
              ),
              state.step.current,
            ];
      state.step = {
        current: payload,
        passed,
      };
      state.error = null;
    },

    goToPrevStep: (state) => {
      const passedlength = state.step.passed.length;
      if (passedlength) {
        state.step = {
          ...state.step,
          current: state.step.passed[passedlength - 1],
          passed: state.step.passed.slice(0, -1),
        };
      }
    },
    setPrevStep: (state) => {
      state.step = {
        ...state.step,
      };
    },
    setName: (state, { payload }) => {
      state.steps.name = payload;
    },
    setDescription: (state, { payload }) => {
      state.steps.description = payload;
    },
    setType: (state, { payload }) => {
      state.steps.type = payload;
    },
    setMethod: (state, { payload }) => {
      state.steps.method = payload;
    },
    setCamera: (state, { payload }) => {
      state.steps.camera = payload;
    },
    setAttachType: (state, { payload }) => {
      state.steps.attachType = payload;
    },
    setImagePath: (state, { payload }) => {
      state.steps.imagePath = payload;
    },
    setGpxPath: (state, { payload }) => {
      state.steps.gpx = {
        ...state.steps.gpx,
        path: payload,
      };
    },
    setGpxRequired: (state, { payload }) => {
      state.steps.gpx = {
        ...state.steps.gpx,
        required: payload,
      };
    },
    setGpxPoints: (state, { payload }) => {
      state.steps.gpx = {
        ...state.steps.gpx,
        points: [...payload],
      };
    },
    setGpxImport: (state) => {
      state.steps.gpx = {
        ...state.steps.gpx,
        import: true,
      };
    },
    setImportGpxPoints: (state) => {
      state.steps.gpx = {
        ...state.steps.gpx,
        import: true,
      };
    },
    setStartTime: (state, { payload }) => {
      state.steps.startTime = payload;
    },
    setModifyTime: (state, { payload }) => {
      state.steps.modifyTime = payload;
    },
    setAzimuth: (state, { payload }) => {
      state.steps.azimuth = payload;
    },
    setTags: (state, { payload }) => {
      state.steps.tags = payload;
    },
    setNadirPath: (state, { payload }) => {
      state.steps.nadirPath = payload;
    },
    setNadirPreview: (state, { payload }) => {
      state.steps.previewnadir = payload;
    },
    setProcessStep: (state, { payload }) => {
      state.steps.processPage = payload;
      state.step = {
        ...state.step,
        current: 'processPage',
      };
    },
    setPoints: (state, { payload }) => {
      state.points = [...payload];
    },

    setModifyPoints: (state, { payload }) => {
      const points = state.points.map((item) => {
        const updatedDate = dayjs(item.GPSDateTime)
          .add(payload, 'second')
          .format('YYYY-MM-DDTHH:mm:ss');
        item.GPSDateTime = updatedDate;
        return item;
      });
      state.points = [...points];
    },

    setSmooth: (state) => {
      state.steps.outlier = {
        ...state.steps.outlier,
        mode: 'S',
      };
    },

    setDiscard: (state) => {
      state.steps.outlier = {
        ...state.steps.outlier,
        mode: 'D',
      };
    },
    setOutlierMeters: (state, { payload }) => {
      state.steps.outlier = {
        ...state.steps.outlier,
        meters: payload,
      };
    },
    setFrame: (state, { payload }) => {
      state.steps.modifySpace = {
        ...state.steps.modifySpace,
        frame: payload,
      };
    },
    setPosition: (state, { payload }) => {
      state.steps.modifySpace = {
        ...state.steps.modifySpace,
        position: payload,
      };
    },
    setInit: (state) => {
      state = {
        ...initialState,
      };
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
  },
});

export const {
  setName,
  setPrevStep,
  setDescription,
  setType,
  setMethod,
  setCamera,
  setAttachType,
  setCurrentStep,
  goToPrevStep,
  setImagePath,
  setGpxPath,
  setGpxRequired,
  setGpxImport,
  setStartTime,
  setModifyTime,
  setAzimuth,
  setTags,
  setNadirPath,
  setNadirPreview,
  setProcessStep,
  setPoints,
  setGpxPoints,
  setModifyPoints,
  setDiscard,
  setSmooth,
  setOutlierMeters,
  setFrame,
  setPosition,
  setInit,
  setError,
} = createSequenceSlice.actions;

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

export const setSequenceImagePath = (uploadPath: string): AppThunk => {
  return (dispatch) => {
    dispatch(setImagePath(uploadPath));
    dispatch(setProcessStep('gpx'));
  };
};

export const setSequenceGpxPath = (uploadPath: string): AppThunk => {
  return (dispatch) => {
    dispatch(setGpxPath(uploadPath));
  };
};

export const setSequenceStartTime = (startTime: string): AppThunk => {
  return (dispatch) => {
    dispatch(setStartTime(startTime));
  };
};

export const setSequenceModifyTime = (modifyTime: number): AppThunk => {
  return (dispatch) => {
    dispatch(setModifyTime(modifyTime));
    dispatch(setCurrentStep('modifySpace'));
  };
};

export const setSequenceAzimuth = (azimuth: number): AppThunk => {
  return (dispatch) => {
    dispatch(setAzimuth(azimuth));
  };
};

export const setSequenceNadirPath = (paths: string): AppThunk => {
  return (dispatch) => {
    dispatch(setNadirPath(paths));
  };
};

export const setSequenceTags = (tags: string[]): AppThunk => {
  return (dispatch) => {
    dispatch(setTags(tags));
    dispatch(setCurrentStep('nadir'));
  };
};

export const setSequencePoints = (points: IGeoPoint[]): AppThunk => {
  return (dispatch) => {
    dispatch(setPoints(points));
    dispatch(
      setGpxRequired(
        points.filter((p: IGeoPoint) => !p.GPSLatitude || !p.GPSLongitude)
          .length > 0
      )
    );
  };
};

export const setSequenceGpxPoints = (points: any): AppThunk => {
  return (dispatch) => {
    dispatch(setGpxPoints(points));
    dispatch(setCurrentStep('startTime'));
  };
};

export const setSequenceGpxImport = (): AppThunk => {
  return (dispatch) => {
    dispatch(setGpxImport());
  };
};

export const setSequenceSmooth = (): AppThunk => {
  return (dispatch) => {
    dispatch(setSmooth());
  };
};

export const setSequenceDiscard = (): AppThunk => {
  return (dispatch) => {
    dispatch(setDiscard());
  };
};

export const setSequenceOutlierMeters = (meters: number): AppThunk => {
  return (dispatch) => {
    dispatch(setOutlierMeters(meters));
  };
};

export const setSequenceFrame = (frame: number): AppThunk => {
  return (dispatch) => {
    dispatch(setFrame(frame));
  };
};

export const setSequencePosition = (position: number): AppThunk => {
  return (dispatch) => {
    dispatch(setPosition(position));
  };
};

export const setSequenceInit = (): AppThunk => {
  return (dispatch) => {
    dispatch(setInit());
  };
};

export const setSequenceError = (error: any): AppThunk => {
  return (dispatch) => {
    dispatch(setError(error));
  };
};

export default createSequenceSlice.reducer;

export const selSequenceName = (state: RootState) => state.create.steps.name;

export const selSequenceDescription = (state: RootState) =>
  state.create.steps.description;

export const selSequenceType = (state: RootState) => state.create.steps.type;

export const selSequenceMethod = (state: RootState) =>
  state.create.steps.method;

export const selSequenceCamera = (state: RootState) =>
  state.create.steps.camera;

export const selSequenceAttachType = (state: RootState) =>
  state.create.steps.attachType;

export const selPrevStep = (state: RootState) => {
  const passedlength = state.create.step.passed.length;
  return passedlength ? state.create.step.passed[passedlength - 1] : '';
};

export const selGPXRequired = (state: RootState) =>
  state.create.steps.gpx.required;

export const selGPXPoints = (state: RootState) => state.create.steps.gpx.points;

export const selStartTime = (state: RootState) =>
  state.create.points.length ? state.create.points[0].GPSDateTime : null;

export const selModifyTime = (state: RootState) =>
  state.create.steps.modifyTime;

export const selSequenceTags = (state: RootState) => state.create.steps.tags;

export const selPoints = (state: RootState) => state.create.points;

export const selProcessPageNext = (state: RootState) => {
  return state.create.steps.processPage;
};

export const selPreviewNadir = (state: RootState) =>
  state.create.steps.previewnadir;

export const selCurrentStep = (state: RootState) => state.create.step.current;

export const selSequence = (state: RootState) => state.create;

export const selSequenceOutlierMeter = (state: RootState) =>
  state.create.steps.outlier.meters;

export const selSequenceOutlierMode = (state: RootState) =>
  state.create.steps.outlier.mode;

export const selSequenceFrame = (state: RootState) =>
  state.create.steps.modifySpace.frame;

export const selSequencePosition = (state: RootState) =>
  state.create.steps.modifySpace.position;

export const selSequenceAzimuth = (state: RootState) =>
  state.create.steps.azimuth;

export const selError = (state: RootState) => state.create.error;
