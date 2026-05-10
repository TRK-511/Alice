const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome-setup')
    .setDescription('Set the welcome message'),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Admins only.', flags: 64 });
    }

    const modal = new ModalBuilder()
      .setCustomId('welcome_setup')
      .setTitle('Welcome Message Setup');

    const textArea = new TextInputBuilder()
      .setCustomId('welcome_message')
      .setLabel('Welcome Message')
      .setStyle(2)
      .setPlaceholder('Available: [user], [userName], [memberCount], [server], [channel:name] — newlines supported')
      .setRequired(true)
      .setMaxLength(4000);;

    modal.addComponents(new ActionRowBuilder().addComponents(textArea));
    await interaction.showModal(modal);
  }
};
