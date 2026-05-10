const { SlashCommandBuilder, ContainerBuilder, MessageFlags } = require('discord.js');
const storage = require('../../systems/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Auto-mod settings')
    .addStringOption(o => o.setName('action').setDescription('Action to perform').setRequired(false)
      .addChoices({ name: 'View', value: 'view' }, { name: 'Spam', value: 'spam' }, { name: 'Links', value: 'links' })),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('Administrator')) return interaction.reply({ content: '❌ Admins only.' });

    const action = interaction.options.getString('action');
    const autoMod = storage.getConfig('autoMod') || {};

    if (!action || action === 'view') {
      const container = new ContainerBuilder()
        .addTextDisplayComponents(t => t.setContent('## 🛡️ AutoMod System'))
        .addTextDisplayComponents(t => t.setContent(
          `**Spam:** ${autoMod.spam ? '🟢 ON' : '🔴 OFF'}\n` +
          `**Links:** ${autoMod.links ? '🟢 ON' : '🔴 OFF'}`
        ));
      return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    autoMod[action] = !autoMod[action];
    storage.setConfig('autoMod', autoMod);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(t => t.setContent('## ✅ AutoMod Updated'))
      .addTextDisplayComponents(t => t.setContent(
        `**Spam:** ${autoMod.spam ? '🟢 ON' : '🔴 OFF'}\n` +
        `**Links:** ${autoMod.links ? '🟢 ON' : '🔴 OFF'}`
      ));
    return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
};
