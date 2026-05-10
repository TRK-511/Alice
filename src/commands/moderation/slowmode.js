const { SlashCommandBuilder, ContainerBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode')
    .addIntegerOption(opt => opt.setName('seconds').setDescription('Slowmode in seconds (0 = off)').setRequired(true)),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('ManageChannels')) return interaction.reply({ content: '❌ Manage Channels permission required.' });

    const seconds = interaction.options.getInteger('seconds');
    await interaction.channel.setRateLimitPerUser(seconds);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(t => t.setContent('## ⏱️ Slowmode Updated'))
      .addTextDisplayComponents(t => t.setContent(`Slowmode set to **${seconds} second(s)**.`));
    await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
};
