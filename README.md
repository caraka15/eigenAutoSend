# EIGEN AUTO SEND BOT

## Prerequisites

need NODE 20+ AND NPM

1. **Clone the Repository**

   ```sh
   git clone https://github.com/caraka15/eigenAutoSend.git
   cd eigenAutoSend
   ```

2. **Install Dependencies**

   ```sh
   npm install
   ```

3. **Create a `.env` File**

   ```sh
   nano .env
   ```

   Add your private key:

   ```
   PRIVATE_KEY=your_private_key_here
   ```

   Save with `Ctrl+X`, then `Y`, then `Enter`.

4. **Configuration**
   Edit `bot.js` or `spam.js`:
   ```sh
   nano bot.js
   # or
   nano spam.js
   ```
   Modify these values:
   - `DESTINATION_ADDRESS`
   - `TOKEN_AMOUNT_TO_TRANSFER`

## Running Scripts

### 1. Spam Transfer until token unlock

To perform spam transfers until the transfer function is opened:

ini untuk melakukan spam transfer sampai fungsi transfer dibuka:

```sh
npx hardhat run scripts/spam.js --network ethereum
```

### 2. Spam check value eth until transfered

This function transfers when ETH balance is above a certain threshold.
Adjust `ETH_THRESHOLD` to set the transfer trigger amount.

ini fungsi untuk transfer apa bila saldo eth diatas angka tertentu,
jangan lupa ubah ETH_THRESHOLD untuk menentukan eth diatas angka itu akan melakukan tf

```sh
npx hardhat run scripts/bot.js --network ethereum
```
