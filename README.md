# PayStream 🕹️ — 8-Bit Pay-Per-Second Video Platform on Monad

PayStream is a real-time pay-per-second video streaming platform built on **Monad Testnet** (`10143`). Every 1 second of actual video playback triggers 1 real on-chain transaction transferring MON micro-payments directly from the viewer's wallet vault to the content creator's payout wallet.

---

## 🌟 Key Features

- **⚡ Subsecond Monad EVM Settlements**: 1 second of video playback = 1 real Monad transaction (`0.001 MON/sec`).
- **🎮 8-Bit Retro Arcade UI**: Ultra-bright sunny yellow pixel grid design with `Press Start 2P` & `VT323` typography (Zero dark colors, zero purple/blue!).
- **🔒 Demo Authorization Portal & Wallet Locking**: Separate, locked Player and Creator roles preventing unauthorized wallet tampering.
- **☁️ Cloudinary Cloud Video Storage**: Real video file uploads hosted via Cloudinary (`dvg1bkx8s`) with instant HTML5 blob fallback.
- **🛡️ Balance-Guarded Auto-Pause**: Video player automatically halts playback and payments if the viewer's MON vault balance is depleted.

---

## 🛠️ Architecture & Tech Stack

- **Blockchain**: Monad Testnet (`Chain ID: 10143`, `https://testnet-rpc.monad.xyz`)
- **Smart Contracts**: Solidity (`PayPerSecond.sol`) compiled & deployed via Foundry (`forge`)
- **Frontend Framework**: Next.js 16 (App Router), TypeScript (`ES2020`), TailwindCSS
- **Web3 Integration**: Viem, Wagmi, MetaMask / Rabby browser wallets
- **Media Hosting**: Cloudinary API (`dvg1bkx8s`) & Browser IndexedDB (`PayStreamVideoDB`)

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Smart Contract Deployment (Monad Testnet)

```bash
cd contracts

# Export RPC URL and your MetaMask Private Key
export RPC_URL="https://testnet-rpc.monad.xyz"
export PRIVATE_KEY="YOUR_METAMASK_PRIVATE_KEY"

# Deploy via Forge script
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

---

## 🌐 Deploy to Vercel

1. Push code to your GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import repository `purushowtham/paystream`.
3. In Vercel Project Settings, ensure **Root Directory** is set to `./` (or leave blank).
4. Click **Deploy**!

---

## 📄 License
MIT License. Built for the Monad Ecosystem ⚡
