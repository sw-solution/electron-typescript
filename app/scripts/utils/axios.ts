const axiosErrorHandler = (error) => {
  let err = '';
  if (error.response) {
    err = error.response.data;
  } else if (error.request) {
    err = error.request;
  } else {
    err = error.message;
  }
  return err;
};

export default axiosErrorHandler;
