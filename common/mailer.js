// Use at least Nodemailer v4.1.0
const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const config = require('../common/config')

const sendMail = async (firstName, lastName, email, token) => {
// Create a SMTP transporter object
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.auth.user,
      pass: config.smtp.auth.pass
    }
  })

  const data = {
    firstName: firstName,
    lastName: lastName,
    url: `localhost:3001/confirm/${token}`
  }

  const confirmationHtml = path.join(__dirname, '..', 'resources', 'email', 'confirmation.html')
  const source = fs.readFileSync(confirmationHtml, 'utf8')
  const template = handlebars.compile(source)
  const html = template(data)

  const message = {
    from: 'Congregreat <confirmation@congregreat.com>',
    to: `${firstName} ${lastName} <${email}>`,
    subject: 'Email Confirmation',
    html: html
  }

  try {
    const info = await transporter.sendMail(message)
    console.log(info)
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  sendMail
}
