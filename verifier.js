const express = require('express')
const VerifierHTTP = require('./http/verifier.js')

var app = express()
const port = 9999

app.use(express.json())

const verifier = new VerifierHTTP('./verifier_storage', 'http://localhost:8080')

verifier.registerCertification((err) => {
  if (err) throw err
  console.log('Issuer has sent certinfo, verifier is online')
  app.listen(port, () => {
    console.log(`Verifier server is listening on http://localhost:${port}`)
  })
})

app.post('/transcript', (req, res) => {
  console.log('1) User has sent a transcript showing a valid credential, only disclosing some properties.')
  res.send(JSON.stringify('1) verifier got transcript'))

  verifier.validate(Buffer.from(req.body), (err) => {
    if (err) throw err
  })
})
