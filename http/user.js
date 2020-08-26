const { User } = require('anon-creds')
const get = require('simple-get')
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

      for (const [certId, certInfo] of certs) {
        var publicCert = PublicCertification.decode(Buffer.from(certInfo, 'base64'))
        console.log('certificateId:', certId, 'schema:', publicCert.schema)
        cb()
      }
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

  present (attributes, certId, cb) {
    const transcript = super.present(attributes, certId)

    var options = {
      method: 'POST',
      url: this.verifierEndpoint + '/transcript',
      body: transcript,
      json: true
    }

    get.concat(options, (err, res, data) => {
      if (err) return cb(err)
      cb()
    })
  }

  static decode (issuerEndpoint, verifierEndpoint, ...args) {
    const user = super.decode(...args)

    user.issuerEndpoint = issuerEndpoint
    user.verifierEndpoint = verifierEndpoint

    return user
  }

  revoke (certId, cb) {
    const id = this.getIdentity(certId)

    const identifier = {
      root: id.pseudonym.root.toString('hex'),
      certId
    }

    var options = {
      method: 'POST',
      url: this.issuerEndpoint + '/userRevoke',
      json: true,
      body: identifier
    }

    get.concat(options, (err, res, data) => {
      if (err) return cb(err)
      console.log(data)
      cb()
    })
  }
}

module.exports = UserHTTP
