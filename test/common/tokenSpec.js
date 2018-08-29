/* global describe it beforeEach afterEach */

const fs = require('fs')
const chai = require('chai')
const sinon = require('sinon')
const faker = require('faker')
const jsonWebToken = require('jsonwebtoken')
const config = require('../../common/config')
const {verifyToken, generateToken} = require('../../common/token')
const publicKey = fs.readFileSync(config.jwt.public)

const passphrase = config.jwt.passphrase
const expect = chai.expect
const assert = chai.assert
const algorithm = 'RS512'

describe('token', function () {
  let sandbox
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })
  it('generates a token that includes the payload', function () {
    const userId = faker.random.uuid()
    const memberId = faker.random.uuid()
    const congregationId = faker.random.uuid()
    const email = faker.internet.email()

    const token = generateToken({userId, memberId, congregationId, email})

    const decodedToken = jsonWebToken.verify(
      token,
      publicKey,
      { algorithm, expiresIn: `2d` }
    )
    expect(decodedToken.userId).to.equal(userId)
    expect(decodedToken.memberId).to.equal(memberId)
    expect(decodedToken.congregationId).to.equal(congregationId)
    expect(decodedToken.email).to.equal(email)
    assert(decodedToken.exp !== null)
  })
  it('verifies invalid token if the token was not generated with the private pem file', function () {
    const userId = faker.random.uuid()
    const memberId = faker.random.uuid()
    const congregationId = faker.random.uuid()
    const email = faker.internet.email()
    // do not add spaces in front of the lines for this key or it
    // becomes an invalid key
    const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAsIi+P75mOkqvFB8037ra94HSRLubUD0RBbjbFNJBtswQrHpn
czryu+hzJqBqeCiRCOQfPqhIS3Lx4Pvafd8loZR9rgxSwEFX3xpE02TOmK7Yq2gC
By5my1RW6Z4wKHuhNjbM8qld4Qf9Y9Dv+35eF7crZeDhlbMpnAXGmufAxNxJq+8U
rwlmJz84yvaRVlIHJjJNLXfOawst3EkERKBbxdzgV5bAC4+awiNGSV8TmbWIBr4T
52J4KuQgL+dfSUv//wWUQcW2Nv0BuvvgrcS2Nrr6OfbOAF6RD7sylbpm74Ur++ZG
V1SWhaGb3ApB6enknvERevYYe2jeGTZczzbN8QIDAQABAoIBAE2jpkB0pZMne36X
BvMKw/is0ORHulP8t3rTxQ6QNjSF5SNmJg9Isq6v2cz4Kjs0ZC0L3y34Zus/3186
hOps9KjunKOqac6CLnpBnFl4cWA3LbWc5Z9w6eas7hiK6NU1Ij6stVBX6qDomamH
n7P07L7zYRPKZownIrqq06EXIfGx0V+5w3q9XHHZuif6qxhObykM9tWY6faDQzDg
cu1NccN5ffA4qNATd9y0epoQkO6pH5c5bsWN3us/SdV+mrEzHRt+iBpNyeRkvoBA
dv7bOvEy+2ny5FFysAnV4Ck1lPDqIl17SX6tt9UPGD1M2obCi42dzyHimhvLjx5A
z32PWX0CgYEA29zgdvmdhZjOFMEgCncCc7xpJjUAvG9B6LhOkzvEZTAMdeIZVgnf
30RlQ+wEL7o5DdbPoESztkZAT2c2yI1p28iJgyQaoLBOrdNdOoFOBcrmCD8wbuRj
0HPufJXkQ3LgpUi0d7lbG7VZOBMGVfhXlLadWxikZ2TFL8n0ZfUgIm8CgYEAzYy8
SfLpVvwBmmZcePj3NOpdzIo+iFs4F0PLy8zFRQeq54RlqfLwr32Gqf6ut29zZdqM
8EGN8+WGt9P5g/x28b/8pvZOHdjCyJEzPUbeAQULIKv7VM/xQN/1lcH32kLNwwmU
/YWsCzBtydMc87yFGiUDWiiAQAvZ18WAbF9exZ8CgYEA2U9PbUj7MPj/d/QKv00x
10L6ixEIUTeGZYcF4vDIBVugdUOs1yWbaQopLSEyYhomGk+fmEFPf3GgTtstgryD
TQDBKiWdTAX3PkgTdagofgE1rCEIthJ3talgpzNgEmqRL8zU0yEZtCFitdHYCVEU
/6Afl9KbbLZlT/7E2aGWyXECgYBjyZb/L3YoTF9a3aa28+bPQZgX3GVPPTmV0cv2
PIroYDiP/K5+Ovqtt3rQvFuFog2bvOX/HVQUu7ETPU08zivQYSv+wkRaKQkm5ZbC
gMz2IcStL9Dr86djn1ZSRcBVrWjG7rft/B7xr6kc+ehsS3EyqBVgh5j7fsVbAv69
ne8ccQKBgHrPzHxmwa5WaeCxALU/2xtAAqyBu0uMbadDeIjw+HB5h0i1j0tFzHw5
LFvFdcdS3/X0kmpri/kVpmlfod+TAR9bketDcWi+ncpPlU8v3lNFZKwGaN57NPwM
mgonsZ2lIUJXcwQNcns6lp2Q1RWPA+9QsQ3m32vuCVe+UrTxpxuw
-----END RSA PRIVATE KEY-----`
    const privateKeyBuffer = Buffer.from(privateKey, 'utf8')
    const payload = {userId, memberId, congregationId, email}
    const token = jsonWebToken.sign(
      payload,
      {
        key: privateKeyBuffer,
        passphrase
      }, {
        algorithm
      }
    )

    expect(() => { verifyToken(token) }).to.throw('invalid signature')
  })
})
