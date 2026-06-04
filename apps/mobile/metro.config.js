const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { join, resolve } = require('path');

const projectRoot = __dirname;
const workspaceRoot = resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo support: watch workspace root and resolve modules from there
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  join(projectRoot, 'node_modules'),
  join(workspaceRoot, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './src/global.css', inlineRem: 16 });
