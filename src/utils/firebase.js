const admin = require('firebase-admin');
const config = require('../config/config')

const initializeApp = () => {
    console.log("Initializing Firebase..")
    const credentials = {
        credential: admin.credential.cert(config.get('googleKey')),
        databaseUrl: "https://rent-a-car-6fd64.firebaseio.com",
        //storageBucket: ""
    }
    admin.initializeApp(credentials)
}

const initializeDB = () => {
    return admin.firestore()
}

// const initializeStorage = () => {
//     return admin.storage().bucket()
// }

module.exports = { initializeApp, initializeDB }