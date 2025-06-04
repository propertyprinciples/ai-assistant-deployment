const twilio = require('twilio');

exports.handler = function (context, event, callback) {
  const client = twilio(context.TWILIO_API_KEY, context.TWILIO_API_SECRET, {
    accountSid: context.TWILIO_ACCOUNT_SID,
  });

  client.conversations.v1.participants
    .create({
      messagingBinding: { address: event.address },
      identity: event.identity,
    })
    .then((participant) => {
      callback(null, { participantSid: participant.sid });
    })
    .catch((error) => {
      callback(error);
    });
};
