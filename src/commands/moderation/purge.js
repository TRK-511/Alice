const { SlashCommandBuilder, ContainerBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const modMember = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

    if (!modMember?.permissions.has('ManageMessages')) {
      const c = new ContainerBuilder()
        .addTextDisplayComponents(t => t.setContent('## ❌ Permission Denied'))
        .addTextDisplayComponents(t => t.setContent('You need Manage Messages permission.'));
      return interaction.reply({ components: [c], flags: MessageFlags.IsComponentsV2 | 64 });
    }
    if (amount < 1 || amount > 100) {
      const c = new ContainerBuilder()
        .addTextDisplayComponents(t => t.setContent('## ❌ Invalid Amount'))
        .addTextDisplayComponents(t => t.setContent('Delete between 1 and 100 messages.'));
      return interaction.reply({ components: [c], flags: MessageFlags.IsComponentsV2 | 64 });
    }

    const messages = await interaction.channel.bulkDelete(amount, true);
    const c = new ContainerBuilder()
      .addTextDisplayComponents(t => t.setContent('## 🗑️ Messages Purged'))
      .addTextDisplayComponents(t => t.setContent(`Deleted **${messages.size}** message(s).`));
    await interaction.reply({ components: [c], flags: MessageFlags.IsComponentsV2 | 64 });
  }
};
