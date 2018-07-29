const nodemailer = require('nodemailer');

require('dotenv').config();

module.exports = {
  async sendWelcomeEmail (user, firstname, lastname, ctx) {
    const mailer = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASS_MAIL
      }
    })

    const mailOptions = {
      to: user.email,
      from: 'jobsnstuff001@gmail.com',
      subject: 'Welcome to Jobs n\' Stuff!',
      html: `
      <div>Hello ${firstname} ${lastname},</div>
      <div>Welcome to Jobs n' Stuff.</div>
      <div>
        Click the following link to activate your account.
        ${ctx.request.headers.origin}/validate-email/${user.validateEmailToken}
      </div>
    `
    }

    return mailer.sendMail(mailOptions)
  },
  sendForgetPassword (uniqueId, email, firstname, lastname, ctx) {
    const mailer = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASS_MAIL
      }
    })

    const mailOptions = {
      to: email,
      from: 'jobsnstuff001@gmail.com',
      subject: 'Jobs n\' Stuff - Reset Password',
      html: `
      <div>Hello ${firstname} ${lastname},</div>
      <div>
        Click the following link to reset your password.
        ${ctx.request.headers.origin}/reset-password/${uniqueId}
      </div>
    `
    }

    mailer.sendMail(mailOptions, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log('Mail sent to: ' + email)
      }
    })
  }
}
