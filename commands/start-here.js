const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'start-here',
  execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("ALICE SYSTEM // START HERE")
      .setDescription(
        "Welcome to the server system.\n\n" +
        "Use the panels below to navigate."
      )
      .addFields(
        { name: "BOT", value: "Marketplace system access", inline: true },
        { name: "SUPPORT", value: "Help & issues", inline: true },
        { name: "LIBRARY", value: "Saved outputs", inline: true }
      );

    interaction.reply({ embeds: [embed], ephemeral: true });
  }
};