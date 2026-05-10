const { ContainerBuilder, SectionBuilder, ThumbnailBuilder, MessageFlags } = require('discord.js');
const storage = require('../systems/storage');

function stripAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

module.exports = async function (member) {
  try {
    const channelId = storage.getConfig('welcomeChannelId');
    const messageTemplate = storage.getConfig('welcomeMessage');
    if (!channelId || !messageTemplate) return;
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;

    let message = messageTemplate
      .replace(/{user}/g, member.toString())
      .replace(/{userName}/g, member.user.username)
      .replace(/{count}/g, String(member.guild.memberCount))
      .replace(/{server}/g, member.guild.name)
      .replace(/\[user\]/g, member.toString())
      .replace(/\[userName\]/g, member.user.username)
      .replace(/\[memberCount\]/gi, String(member.guild.memberCount))
      .replace(/\[server\]/g, member.guild.name);

    const channelMentions = message.match(/\[channel:([^\]]+)\]/gi) || [];
    for (const match of channelMentions) {
      const name = match.replace(/\[channel:/i, '').replace(/\]/i, '').trim();
      const searchLower = name.toLowerCase();
      const ch = member.guild.channels.cache.find(c => 
        c.name.toLowerCase() === searchLower ||
        c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === searchLower.replace(/[^a-z0-9]/g, '')
      );
      message = message.replace(match, ch ? ch.toString() : `#${name}`);
    }

    const avatarUrl = member.user.displayAvatarURL({ size: 256 });

    const section = new SectionBuilder()
      .addTextDisplayComponents(t => t.setContent(`## 👋 Hello, ${member.toString()}!`))
      .addTextDisplayComponents(t => t.setContent(message))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl));

    const container = new ContainerBuilder()
      .addSectionComponents(() => section);

    console.log(`[WELCOME] Sending to #${channel.name}`);
    channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 })
      .catch(err => console.error('[WELCOME] Send error:', err.message));
  } catch (err) {
    console.error('Welcome event error:', err.message, err.stack);
  }
};