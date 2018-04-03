const passport = require('passport');
const sinon = require('sinon');
const User = require('../../models').User
const app = require('../../app');
const chai = require('chai');
const expect = chai.expect;

describe('passport', function () {
  let sandbox;
  beforeEach(function () {
      sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
      sandbox.restore();
  });

  describe('use LocalStrategy', function () {
    it('returns false if user is not found', function (done) {
      const email = 'testEmail@example.com';
      const password = 'testPassword';
      const req = {body:{email: email, password: password}};
      const res = {};
      const user = sandbox.stub();
      sandbox.stub(User, 'findOne').resolves(null);
      passport.authenticate('local', function (err, user, info) {
        if (err) done(err);
        expect(user).to.be.false;
        expect(info.message).to.equal('Incorrect username or password');
        done()
      })(req, res);
    });
    it('returns false if the password is invalid', function (done) {
      const email = 'testEmail@example.com';
      const password = 'testPassword';
      const req = {body:{email: email, password: password}};
      const res = {};
      const userStub = sandbox.stub();
      userStub.validPassword = password => false
      sandbox.stub(User, 'findOne').resolves(userStub);
      passport.authenticate('local', function (err, user, info) {
        if (err) done(err);
        expect(user).to.be.false;
        expect(info.message).to.equal('Incorrect username or password');
        done()
      })(req, res);
    });
    it('returns the user on successful authentication', function (done) {
      const email = 'testEmail@example.com';
      const password = 'testPassword';
      const req = {body:{email: email, password: password}};
      const res = {};
      const userStub = sandbox.stub();
      userStub.hash = 'testHash';
      userStub.salt = 'testSalt';
      userStub.validPassword = password => true
      sandbox.stub(User, 'findOne').resolves(userStub);
      passport.authenticate('local', function (err, user, info) {
        if (err) done(err);
        expect(user).to.be.equal(userStub);
        expect(user.hash).to.equal('');
        expect(user.salt).to.equal('');
        if (info) done(info);
        done()
      })(req, res);
    });
    it('returns false if an exception is caught', function (done) {
      const email = 'testEmail@example.com';
      const password = 'testPassword';
      const req = {body:{email: email, password: password}};
      const res = {};
      const userStub = sandbox.stub();
      userStub.validPassword = password => true
      sandbox.stub(User, 'findOne').throws({message: "test exception thrown"});
      passport.authenticate('local', function (err, user, info) {
        expect(err.message).to.equal("test exception thrown");
        if (user) done(user);
        if (info) done(infO);
        done()
      })(req, res);
    });
  });
});

