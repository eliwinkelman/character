module.exports = {
  servers: {
    one: {
      host: '52.11.39.246',
      username: 'ubuntu',
      //password: 'toor',
      pem: "/Users/eliwinkelman/Character.pem"
    }
  },

  meteor: {
    name: 'blogging',
    path: '../',
    servers: {
      one: {}
    },
    env: {
      ROOT_URL: 'http://52.11.39.246'
      //  MONGO_URL: 'mongodb://localhost/meteor'
    },
    dockerImage: 'abernix/meteord:base'
  }

 //mongo: {
//   oplog: true,
//   port: 27017,
//   servers: {
//   one: {},
//   },
//   },
};
