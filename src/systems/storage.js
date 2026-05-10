const fs = require('fs');
const path = require('path');

const storageFile = path.join(__dirname, '../../data/storage.json');

function load() {
  if (!fs.existsSync(storageFile)) {
    fs.writeFileSync(storageFile, JSON.stringify({ library: [], verified: [], warns: {}, xp: {}, reactionroles: [], config: { welcomeChannelId: '', goodbyeChannelId: '', welcomeMessage: 'Welcome to {server}, {user}\nYou are member #{count}.\nRead the rules, explore the mod downloads, and enjoy your stay!', goodbyeMessage: 'Goodbye {user}.', logChannelId: '', verifiedRoleId: '', embedColor: 15548997, xpEnabled: false, xpPerMessage: 3, xpCooldown: 60, autoMod: { spam: false, links: false } } }, null, 2));
  }
  return JSON.parse(fs.readFileSync(storageFile, 'utf8'));
}

function save(data) {
  fs.writeFileSync(storageFile, JSON.stringify(data, null, 2));
}

const storage = {
  get: (key) => {
    const data = load();
    return key ? data[key] : data;
  },
  set: (key, value) => {
    const data = load();
    data[key] = value;
    save(data);
  },
  push: (key, item) => {
    const data = load();
    if (!data[key]) data[key] = [];
    if (Array.isArray(data[key])) data[key].push(item);
    save(data);
  },
  pull: (key, filterFn) => {
    const data = load();
    if (data[key]) data[key] = data[key].filter(filterFn);
    save(data);
  },
  getConfig: (key) => {
    const data = load();
    if (!data.config) return key ? undefined : {};
    if (key) return JSON.parse(JSON.stringify(data.config[key]));
    return JSON.parse(JSON.stringify(data.config));
  },
  setConfig: (key, value) => {
    const data = load();
    if (!data.config) data.config = {};
    if (typeof key === 'object') {
      data.config = JSON.parse(JSON.stringify(key));
    } else {
      data.config[key] = JSON.parse(JSON.stringify(value));
    }
    save(data);
  },
  saveXp: (userId, xp) => {
    const data = load();
    if (!data.xp) data.xp = {};
    data.xp[userId] = { xp: xp.xp || xp, messages: xp.messages || 0 };
    save(data);
  },
  getXp: (userId) => {
    const data = load();
    const entry = data.xp?.[userId];
    if (!entry) return { xp: 0, messages: 0 };
    return { xp: entry.xp || 0, messages: entry.messages || 0 };
  },
  saveReactionRole: (roleId, emoji, channelId, msgId) => {
    const data = load();
    if (!data.reactionroles) data.reactionroles = [];
    data.reactionroles.push({ roleId, emoji, channelId, messageId: msgId });
    save(data);
  },
  getReactionRoles: () => {
    const data = load();
    return data.reactionroles || [];
  },
  removeReactionRole: (roleId, emoji) => {
    const data = load();
    if (data.reactionroles) {
      data.reactionroles = data.reactionroles.filter(r => !(r.roleId === roleId && r.emoji === emoji));
      save(data);
    }
  }
};

module.exports = storage;
