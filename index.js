const firestore = require('./firestore');
const functions = require('firebase-functions');
const sm_app = require('./smarthome_app');

// Fulfillment redirect function
exports.router = functions.https.onRequest(sm_app.app);

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


