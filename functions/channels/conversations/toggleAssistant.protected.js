exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  const { ChatServiceSid, ConversationSid, disabled } = event;
  if (!ChatServiceSid || !ConversationSid) {
    return callback(new Error('Missing conversation information'));
  }
  const attributes = await client.conversations.v1
    .services(ChatServiceSid)
    .conversations(ConversationSid)
    .fetch()
    .then(conv => conv.attributes ? JSON.parse(conv.attributes) : {})
    .catch(() => ({}));
  const updated = { ...attributes, assistantDisabled: disabled === 'true' };
  await client.conversations.v1
    .services(ChatServiceSid)
    .conversations(ConversationSid)
    .update({ attributes: JSON.stringify(updated) });
  callback(null, { assistantDisabled: updated.assistantDisabled });
};
