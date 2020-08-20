const { User } = require('anon-creds')

class UserHTTP {
  constructor (issuerEndpoint, verifierEndpoint) {
    this.user = new User()
    this.issuerEndpoint = issuerEndpoint
    this.verifierEndpoint = verifierEndpoint
  }
}
