const hre = require("hardhat");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const DESTINATION_ADDRESS = config.DESTINATION_ADDRESS;
const TOKEN_AMOUNT_TO_TRANSFER = config.TOKEN_AMOUNT_TO_TRANSFER;

// Import ABI ERC20 dari file
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

// Fungsi untuk memeriksa saldo token
async function checkTokenBalance(contract, signer) {
  const balance = await contract.balanceOf(signer.address);
  return ethers.formatUnits(balance, 18); // Ganti 18 dengan jumlah desimal token yang sesuai
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

    // Cek saldo token sebelum melakukan transfer
    const tokenBalance = await checkTokenBalance(contract, signer);
    console.log(
      createFrame(
        `Current EIGEN balance: ${tokenBalance} EIGEN`,
        colors.fg.cyan
      )
    );

    let isTransferring = false;

    // Fungsi untuk spam transfer
    async function spamTransfer() {
      if (isTransferring) return; // Skip jika transfer sedang berlangsung

      isTransferring = true;
      try {
        const amountToTransfer = ethers.parseUnits(
          TOKEN_AMOUNT_TO_TRANSFER,
          18
        );
        const tx = await contract.transfer(
          DESTINATION_ADDRESS,
          amountToTransfer
        );
        console.log(
          createFrame(`Transaction sent. Hash: ${tx.hash}`, colors.fg.yellow)
        );

        await tx.wait();
        console.log(
          createFrame(
            `Transferred ${TOKEN_AMOUNT_TO_TRANSFER} tokens to ${DESTINATION_ADDRESS}`,
            colors.fg.green
          )
        );

        // Hentikan spam transfer jika berhasil
        clearInterval(intervalId);
        console.log(
          createFrame("Transfer completed. Exiting program.", colors.fg.blue)
        );
        process.exit(0);
      } catch (error) {
        console.log(
          createFrame(
            `Token EIGEN masih terkunci. ${error.message}`,
            colors.fg.red
          )
        );
      } finally {
        isTransferring = false;
      }
    }

    // Jalankan spam transfer setiap detik
    const intervalId = setInterval(spamTransfer, 1000);
    console.log(
      createFrame("Starting spam transfer every second...", colors.fg.blue)
    );
  } catch (error) {
    console.error(
      createFrame(`Error in main function: ${error.message}`, colors.fg.red)
    );
    process.exit(1);
  }
}

// Jalankan bot
main().catch((error) => {
  console.error(createFrame(`Critical Error: ${error.message}`, colors.fg.red));
  process.exit(1);
});
