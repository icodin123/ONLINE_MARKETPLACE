const Message = require("../messages/message.model").Message;
const _ = require("lodash");
const ObjectID = require('mongodb').ObjectID;

function handleError(res, err) {
    return res.send(500, err);
}

exports.get_for_users = function (req, res) {
    var query = require('url').parse(req.url, true).query;
    const userId = query.userId;
    const userIdObjectID = ObjectID(userId);
    Promise.all([
        Message.find(
            {
                receiver: userIdObjectID,
            })
            .populate("sender")
            .populate("ad"),
        Message.find(
            {
                sender: userIdObjectID,
            })
            .populate("receiver")
            .populate("ad"),
    ]).then(results => {
        let received = results[0];
        let sent = results[1];
        received = received.concat(sent);
        received = new Set(received);
        received = Array.from(received);
        let targetUsers = new Set();
        for (let i = 0; i < received.length; i++) {
            if (received[i].sender && !(received[i].sender instanceof ObjectID) && !targetUsers.has(received[i].sender)) {
                targetUsers.add({
                    ...received[i].sender._doc,
                    adId: received[i].ad._id,
                    adName: received[i].ad.name
                });
            }
            if (received[i].receiver && !(received[i].receiver instanceof ObjectID) && !targetUsers.has(received[i].receiver)) {
                targetUsers.add({
                    ...received[i].receiver._doc,
                    adId: received[i].ad._id,
                    adName: received[i].ad.name
                });
            }
        }
        return res.json(200, Array.from(targetUsers));
    }).catch(err => {
        handleError(res, err);
    });
};
