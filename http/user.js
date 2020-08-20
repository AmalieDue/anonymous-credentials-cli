const { User } = require('anon-creds')
const get = require('simple-get')

class UserHTTP extends User {
  constructor (issuerEndpoint, verifierEndpoint) {
    super()
    this.issuerEndpoint = issuerEndpoint
    this.verifierEndpoint = verifierEndpoint
  }

  apply (details, certId, cb) {
    const app = super.apply(details, certId)

    var options = {
      method: 'POST',
      url: this.issuerEndpoint + '/app',
      body: app,
      json: true
    }

    get.concat(options, (err, res, data) => {
      if (err) return cb(err)

      console.log('3) Issuer has begun a new issuance protocol by generating a "setup" object')
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

      console.log('5) Issuer has sent his final step during issuance, i.e. the issuer has sealed the credential by exponentiating the product of all curve points by the issuer´s secret key.')
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
}

module.exports = UserHTTP
