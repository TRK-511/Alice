const { SlashCommandBuilder, ContainerBuilder, MessageFlags } = require('discord.js');
const storage = require('../../systems/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Welcome system settings')
    .addChannelOption(o => o.setName('channel').setDescription('Channel for welcome messages').setRequired(false)),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('Administrator')) return interaction.reply({ content: '❌ Admins only.' });

    const channel = interaction.options.getChannel('channel');
    const cfg = storage.getConfig();

    if (!channel) {
      const container = new ContainerBuilder()
        .addTextDisplayComponents(t => t.setContent('## 📋 Welcome System'))
        .addTextDisplayComponents(t => t.setContent(
          `**Channel:** ${cfg.welcomeChannelId ? `<#${cfg.welcomeChannelId}>` : 'Not set'}\n` +
          `**Message:** ${cfg.welcomeMessage || 'Not set'}`
        ));
      return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    storage.setConfig('welcomeChannelId', channel.id);
    const container = new ContainerBuilder()
      .addTextDisplayComponents(t => t.setContent('## ✅ Welcome Channel Set'))
      .addTextDisplayComponents(t => t.setContent(`Welcome messages will be sent to ${channel}.`));
    return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
};
