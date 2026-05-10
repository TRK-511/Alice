const { EmbedBuilder } = require('discord.js');
const storage = require('../systems/storage');

module.exports = async function (oldMember, newMember) {
  try {
    if (oldMember.user.bot || newMember.user.bot) return;
    const logChannelId = storage.getConfig('logChannelId');
    if (!logChannelId) return;
    const logChannel = newMember.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;
    const added = newRoles.filter(r => !oldRoles.has(r.id));
    const removed = oldRoles.filter(r => !newRoles.has(r.id));

    if (added.size === 0 && removed.size === 0) return;

    let description = `**User:** ${newMember.user.tag}\n`;
    if (added.size > 0) description += `**Added:** ${added.map(r => r).join(', ')}\n`;
    if (removed.size > 0) description += `**Removed:** ${removed.map(r => r).join(', ')}\n`;

    const embed = new EmbedBuilder()
      .setTitle('🎭 Role Changed')
      .setDescription(description)
      .setColor(0x9b59b6)
      .setThumbnail(newMember.user.displayAvatarURL({ size: 256 }));

    logChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Role change error:', err.message);
  }
};
