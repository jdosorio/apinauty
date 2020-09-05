const config={
    production :{
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default : {
        SECRET: 'secretkey',
        DATABASE: 'mongodb://172.20.0.2:27017/Nauty'
    }
}


exports.get = function get(env){
    return config[env] || config.default
}