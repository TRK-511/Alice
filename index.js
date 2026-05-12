const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const fs = require('fs');

const express = require('express');

console.log('TOKEN value:', process.env.TOKEN ? 'exists' : 'undefined');
console.log('TOKEN length:', process.env.TOKEN ? process.env.TOKEN.length : 0);

const app = express();

app.get('/', (req, res) => res.send('Bot is running'));
app.get('/health', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP server on port ${PORT}`));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageTyping
  ]
});

client.on('debug', (msg) => {
  if (msg.includes('WebSocket') || msg.includes('gateway')) {
    console.log('DEBUG:', msg);
  }
});
client.on('error', (err) => console.log('CLIENT ERROR:', err.message));
client.on('warn', (msg) => console.log('WARN:', msg));
client.on('disconnect', () => console.log('Client disconnected'));
client.on('reconnecting', () => console.log('Client reconnecting'));
client.on('resume', () => console.log('Client resumed'));

client.commands = new Map();
client.modals = new Map();
client.buttons = new Map();
client.selectMenus = new Map();

function loadCommands(dir) {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) return;
  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const cmd = require(path.join(fullPath, file));
    if (cmd.data && cmd.data.name) client.commands.set(cmd.data.name, cmd);
    if (cmd.modalData) client.modals.set(cmd.modalData.customId, cmd);
    if (cmd.buttonData) client.buttons.set(cmd.buttonData.customId, cmd);
    if (cmd.selectMenuData) client.selectMenus.set(cmd.selectMenuData.customId, cmd);
  }
}

function loadEvents(dir) {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) return;
  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const event = require(path.join(fullPath, file));
    const eventName = file.replace('.js', '');
    if (eventName === 'guildMemberAdd') {
      client.on('guildMemberAdd', event);
    } else if (eventName === 'guildMemberRemove') {
      client.on('guildMemberRemove', event);
    } else if (eventName === 'messageCreate') {
      client.on('messageCreate', event);
    } else if (eventName === 'messageUpdate') {
      client.on('messageUpdate', event);
    } else if (eventName === 'messageDelete') {
      client.on('messageDelete', event);
    } else if (eventName === 'roleChange') {
      client.on('guildMemberUpdate', event);
    }
  }
}

loadCommands('./src/commands/utility');
loadCommands('./src/commands/moderation');
loadCommands('./src/commands/admin');
loadEvents('./src/events');

client.once('ready', () => {
  console.log(`Alice is online as ${client.user.tag}`);
  console.log(`Loaded ${client.commands.size} commands`);
});

client.once('clientReady', () => {
  console.log(`Alice is online as ${client.user.tag} (clientReady)`);
  console.log(`Loaded ${client.commands.size} commands`);
});

client.on('interactionCreate', require('./src/events/interactionCreate'));

const loginPromise = client.login(process.env.TOKEN);

setTimeout(() => {
  console.log('Login still pending after 30 seconds...');
}, 30000);

loginPromise
  .then(() => console.log('Login successful'))
  .catch((err) => console.log('Login failed:', err.message));
