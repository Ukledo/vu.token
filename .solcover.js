require('babel-register');
require('babel-polyfill');

module.exports = {
  copyNodeModules: true,
  skipFiles: ['migration/Migrations.sol'],
}
