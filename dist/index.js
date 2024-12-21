"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const axios_1 = __importDefault(require("axios"));
const anchor_1 = require("@project-serum/anchor");
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
require('dotenv').config();
// It is recommended that you use your own RPC endpoint.
// This RPC endpoint is only for demonstration purposes so that this example will run.
const connection = new web3_js_1.Connection('https://api.mainnet-beta.solana.com');
const secretkey = process.env.PRIVATE_KEY;
const wallet = new anchor_1.Wallet(web3_js_1.Keypair.fromSecretKey(bytes_1.bs58.decode(secretkey)));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (yield axios_1.default.get('https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=50'));
        const quoteResponse = response.data;
        console.log(quoteResponse);
        try {
            const { data: { swapTransaction } } = yield (yield axios_1.default.post('https://quote-api.jup.ag/v6/swap', {
                quoteResponse,
                userPublicKey: wallet.publicKey.toString(),
            }));
            console.log("swapTransaction");
            const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
            var transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
            console.log(transaction);
            transaction.sign([wallet.payer]);
            const latestBlockHash = yield connection.getLatestBlockhash();
            // Execute the transaction
            const rawTransaction = transaction.serialize();
            const txid = yield connection.sendRawTransaction(rawTransaction, {
                skipPreflight: true,
                maxRetries: 2
            });
            yield connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: txid
            });
            console.log(`https://solscan.io/tx/${txid}`);
        }
        catch (e) {
            console.log(e);
        }
    });
}
main();
