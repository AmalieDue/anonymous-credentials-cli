const express = require('express')
const IssuerHTTP = require('./http/issuer.js')
const app = express()
const fs = require('fs')
const path = require('path')
const port = 8080
const concat = require('concat-stream')
app.use(function (req, res, next) {
  req.pipe(concat(function (data) {
    req.body = data
    next()
  }))
})
app.use(express.raw())
app.use(express.json())

function loadCertification (scheme, cb) {
  issuer.addCertification(scheme, cb)
}

const issuer = new IssuerHTTP('./issuer_storage')

fs.readdir(process.argv[2], (err, files) => {
  if (err) throw err

  return loop(0)

  function loop (i) {
    if (i === files.length) {
      return app.listen(port, () => {
        console.log(`Issuer server is listening on http://localhost:${port}`)
      })
    }

    const scheme = require(path.join(process.argv[2], files[i]))

    loadCertification(scheme, (err) => {
      if (err) throw err
      return loop(++i)
    })
  }
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

  const response = issuer.beginIssuance(Buffer.from(req.body))
  res.send(response)
})

app.post('/obtain', (req, res) => {
  console.log('3) User has sent his contribution in the issuance protocol, i.e. the user has generated random scalars used to exponentiate the blinded curve points.')

  res.send(issuer.grantCredential(Buffer.from(req.body)))
})

app.post('/issuerRevoke', (req, res) => {
  console.log('2) Verifier has sent identifier which is used for revocation.')
  const identifier = {
    pk: Buffer.from(req.body.pk.data),
    certId: req.body.certId
  }

  issuer.revokeCredential(identifier, (err) => {
    if (err) throw err
    console.log('User has now been revoked')
  })
})

app.post('/userRevoke', (req, res) => {
  const identifier = req.body
  identifier.root = Buffer.from(identifier.root, 'hex')

  issuer.revokeCredential(identifier, (err) => {
    if (err) throw err
    console.log('User has now been revoked from certificationId:', identifier.certId)
    res.send(JSON.stringify('User has now been revoked'))
  })
})
