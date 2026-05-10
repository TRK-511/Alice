const { SlashCommandBuilder, ContainerBuilder, MessageFlags } = require('discord.js');
const storage = require('../../systems/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription('Logging system settings')
    .addChannelOption(o => o.setName('channel').setDescription('Channel for logs').setRequired(false)),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('Administrator')) return interaction.reply({ content: '❌ Admins only.' });

    const channel = interaction.options.getChannel('channel');
    const cfg = storage.getConfig();

    if (!channel) {
      const container = new ContainerBuilder()
        .addTextDisplayComponents(t => t.setContent('## 📋 Logging System'))
        .addTextDisplayComponents(t => t.setContent(
          `**Channel:** ${cfg.logChannelId ? `<#${cfg.logChannelId}>` : 'Not set'}`
        ));
      return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    storage.setConfig('logChannelId', channel.id);
    const container = new ContainerBuilder()
      .addTextDisplayComponents(t => t.setContent('## ✅ Logging Channel Set'))
      .addTextDisplayComponents(t => t.setContent(`Log messages will be sent to ${channel}.`));
    return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
};
