const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const TOKEN_MINT = "YOUR_SPL_TOKEN_MINT_ADDRESS";
const USDT_MINT = "USDT_TOKEN_MINT_ADDRESS";
const USDC_MINT = "USDC_TOKEN_MINT_ADDRESS";
const EXCHANGE_RATE = 10; // Курс обміну

let wallet = null;
let connection = new solanaWeb3.Connection(SOLANA_RPC);

document.addEventListener("DOMContentLoaded", () => {
    const walletButton = document.getElementById("wallet-button");
    const widget = document.getElementById("widget");
    
    walletButton.innerHTML = '<button id="connect-wallet">Підключити гаманець</button>';
    document.getElementById("connect-wallet").addEventListener("click", connectMobileWallet);
});

async function connectMobileWallet() {
    try {
        const deeplink = "solana://wallet/connect?cluster=mainnet-beta";
        window.location.href = deeplink;
    } catch (error) {
        console.error("Помилка підключення гаманця:", error);
    }
}

async function loadBalance() {
    try {
        const accounts = await connection.getParsedTokenAccountsByOwner(new solanaWeb3.PublicKey(wallet), { programId: solanaWeb3.TOKEN_PROGRAM_ID });
        const tokenAccount = accounts.value.find(acc => acc.account.data.parsed.info.mint === TOKEN_MINT);
        const balance = tokenAccount ? tokenAccount.account.data.parsed.info.tokenAmount.uiAmount : 0;
        document.getElementById("widget").innerHTML = `Баланс токенів: ${balance}`;
        showSwapUI();
    } catch (error) {
        console.error("Помилка отримання балансу:", error);
    }
}

function showSwapUI() {
    document.getElementById("widget").innerHTML += `
        <h3>Обмін USDT/USDC на наш токен</h3>
        <select id="token-select">
            <option value="${USDT_MINT}">USDT</option>
            <option value="${USDC_MINT}">USDC</option>
        </select>
        <input type="number" id="swap-amount" placeholder="Введіть кількість">
        <button id="swap-button">Обміняти</button>
    `;
    document.getElementById("swap-button").addEventListener("click", swapTokens);
}

async function swapTokens() {
    const selectedToken = document.getElementById("token-select").value;
    const amount = parseFloat(document.getElementById("swap-amount").value);
    if (!wallet || isNaN(amount) || amount <= 0) {
        alert("Некоректна сума або гаманець не підключено.");
        return;
    }
    try {
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: new solanaWeb3.PublicKey(wallet),
                toPubkey: new solanaWeb3.PublicKey(TOKEN_MINT),
                lamports: amount * EXCHANGE_RATE,
            })
        );
        const signature = await window.solana.signAndSendTransaction(transaction);
        alert(`Транзакція відправлена: ${signature}`);
    } catch (error) {
        console.error("Помилка обміну:", error);
    }
}