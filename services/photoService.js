const fs = require('fs')
const aws = require('aws-sdk')
const config = require('../common/config')

const createDirectory = name => {
  new aws.S3().upload({Bucket: config.aws.bucket, Key: `${name}/`, Body: 'doesnot matter'}, (err, data) => {
    console.log(err, data)
  })
}

const upload = (directoryName, fileName, filePath) => {
  const params = {
    Bucket: config.aws.bucket,
    Key: `${directoryName}/${fileName}.jpg`,
    Body: fs.createReadStream(filePath)
  }

  new aws.S3().upload(params, (err, data) => {
    console.log(err, data)
  })
}

const download = (directoryName, fileName, res) => {
  const params = {
    Bucket: config.aws.resizedBucket,
    Key: `${directoryName}/${fileName}.jpg`
  }

  const s3 = new aws.S3()
  s3.getObject(params, (error, data) => {
    if (error) console.error(error)
    res.attachment(`${fileName}.jpg`)
    res.send(data.Body)
  })
}

module.exports = {
  createDirectory,
  upload,
  download
}
