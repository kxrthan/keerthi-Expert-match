// Mock Implementation of walletApi.js for sandbox mode
const WALLET_KEY = 'expertmatch_mock_wallet';
const BILLINGS_KEY = 'expertmatch_mock_billings';

const initialWallet = {
  balance: 150.00,
  currency: "USD"
};

const initialBillings = [
  {
    id: 701,
    sessionId: 501,
    amount: 15.00,
    status: "paid",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    session: {
      doubt: {
        title: "Quantum Entanglement State Calculation"
      }
    }
  }
];

function getWallet() {
  const saved = localStorage.getItem(WALLET_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  localStorage.setItem(WALLET_KEY, JSON.stringify(initialWallet));
  return initialWallet;
}

function getBillings() {
  const saved = localStorage.getItem(BILLINGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  localStorage.setItem(BILLINGS_KEY, JSON.stringify(initialBillings));
  return initialBillings;
}

export async function fetchWalletConfig() {
  return { keyId: "rzp_test_mockkey123" };
}

export async function fetchMyWallet() {
  return getWallet();
}

export async function createTopupOrder(amount) {
  return {
    id: `order_${Date.now()}`,
    amount: Number(amount) * 100,
    currency: "INR"
  };
}

export async function verifyTopupPayment(data) {
  const wallet = getWallet();
  // Assume a default transfer amount or grab what was passed in
  const amountAdded = Number(data.amount || 50); 
  wallet.balance += amountAdded;
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));

  const billings = getBillings();
  const newTx = {
    id: Date.now(),
    amount: amountAdded,
    status: "paid",
    createdAt: new Date().toISOString(),
    session: {
      doubt: {
        title: "Wallet Cash Top-up"
      }
    }
  };
  billings.unshift(newTx);
  localStorage.setItem(BILLINGS_KEY, JSON.stringify(billings));

  return { success: true, wallet };
}

export async function fetchMyBillings() {
  return getBillings();
}

export async function fetchSessionBilling(sessionId) {
  return {
    id: Date.now(),
    sessionId: Number(sessionId),
    amount: 15.00,
    status: "paid",
    createdAt: new Date().toISOString()
  };
}
