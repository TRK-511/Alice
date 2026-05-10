const { SlashCommandBuilder, EmbedBuilder, ContainerBuilder, MessageFlags } = require('discord.js');
const storage = require('../../systems/storage');

function cv2(accentColor, title, body) {
  return new ContainerBuilder()
    .addTextDisplayComponents(t => t.setContent(`## ${title}`))
    .addTextDisplayComponents(t => t.setContent(body));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(opt => opt.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for ban').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ components: [cv2(0xe74c3c, '❌ User Not Found', 'Could not find that user.')], flags: MessageFlags.IsComponentsV2 });

    const modMember = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!modMember?.permissions.has('BanMembers')) return interaction.reply({ components: [cv2(0xe74c3c, '❌ Permission Denied', 'You need Ban Members permission.')], flags: MessageFlags.IsComponentsV2 });

    const dmEmbed = new EmbedBuilder()
      .setTitle('⚠️ ACTION TAKEN: BAN')
      .setDescription(
        "```diff\n- YOU HAVE BEEN BANNED\n```\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        `**Server:** ${interaction.guild.name}\n` +
        `**Reason:** ${reason}\n` +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "This action is permanent and cannot be undone."
      )
      .setColor(0xe74c3c);

    await user.send({ embeds: [dmEmbed] }).catch(async (err) => {
      const logChannelId = storage.getConfig('logChannelId');
      if (logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) await logChannel.send({ content: `⚠️ DM failed for ${user.tag} (${user.id}) — reason: ${err.message}` }).catch(() => {});
      }
    });

    await member.ban({ reason });

    await interaction.reply({
      components: [cv2(0xe74c3c, '🔨 User Banned', `${user} has been banned.\n**Reason:** ${reason}`)],
      allowedMentions: { users: [] },
      flags: MessageFlags.IsComponentsV2
    });

    const logChannelId = storage.getConfig('logChannelId');
    if (logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) await logChannel.send({ components: [cv2(0xe74c3c, 'Action: Ban', `**User:** ${user.tag} (${user.id})\n**Moderator:** ${interaction.user.tag}\n**Reason:** ${reason}`)], flags: MessageFlags.IsComponentsV2 });
    }
  }
};
