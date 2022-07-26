const Message = require("./message.model").Message;
const _ = require("lodash");
const ObjectID = require('mongodb').ObjectID;

function handleError(res, err) {
    return res.send(500, err);
}

exports.get_for_users = function (req, res) {
    var query = require('url').parse(req.url,true).query;
    const senderId  = query.senderId;
    const receiverId  = query.receiverId;
    const adId  = query.adId;
    Message.find(
        { 
            sender: ObjectID(senderId),
            receiver: ObjectID(receiverId),
            ad: ObjectID(adId),
        })
        .sort({date: -1})
        .populate("sender")
        .populate("receiver")
        .exec(function (err, messages) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, messages);
        });
};

exports.create = function (req, res) {
    Message.create(
        {
            text: req.body.text,
            sender: req.body.senderId,
            receiver: req.body.receiverId,
            ad: req.body.adId,
        }, function (err, message) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(201, message);
        });
};
