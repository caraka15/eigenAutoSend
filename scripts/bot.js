const hre = require("hardhat");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const DESTINATION_ADDRESS = config.DESTINATION_ADDRESS;
const ETH_THRESHOLD = config.ETH_THRESHOLD;
const TOKEN_AMOUNT_TO_TRANSFER = config.TOKEN_AMOUNT_TO_TRANSFER;

// Import ABI ERC20 dari file atau langsung definisikan di sini
const abi = JSON.parse(fs.readFileSync("abi/abi_eigen.json", "utf8"));

// Fungsi untuk membuat output berwarna
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  fg: {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
  },
};

// Fungsi untuk membuat bingkai
function createFrame(message, color = colors.fg.cyan) {
  const width = message.length + 4;
  const top = "╔" + "═".repeat(width - 2) + "╗";
  const bottom = "╚" + "═".repeat(width - 2) + "╝";
  const middle = "║ " + message + " ║";
  return `${color}${top}\n${middle}\n${bottom}${colors.reset}`;
}

// Fungsi untuk membuat pemisah
function createSeparator(color = colors.fg.yellow) {
  return `${color}${"═".repeat(50)}${colors.reset}`;
}

async function main() {
  try {
    // Alamat kontrak ERC20
    const contractAddress = "0xec53bf9167f50cdeb3ae105f56099aaab9061f83"; // Ganti dengan alamat kontrak yang benar

    // Dapatkan signer
    const [signer] = await hre.ethers.getSigners();
    console.log(
      createFrame(`Using account: ${signer.address}`, colors.fg.green)
    );

    // Buat instance kontrak ERC20
    const contract = new hre.ethers.Contract(contractAddress, abi, signer);

    let isTransferring = false;

    // Fungsi untuk memeriksa balance dan melakukan transfer
    async function checkBalanceAndTransfer() {
      try {
        if (isTransferring) return; // Skip jika transfer sedang berlangsung

        // Cek balance ETH
        const balance = await hre.ethers.provider.getBalance(signer.address);
        const balanceInEth = ethers.formatEther(balance);

        console.log(createSeparator());
        console.log(
          `${colors.fg.cyan}Current ETH balance: ${colors.fg.yellow}${balanceInEth} ETH${colors.reset}`
        );

        // Jika balance lebih dari threshold, lakukan transfer token dan hentikan interval
        if (
          parseFloat(balanceInEth) > parseFloat(ETH_THRESHOLD) &&
          !isTransferring
        ) {
          isTransferring = true;
          console.log(
            createFrame(
              "Balance above threshold, initiating token transfer...",
              colors.fg.magenta
            )
          );

          const amountToTransfer = ethers.parseUnits(
            TOKEN_AMOUNT_TO_TRANSFER,
            18
          );
          const tx = await contract.transfer(
            DESTINATION_ADDRESS,
            amountToTransfer
          );
          console.log(
            createFrame(
              `Transaction sent. Waiting for confirmation...`,
              colors.fg.yellow
            )
          );
          await tx.wait();

          console.log(
            createFrame(
              `Transferred ${TOKEN_AMOUNT_TO_TRANSFER} EIGEN to ${DESTINATION_ADDRESS}`,
              colors.fg.green
            )
          );
          console.log(
            `${colors.fg.green}Transaction hash: ${colors.fg.yellow}${tx.hash}${colors.reset}`
          );

          // Hentikan interval dan keluar dari program
          clearInterval(intervalId);
          console.log(
            createFrame("Transfer completed. Exiting program.", colors.fg.blue)
          );
          process.exit(0);
        }
      } catch (error) {
        console.log(
          createFrame("Error in checkBalanceAndTransfer", colors.fg.red)
        );
        if (
          error.code === "NONCE_EXPIRED" ||
          error.message.includes("already known")
        ) {
          console.log(
            createFrame(
              "Transaction already in progress. Waiting for confirmation...",
              colors.fg.yellow
            )
          );
        } else {
          console.error(`${colors.fg.red}${error.message}${colors.reset}`);
          clearInterval(intervalId);
          process.exit(1);
        }
      }
    }

    // Jalankan pengecekan setiap 500 milidetik
    const intervalId = setInterval(checkBalanceAndTransfer, 500);

    console.log(
      createFrame("Starting balance check. Waiting for ETH...", colors.fg.blue)
    );
  } catch (error) {
    console.log(createFrame("Error in main function", colors.fg.red));
    console.error(`${colors.fg.red}${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Jalankan bot
main().catch((error) => {
  console.log(createFrame("Critical Error", colors.fg.red));
  console.error(`${colors.fg.red}${error.message}${colors.reset}`);
  process.exit(1);
});
