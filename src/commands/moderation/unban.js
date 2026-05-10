const { SlashCommandBuilder, ContainerBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('View and unban users'),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('BanMembers')) return interaction.reply({ content: '❌ Ban Members permission required.' });

    const bans = await interaction.guild.bans.fetch();
    if (bans.size === 0) return interaction.reply({ content: 'No banned users.' });

    const row = new ActionRowBuilder();
    bans.first(25).forEach(ban => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`unban_${ban.user.id}`)
          .setLabel(ban.user.tag.substring(0, 20))
          .setStyle(ButtonStyle.Secondary)
      );
    });

    const container = new ContainerBuilder()
      .addTextDisplayComponents(t => t.setContent('## 🔨 Banned Users'))
      .addTextDisplayComponents(t => t.setContent(`**Total:** ${bans.size} banned user(s)\nClick a button to unban.`))
      .addActionRowComponents(() => row);

    await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
};
