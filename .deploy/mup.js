module.exports = {
  servers: {
    one: {
      host: '52.42.204.69',
      username: 'ubuntu',
      pem: "/Users/eliwinkelman/Character.pem",
      // pem: './mykey',
    },
  },

  meteor: {
      env: {
        ROOT_URL: 'http://52.42.204.69',
        PORT: 80,
        MONGO_URL: 'mongodb://localhost/meteor',
      },
    deployCheckWaitTime: 300,
    enableUploadProgressBar: true,
    dockerImage: 'abernix/meteord:base',
  },

  mongo: { //optional
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};
