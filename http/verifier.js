const get = require('simple-get')
const parallel = require('run-parallel')
const { Verifier } = require('anon-creds')

const db = new Map()

class VerifierHTTP extends Verifier {
  constructor (storage, issuerEndpoint) {
    super(storage)
    this.issuerEndpoint = issuerEndpoint
  }

  registerCertifications (cb) {
    var options = {
      method: 'GET',
      url: this.issuerEndpoint + '/certifications',
      json: true
    }

    get.concat(options, (err, res, data) => {
      if (err) return cb(err)

      var certs = Object.entries(data)

      var tasks = certs.map(([certId, certInfo]) => {
        return (cb) => {
          super.registerCertification(Buffer.from(certInfo, 'base64'), cb)
        }
      })

      parallel(tasks, function (err, results) {
        if (err) return cb(err)
        cb()
      })
    })
  }

  validate (transcript, cb) {
    super.validate(transcript, (err, identifier) => {
      if (err) return cb(err)

      console.log(identifier)

      db.set(identifier.certId, identifier)

      // IF ISSUER WANTS TO REVOKE
      // var options = {
      //   method: 'POST',
      //   url: this.issuerEndpoint + '/issuerRevoke',
      //   body: db.get(identifier.certId),
      //   json: true
      // }

      // get.concat(options, (err, res, data) => {
      //   if (err) return cb(err)
      //   console.log(data)
      //   cb()
      // })
      cb()
    })
  }
}

module.exports = VerifierHTTP
