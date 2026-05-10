const { EmbedBuilder } = require('discord.js');
const storage = require('../systems/storage');

function dmWarn(server, reason, warnCount, showDuration = false) {
    return new EmbedBuilder()
      .setTitle('⚠️ WARNING ISSUED')
      .setDescription(
        "```fix\nWARNING: BEHAVIOR VIOLATION\n```\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        `**Server:** ${server}\n` +
        `**Reason:** ${reason}\n` +
        `**Warning #:** ${warnCount}\n` +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "Further violations will result in escalated action."
      )
      .setColor(0xf39c12)
      .setFooter({ text: 'This is an automated message from Alice System.' })
      .addFields(showDuration ? [{ name: 'Duration:', value: '5 minute timeout applied.', inline: true }] : []);
}

module.exports = async function (message) {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;

    const logChannelId = storage.getConfig('logChannelId');
    const autoMod = storage.getConfig('autoMod') || {};
    const logChannel = logChannelId ? message.guild.channels.cache.get(logChannelId) : null;

    if (autoMod.spam || autoMod.links) {
      const content = message.content;
      const isLink = /discord\.gg\/[\w-]+/i.test(content);

      if (autoMod.links && isLink) {
        const warns = storage.get('warns') || {};
        if (!warns[message.author.id]) warns[message.author.id] = [];
        warns[message.author.id].push({ reason: 'Discord Invite links are not allowed.', moderator: 'AutoMod', timestamp: Date.now() });
        storage.set('warns', warns);

        await message.delete().catch(() => {});
        message.author.send({ embeds: [dmWarn(message.guild.name, 'Discord Invite links are not allowed.', warns[message.author.id].length, false)] }).catch(() => {});
        message.channel.send({ content: `${message.author}`, embeds: [new EmbedBuilder().setTitle('🛡️ AutoMod Triggered').setDescription(`**User:** ${message.author.tag}\n**Filter:** Link\n**Reason:** Discord Invite links are not allowed.`).setColor(0xf39c12)], allowedMentions: { users: [message.author.id] } }).catch(() => {});
        if (logChannel) logChannel.send({ embeds: [new EmbedBuilder().setTitle('🛡️ AutoMod Triggered').setDescription(`**User:** ${message.author.tag}\n**Channel:** ${message.channel}\n**Reason:** Discord Invite links are not allowed.`).setColor(0xf39c12)] }).catch(() => {});
        return;
      }

      if (autoMod.spam) {
        const spamKey = `spam_${message.author.id}`;
        const spamData = storage.get(spamKey) || { words: {}, msgs: [], time: 0 };

        if (Date.now() - spamData.time > 10000) {
          spamData.words = {};
          spamData.msgs = [];
          spamData.time = Date.now();
        }

        const words = content.split(/[\s\n]+/).map(w => w.toLowerCase()).filter(w => w.length >= 3);
        words.forEach(w => { spamData.words[w] = (spamData.words[w] || 0) + 1; });
        spamData.msgs.push(message.id);
        spamData.time = Date.now();
        storage.set(spamKey, spamData);

        const maxCount = Math.max(...Object.values(spamData.words));
        if (Object.keys(spamData.words).length > 0 && maxCount >= 4 && spamData.msgs.length >= 4) {
          const warns = storage.get('warns') || {};
          if (!warns[message.author.id]) warns[message.author.id] = [];
          warns[message.author.id].push({ reason: 'Repeated spam messages are not allowed.', moderator: 'AutoMod', timestamp: Date.now() });
          storage.set('warns', warns);
          storage.set(spamKey, null);

          const member = await message.guild.members.fetch(message.author.id).catch(() => null);
          if (member) member.timeout(5 * 60 * 1000, 'Repeated spam messages are not allowed.').catch(() => {});

          for (const msgId of spamData.msgs) {
            const ch = message.channel;
            const msg = ch.messages.cache.get(msgId) || await ch.messages.fetch(msgId).catch(() => null);
            if (msg) msg.delete().catch(() => {});
          }

          message.author.send({ embeds: [dmWarn(message.guild.name, 'Repeated spam messages are not allowed.', warns[message.author.id].length, true)] }).catch(() => {});
          message.channel.send({ content: `${message.author}`, embeds: [new EmbedBuilder().setTitle('🛡️ AutoMod Triggered').setDescription(`**User:** ${message.author.tag}\n**Filter:** Spam\n**Reason:** Repeated spam messages are not allowed.\n**Duration:** 5 minute timeout applied.`).setColor(0xf39c12)], allowedMentions: { users: [message.author.id] } }).catch(() => {});
          if (logChannel) logChannel.send({ embeds: [new EmbedBuilder().setTitle('🛡️ AutoMod Triggered').setDescription(`**User:** ${message.author.tag}\n**Channel:** ${message.channel}\n**Reason:** Repeated spam messages are not allowed.\n**Duration:** 5 minute timeout applied.`).setColor(0xf39c12)] }).catch(() => {});
          return;
        }
      }
    }

    if (!storage.getConfig('xpEnabled')) return;
    const lastXp = storage.get(`xp_last_${message.author.id}`) || 0;
    const cooldown = (storage.getConfig('xpCooldown') || 60) * 1000;
    if (Date.now() - lastXp < cooldown) return;

    const userXp = storage.getXp(message.author.id);
    userXp.xp += storage.getConfig('xpPerMessage') || 3;
    userXp.messages += 1;
    const newLevel = Math.max(0, Math.floor(Math.sqrt(userXp.xp / 100)));
    const oldLevel = userXp.level;
    userXp.level = newLevel;
    storage.saveXp(message.author.id, userXp);
    storage.set(`xp_last_${message.author.id}`, Date.now());
  } catch (err) {
    console.error('Message create error:', err.message);
  }
};
