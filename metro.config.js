const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [];
config.resolver.blockList = [
  /Materiais\/.*/,
  /Problemas\/.*/,
  /docs\/.*/,
];

module.exports = config;
