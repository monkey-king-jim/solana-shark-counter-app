use anchor_lang::prelude::*;

declare_id!("3f9RGuXLK1qeUgoCcwmMxzoKJBP54Qn75HF3LcCFuaCy");

#[program]
pub mod counterapp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u32) -> Result<()> {
        let my_account = &mut ctx.accounts.my_account;
        my_account.data = data;
        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: u32) -> Result<()> {
        let my_account = &mut ctx.accounts.my_account;
        my_account.data = data;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
    let my_account = &mut ctx.accounts.my_account;
    my_account.data += 1;
    Ok(())
    }

    pub fn decrement(ctx: Context<Decrement>) -> Result<()> {
    let my_account = &mut ctx.accounts.my_account;
    if my_account.data > 0 {
        my_account.data -= 1;
    }
    Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 4)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
}

#[derive(Accounts)]
pub struct Decrement<'info> {
    #[account(mut)]
    pub my_account: Account<'info, MyAccount>,
}

#[account]
pub struct MyAccount {
    pub data: u32,
}