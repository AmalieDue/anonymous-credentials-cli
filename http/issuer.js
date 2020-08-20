const { Issuer } = require('anon-creds')
const fs = require('fs')

class IssuerHTTP {
  constructor (storage, verifierEndpoint) {
    this.issuer = new Issuer(storage)
    this.verifierEndpoint = verifierEndpoint
  }

  addCertification (schema, cb) {
    this.issuer.addCertification(schema, (cb) => {
      fs.writeFile('certId.json', cb, (err) => {
        if (err) return cb(err)
      })
    })
  }
}

module.exports = IssuerHTTP
