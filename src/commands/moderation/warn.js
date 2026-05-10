const { SlashCommandBuilder, EmbedBuilder, ContainerBuilder, MessageFlags } = require('discord.js');
const storage = require('../../systems/storage');

function cv2(accentColor, title, body) {
  return new ContainerBuilder()
    .addTextDisplayComponents(t => t.setContent(`## ${title}`))
    .addTextDisplayComponents(t => t.setContent(body));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(opt => opt.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for warning').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const modMember = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!modMember?.permissions.has('ModerateMembers')) return interaction.reply({ components: [cv2(0xe74c3c, '❌ Permission Denied', 'You need Moderate Members permission.')], flags: MessageFlags.IsComponentsV2 });

    const warns = storage.get('warns') || {};
    if (!warns[user.id]) warns[user.id] = [];
    warns[user.id].push({ reason, moderator: interaction.user.tag, timestamp: Date.now() });
    storage.set('warns', warns);

    const dmEmbed = new EmbedBuilder()
      .setTitle('⚠️ WARNING ISSUED')
      .setDescription(
        "```fix\nWARNING: BEHAVIOR VIOLATION\n```\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        `**Server:** ${interaction.guild.name}\n` +
        `**Reason:** ${reason}\n` +
        `**Warning #:** ${warns[user.id].length}\n` +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "Further violations will result in escalated action."
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
      components: [cv2(0xf39c12, '⚠️ Warning Issued', `${user} has been warned.\n**Reason:** ${reason}\n**Total warnings:** ${warns[user.id].length}`)],
      allowedMentions: { users: [] },
      flags: MessageFlags.IsComponentsV2
    });

    const logChannelId = storage.getConfig('logChannelId');
    if (logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) await logChannel.send({ components: [cv2(0xf39c12, 'Action: Warn', `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`)], flags: MessageFlags.IsComponentsV2 });
    }
  }
};
