import type { NextPage } from "next";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  useAnchorWallet,
  AnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { Program, BN } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import idl_type from "/Users/jamesw/Documents/GitHub/solana-shark-counter-app/target/idl/counterapp.json";
import { ConfirmOptions } from "@solana/web3.js";

const Home: NextPage = () => {
  const opts = {
    preflightCommitment: "processed" as ConfirmOptions,
  };
  const connection = useConnection();
  const wallet: AnchorWallet | any = useAnchorWallet();

  const [programState, setProgramState] = useState({} as any);

  const increment = async () => {
    const tx = await programState.program.methods
      .increment()
      .accounts({
        counterAccount: programState.counter,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  };

  const setupCounterProgram = async () => {
    let idl = idl_type as anchor.Idl;

    const network = "https://api.devnet.solana.com ";
    const connection = new anchor.web3.Connection(
      network,
      opts.preflightCommitment
    );

    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      opts.preflightCommitment
    );

    const program = new Program(
      idl,
      "8UCFsbJjuTzUimm4g9TuVooR3dKEC7MNV8wyqZp8TEKH",
      provider
    );

    const [counterPubkey, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("counter_account"),
        wallet.publicKey.toBytes(),
      ],
      program.programId
    );
    console.log("Your counter address", counterPubkey.toString());
    const counter: any = await program.account.counterAccount.fetch(
      counterPubkey
    );
    console.log("Your counter", counter);
    // const systemProgram = anchor.web3.SystemProgram;
    // const [counter, _counterBump] =
    //   await anchor.web3.PublicKey.findProgramAddress(
    //     [
    //       anchor.utils.bytes.utf8.encode("counter_account"),
    //       wallet.publicKey.toBytes(),
    //     ],
    //     program.programId
    //   );
    // console.log("Your counter address", counter.toString());
    // const tx = await program.methods
    //   .createCounter()
    //   .accounts({
    //     user: wallet.publicKey,
    //     counterAccount: counter,
    //     systemProgram: systemProgram.programId,
    //   })
    //   .rpc();
    // console.log("Your transaction signature", tx);

    setProgramState({
      program: program,
      counter: counterPubkey,
      count: counter.count.toString(),
    });
  };

  useEffect(() => {
    (async () => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return;
      }
      await setupCounterProgram();
    })();
  }, [wallet]);

  useEffect(() => {
    // console.log("state refreshed");
    (async () => {
      // @ts-ignore
      if (!programState._programId) {
        return;
      }
      console.log("program is setup");
    })();
  }, [programState]);

  console.log(wallet);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>MLH Counter App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="mockup-window border bg-base-300">
          <div className="flex justify-center px-4 py-16 bg-base-200">
            <WalletMultiButton />
            <WalletDisconnectButton />
          </div>
          <div className="flex justify-center px-4 py-16 bg-base-200">
            {programState.counter && (
              <div>
                <p>Count: {programState.count}</p>
                <button
                  onClick={async () => {
                    await increment();
                    await setupCounterProgram();
                  }}
                >
                  Increment
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
