const anon_creds = require('anon-creds')

const user = new anon_creds.User()

const org = new anon_creds.Issuer()

const verifier = new anon_creds.Verifier()