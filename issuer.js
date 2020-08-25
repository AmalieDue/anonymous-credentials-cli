const express = require('express')
const IssuerHTTP = require('./http/issuer.js')
const app = express()
const port = 8080
app.use(express.json())

const schema1 = {
  age: 'number',
  nationality: 'string',
  residence: 'string',
  'drivers license': 'boolean',
  employed: 'boolean',
  gender: 'string'
}

const schema2 = {
  age: 'number',
  gender: 'string',
  'marital status': 'string',
  education: 'string',
  nationality: 'string'
}

const issuer = new IssuerHTTP('./issuer_storage')

issuer.addCertification(schema1, (err) => {
  if (err) throw err

  issuer.addCertification(schema2, (err) => {
    if (err) throw err

    app.listen(port, () => {
      console.log(`Issuer server is listening on http://localhost:${port}`)
    })
  })
})

app.get('/certifications', (req, res) => {
  const certificates = {}

  for (const [certId, certInfo] of issuer.getPublicCerts()) {
    certificates[certId] = certInfo.toString('base64')
  }
  res.send(certificates)
})

app.post('/app', (req, res) => {
  console.log('1) User has sent an application for a credential')

  res.send(JSON.stringify(issuer.beginIssuance(Buffer.from(req.body))))
})

app.post('/obtain', (req, res) => {
  console.log('3) User has sent his contribution in the issuance protocol, i.e. the user has generated random scalars used to exponentiate the blinded curve points.')

  res.send(JSON.stringify(issuer.grantCredential(Buffer.from(req.body))))
})

app.post('/identifier', (req, res) => {
  console.log('2) Verifier has sent identifier which should be used in case of revocation.')
  const identifier = {
    pk: Buffer.from(req.body.pk.data),
    certId: req.body.certId
  }

  app.post('/userRevoke', (req, res) => {
    issuer.revokeCredential(identifier, (err) => {
      if (err) throw err
      res.send(JSON.stringify('User has now been revoked.'))
    })
  })
})
