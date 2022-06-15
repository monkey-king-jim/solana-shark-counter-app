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
  let sender;
  let sender_token;
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
    mint = Keypair.generate();
    console.log(`mint: ${mint.publicKey.toBase58()}`);
    const connection = provider.connection;

    payer = web3.Keypair.generate();
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

    let mintPubkey = await createMint(
      connection, // conneciton
      payer, // fee payer
      wallet.publicKey, // mint authority
      wallet.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      6 // decimals
    );

    let mintAccount = await getMint(connection, mintPubkey);

    console.log(mintAccount);
    sender = Keypair.generate();
    receiver = Keypair.generate();

    let sender_token = await createAssociatedTokenAccount(
      connection, // connection
      payer, // fee payer
      mintPubkey, // mint
      sender.publicKey // owner,
    );
    console.log(`ATA: ${sender_token.toBase58()}`);

    let senderTokenAccount = await getAccount(connection, sender_token);
    console.log(senderTokenAccount);

    let receiver_token = await createAssociatedTokenAccount(
      connection, // connection
      payer, // fee payer
      mintPubkey, // mint
      receiver.publicKey // owner,
    );
    console.log(`ATA: ${receiver_token.toBase58()}`);

    let receiverTokenAccount = await getAccount(connection, receiver_token);
    console.log(receiverTokenAccount);

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
    let mint_sender_tx = new Transaction().add(
      createMintToCheckedInstruction(
        mintPubkey, // mint
        sender_token, // receiver (sholud be a token account)
        wallet.publicKey, // mint authority
        2e6, // amount. if your decimals is 8, you mint 10^8 for 1 token.
        6 // decimals
        // [signer1, signer2 ...], // only multisig account will use
      )
    );
    console.log(`txhash: ${await provider.sendAndConfirm(mint_sender_tx)}`);
    let senderTokenAmount = await connection.getTokenAccountBalance(
      sender_token
    );
    console.log(`amount: ${senderTokenAmount.value.amount}`);
  });
});
