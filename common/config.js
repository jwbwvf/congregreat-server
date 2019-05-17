module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'r00tadm1n',
    database: process.env.DB_NAME || 'congregreat',
    host: process.env.DB_HOSTNAME || 'localhost',
    port: process.env.DB_PORT || '5306',
    dialect: 'mysql'
  },
  test: {
    username: 'root',
    password: 'r00tadm1n',
    database: 'congregreat-test',
    host: '127.0.0.1',
    port: '5306',
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql'
  },
  jwt: {
    private: process.env.JWT_PRIVATE,
    public: process.env.JWT_PUBLIC,
    passphrase: process.env.JWT_PASSPHRASE
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE || false, // true for 465, false for other
    auth: {
      user: process.env.SMTP_AUTH_USER,
      pass: process.env.SMTP_AUTH_PASS
    }
  },
  aws: {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET
    // Initialising the s3 object from aws-sdk automatically loads the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.
    // process.env.AWS_ACCESS_KEY_ID,
    // process.env.AWS_SECRET_ACCESS_KEY
  }
}
