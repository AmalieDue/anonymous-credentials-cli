const express = require('express')
const IssuerHTTP = require('./http/issuer.js')
const fs = require('fs')
const app = express()
const port = 8080

app.use(express.json())

const schema = {
  "age": "number",
  "nationality": "string",
  "residence": "string",
  "drivers license": "boolean",
  "employed": "boolean",
  "gender": "string"
}

const issuer = new IssuerHTTP('./issuer_storage', 'http://localhost:9999')

issuer.issuer.addCertification(schema, (cb) => {

    fs.writeFile('certId.json', cb, function (err) {
        if (err) return console.log(err)
    })

    app.post('/certinfo_verifier', (req, res) => {
        console.log('From verifier:', req.body) // answer verifier's request for certinfo
    
        res.send(JSON.stringify(issuer.issuer.getPublicCert(cb)))
    })
})

app.post('/app', (req, res) => {
    console.log('2) User has sent an application for a credential')

    res.send(JSON.stringify(issuer.issuer.addIssuance(Buffer.from(req.body))))
})

app.post('/obtain', (req, res) => {
    console.log('4) User has sent his contribution in the issuance protocol, i.e. the user has generated random scalars used to exponentiate the blinded curve points.')

    res.send(JSON.stringify(issuer.issuer.grantCredential(Buffer.from(req.body))))
})

app.post('/identifier', (req, res) => {
    console.log('2) Verifier has sent identifier which should be used for revocation process.')
    const identifier = {
        pk: Buffer.from(req.body.pk.data),
        certId: req.body.certId
    }
    
    // REVOKE
    issuer.issuer.revokeCredential(identifier, (err) => {
        if (err) throw err
        console.log('3) user has now been revoked')
        res.send(JSON.stringify('3) user has now been revoked'))
    })    
})

app.listen(port, () => {
    console.log(`Issuer server is listening on http://localhost:${port}`)
})
