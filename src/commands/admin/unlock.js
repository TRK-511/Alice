const { SlashCommandBuilder, ContainerBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock the current channel'),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('ManageChannels')) return interaction.reply({ content: '❌ Manage Channels permission required.' });

    const ch = interaction.channel;
    await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });

    const container = new ContainerBuilder()
      .addTextDisplayComponents(t => t.setContent('## 🔓 Channel Unlocked'))
      .addTextDisplayComponents(t => t.setContent(`<#${ch.id}> has been unlocked.`));
    return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
};
