import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Counterapp } from "../target/types/counterapp";
import * as assert from "assert";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createMint,
  getMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  createAssociatedTokenAccount,
  mintToChecked,
  createMintToCheckedInstruction,
} from "@solana/spl-token";
import * as bs58 from "bs58";
const web3 = require("@solana/web3.js");

describe("counterapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet;
  const systemProgram = anchor.web3.SystemProgram;
  const program = anchor.workspace.Counterapp as Program<Counterapp>;

  let mint;
  let receiver;
  let receiver_token;
  let payer;
  // it("Is initialized!", async () => {
  //   const [counter, _counterBump] =
  //     await anchor.web3.PublicKey.findProgramAddress(
  //       [
  //         anchor.utils.bytes.utf8.encode("counter_account"),
  //         wallet.publicKey.toBytes(),
  //       ],
  //       program.programId
  //     );
  //   console.log("Your counter address", counter.toString());
  //   const tx = await program.methods
  //     .createCounter()
  //     .accounts({
  //       user: wallet.publicKey,
  //       counterAccount: counter,
  //       systemProgram: systemProgram.programId,
  //     })
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  // });

  // it("Fetch a counter!", async () => {
  //   // Keypair = account
  //   const [counterPubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
  //     [
  //       anchor.utils.bytes.utf8.encode("counter_account"),
  //       wallet.publicKey.toBytes(),
  //     ],
  //     program.programId
  //   );
  //   console.log("Your counter address", counterPubkey.toString());
  //   const counter = await program.account.counterAccount.fetch(counterPubkey);
  //   console.log("Your counter", counter);
  //   assert.equal(counter.authority.toBase58(), wallet.publicKey.toBase58());
  // });

  // it("Update a counter!", async () => {
  //   // Keypair = account
  //   const [counterPubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
  //     [
  //       anchor.utils.bytes.utf8.encode("counter_account"),
  //       wallet.publicKey.toBytes(),
  //     ],
  //     program.programId
  //   );
  //   console.log("Your counter address", counterPubkey.toString());
  //   const counter = await program.account.counterAccount.fetch(counterPubkey);
  //   console.log("Your counter", counter);
  //   const tx = await program.methods
  //     .update(1)
  //     .accounts({
  //       counterAccount: counterPubkey,
  //     })
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  //   const counterUpdated = await program.account.counterAccount.fetch(
  //     counterPubkey
  //   );
  //   console.log("Your counter", counterUpdated);
  // });

  // it("Increment a counter!", async () => {
  //   // Keypair = account
  //   const [counterPubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
  //     [
  //       anchor.utils.bytes.utf8.encode("counter_account"),
  //       wallet.publicKey.toBytes(),
  //     ],
  //     program.programId
  //   );
  //   console.log("Your counter address", counterPubkey.toString());
  //   const counter = await program.account.counterAccount.fetch(counterPubkey);
  //   console.log("Your counter", counter);
  //   const tx = await program.methods
  //     .increment()
  //     .accounts({
  //       counterAccount: counterPubkey,
  //     })
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  //   const counterIncremented = await program.account.counterAccount.fetch(
  //     counterPubkey
  //   );
  //   console.log("Your counter", counterIncremented);
  // });

  // it("Decrement a counter!", async () => {
  //   // Keypair = account
  //   const [counterPubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
  //     [
  //       anchor.utils.bytes.utf8.encode("counter_account"),
  //       wallet.publicKey.toBytes(),
  //     ],
  //     program.programId
  //   );
  //   console.log("Your counter address", counterPubkey.toString());
  //   const counter = await program.account.counterAccount.fetch(counterPubkey);
  //   console.log("Your counter", counter);
  //   const tx = await program.methods
  //     .decrement()
  //     .accounts({
  //       counterAccount: counterPubkey,
  //     })
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  //   const counterDecremented = await program.account.counterAccount.fetch(
  //     counterPubkey
  //   );
  //   console.log("Your counter", counterDecremented);
  // });

  it("setup mints and token accounts", async () => {
    // set up mint
    mint = Keypair.generate();
    const connection = provider.connection;
    payer = web3.Keypair.generate();

    // airdrop some lamports to payer
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      web3.LAMPORTS_PER_SOL // 10000000 Lamports in 1 SOL
    );
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    // create mint
    let mintPubkey = await createMint(
      connection, // conneciton
      payer, // fee payer
      wallet.publicKey, // mint authority
      wallet.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      6 // decimals
    );

    // let mintAccount = await getMint(connection, mintPubkey);
    // console.log(mintAccount);
    receiver = Keypair.generate();

    // create ATAs for sender and receiver
    receiver_token = await createAssociatedTokenAccount(
      connection, // connection
      payer, // fee payer
      mintPubkey, // mint
      receiver.publicKey // owner,
    );
    // console.log(`ATA: ${receiver_token.toBase58()}`);

    let wallet_token = await createAssociatedTokenAccount(
      connection, // connection
      payer, // fee payer
      mintPubkey, // mint
      wallet.publicKey // owner,
    );
    // mint tokens
    // let mint_sender_tx = await mintToChecked(
    //   connection, // connection
    //   payer, // fee payer
    //   mintPubkey, // mint
    //   sender_token, // receiver (sholud be a token account)
    //   wallet.publicKey, // mint authority
    //   2e6, // amount. if your decimals is 8, you mint 10^8 for 1 token.
    //   6 // decimals
    // );

    // console.log(`txhash: ${mint_sender_tx}`);

    // let senderTokenAmount = await connection.getTokenAccountBalance(
    //   sender_token
    // );

    // let mint_sender_tx = new Transaction().add(
    //   createMintToCheckedInstruction(
    //     mintPubkey, // mint
    //     sender_token, // receiver (sholud be a token account)
    //     wallet.publicKey, // mint authority
    //     2e6, // amount. if your decimals is 8, you mint 10^8 for 1 token.
    //     6 // decimals
    //     // [signer1, signer2 ...], // only multisig account will use
    //   )
    // );
    // console.log(`txhash: ${await provider.sendAndConfirm(mint_sender_tx)}`);
    // let senderTokenAmount = await connection.getTokenAccountBalance(
    //   sender_token
    // );
    // console.log(`sender starting amount: ${senderTokenAmount.value.amount}`);

    // mint 2 tokens to sender ATA (wallet)
    let mint_wallet_tx = new Transaction().add(
      createMintToCheckedInstruction(
        mintPubkey, // mint
        wallet_token, // receiver (sholud be a token account)
        wallet.publicKey, // mint authority
        2e6, // amount. if your decimals is 8, you mint 10^8 for 1 token.
        6 // decimals
        // [signer1, signer2 ...], // only multisig account will use
      )
    );
    console.log(`txhash: ${await provider.sendAndConfirm(mint_wallet_tx)}`);
    let walletTokenAmount = await connection.getTokenAccountBalance(
      wallet_token
    );
    console.log(`sender starting amount: ${walletTokenAmount.value.amount}`);

    const tx = await program.methods
      .transferToken()
      .accounts({
        sender: wallet.publicKey,
        senderToken: wallet_token,
        receiverToken: receiver_token,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Your transaction signature", tx);
    walletTokenAmount = await connection.getTokenAccountBalance(wallet_token);
    console.log(`sender remaining amount: ${walletTokenAmount.value.amount}`);
    let receiverTokenAmount = await connection.getTokenAccountBalance(
      receiver_token
    );
    console.log(
      `receiver remaining amount: ${receiverTokenAmount.value.amount}`
    );
  });
});
