const firestore = require('./firestore');
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();

exports.router = async function(req, res) {
    // Find matchng user with auth key
    const authToken = String(req.headers.authorization).substr(7);
    console.log('Seeking endpoint for token '+authToken);
    firestore.getEndpoint(authToken)
    .then((data) => {
        proxy.web(req, res, {
            changeOrigin: true,
            target: data.url
        });
    })
    .catch( (e) => {
        console.log(e);
        res.status(400).send({error: e});
    });
};

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


