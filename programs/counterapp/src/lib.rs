use anchor_lang::prelude::*;

declare_id!("3f9RGuXLK1qeUgoCcwmMxzoKJBP54Qn75HF3LcCFuaCy");

#[program]
pub mod counterapp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, count: u32) -> Result<()> {
        let counter_account = &mut ctx.accounts.counter_account;
        counter_account.count = count;
        Ok(())
    }

    pub fn update(ctx: Context<Update>, count: u32) -> Result<()> {
        let counter_account = &mut ctx.accounts.counter_account;
        counter_account.count = count;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
    let counter_account = &mut ctx.accounts.counter_account;
    counter_account.count += 1;
    Ok(())
    }

    pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
    let counter_account = &mut ctx.accounts.counter_account;
    if counter_account.count > 0 {
        counter_account.count -= 1;
    }
    Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 4)]
    pub counter_account: Account<'info, CounterAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub counter_account: Account<'info, CounterAccount>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter_account: Account<'info, CounterAccount>,
}

#[derive(Accounts)]
pub struct Decrement<'info> {
    #[account(mut)]
    pub counter_account: Account<'info, CounterAccount>,
}

#[account]
pub struct CounterAccount {
    pub count: u32,
}