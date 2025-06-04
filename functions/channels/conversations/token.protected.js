const twilio = require('twilio');

exports.handler = function(context, event, callback) {
  try {
    const AccessToken = twilio.jwt.AccessToken;
    const ChatGrant = AccessToken.ChatGrant;

    const identity = event.identity || 'agent';
    const token = new AccessToken(
      context.TWILIO_ACCOUNT_SID,
      context.TWILIO_API_KEY,
      context.TWILIO_API_SECRET,
      { identity }
    );

    token.addGrant(
      new ChatGrant({ serviceSid: context.CONVERSATIONS_SERVICE_SID })
    );

    callback(null, { token: token.toJwt() });
  } catch (err) {
    callback(err);
  }
};
