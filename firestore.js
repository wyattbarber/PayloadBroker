admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

module.exports = {
    getUserData: async function (req, res) {
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

    set: async function (req, res) {
        const client = req.query.client_id
            ? req.query.client_id
            : req.body.client_id;
        const param = req.query.param
            ? req.query.param
            : req.body.param;
        const value = req.query.value
            ? req.query.value
            : req.body.value;

        const clientDoc = await db.collection('Home Data').doc(client);
        if (clientDoc) {
            try {
                if (param == 'HomeAddress') {
                    await clientDoc.update({ "HomeAddress": value });
                    return;
                }
                if (param == 'HomeAccessKey') {
                    await clientDoc.update({ "HomeAccessKey": value });
                    return
                }
                throw "Unsupported parameter";
            }
            catch (e) {
                res.status(400).send({ error: 'Failed to update data: ' + e });
                return;
            }
        }
        else {
            res.status(404).send({ error: 'Could not locate document for this client' });
            throw 'Error opening document';
        }

    },

    getEndpoint: async function (token) {
        console.log('Token query started for ' + token);
        const query = await db.collection('Home Data').where('AuthToken', '==', token).get()

        if (query.empty) {
            console.error('Token query: no match found.');
            throw 'Bad token';
        }
        if (query.length > 1) {
            console.error('Token query: multiple matches found');
            throw 'Bad token';
        }

        console.log('Token query: match found');
        const data = await query.docs[0].data();

        return new Promise((resolve, reject) => {
            if (data) {
                resolve({
                    url: data.HomeAddress,
                    key: data.HomeAccessKey
                });
            }
            else {
                reject({
                    url: "potato",
                    key: "potato"
                })
            }
        });
    }
};