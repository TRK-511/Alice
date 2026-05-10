const { SlashCommandBuilder, ContainerBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Get info about this server'),
  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();
    const members = guild.members.cache;
    const online = members.filter(m => m.presence && ['online', 'idle', 'dnd'].includes(m.presence.status)).size;
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const iconUrl = guild.iconURL({ size: 256 });

    const headerSection = new SectionBuilder()
      .addTextDisplayComponents(t => t.setContent(`### ${guild.name}`))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(iconUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'));

    const container = new ContainerBuilder()
      .addSectionComponents(() => headerSection)
      .addSeparatorComponents(s => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(t => t.setContent(
        `🪪 **Server ID:** ${guild.id}\n` +
        `📅 **Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>\n` +
        `👑 **Owner:** @${owner.user.username}`
      ))
      .addSeparatorComponents(s => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(t => t.setContent(
        `👥 **Members (${guild.memberCount})** — ${online} Online\n` +
        `💬 **Channels (${guild.channels.cache.size})** — ${textChannels} Text | ${voiceChannels} Voice\n` +
        `✨ **Boosts:** ${guild.premiumSubscriptionCount || 0} | **Verification:** ${guild.verificationLevel}`
      ))
      .addSeparatorComponents(s => s.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(t => t.setContent(
        `🔒 **Roles (${guild.roles.cache.size - 1})** — use \`/role\` to see all\n` +
        `😄 **Emojis:** ${guild.emojis.cache.size} | **Stickers:** ${guild.stickers.cache.size}`
      ));

    await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
};