const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('goodbye-setup')
    .setDescription('Set the goodbye message'),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Admins only.', flags: 64 });
    }

    const modal = new ModalBuilder()
      .setCustomId('goodbye_setup')
      .setTitle('Goodbye Message Setup');

    const textArea = new TextInputBuilder()
      .setCustomId('goodbye_message')
      .setLabel('Goodbye Message')
      .setStyle(2)
      .setPlaceholder('Available: [user], [userName], [memberCount], [server], [channel:name] — newlines supported')
      .setRequired(true)
      .setMaxLength(4000);

    modal.addComponents(new ActionRowBuilder().addComponents(textArea));
    await interaction.showModal(modal);
  }
};
