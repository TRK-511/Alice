const { SlashCommandBuilder, EmbedBuilder, ContainerBuilder, MessageFlags } = require('discord.js');
const storage = require('../../systems/storage');

function cv2(accentColor, title, body) {
  return new ContainerBuilder()
    .addTextDisplayComponents(t => t.setContent(`## ${title}`))
    .addTextDisplayComponents(t => t.setContent(body));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a user')
    .addUserOption(opt => opt.setName('user').setDescription('User to timeout').setRequired(true))
    .addIntegerOption(opt => opt.setName('minutes').setDescription('Duration in minutes').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ components: [cv2(0xe74c3c, '❌ User Not Found', 'Could not find that user.')], flags: MessageFlags.IsComponentsV2 });

    const modMember = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!modMember?.permissions.has('ModerateMembers')) return interaction.reply({ components: [cv2(0xe74c3c, '❌ Permission Denied', 'You need Moderate Members permission.')], flags: MessageFlags.IsComponentsV2 });

    const duration = minutes * 60 * 1000;
    await member.timeout(duration, reason);

    const dmEmbed = new EmbedBuilder()
      .setTitle('⏸️ ACTION TAKEN: TIMEOUT')
      .setDescription(
        "```yaml\n--- TIMEOUT APPLIED ---\n```\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        `**Server:** ${interaction.guild.name}\n` +
        `**Duration:** ${minutes} minute(s)\n` +
        `**Reason:** ${reason}\n` +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "You cannot send messages until the timeout expires."
      )
      .setColor(0xf39c12);

    await user.send({ embeds: [dmEmbed] }).catch(async (err) => {
      const logChannelId = storage.getConfig('logChannelId');
      if (logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) await logChannel.send({ content: `⚠️ DM failed for ${user.tag} (${user.id}) — reason: ${err.message}` }).catch(() => {});
      }
    });

    await interaction.reply({
      components: [cv2(0xf39c12, '⏸️ User Timed Out', `${user} has been timed out.\n**Duration:** ${minutes} minute(s)\n**Reason:** ${reason}`)],
      allowedMentions: { users: [] },
      flags: MessageFlags.IsComponentsV2
    });

    const logChannelId = storage.getConfig('logChannelId');
    if (logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) await logChannel.send({ components: [cv2(0xf39c12, 'Action: Timeout', `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Duration:** ${minutes}m\n**Reason:** ${reason}`)], flags: MessageFlags.IsComponentsV2 });
    }
  }
};
