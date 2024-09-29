require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY } = process.env;

module.exports = {
  defaultNetwork: "swisstronik",
  solidity: "0.8.20",
  networks: {
    ethereum: {
      url: "https://eth-pokt.nodies.app",
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  sourcify: {
    enabled: true,
  },
};
