const { User } = require('anon-creds')
const get = require('simple-get')
const fs = require('fs')
const { PublicCertification } = require('anon-creds/certification')

class UserHTTP extends User {
  constructor (issuerEndpoint, verifierEndpoint) {
    super()
    this.issuerEndpoint = issuerEndpoint
    this.verifierEndpoint = verifierEndpoint
  }

  getCertifications (cb) {
    var options = {
      method: 'GET',
      url: this.issuerEndpoint + '/certifications',
      json: true
    }

    get.concat(options, (err, res, data) => {
      if (err) return cb(err)

      var certs = Object.entries(data)

      fs.writeFile('certs.json', '', (err) => {
        if (err) return cb(err)

        for (const [certId, certInfo] of certs) {
          var publicCert = PublicCertification.decode(Buffer.from(certInfo, 'base64'))
          console.log(publicCert.certId, publicCert.schema)

          fs.appendFile('certs.json', publicCert.certId + '\n', (err) => {
            if (err) return cb(err)
            cb()
          })
        }
      })
    })
  }

  createApplication (details, certId, cb) {
    const app = super.createApplication(details, certId)

    var options = {
      method: 'POST',
      url: this.issuerEndpoint + '/app',
      body: app,
      json: true
    }

    get.concat(options, (err, res, data) => {
      if (err) return cb(err)

      console.log('2) Issuer has begun a new issuance protocol by generating a "setup" object')
      cb(null, data)
    })
  }

  obtain (msg, cb) {
    const issuanceResponse = super.obtain(msg)

    var options = {
      method: 'POST',
      url: this.issuerEndpoint + '/obtain',
      body: issuanceResponse,
      json: true
    }

    get.concat(options, (err, res, data) => {
      if (err) return cb(err)

      console.log('4) Issuer has sent his final step during issuance, i.e. the issuer has sealed the credential by exponentiating the product of all curve points by the issuer´s secret key.')
      cb(null, data)
    })
  }

  present (attributes, cb) {
    const transcript = super.present(attributes)

    var options = {
      method: 'POST',
      url: this.verifierEndpoint + '/transcript',
      body: transcript,
      json: true
    }

    get.concat(options, (err, res, data) => {
      if (err) return cb(err)
      console.log(data)
      cb()
    })
  }

  static decode (issuerEndpoint, verifierEndpoint, ...args) {
    const user = super.decode(...args)

    user.issuerEndpoint = issuerEndpoint
    user.verifierEndpoint = verifierEndpoint

    return user
  }

  revoke (cb) {
    var options = {
      method: 'POST',
      url: this.issuerEndpoint + '/userRevoke',
      json: true
    }

    get.concat(options, (err, res, data) => {
      if (err) return cb(err)
      console.log(data)
      cb()
    })
  }
}

module.exports = UserHTTP
