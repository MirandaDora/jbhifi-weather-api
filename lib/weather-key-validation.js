const _ = require('lodash')
const moment = require('moment')
const AWS = require('aws-sdk')
module.exports.create = (ddbClient) => {
  const isKeyValid = async (key) => {
    try {
      //1. get key within one hour
      const oneHourTime = moment().subtract(1, 'h').valueOf()
      var params = {
        TableName: process.env.API_KEY_DDB_TABLE || 'jbhifi-weather-api-key',
        KeyConditionExpression: '#key = :key and #createdat > :createdat',
        ExpressionAttributeNames: {
          '#createdat': 'createdat',
          '#key': 'key'
        },
        ExpressionAttributeValues: {
          ':createdat': oneHourTime,
          ':key': key
        }
      }
      const results = await ddbClient.query(params).promise()
      if (results.Count >= 5) {
        console.log('Hourly limit exceed')
        throw new Error('HOURLY LIMIT EXCEED')
      }
      //3. the furtherst is without 1 hour
    } catch (error) {
      throw error
    }
  }
  const addKeyUsage = async (key) => {
    try {
      if(!key){
        throw new Error('Bad Request')
      }
      const now = moment().valueOf()
      const ttl = moment().add(1, 'h').valueOf()
      const params = {
        TableName: process.env.API_KEY_DDB_TABLE || 'jbhifi-weather-api-key',
        Item: {
          key: key,
          createdat: now,
          ttl: ttl
        }
      }
      const results = await ddbClient.put(params).promise()
      return results
    } catch (error) {
      console.log('Error add key usage to ddb', error)
      throw error
    }
  }
  return {
    isKeyValid,
    addKeyUsage
  }
}
