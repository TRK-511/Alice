const { EmbedBuilder } = require('discord.js');
const storage = require('../systems/storage');

module.exports = async function (message) {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;
    const logChannelId = storage.getConfig('logChannelId');
    if (!logChannelId) return;
    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Message Deleted')
      .setDescription(
        `**User:** ${message.author}\n` +
        `**Channel:** ${message.channel}\n` +
        `**Content:** ${message.content.substring(0, 1000) || '_No text content_'}\n` +
        `**Attachments:** ${message.attachments.size > 0 ? 'Yes' : 'No'}`
      )
      .setColor(0xe74c3c)
      .setThumbnail(message.author.displayAvatarURL({ size: 256 }));

    logChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Message delete error:', err.message);
  }
};
