
module.exports = {
    development: {
      username: "root",
      password: "r00tadm1n",
      database: "congregreat",
      host: "127.0.0.1",
      port: "5306",
      dialect: 'mysql',      
    },
    test: {
      username: "root",
      password: "r00tadm1n",
      database: "congregreat-test",
      host: "127.0.0.1",
      port: "5306",
      dialect: "mysql"
    },
    production: {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOSTNAME,
      dialect: 'mysql',
    }
  };