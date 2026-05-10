const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Role management')
    .addStringOption(o => o.setName('action').setDescription('Action to perform').setRequired(false).addChoices(
      { name: 'Add', value: 'add' },
      { name: 'Remove', value: 'remove' },
      { name: 'Add to All', value: 'addtoall' },
      { name: 'Remove from All', value: 'removefromall' }
    ))
    .addUserOption(o => o.setName('user').setDescription('User to manage roles for').setRequired(false))
    .addRoleOption(o => o.setName('role').setDescription('Role to assign or remove').setRequired(false)),
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member?.permissions.has('ManageRoles')) {
      return interaction.reply({ content: '❌ Manage Roles permission required.', flags: 64 });
    }

    const action = interaction.options.getString('action');
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');

    if (!action) {
      const roles = interaction.guild.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position);

      const roleList = roles.map(r => {
        const count = r.members.size;
        return `${r} — **${count}** member${count !== 1 ? 's' : ''}`;
      }).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`📋 Roles (${roles.size})`)
        .setDescription(roleList.length > 4000 ? roleList.substring(0, 4000) + '\n...(truncated)' : roleList)
        .setColor(0x9b59b6);
      return interaction.reply({ embeds: [embed] });
    }

    if (action === 'addtoall' || action === 'removefromall') {
      if (!role) {
        return interaction.reply({ content: '❌ Role is required for add/remove from all.', flags: 64 });
      }
      const massAction = action === 'addtoall' ? 'addtoallrole' : 'removefromallrole';
      await interaction.reply({
        content: `⚠️ Mass action: ${action === 'addtoall' ? 'add' : 'remove'} **${role}** ${action === 'addtoall' ? 'to' : 'from'} **${interaction.guild.memberCount}** members?\n\nClick the button below, then type **CONFIRM** in the modal.`,
        components: [{
          type: 1,
          components: [{
            type: 2,
            style: 4,
            label: `I understand, open confirmation`,
            custom_id: `role_mass_${massAction}_${role.id}`
          }]
        }],
        flags: 64
      });
      return;
    }

    if (action === 'add' || action === 'remove') {
      if (!role) return interaction.reply({ content: '❌ Role is required.', flags: 64 });
      if (!user) return interaction.reply({ content: '❌ User is required.', flags: 64 });
      const targetMember = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!targetMember) return interaction.reply({ content: '❌ User not found.', flags: 64 });
      if (action === 'add') {
        await targetMember.roles.add(role);
        return interaction.reply({ content: `✅ Added ${role} to ${user}.`, flags: 64 });
      } else {
        await targetMember.roles.remove(role);
        return interaction.reply({ content: `✅ Removed ${role} from ${user}.`, flags: 64 });
      }
    }

    return interaction.reply({ content: `❌ Unknown action: \`${action}\``, flags: 64 });
  }
};