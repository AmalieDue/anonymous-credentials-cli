const { Issuer } = require('anon-creds')
const fs = require('fs')

class IssuerHTTP extends Issuer {
  constructor (storage, endpoint) {
    super(storage)

    this.endpoint = endpoint
  }

  addCertification (schema, cb) {
    super.addCertification(schema, (certId) => {
      fs.writeFile('certId.json', certId, (err) => {
        if (err) return cb(err)

        cb(null, certId)
      })
    })
  }
}

module.exports = IssuerHTTP
