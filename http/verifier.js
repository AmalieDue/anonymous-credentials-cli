const get = require('simple-get')
const { Verifier } = require('anon-creds')

class VerifierHTTP {
  constructor (storage, issuerEndpoint) {
    this.verifier = new Verifier(storage)
    this.issuerEndpoint = issuerEndpoint
  }

  registerCertification (cb) {
    var options = {
      method: 'POST',
      url: this.issuerEndpoint + '/certinfo_verifier',
      body: {
        Message: 'I need certinfo'
      },
      json: true
    }

    get.concat(options, (err, res, data) => {
      if (err) return cb(err)

      this.verifier.registerCertification(Buffer.from(data), (err) => {
        cb(err)
      })
    })
  }

  validate (transcript, cb) {
    this.verifier.validate(transcript, (err, identifier) => {
      if (err) return cb(err)

      var options = {
        method: 'POST',
        url: this.issuerEndpoint + '/identifier',
        body: identifier,
        json: true
      }

      get.concat(options, (err, res, data) => {
        if (err) return cb(err)
        console.log(data)
      })
    })
  }
}

module.exports = VerifierHTTP
