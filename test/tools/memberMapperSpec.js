/* global describe it */

const chai = require('chai')
const faker = require('faker')
const memberMapper = require('../../tools/memberMapper')

const expect = chai.expect

describe('memberMapper', function () {
  describe('map', function () {
    it('it maps imported members to member objects based on the mapper config', function () {
      const memberConfig = {
        'Member': {
          'firstName': 'first_name',
          'lastName': 'last_name',
          'email': 'email_address'
        },
        'Phone': {
          'number': 'phone_number'
        }
      }

      const firstMemberFirstName = faker.name.firstName()
      const firstMemberLastName = faker.name.lastName()
      const firstMemberEmail = faker.internet.email()
      const firstMemberPhoneNumber = faker.phone.phoneNumber()
      const secondMemberFirstName = faker.name.firstName()
      const secondMemberLastName = faker.name.lastName()
      const secondMemberEmail = faker.internet.email()
      const secondMemberPhoneNumber = faker.phone.phoneNumber()

      const importMembers = [
        {
          'first_name': firstMemberFirstName,
          'last_name': firstMemberLastName,
          'email_address': firstMemberEmail,
          'phone_number': firstMemberPhoneNumber
        },
        {
          'first_name': secondMemberFirstName,
          'last_name': secondMemberLastName,
          'email_address': secondMemberEmail,
          'phone_number': secondMemberPhoneNumber
        }
      ]

      const expectedMembers = [{
        Member: {
          firstName: firstMemberFirstName,
          lastName: firstMemberLastName,
          email: firstMemberEmail
        },
        Phone: {
          number: firstMemberPhoneNumber
        }
      }, {
        Member: {
          firstName: secondMemberFirstName,
          lastName: secondMemberLastName,
          email: secondMemberEmail
        },
        Phone: {
          number: secondMemberPhoneNumber
        }
      }]
      const members = memberMapper.map(memberConfig, importMembers)
      expect(members).to.deep.equal(expectedMembers)
    })
  })
})
