import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Counterapp } from "../target/types/counterapp";
import * as assert from "assert";

describe("counterapp", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet;
  const systemProgram = anchor.web3.SystemProgram;
  const program = anchor.workspace.Counterapp as Program<Counterapp>;

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

  it("Fetch a counter!", async () => {
    // Keypair = account
    const [counterPubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("counter_account"),
        wallet.publicKey.toBytes(),
      ],
      program.programId
    );
    console.log("Your counter address", counterPubkey.toString());
    const counter = await program.account.counterAccount.fetch(counterPubkey);
    console.log("Your counter", counter);
    assert.equal(counter.authority.toBase58(), wallet.publicKey.toBase58());
  });

  it("Update a counter!", async () => {
    // Keypair = account
    const [counterPubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("counter_account"),
        wallet.publicKey.toBytes(),
      ],
      program.programId
    );
    console.log("Your counter address", counterPubkey.toString());
    const counter = await program.account.counterAccount.fetch(counterPubkey);
    console.log("Your counter", counter);
    const tx = await program.methods
      .update(1)
      .accounts({
        counterAccount: counterPubkey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const counterUpdated = await program.account.counterAccount.fetch(
      counterPubkey
    );
    console.log("Your counter", counterUpdated);
  });

  it("Increment a counter!", async () => {
    // Keypair = account
    const [counterPubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("counter_account"),
        wallet.publicKey.toBytes(),
      ],
      program.programId
    );
    console.log("Your counter address", counterPubkey.toString());
    const counter = await program.account.counterAccount.fetch(counterPubkey);
    console.log("Your counter", counter);
    const tx = await program.methods
      .increment()
      .accounts({
        counterAccount: counterPubkey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const counterIncremented = await program.account.counterAccount.fetch(
      counterPubkey
    );
    console.log("Your counter", counterIncremented);
  });

  it("Decrement a counter!", async () => {
    // Keypair = account
    const [counterPubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("counter_account"),
        wallet.publicKey.toBytes(),
      ],
      program.programId
    );
    console.log("Your counter address", counterPubkey.toString());
    const counter = await program.account.counterAccount.fetch(counterPubkey);
    console.log("Your counter", counter);
    const tx = await program.methods
      .decrement()
      .accounts({
        counterAccount: counterPubkey,
      })
      .rpc();
    console.log("Your transaction signature", tx);
    const counterDecremented = await program.account.counterAccount.fetch(
      counterPubkey
    );
    console.log("Your counter", counterDecremented);
  });
});
