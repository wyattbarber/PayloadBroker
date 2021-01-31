const firestore = require('./firestore');

exports.link_home = (req, res) => {
    const secret = req.body.secret;
    var data = firestore.getUserData(req, res);

    // Verify source of request
    if (secret != data.HomeSecret) {
        res.status(400).send({error: "Could not verify source"});
        return;
    }
    // Source verified, set home url
    var newReq = req;
    newReq.body.param = 'HomeAddress';
    newReq.body.value = req.body.url;
    firestore.set(req, res);
    data = firestore.getUserData(req, res);

    // Send response with verification key and set url
    res.status(202).send({
        key: data.HomeAccesKey,
        url: data.HomeAddress
    });
}