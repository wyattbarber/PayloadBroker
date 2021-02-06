const firestore = require('./firestore');
const axios = require('axios');
const functions = require('firebase-functions');
const { smarthome } = require('actions-on-google');
const app = smarthome();
const https = require('https');
const agent = https.Agent({
    rejectUnauthorized: false,
    keepAlive: true
});

exports.router = functions.https.onRequest(app);

app.onSync(async function (body, headers) {
    console.log('SYNC request recieved');
    // Find matchng user with auth key
    let res;
    try {
        let authToken = String(headers.authorization).substr(7);
        console.log('Seeking endpoint for token ' + authToken);
        let data = await firestore.getEndpoint(authToken);

        console.log('Forwarding SYNC request');
        let options = {
            method: 'POST',
            headers: {
                'Authorization': data.key,
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=UTF-8'
            }
        };
        res = await fetch(data.url, options);
    }
    catch (e) {
        console.error(e);
    }

    return new Promise((resolve, reject) => {
        if (res != undefined) {
            console.log('Response resolved');
            resolve({
                requestId: body.requestId,
                payload: {
                    agentUserId: res.user,
                    devices: res.devices
                }
            });
        }
        else {
            reject(undefined);
        }
    });
});

// Store url from home device
exports.link_home = (req, res) => {
    const secret = req.body.secret;
    firestore.getUserData(req, res).then((data) => {
        // Verify source of request
        if (secret != data.HomeSecret) {
            res.status(400).send({ error: "Could not verify source " + secret + ", " + data.HomeSecret });
            return;
        }
        // Source verified, set home url
        var newReq = req;
        newReq.body.param = 'HomeAddress';
        newReq.body.value = req.body.url;
        firestore.set(req, res).then(function () {
            firestore.getUserData(req, res).then((newData) => {
                // Send response with verification key and set url
                res.status(202).send({
                    key: newData.HomeAccesKey,
                    url: newData.HomeAddress
                });
            });
        });

    });
}


