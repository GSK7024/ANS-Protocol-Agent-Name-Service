/**
 * Wallet Signature Authentication
 * 
 * Verifies that API callers own the wallet they claim to represent.
 * Uses Solana's native signMessage for invisible security UX.
 */

import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Generate a challenge message for wallet signing
 * 
 * @param escrowId - The escrow ID being acted upon
 * @param action - The action being performed (lock, release, refund, etc.)
 * @param timestamp - Unix timestamp for message expiry
 */
export function generateChallengeMessage(
    escrowId: string,
    action: string,
    timestamp: number = Date.now()
): string {
    return `ANS Protocol\nAction: ${action}\nEscrow: ${escrowId}\nTimestamp: ${timestamp}`;
}

/**
 * Verify a wallet signature
 * 
 * @param message - The original message that was signed
 * @param signature - Base58 encoded signature
 * @param publicKey - Wallet public key (address)
 * @returns true if signature is valid
 */
export function verifyWalletSignature(
    message: string,
    signature: string,
    publicKey: string
): { valid: boolean; error?: string } {
    try {
        // Decode signature from base58
        const signatureBytes = bs58.decode(signature);

        // Convert message to Uint8Array
        const messageBytes = new TextEncoder().encode(message);

        // Decode public key
        const pubkeyBytes = new PublicKey(publicKey).toBytes();

        // Verify using nacl
        const isValid = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            pubkeyBytes
        );

        if (!isValid) {
            return { valid: false, error: 'Invalid signature' };
        }

        return { valid: true };
    } catch (err: any) {
        return { valid: false, error: `Signature verification failed: ${err.message}` };
    }
}

/**
 * Verify signature with timestamp check (prevent replay attacks)
 * 
 * @param message - The original message
 * @param signature - Base58 encoded signature
 * @param publicKey - Wallet public key
 * @param maxAgeMs - Maximum age of signature in milliseconds (default: 5 minutes)
 */
export function verifyWalletSignatureWithExpiry(
    message: string,
    signature: string,
    publicKey: string,
    maxAgeMs: number = 5 * 60 * 1000
): { valid: boolean; error?: string } {
    // Extract timestamp from message
    const timestampMatch = message.match(/Timestamp: (\d+)/);
    if (!timestampMatch) {
        return { valid: false, error: 'Message missing timestamp' };
    }

    const messageTimestamp = parseInt(timestampMatch[1]);
    const now = Date.now();

    // Check if message has expired
    if (now - messageTimestamp > maxAgeMs) {
        return { valid: false, error: 'Signature expired' };
    }

    // Verify the actual signature
    return verifyWalletSignature(message, signature, publicKey);
}

/**
 * Check if wallet is authorized for escrow action
 * 
 * @param walletAddress - The wallet making the request
 * @param escrow - The escrow record
 * @param action - The action being performed
 */
export function isWalletAuthorizedForAction(
    walletAddress: string,
    escrow: { buyer_wallet: string; seller_wallet: string | null },
    action: 'lock' | 'confirm' | 'release' | 'refund' | 'dispute'
): { authorized: boolean; error?: string } {
    const wallet = walletAddress.toLowerCase();
    const buyer = escrow.buyer_wallet?.toLowerCase();
    const seller = escrow.seller_wallet?.toLowerCase();

    switch (action) {
        case 'lock':
            // Only buyer can lock funds
            if (wallet !== buyer) {
                return { authorized: false, error: 'Only buyer can lock escrow' };
            }
            break;

        case 'confirm':
            // Only seller can confirm delivery
            if (wallet !== seller) {
                return { authorized: false, error: 'Only seller can confirm delivery' };
            }
            break;

        case 'release':
            // Only buyer can release funds to seller
            if (wallet !== buyer) {
                return { authorized: false, error: 'Only buyer can release funds' };
            }
            break;

        case 'refund':
            // Buyer can request refund, or system auto-refund (no wallet check for auto)
            // For manual refund, must be buyer
            if (wallet !== buyer) {
                return { authorized: false, error: 'Only buyer can request refund' };
            }
            break;

        case 'dispute':
            // Either buyer or seller can open dispute
            if (wallet !== buyer && wallet !== seller) {
                return { authorized: false, error: 'Only buyer or seller can dispute' };
            }
            break;

        default:
            return { authorized: false, error: 'Unknown action' };
    }

    return { authorized: true };
}
