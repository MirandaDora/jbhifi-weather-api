const _ = require('lodash')
const { apiResponseHeader, genericErrorHandler } = require('./util/httpResponse')
const WeatherKeyValidation = require('./lib/weather-key-validation')
const AWS = require('aws-sdk')
const DocumentClient = new AWS.DynamoDB.DocumentClient({
  region: 'ap-southeast-2'
})
const weatherKeyValidation = WeatherKeyValidation.create(DocumentClient)
const axios = require('axios')
const getWeatherHandler = async (event) => {
  try {
    const { city, country } = _.get(event, 'queryStringParameters', {})
    const key = event.headers['x-api-key']
    if(!city || !country || !key){
      throw new Error('Bad Request')
    }
    const requestParam = {
      url: `http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=c78709b7a991e8b3f65962ed11e5761e`,
      method: 'get'
    }
    try {
      await weatherKeyValidation.isKeyValid(key)
      await weatherKeyValidation.addKeyUsage(key)
      const res = await axios.request(requestParam)
      return {
        statusCode: 200,
        body: JSON.stringify(res.data),
        headers: apiResponseHeader
      }
    } catch (error) {
      console.log('Error getting weather info', error)
      throw error
    }
  } catch (error) {
    return genericErrorHandler(error)
  }
}

module.exports = {
  getWeatherHandler
}