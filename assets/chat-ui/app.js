let client;
let currentConversation;

async function getToken(identity) {
  const resp = await fetch(`/channels/conversations/token?identity=${encodeURIComponent(identity)}`);
  const data = await resp.json();
  return data.token;
}

function renderThread(conversation) {
  const li = document.createElement('li');
  li.textContent = conversation.friendlyName || conversation.sid;
  li.onclick = () => openConversation(conversation);
  li.id = conversation.sid;
  document.getElementById('thread-list').appendChild(li);
}

async function loadConversations() {
  const paginator = await client.getSubscribedConversations();
  paginator.items.forEach(renderThread);
}

function addMessage(msg) {
  const div = document.createElement('div');
  div.className = 'message ' + (msg.author === client.identity ? 'outgoing' : 'incoming');
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = msg.body;
  div.appendChild(bubble);
  document.getElementById('message-list').appendChild(div);
  document.getElementById('message-list').scrollTop = document.getElementById('message-list').scrollHeight;
}

function clearMessages() {
  document.getElementById('message-list').innerHTML = '';
}

async function openConversation(conversation) {
  if (currentConversation) {
    currentConversation.removeAllListeners();
    document.getElementById(currentConversation.sid).classList.remove('active');
  }
  currentConversation = conversation;
  document.getElementById(conversation.sid).classList.add('active');
  document.getElementById('messages').classList.remove('hidden');
  document.getElementById('contact').textContent = conversation.friendlyName || conversation.sid;
  document.getElementById('message-input').value = '';
  clearMessages();
  const msgs = await conversation.getMessages();
  msgs.items.forEach(addMessage);
  const attributes = conversation.attributes || {};
  updateToggleButton(attributes.assistantDisabled);
  conversation.on('messageAdded', addMessage);
  conversation.on('typingStarted', () => document.getElementById('typing').classList.remove('hidden'));
  conversation.on('typingEnded', () => document.getElementById('typing').classList.add('hidden'));
}

async function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('message-input');
  const text = input.value.trim();
  if (!text || !currentConversation) return;
  await currentConversation.sendMessage(text);
  input.value = '';
}

document.getElementById('message-form').addEventListener('submit', sendMessage);

document.getElementById('toggle-assistant').addEventListener('click', async () => {
  if (!currentConversation) return;
  const btn = document.getElementById('toggle-assistant');
  const disabled = btn.dataset.disabled === 'true';
  const form = new URLSearchParams();
  form.append('ConversationSid', currentConversation.sid);
  form.append('ChatServiceSid', currentConversation.serviceSid);
  form.append('disabled', (!disabled).toString());
  await fetch('/channels/conversations/toggleAssistant', { method: 'POST', body: form });
  updateToggleButton(!disabled);
});

function updateToggleButton(disabled) {
  const btn = document.getElementById('toggle-assistant');
  btn.dataset.disabled = disabled;
  btn.textContent = disabled ? 'Enable AI' : 'Disable AI';
}

(async function init() {
  const identity = prompt('Enter your agent identity');
  const token = await getToken(identity);
  client = await Twilio.Conversations.Client.create(token);
  loadConversations();
})();
