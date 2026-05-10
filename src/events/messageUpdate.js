const { EmbedBuilder } = require('discord.js');
const storage = require('../systems/storage');

module.exports = async function (message, newMessage) {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;
    const logChannelId = storage.getConfig('logChannelId');
    if (!logChannelId) return;
    const logChannel = message.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle('📝 Message Edited')
      .setDescription(
        `**User:** ${message.author}\n` +
        `**Channel:** ${message.channel}\n\n` +
        `**Before:** ${message.content.substring(0, 1000)}\n\n` +
        `**After:** ${newMessage.content.substring(0, 1000)}`
      )
      .setColor(0xf39c12)
      .setThumbnail(message.author.displayAvatarURL({ size: 256 }));

    logChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Message update error:', err.message);
  }
};
