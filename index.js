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
    const authToken = String(headers.authorization).substr(7);
    console.log('Seeking endpoint for token ' + authToken);
    firestore.getEndpoint(authToken)
        .then((data) => {
            console.log('Forwarding SYNC request');
            axios({
                method: 'post',
                url: data.url,
                headers: headers,
                data: body,
                httpsAgent: agent
            })
                .then((res) => {
                    console.log('SYNC response recieved');
                    return new Promise((resolve, reject) => {
                        if(resolve){
                            return {
                                requestId: body.requestId,
                                    payload: {
                                    agentUserId: res.user,
                                        devices: res.devices
                                }
                            } 
                        }
                        if(reject){
                            console.error('Promised response rejected');
                        }
                    });
                });
        })
        .catch((e) => {
            console.error(e);
            return undefined;
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


