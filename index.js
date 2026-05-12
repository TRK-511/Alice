const { Client, GatewayIntentBits } = require(‘discord.js’);
const path = require(‘path’);
const fs = require(‘fs’);
const express = require(‘express’);

// ── Startup ──────────────────────────────────────────────────────────────────
console.log(’[BOOT] index.js started’);
console.log(’[BOOT] Node version:’, process.version);
console.log(’[BOOT] TOKEN:’, process.env.TOKEN ? `exists (length ${process.env.TOKEN.length})` : ‘MISSING’);
console.log(’[BOOT] CLIENT_ID:’, process.env.CLIENT_ID ? `exists` : ‘not set’);
console.log(’[BOOT] PORT:’, process.env.PORT || 3000);

// ── HTTP server (keeps Render alive) ─────────────────────────────────────────
const app = express();
app.get(’/’, (req, res) => res.send(‘Alice is running’));
app.get(’/health’, (req, res) => res.send(‘OK’));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[HTTP] Server listening on port ${PORT}`));

// ── Discord client ────────────────────────────────────────────────────────────
console.log(’[CLIENT] Creating Discord client…’);
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
console.log(’[CLIENT] Client created’);

// ── Gateway debug events ──────────────────────────────────────────────────────
client.on(‘debug’, (msg) => {
if (msg.includes(‘Identified’) || msg.includes(‘READY’) || msg.includes(‘token’) ||
msg.includes(‘gateway’) || msg.includes(‘WebSocket’) || msg.includes(‘401’) ||
msg.includes(‘4004’) || msg.includes(‘Invalid’)) {
console.log(’[GATEWAY]’, msg);
}
});
client.on(‘error’, (err) => console.error(’[CLIENT ERROR]’, err.message));
client.on(‘warn’, (msg) => console.warn(’[WARN]’, msg));
client.on(‘shardError’, (err, shardId) => console.error(`[SHARD ${shardId} ERROR]`, err.message));
client.on(‘shardReady’, (id) => console.log(`[SHARD ${id}] Ready`));
client.on(‘shardDisconnect’, (event, id) => console.log(`[SHARD ${id}] Disconnected — code ${event.code}`));
client.on(‘shardReconnecting’, (id) => console.log(`[SHARD ${id}] Reconnecting...`));
client.on(‘shardResume’, (id, replayed) => console.log(`[SHARD ${id}] Resumed — replayed ${replayed} events`));
client.on(‘invalidated’, () => console.error(’[SESSION] Session invalidated — token may be revoked’));
client.on(‘rateLimit’, (info) => console.warn(’[RATE LIMIT]’, info.route, ‘— timeout’, info.timeout));

// ── Collections ───────────────────────────────────────────────────────────────
client.commands = new Map();
client.modals = new Map();
client.buttons = new Map();
client.selectMenus = new Map();

// ── Load commands ─────────────────────────────────────────────────────────────
function loadCommands(dir) {
const fullPath = path.join(__dirname, dir);
if (!fs.existsSync(fullPath)) {
console.warn(`[COMMANDS] Directory not found: ${fullPath}`);
return;
}
const files = fs.readdirSync(fullPath).filter(f => f.endsWith(’.js’));
console.log(`[COMMANDS] Loading ${files.length} file(s) from ${dir}`);
for (const file of files) {
try {
const cmd = require(path.join(fullPath, file));
if (cmd.data && cmd.data.name) {
client.commands.set(cmd.data.name, cmd);
console.log(`[COMMANDS]   ✓ ${cmd.data.name}`);
}
if (cmd.modalData) client.modals.set(cmd.modalData.customId, cmd);
if (cmd.buttonData) client.buttons.set(cmd.buttonData.customId, cmd);
if (cmd.selectMenuData) client.selectMenus.set(cmd.selectMenuData.customId, cmd);
} catch (err) {
console.error(`[COMMANDS]   ✗ Failed to load ${file}:`, err.message);
}
}
}

// ── Load events ───────────────────────────────────────────────────────────────
function loadEvents(dir) {
const fullPath = path.join(__dirname, dir);
if (!fs.existsSync(fullPath)) {
console.warn(`[EVENTS] Directory not found: ${fullPath}`);
return;
}
const files = fs.readdirSync(fullPath).filter(f => f.endsWith(’.js’));
console.log(`[EVENTS] Loading ${files.length} file(s) from ${dir}`);
const map = {
guildMemberAdd: ‘guildMemberAdd’,
guildMemberRemove: ‘guildMemberRemove’,
messageCreate: ‘messageCreate’,
messageUpdate: ‘messageUpdate’,
messageDelete: ‘messageDelete’,
roleChange: ‘guildMemberUpdate’
};
for (const file of files) {
try {
const event = require(path.join(fullPath, file));
const name = file.replace(’.js’, ‘’);
const discordEvent = map[name];
if (discordEvent) {
client.on(discordEvent, event);
console.log(`[EVENTS]   ✓ ${name} → ${discordEvent}`);
} else {
console.log(`[EVENTS]   ~ ${name} (no mapping, skipped)`);
}
} catch (err) {
console.error(`[EVENTS]   ✗ Failed to load ${file}:`, err.message);
}
}
}

console.log(’[BOOT] Loading commands…’);
loadCommands(’./src/commands/utility’);
loadCommands(’./src/commands/moderation’);
loadCommands(’./src/commands/admin’);
console.log(`[BOOT] Total commands loaded: ${client.commands.size}`);

console.log(’[BOOT] Loading events…’);
loadEvents(’./src/events’);

// ── Interaction handler ───────────────────────────────────────────────────────
console.log(’[BOOT] Registering interactionCreate handler…’);
client.on(‘interactionCreate’, (interaction) => {
console.log(`[INTERACTION] type=${interaction.type} user=${interaction.user?.tag} guild=${interaction.guildId}`);
require(’./src/events/interactionCreate’)(interaction);
});

// ── Ready ─────────────────────────────────────────────────────────────────────
client.once(‘clientReady’, (c) => {
console.log(`[READY] Logged in as ${c.user.tag} (${c.user.id})`);
console.log(`[READY] Serving ${c.guilds.cache.size} guild(s)`);
console.log(`[READY] Commands registered: ${client.commands.size}`);
c.guilds.cache.forEach(g => console.log(`[READY]   guild: ${g.name} (${g.id})`));
});

// ── Login ─────────────────────────────────────────────────────────────────────
console.log(’[LOGIN] Attempting login…’);

const loginTimeout = setTimeout(() => {
console.error(’[LOGIN] Still pending after 30s — possible causes: invalid token, privileged intents not enabled in Dev Portal, or network block’);
}, 30000);

client.login(process.env.TOKEN)
.then(() => {
clearTimeout(loginTimeout);
console.log(’[LOGIN] Login call resolved successfully’);
})
.catch((err) => {
clearTimeout(loginTimeout);
console.error(’[LOGIN] Login failed:’, err.message);
console.error(’[LOGIN] Code:’, err.code);
process.exit(1);
});
