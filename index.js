const firestore = require('./firestore');

exports.address_ap = (req, res) => {
    const source_ip = req.ip;

    // Get data to validate source
    const data = firestore.getUserData(req, res);
    if (req.query.key != data.HomeSecret) {
        res.status(400).send({error : 'Failed to verify source identity'});
        return;
    }

    // Source verified, store new ip
    var newReq = req;
    newReq.body.param = 'HomeAddress';
    newReq.body.value = source_ip;
    firestore.set(newReq, res);

    // Respond to request
    res.status(202).send({ip: source_ip});
    return;
}