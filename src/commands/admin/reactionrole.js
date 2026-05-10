const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const storage = require('../../systems/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Create a reaction role panel')
    .addStringOption(opt => opt.setName('message').setDescription('Panel message text').setRequired(true))
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to send panel').setRequired(true)),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ Admins only.' });
    }

    const msg = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setTitle('🎭 Reaction Roles')
      .setDescription(msg)
      .setColor(0x9b59b6);

    await interaction.reply({ content: `Panel will be created in ${channel}. Continue in DMs or reply with role details in format:\n\`emoji | role_id\`\nOne per line, max 10.` });

    const replyMsg = await interaction.fetchReply();
    interaction.channel.send({ content: 'Send your reaction roles now (format: `emoji | roleId`). Send `done` when finished.' }).then(async (collectorMsg) => {
      const collector = interaction.channel.createMessageCollector({ filter: m => m.author.id === interaction.user.id, time: 60000, max: 10 });
      const roleData = [];
      collector.on('collect', async (m) => {
        if (m.content.toLowerCase() === 'done') {
          collector.stop();
          return;
        }
        const [emoji, roleId] = m.content.split('|').map(s => s.trim());
        if (!emoji || !roleId) {
          m.reply('Invalid format. Use: `emoji | roleId`').then(msg => setTimeout(() => { m.delete(); msg.delete(); }, 3000));
          return;
        }
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
          m.reply('Role not found.').then(msg => setTimeout(() => { m.delete(); msg.delete(); }, 3000));
          return;
        }
        roleData.push({ emoji, roleId, label: role.name });

        const options = roleData.map(r => ({ label: r.label, value: r.roleId, emoji: r.emoji }));
        const row = new ActionRowBuilder().addComponents(
          new SelectMenuBuilder()
            .setCustomId('rr_panel')
            .setPlaceholder('Select your role...')
            .addOptions(options.slice(0, 25))
        );

        const panelMsg = await channel.send({ embeds: [embed], components: roleData.length > 0 ? [row] : [] }).catch(() => null);
        if (panelMsg) {
          storage.set('rr_panel_' + panelMsg.id, roleData);
        }

        m.delete();
      });
      collector.on('end', () => {
        collectorMsg.delete();
      });
    });
  }
};
