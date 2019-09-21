var AmazingDapp = artifacts.require("./AmazingDapp.sol")

module.exports = function(deployer) {
  deployer.deploy(AmazingDapp);
};
