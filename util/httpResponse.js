module.exports.apiResponseHeader = {
  'Content-Type': 'application/json',
  'X-Requested-With': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  Expires: '-1'
}

module.exports.genericErrorHandler = async (error, dbConnection) => {
  let statusCode
  let body = error.message || null
  return new Promise((resolve, reject) => { // need to delete this
    if (dbConnection) {
      dbConnection.close(function (error, success) {
        console.log('db connection close result: error:', error, ' success:', success)
        dbConnection = undefined
        return resolve()
      })
    } else {
      return resolve()
    }
  })
    .then(() => {
      if (error.message === 'Bad Request') {
        statusCode = 400
      } else if (error.message === 'Unauthorized') {
        statusCode = 401
      } else if (error.message === 'Not Found') {
        statusCode = 404
      } else if (error.message.indexOf('409') > -1) {
        statusCode = 409
      } else if (error.message === 'Internal Error') {
        statusCode = 500
      } else if (error.message === 'HOURLY LIMIT EXCEED') {
        statusCode = 403
      } else if (error.message.indexOf('422') > -1) {
        statusCode = 422
        body = error.message
      } else {
        console.error('Unhandled error', error)
        statusCode = 500
      }
    })
    .catch(error => {
      console.log('error handling errors', error)
      body = 'Internal Error'
      statusCode = 500
    })
    .then(() => {
      return { // eslint-disable-line
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: this.apiResponseHeader
      }
    })
}
