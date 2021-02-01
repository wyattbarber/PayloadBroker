const firestore = require('./firestore');
const{smarthome} = require('actions-on-google');
const functions = require('firebase-functions');
const app = smarthome();
const axios = require('axios');

// Smarthome intent fulfillment 
app.onSync((body, headers) =>{
    const authToken = String(headers.authorization);
    firestore.getEndpoint(authToken)
    .then((home) => {
        axios.get(home.url+'/smarthome/fulfillment/sync?key='+home.key)
        .then((res) => {
            let syncResponse = {
                requestId: body.requestId,
                payload: {
                    agentUserId: res.user,
                    devices: res.devices
                }
            };
            return syncResponse;
        });
    })
    .catch((e) => {
        let syncResponse = {
            requestId: body.requestId,
            payload: {
                errorCode: 400,
                debugString: e,
                agentUserId: 'GCP',
                devices: []
            }
        };
        return syncResponse;
    });
});

app.onQuery((body, headers) => {

});
app.onExecute((body, headers) => {

});

exports.router = app;

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
        firestore.set(req, res).then(function(){
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


