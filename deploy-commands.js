const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const GUILD_ID = '1353884132244983878';

const commandBuilders = [
  new SlashCommandBuilder().setName('userinfo').setDescription('Get info about a user').addUserOption(o => o.setName('user').setDescription('User to check').setRequired(false)),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Get info about this server'),
  new SlashCommandBuilder().setName('avatar').setDescription("Get a user's avatar").addUserOption(o => o.setName('user').setDescription('User to get avatar for').setRequired(false)),
  new SlashCommandBuilder().setName('ban').setDescription('Ban a user from the server').addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason for ban').setRequired(false)),
  new SlashCommandBuilder().setName('kick').setDescription('Kick a user from the server').addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason for kick').setRequired(false)),
  new SlashCommandBuilder().setName('timeout').setDescription('Timeout a user').addUserOption(o => o.setName('user').setDescription('User to timeout').setRequired(true)).addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)),
  new SlashCommandBuilder().setName('warn').setDescription('Warn a user').addUserOption(o => o.setName('user').setDescription('User to warn').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason for warning').setRequired(true)),
  new SlashCommandBuilder().setName('purge').setDescription('Bulk delete messages').addIntegerOption(o => o.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true)),
  new SlashCommandBuilder().setName('announce').setDescription('Send an announcement').addStringOption(o => o.setName('title').setDescription('Announcement title').setRequired(true)).addStringOption(o => o.setName('message').setDescription('Announcement message').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('Channel to send to').setRequired(false)),
  new SlashCommandBuilder().setName('reactionrole').setDescription('Create a reaction role panel').addStringOption(o => o.setName('message').setDescription('Panel message text').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('Channel to send panel').setRequired(true)),
  new SlashCommandBuilder().setName('automod').setDescription('Auto-mod settings').addStringOption(o => o.setName('action').setDescription('Action to perform').setRequired(false).addChoices({ name: 'View', value: 'view' }, { name: 'Spam', value: 'spam' }, { name: 'Links', value: 'links' })),
  new SlashCommandBuilder().setName('welcome').setDescription('Welcome system settings').addChannelOption(o => o.setName('channel').setDescription('Channel for welcome messages').setRequired(false)),
  new SlashCommandBuilder().setName('goodbye').setDescription('Goodbye system settings').addChannelOption(o => o.setName('channel').setDescription('Channel for goodbye messages').setRequired(false)),
  new SlashCommandBuilder().setName('welcome-setup').setDescription('Set the welcome message'),
  new SlashCommandBuilder().setName('goodbye-setup').setDescription('Set the goodbye message'),
  new SlashCommandBuilder().setName('log').setDescription('Logging system settings').addChannelOption(o => o.setName('channel').setDescription('Channel for logs').setRequired(false)),
  new SlashCommandBuilder().setName('lock').setDescription('Lock the current channel'),
  new SlashCommandBuilder().setName('unlock').setDescription('Unlock the current channel'),
  new SlashCommandBuilder().setName('slowmode').setDescription('Set channel slowmode').addIntegerOption(o => o.setName('seconds').setDescription('Slowmode in seconds (0 = off)').setRequired(true)),
  new SlashCommandBuilder().setName('unban').setDescription('View and unban users'),
  new SlashCommandBuilder().setName('start-here').setDescription('Send the start-here message to the channel'),
  new SlashCommandBuilder().setName('role').setDescription('Role management').addStringOption(o => o.setName('action').setDescription('Action to perform').setRequired(false).addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' }, { name: 'Add to All', value: 'addtoall' }, { name: 'Remove from All', value: 'removefromall' })).addUserOption(o => o.setName('user').setDescription('User to manage roles for').setRequired(false)).addRoleOption(o => o.setName('role').setDescription('Role to assign or remove').setRequired(false))
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`Deploying ${commandBuilders.length} commands to guild ${GUILD_ID}...`);
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID), { body: commandBuilders });
    console.log(`Successfully deployed ${commandBuilders.length} commands to guild.`);
  } catch (error) {
    console.error('Deploy failed:', error.message);
  }
  process.exit(0);
})();