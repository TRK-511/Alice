const { SlashCommandBuilder, ContainerBuilder, SectionBuilder, ThumbnailBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const storage = require('../../systems/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get info about a user')
    .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.options.getMember('user') || interaction.member;
    const warns = storage.get('warns') || {};
    const userWarns = warns[user.id] || [];

    const modMember = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    const isMod = modMember?.permissions.has('ModerateMembers');

    const avatarUrl = user.displayAvatarURL({ size: 4096 });
    const roles = member?.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r).join(', ') || 'None';

    const section = new SectionBuilder()
      .addTextDisplayComponents(t => t.setContent(`## 👤 ${user.tag}`))
      .addTextDisplayComponents(t => t.setContent(
        `**ID:** ${user.id}\n` +
        `**Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>\n` +
        `**Joined:** ${member?.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown'}\n` +
        `**Roles:** ${roles}`
      ))
      .addTextDisplayComponents(t => t.setContent(
        `⚠️ **Warnings:** ${userWarns.length}  🔨 **Kicks:** ${userWarns._kicks || 0}  ⏸️ **Timeouts:** ${userWarns._timeouts || 0}  🚫 **Bans:** ${userWarns._bans || 0}`
      ))
      .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl));

    const container = new ContainerBuilder()
      .addSectionComponents(() => section);

    if (isMod) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`mod_kick_${user.id}`).setLabel('🔨 Kick').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`mod_ban_${user.id}`).setLabel('🚫 Ban').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`mod_timeout_${user.id}`).setLabel('⏸️ Timeout').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`mod_warn_${user.id}`).setLabel('⚠️ Warn').setStyle(ButtonStyle.Secondary)
      );
      container.addActionRowComponents(() => row);
    }

    await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
};
