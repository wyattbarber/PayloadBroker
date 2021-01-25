admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

module.exports = {
    getUserData: async function(req, res) {
        const client = req.query.client_id
            ? req.query.client_id
            : req.body.client_id;
            
        const clientDoc = await db.collection('Home Data').doc(client).get();
        if (clientDoc.exists) {
            const data = await clientDoc.data();
            return data;
        }
        else {
            res.status(404).send({ error: 'Could not locate document for this client' });
            throw 'Error opening document';
        }
    },

    set: async function(req, res) {
        const client = req.query.client_id
            ? req.query.client_id
            : req.body.client_id;
        const param = req.query.param
            ? req.query.param
            : req.body.param;
        const value = req.query.value
            ? req.query.value
            : req.body.value;

        const clientDoc = await db.collection('Home Data').doc(client).get();
        if (clientDoc.exists) {
            try {
                clientDoc.update({param: value});
            }
            catch (e) {
                res.status(400).send({ error: 'Failed to update data' });
                return;
            }
        }
        else {
            res.status(404).send({ error: 'Could not locate document for this client' });
            throw 'Error opening document';
        }
        
    }
};