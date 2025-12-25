# ANS Registry Smart Contract - Audit Preparation

## Contract Overview

**Program ID:** `ANSregXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (placeholder)
**Framework:** Anchor v0.29+
**Language:** Rust
**Lines of Code:** ~270
**Last Updated:** December 2024

---

## Contract Functions

| Function | Description | Risk Level |
|----------|-------------|------------|
| `register_domain` | Creates new domain PDA | Medium |
| `transfer_domain` | Changes owner, clears listing | Low |
| `update_endpoint` | Updates API URL | Low |
| `list_for_sale` | Lists domain on marketplace | Low |
| `unlist` | Removes from marketplace | Low |
| `buy_domain` | Atomic swap SOL for domain | High |
| `renew_domain` | Extends expiry by 1 year | Low |

---

## Security Considerations

### ✅ Implemented Correctly

1. **PDA Seeds:** Domain accounts are PDAs seeded by name, preventing duplicates
2. **Owner Validation:** `has_one = owner` constraint on update operations
3. **Atomic Transfers:** Buy function transfers SOL and ownership atomically
4. **Input Validation:** Name length (3-32) and endpoint length (256) validated
5. **Bump Storage:** PDA bump stored for efficient re-derivation

### ⚠️ Potential Areas for Review

1. **No Expiry Check on Buy:**
   - `buy_domain` doesn't verify domain hasn't expired
   - Buyer could purchase expired domain
   - **Recommendation:** Add expiry validation

2. **No Payment to Protocol:**
   - All SOL goes directly to seller
   - No protocol fee mechanism
   - **Recommendation:** Add optional fee if desired

3. **Renewal Payment:**
   - `renew_domain` doesn't charge renewal fee
   - Anyone who owns domain can renew for free
   - **Recommendation:** Add payment requirement

4. **No Grace Period:**
   - Domain immediately expires at `expires_at`
   - No grace period for late renewal
   - **Recommendation:** Consider grace period logic

5. **Seller CHECK Account:**
   - Line 220: `/// CHECK: Seller is validated via domain.owner`
   - Constraint exists but verify it's sufficient

---

## Recommended Fixes Before Audit

```rust
// 1. Add expiry check to buy_domain
pub fn buy_domain(ctx: Context<BuyDomain>, _name: String) -> Result<()> {
    let domain = &mut ctx.accounts.domain;
    let clock = Clock::get()?;
    
    require!(domain.is_listed, AnsError::NotForSale);
    require!(domain.expires_at > clock.unix_timestamp, AnsError::DomainExpired); // ADD THIS
    
    // ... rest of function
}

// 2. Add protocol fee (optional)
const PROTOCOL_FEE_BPS: u64 = 250; // 2.5%

let fee = price.checked_mul(PROTOCOL_FEE_BPS).unwrap() / 10000;
let seller_amount = price.checked_sub(fee).unwrap();

// Transfer fee to protocol treasury
// Transfer seller_amount to seller

// 3. Add renewal payment
pub fn renew_domain(
    ctx: Context<RenewDomain>,
    _name: String,
) -> Result<()> {
    let renewal_cost = 100_000_000; // 0.1 SOL in lamports
    
    // Transfer to treasury
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: ctx.accounts.owner.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        },
    );
    anchor_lang::system_program::transfer(cpi_context, renewal_cost)?;
    
    // Extend expiry
    // ...
}
```

---

## Audit Vendors (Recommended)

| Vendor | Specialty | Est. Cost | Timeline |
|--------|-----------|-----------|----------|
| **OtterSec** | Solana-focused | $15-30k | 2-4 weeks |
| **Neodyme** | Anchor expert | $10-20k | 2-3 weeks |
| **Sec3** | Automated + manual | $8-15k | 1-2 weeks |
| **Trail of Bits** | Premium tier | $50k+ | 4-6 weeks |

**Recommendation:** OtterSec or Neodyme for Solana-native expertise.

---

## Pre-Audit Checklist

- [ ] Fix expiry check in `buy_domain`
- [ ] Add renewal payment mechanism
- [ ] Consider protocol fee implementation
- [ ] Add comprehensive unit tests
- [ ] Document all functions
- [ ] Prepare test coverage report
- [ ] Set up devnet deployment for auditors
- [ ] Create threat model document

---

## Test Commands

```bash
# Build
anchor build

# Test
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

---

## Contact for Audit

**Project:** ANS Protocol
**Website:** https://ans.dev
**GitHub:** https://github.com/ans-protocol
**Email:** security@ans.dev
