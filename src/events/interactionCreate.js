const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const storage = require('../systems/storage');

module.exports = async function (interaction) {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = interaction.client.commands.get(interaction.commandName);
      if (!cmd) {
        console.log('Command not found:', interaction.commandName, '| registered:', [...interaction.client.commands.keys()].join(', '));
        return interaction.reply({ content: '❌ Command not found. Try redeploying commands.', flags: 64 }).catch(() => {});
      }
      await cmd.execute(interaction);
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'verify_button') {
        if (!interaction.guild) return;
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if (!member) return interaction.reply({ content: '❌ Could not find you in the server.', flags: 64 }).catch(() => {});
        const VERIFIED_ROLE_ID = '1353884132244983880';
        if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
          return interaction.reply({ content: '✅ You are already verified!', flags: 64 }).catch(() => {});
        }
        await member.roles.add(VERIFIED_ROLE_ID).catch(err => console.error('Role add error:', err.message));
        return interaction.reply({ content: '✅ You have been verified! Welcome to Block Party.', flags: 64 }).catch(() => {});
      }

      if (interaction.customId.startsWith('unban_')) {
        if (!interaction.guild) return;
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if (!member?.permissions.has('BanMembers')) {
          return interaction.reply({ content: '❌ Ban Members permission required.', flags: 64 }).catch(() => {});
        }
        const userId = interaction.customId.replace('unban_', '');
        try {
          await interaction.guild.members.unban(userId);
          return interaction.reply({ content: `✅ Unbanned <@${userId}>.`, flags: 64 }).catch(() => {});
        } catch {
          return interaction.reply({ content: '❌ Could not unban.', flags: 64 }).catch(() => {});
        }
        return;
      }

      if (interaction.customId.startsWith('role_mass_')) {
        const id = interaction.customId.replace('role_mass_', '');

        let action, targetId;

        if (id.startsWith('addtoallrole_')) {
          action = 'addtoallrole';
          targetId = id.replace('addtoallrole_', '');
        } else if (id.startsWith('removefromallrole_')) {
          action = 'removefromallrole';
          targetId = id.replace('removefromallrole_', '');
        } else {
          return interaction.reply({ content: '❌ Invalid action.', flags: 64 }).catch(() => {});
        }

        if (!interaction.guild) return;
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if (!member?.permissions.has('ManageRoles')) {
          return interaction.reply({ content: '❌ Manage Roles permission required.', flags: 64 }).catch(() => {});
        }

        const role = interaction.guild.roles.cache.get(targetId);
        if (!role) return interaction.reply({ content: '❌ Role not found.', flags: 64 }).catch(() => {});

        try {
          const confirmAction = action === 'addtoallrole' ? 'add_all' : 'remove_all';
          const modalCustomId = `role_confirm_${confirmAction}_${role.id}`;
          const modal = new ModalBuilder().setCustomId(modalCustomId).setTitle('Confirm Mass Role');
          const shortLabel = action === 'addtoallrole' ? 'CONFIRM to add to ALL members' : 'CONFIRM to remove from ALL members';
          modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('confirm_text').setLabel(shortLabel).setStyle(1).setRequired(true)));
          await interaction.showModal(modal);
        } catch (err) {
          console.error('Modal error:', err.message, 'customId:', interaction.customId);
          return interaction.reply({ content: '❌ Error opening modal: ' + err.message, flags: 64 }).catch(() => {});
        }
        return;
      }

      const [action] = interaction.customId.split('_');

      if (action === 'mod') {
        const [, subAction, targetId] = interaction.customId.split('_');
        if (!interaction.guild) return;
        const modMember = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if (!modMember?.permissions.has('ModerateMembers')) {
          return interaction.reply({ content: '❌ Mods only.', flags: 64 }).catch(() => {});
        }
        await interaction.deferReply({ flags: 64 });
        try {
          const target = await interaction.client.users.fetch(targetId);
          const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);
          if (subAction === 'kick' && targetMember) {
            await targetMember.kick('Kicked via userinfo panel');
            const dmEmbed = new EmbedBuilder()
              .setTitle('⚠️ ACTION TAKEN: KICK')
              .setDescription("```css\n[ KICKED FROM SERVER ]\n```\n━━━━━━━━━━━━━━━━━━━━━━\n**Server:** " + interaction.guild.name + "\n**Reason:** Kicked via userinfo panel\n━━━━━━━━━━━━━━━━━━━━━━\nYou may rejoin if invited. Repeated behavior may result in a ban.")
              .setColor(0xf39c12);
            await target.send({ embeds: [dmEmbed] }).catch(() => {});
          } else if (subAction === 'ban' && targetMember) {
            await targetMember.ban({ reason: 'Banned via userinfo panel' });
            const dmEmbed = new EmbedBuilder()
              .setTitle('⚠️ ACTION TAKEN: BAN')
              .setDescription("```diff\n- YOU HAVE BEEN BANNED\n```\n━━━━━━━━━━━━━━━━━━━━━━\n**Server:** " + interaction.guild.name + "\n**Reason:** Banned via userinfo panel\n━━━━━━━━━━━━━━━━━━━━━━\nThis action is permanent and cannot be undone.")
              .setColor(0xe74c3c);
            await target.send({ embeds: [dmEmbed] }).catch(() => {});
          } else if (subAction === 'timeout' && targetMember) {
            await targetMember.timeout(60 * 60 * 1000, 'Timed out via userinfo panel');
            const dmEmbed = new EmbedBuilder()
              .setTitle('⏸️ ACTION TAKEN: TIMEOUT')
              .setDescription("```yaml\n--- TIMEOUT APPLIED ---\n```\n━━━━━━━━━━━━━━━━━━━━━━\n**Server:** " + interaction.guild.name + "\n**Duration:** 60 minute(s)\n**Reason:** Timed out via userinfo panel\n━━━━━━━━━━━━━━━━━━━━━━\nYou cannot send messages until the timeout expires.")
              .setColor(0xf39c12);
            await target.send({ embeds: [dmEmbed] }).catch(() => {});
          } else if (subAction === 'warn') {
            const warns = storage.get('warns') || {};
            if (!warns[targetId]) warns[targetId] = [];
            warns[targetId].push({ reason: 'Warned via userinfo panel', moderator: interaction.user.tag, timestamp: Date.now() });
            storage.set('warns', warns);
            const dmEmbed = new EmbedBuilder()
              .setTitle('⚠️ WARNING ISSUED')
              .setDescription("```fix\nWARNING: BEHAVIOR VIOLATION\n```\n━━━━━━━━━━━━━━━━━━━━━━\n**Server:** " + interaction.guild.name + "\n**Reason:** Warned via userinfo panel\n**Warning #:** " + warns[targetId].length + "\n━━━━━━━━━━━━━━━━━━━━━━\nFurther violations will result in escalated action.")
              .setColor(0xf39c12);
            await target.send({ embeds: [dmEmbed] }).catch(() => {});
          } else {
            return interaction.editReply({ content: '❌ Could not ' + subAction + ' ' + target.tag }).catch(() => {});
          }
          return interaction.editReply({ content: '✅ ' + subAction.charAt(0).toUpperCase() + subAction.slice(1) + 'ed ' + target }).catch(() => {});
        } catch (err) {
          return interaction.editReply({ content: '❌ Failed: ' + err.message }).catch(() => {});
        }
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'rr_panel') {
        const roleId = interaction.values[0];
        if (!interaction.guild) return;
        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if (!member) return;
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return;
        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(roleId);
          return interaction.reply({ content: '✅ Removed ' + role.name + '.', flags: 64 }).catch(() => {});
        } else {
          await member.roles.add(roleId);
          return interaction.reply({ content: '✅ Added ' + role.name + '.', flags: 64 }).catch(() => {});
        }
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('role_confirm_')) {
        const confirmText = interaction.fields.getTextInputValue('confirm_text');
        if (confirmText.trim().toUpperCase() !== 'CONFIRM') {
          return interaction.reply({ content: '❌ Cancelled. Type CONFIRM to apply the mass role action.', flags: 64 }).catch(() => {});
        }

        const id = interaction.customId.replace('role_confirm_', '');
        const parts = id.split('_');
        let action, targetId, isUser = false;

        if (parts[parts.length - 2] === 'user') {
          action = parts.slice(0, -2).join('_');
          targetId = parts[parts.length - 1];
          isUser = true;
        } else {
          action = parts.slice(0, -1).join('_');
          targetId = parts[parts.length - 1];
        }

        if (isUser) {
          if (!interaction.guild) return;
          const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);
          if (!targetMember) return interaction.reply({ content: '❌ User not found.', flags: 64 }).catch(() => {});

          await interaction.reply({ content: `⏳ ${action === 'add_all' ? 'Adding' : 'Removing'} ALL roles ${action === 'add_all' ? 'to' : 'from'} ${targetMember.user}...`, flags: 64 }).catch(() => {});

          if (action === 'add_all') {
            const rolesToAdd = interaction.guild.roles.cache.filter(r => r.id !== interaction.guild.id && !targetMember.roles.cache.has(r.id));
            for (const role of rolesToAdd.values()) {
              await targetMember.roles.add(role).catch(() => {});
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            await interaction.editReply({ content: `✅ Added **${rolesToAdd.size}** roles to ${targetMember.user}.` }).catch(() => {});
          } else {
            const rolesToRemove = targetMember.roles.cache.filter(r => r.id !== interaction.guild.id);
            for (const role of rolesToRemove.values()) {
              await targetMember.roles.remove(role).catch(() => {});
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            await interaction.editReply({ content: `✅ Removed **${rolesToRemove.size}** roles from ${targetMember.user}.` }).catch(() => {});
          }
          return;
        }

        if (!interaction.guild) return;
        const role = interaction.guild.roles.cache.get(targetId);
        if (!role) return interaction.reply({ content: '❌ Role not found.', flags: 64 }).catch(() => {});

        await interaction.reply({ content: `⏳ ${action === 'add_all' ? 'Adding' : 'Removing'} ${role} from all members...`, flags: 64 }).catch(() => {});

        const members = await interaction.guild.members.fetch();
        let changed = 0;
        const batchSize = 10;

        for (let i = 0; i < members.size; i++) {
          const m = members.at(i);
          try {
            const hasRole = m.roles.cache.has(role.id);
            if (action === 'add_all' && !hasRole) {
              await m.roles.add(role);
              changed++;
            } else if (action === 'remove_all' && hasRole) {
              await m.roles.remove(role);
              changed++;
            }
            if ((i + 1) % batchSize === 0) await new Promise(resolve => setTimeout(resolve, 500));
          } catch {}
        }

        await interaction.editReply({ content: `✅ ${action === 'add_all' ? 'Added' : 'Removed'} **${role}** ${action === 'add_all' ? 'to' : 'from'} **${changed}** members.` }).catch(() => {});
        return;
      }

      if (interaction.customId === 'welcome_setup') {
        const text = interaction.fields.getTextInputValue('welcome_message');
        storage.setConfig('welcomeMessage', text);
        const guild = interaction.guild;
        let preview = text
          .replace(/{user}/g, interaction.user.toString())
          .replace(/{userName}/g, interaction.user.username)
          .replace(/{count}/g, String(guild?.memberCount || '?'))
          .replace(/{server}/g, guild?.name || '?')
          .replace(/\[user\]/gi, interaction.user.toString())
          .replace(/\[userName\]/gi, interaction.user.username)
          .replace(/\[memberCount\]/gi, String(guild?.memberCount || '?'))
          .replace(/\[server\]/gi, guild?.name || '?');
        const channelMentions = preview.match(/\[channel:([^\]]+)\]/gi) || [];
        for (const match of channelMentions) {
          const name = match.replace(/\[channel:/i, '').replace(/\]/i, '');
          const ch = guild?.channels.cache.find(c => c.name.toLowerCase() === name.toLowerCase());
          preview = preview.replace(match, ch ? ch.toString() : `#${name}`);
        }
        await interaction.reply({ content: preview });
        await interaction.followUp({ content: '✅ Welcome message set.', flags: 64 });
        return;
      }
      if (interaction.customId === 'goodbye_setup') {
        const text = interaction.fields.getTextInputValue('goodbye_message');
        storage.setConfig('goodbyeMessage', text);
        const guild = interaction.guild;
        let preview = text
          .replace(/{user}/g, interaction.user.toString())
          .replace(/{userName}/g, interaction.user.username)
          .replace(/{count}/g, String(guild?.memberCount || '?'))
          .replace(/{server}/g, guild?.name || '?')
          .replace(/\[user\]/gi, interaction.user.toString())
          .replace(/\[userName\]/gi, interaction.user.username)
          .replace(/\[memberCount\]/gi, String(guild?.memberCount || '?'))
          .replace(/\[server\]/gi, guild?.name || '?');
        const channelMentions = preview.match(/\[channel:([^\]]+)\]/gi) || [];
        for (const match of channelMentions) {
          const name = match.replace(/\[channel:/i, '').replace(/\]/i, '');
          const ch = guild?.channels.cache.find(c => c.name.toLowerCase() === name.toLowerCase());
          preview = preview.replace(match, ch ? ch.toString() : `#${name}`);
        }
        await interaction.reply({ content: preview });
        await interaction.followUp({ content: '✅ Goodbye message set.', flags: 64 });
        return;
      }
    }
  } catch (err) {
    console.error('Interaction error:', err.message);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'An error occurred. Please try again.', flags: 64 }).catch(() => {});
    } else if (interaction.deferred) {
      await interaction.editReply({ content: 'An error occurred. Please try again.' }).catch(() => {});
    }
  }
};