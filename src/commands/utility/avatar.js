const {
  SlashCommandBuilder,
  TextDisplayBuilder,
  MediaGalleryBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ContainerBuilder,
  MessageFlags
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Get a user's avatar")
    .addUserOption(opt => opt.setName('user').setDescription('User to get avatar for').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ size: 4096 });

    const downloadButton = new ButtonBuilder()
      .setLabel('Download Avatar')
      .setStyle(ButtonStyle.Link)
      .setURL(avatarUrl);

    const row = new ActionRowBuilder().addComponents(downloadButton);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(t => t.setContent(`## @${user.username}'s avatar`))
      .addMediaGalleryComponents(g => g.addItems(i => i.setURL(avatarUrl)))
      .addActionRowComponents(() => row);

    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};