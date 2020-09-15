const axiosErrorHandler = (error: any, apiName?: string) => {
  let err = '';
  if (error.response) {
    err = JSON.stringify(error.response.data);
  } else if (error.errno === 'ECONNREFUSED') {
    err = 'API Service is down now. Please check';
  } else if (error.message) {
    err = error.message;
  }

  return apiName ? `${apiName} : ${err}` : err;
};

export default axiosErrorHandler;
