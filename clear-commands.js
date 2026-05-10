const { REST, Routes } = require('discord.js');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Deleting ALL application commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
    console.log('All commands deleted.');
    console.log('Now run: node deploy-commands.js');
  } catch (error) {
    console.error('Failed:', error.message);
  }
})();