const { SlashCommandBuilder, ContainerBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the current channel'),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('ManageChannels')) return interaction.reply({ content: '❌ Manage Channels permission required.' });

    const ch = interaction.channel;
    await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });

    const container = new ContainerBuilder()
      .addTextDisplayComponents(t => t.setContent('## 🔒 Channel Locked'))
      .addTextDisplayComponents(t => t.setContent(`<#${ch.id}> has been locked.`));
    return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
};
