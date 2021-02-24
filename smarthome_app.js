/* 
Exports app, instance of actions-on-google.smarthome()
onSync, onQuery, and onExecute intent forwarding implemented by this file.
*/
const firestore = require('./firestore');
const { smarthome } = require('actions-on-google');
const app = smarthome();
const axios = require('axios');
const https = require('https');
const agent = https.Agent({
    rejectUnauthorized: false,
    keepAlive: true
});

// Forward SYNC requests to home
app.onSync(async function (body, headers) {
    console.log('SYNC request recieved');
    let res;
    try {
        // Find matchng user with auth key
        let authToken = String(headers.authorization).substr(7);
        console.log('Seeking endpoint for token ' + authToken);
        let data = await firestore.getEndpoint(authToken);
        // Send SYNC to users home
        console.log('Forwarding SYNC request');
        res = await axios.post(data.url+'/smarthome/fulfillment/sync', {
            key: data.key
        });
    }
    catch (e) {
        console.error(e);
    }

    // Assemble SYNC response
    return new Promise((resolve, reject) => {
        if (res.data != undefined) {
            console.log('Response resolved');
            let syncRes = {
                requestId: body.requestId,
                payload: {
                    agentUserId: res.data.user,
                    devices: res.data.devices
                }
            };
            resolve(syncRes);
        }
        else {
            reject(undefined);
        }
    });
});


// Forward QUERY requests to home
app.onQuery(async function (body, headers) {
    console.log('QUERY request recieved');
    console.log(body);
    let res;
    try {
        // Find matchng user with auth key
        let authToken = String(headers.authorization).substr(7);
        console.log('Seeking endpoint for token ' + authToken);
        let data = await firestore.getEndpoint(authToken);
        // Send QUERY to users home
        console.log('Forwarding QUERY request');
        res = await axios.post(data.url+'/smarthome/fulfillment/query', {
            key: data.key,
            devices: body.inputs[0].payload.devices
        });
    }
    catch (e) {
        console.error(e);
    }

    // Assemble QUERY response
    return new Promise((resolve, reject) => {
        if (res.data != undefined) {
            console.log('Response resolved');
            let queryRes = {
                requestId: body.requestId,
                payload: res.data.payload
            };
            resolve(queryRes);
        }
        else {
            reject(undefined);
        }
    });
});

// Forward EXECUTE intents to home
app.onExecute(async function (body, headers) {
    console.log('EXECUTE request recieved');
    let res;
    try {
        // Find matchng user with auth key
        let authToken = String(headers.authorization).substr(7);
        console.log('Seeking endpoint for token ' + authToken);
        let data = await firestore.getEndpoint(authToken);
        // Send EXECUTE to users home
        console.log('Forwarding EXECUTE request');
        res = await axios.post(data.url+'/smarthome/fulfillment/execute', {
            key: data.key,
            commands: body.inputs[0].payload.commands
        });
    }
    catch (e) {
        console.error(e);
    }

    // Assemble EXECUTEY response
    return new Promise((resolve, reject) => {
        if (res.data != undefined) {
            console.log('Response resolved');
            let exeRes = {
                requestId: body.requestId,
                payload: {
                    errorCode: res.data.errorCode,
                    commands: res.data.cmd_result
                }
            };
            resolve(exeRes);
        }
        else {
            reject(undefined);
        }
    });
});

exports.app = app;