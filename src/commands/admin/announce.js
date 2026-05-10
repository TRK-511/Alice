const { SlashCommandBuilder, ContainerBuilder, MessageFlags } = require('discord.js');

const ANNOUNCE_CHANNEL_ID = '1469899165608841287';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement')
    .addStringOption(opt => opt.setName('title').setDescription('Announcement title').setRequired(true))
    .addStringOption(opt => opt.setName('message').setDescription('Announcement message').setRequired(true))
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to send to').setRequired(false)),
  async execute(interaction) {
    if (!interaction.guild) return interaction.reply({ content: '❌ This command can only be used in a server.' });
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('Administrator')) return interaction.reply({ content: '❌ Admins only.' });

    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const targetChannel = interaction.options.getChannel('channel') || interaction.guild.channels.cache.get(ANNOUNCE_CHANNEL_ID);
    if (!targetChannel) return interaction.reply({ content: '❌ Announcements channel not found.' });

    const container = new ContainerBuilder()
      .addTextDisplayComponents(t => t.setContent(`@everyone`))
      .addTextDisplayComponents(t => t.setContent(`## 📢 ${title}`))
      .addTextDisplayComponents(t => t.setContent(message))
      .addTextDisplayComponents(t => t.setContent(`-# ${new Date().toUTCString()}`));

    await targetChannel.send({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: ['everyone'] } });
    await interaction.reply({ content: `✅ Announcement sent to ${targetChannel}.` });
  }
};