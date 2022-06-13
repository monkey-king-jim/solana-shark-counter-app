use anchor_lang::prelude::*;

declare_id!("8UCFsbJjuTzUimm4g9TuVooR3dKEC7MNV8wyqZp8TEKH");


//Data logics
#[program]
pub mod counterapp {
    use super::*;

    pub fn create_counter(ctx: Context<CreateCounter>) -> Result<()> {
        let counter_account = &mut ctx.accounts.counter_account;
        counter_account.authority = ctx.accounts.user.key();
        counter_account.count = 0;
        Ok(())
    }

    pub fn update(ctx: Context<Update>, count: u32) -> Result<()> {
        let counter_account = &mut ctx.accounts.counter_account;
        counter_account.count = count;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
    let counter_account = &mut ctx.accounts.counter_account;
    counter_account.count = counter_account.count.checked_add(1).unwrap();
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

// data validators

#[derive(Accounts)]
pub struct CreateCounter<'info> {
    // space: 32 public key + 8 discrimator + 4 count size + 1 bump
    #[account(
        init, 
        payer = user, 
        space = 32 + 8 + 4 + 1, 
        seeds = [b"counter_account", user.key().as_ref()], 
        bump
    )]
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


// data structures
#[account]
pub struct CounterAccount {
    authority: Pubkey,
    pub count: u32,
}