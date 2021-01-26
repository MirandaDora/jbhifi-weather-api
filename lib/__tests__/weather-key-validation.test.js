/* globals describe, it */
const expect = require('chai').expect
const sinon = require('sinon')

const WeatherKeyValidation = require('../weather-key-validation')
describe('weather-key-validation.js', () => {
  describe('isKeyValid()', () => {
    it('key should be valid if less than 5 times of usage', async () => {
      const AWS = require('aws-sdk')
      const DocumentClient = new AWS.DynamoDB.DocumentClient({
        region: 'ap-southeast-2',
        accessKeyId: 'AKIATJRP2HIWZSXC24RC',
        secretAccessKey: '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'
      })
      const ddbPutMock = sinon.stub().returns(Promise.resolve({
        Items: [
          { key: 'abctest', ttl: 1611581060106 },
          { key: 'abctest', ttl: 1611581097855 },
          { key: 'abctest', ttl: 1611581109394 }
        ],
        Count: 3,
        ScannedCount: 6
      }))
      const documentClientMock = {
        query: () => { return { promise: ddbPutMock } }
      }
      const weatherKeyValidation = WeatherKeyValidation.create(documentClientMock)
      const rest = await weatherKeyValidation.isKeyValid('abctest')
      expect(ddbPutMock.calledOnce).to.be.true
    })
    it('key should not be valid if more than 5 times detected', async () => {
      const AWS = require('aws-sdk')
      const DocumentClient = new AWS.DynamoDB.DocumentClient({
        region: 'ap-southeast-2',
        accessKeyId: 'AKIATJRP2HIWZSXC24RC',
        secretAccessKey: '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'
      })
      const ddbQueryMock = sinon.stub().returns(Promise.resolve({
        Items: [
          { key: 'abctest', ttl: 1611581060106 },
          { key: 'abctest', ttl: 1611581097855 },
          { key: 'abctest', ttl: 1611581109394 },
          { key: 'abctest', ttl: 1611581111810 },
          { key: 'abctest', ttl: 1611581113461 },
          { key: 'abctest', ttl: 1611581115356 },
          { key: 'abctest', ttl: 1611581133210 },
          { key: 'abctest', ttl: 1611581167912 },
          { key: 'abctest', ttl: 1611581181770 }
        ],
        Count: 9,
        ScannedCount: 9
      }))
      const documentClientMock = {
        query: () => { return { promise: ddbQueryMock } }
      }
      const weatherKeyValidation = WeatherKeyValidation.create(documentClientMock)
      // await weatherKeyValidation.addKeyUsage('abctest')
      try {
        await weatherKeyValidation.isKeyValid('abctest')
      } catch (error) {
        expect(error.message).to.equal('HOURLY LIMIT EXCEED')
      }
    })
  })

  describe('addKeyUsage()', () => {
    it('key should be added given key', async () => {
      const AWS = require('aws-sdk')
      const DocumentClient = new AWS.DynamoDB.DocumentClient({
        region: 'ap-southeast-2',
        accessKeyId: 'AKIATJRP2HIWZSXC24RC',
        secretAccessKey: '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'
      })
      const ddbPutMock = sinon.stub().returns(Promise.resolve({}))
      const documentClientMock = {
        put: () => { return { promise: ddbPutMock } }
      }
      const weatherKeyValidation = WeatherKeyValidation.create(documentClientMock)
      const rest = await weatherKeyValidation.addKeyUsage('abctest')
      expect(ddbPutMock.calledOnce).to.be.true
      expect(rest).to.deep.equal({})
    })
    it('should throw bad request if no key', async () => {
      const ddbPutMock = sinon.stub().returns(Promise.resolve({}))
      const documentClientMock = {
        put: () => { return { promise: ddbPutMock } }
      }
      const weatherKeyValidation = WeatherKeyValidation.create(documentClientMock)
      // await weatherKeyValidation.addKeyUsage('abctest')
      try {
        await weatherKeyValidation.addKeyUsage()
      } catch (error) {
        expect(error.message).to.equal('Bad Request')
      }
    })
  })
})