const { EmbedBuilder } = require('discord.js');

const DEFAULT_COLOR = 15548997;

function base(title, description, fields, color) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color || DEFAULT_COLOR);
  if (fields) embed.addFields(fields);
  return embed;
}

function dashboard(title, description, fields) {
  return base(
    `⚡ ${title}`,
    "```ansi\n\u001b[1;35mWELCOME TO THE CONTROL PANEL\u001b[0m\n```\n" +
    "━━━━━━━━━━━━━━━━━━━━━━\n" +
    (description || 'Select a module below to continue.'),
    fields,
    0x9b59b6
  );
}

function success(title, description) {
  return base(`✅ ${title}`, description, null, 0x2ecc71);
}

function error(title, description) {
  return base(`❌ ${title}`, description, null, 0xe74c3c);
}

function info(title, description, fields) {
  return base(`ℹ️ ${title}`, description, fields, 0x3498db);
}

function mod(title, description, fields) {
  return base(`🛡️ ${title}`, description, fields, 0xf39c12);
}

function panel(title, description, fields) {
  return base(`📋 ${title}`, description, fields, 0x1abc9c);
}

module.exports = { base, dashboard, success, error, info, mod, panel };
