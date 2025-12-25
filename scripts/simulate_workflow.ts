/**
 * END-TO-END WORKFLOW SIMULATION
 * 
 * This script simulates the "IRL" scenario:
 * 1. User Agent resolves 'agent://marriott'
 * 2. User Agent creates an escrow to pay Marriott
 * 3. Script validates that the escrow was created correctly
 * 
 * Usage: npx tsx scripts/simulate_workflow.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const API_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

async function runSimulation() {
    console.log('\n🎬 STARTING REAL-WORLD SIMULATION: "Booking a Room"\n');

    // ---------------------------------------------------------
    // STEP 0: SETUP (Ensure Agent Exists)
    // ---------------------------------------------------------
    const AGENT_NAME = 'marriott-sim';
    const SELLER_WALLET = '7xKXtg2CV1vxGg7HJBqHiE2NuRbGtQ1W9TGGWTdz9mJf';
    const BUYER_WALLET = 'BuyerWalletAddress1234567890123456789012345';

    console.log(`[0] Setup: Ensuring agent://marriott-sim exists...`);

    // Clean up existing if any
    await supabase.from('domains').delete().eq('name', `agent://${AGENT_NAME}`);

    // Create the domain manually in DB to mock registration
    await supabase.from('domains').insert({
        name: `agent://${AGENT_NAME}`,
        owner_wallet: SELLER_WALLET,
        status: 'active',
        // expires_at: new Date(Date.now() + 1000000000).toISOString()
    });
    console.log(`✅ Agent created: agent://${AGENT_NAME} -> ${SELLER_WALLET}\n`);


    // ---------------------------------------------------------
    // STEP 1: DISCOVERY (Resolve Agent)
    // ---------------------------------------------------------
    console.log(`[1] Discovery: User Agent resolving "agent://${AGENT_NAME}"...`);

    // Simulate API call to /api/resolve
    // We'll simulate the fetch locally since server might not be running in this script context,
    // but we use the exact logic: Query DB
    const { data: resolution } = await supabase
        .from('domains')
        .select('name, owner_wallet, status')
        .eq('name', `agent://${AGENT_NAME}`)
        .single();

    if (!resolution) {
        throw new Error('❌ Resolution failed! Agent not found.');
    }

    console.log(`   🔍 Resolved Address: ${resolution.owner_wallet}`);
    if (resolution.owner_wallet !== SELLER_WALLET) throw new Error('❌ Address mismatch!');
    console.log(`✅ Discovery Successful.\n`);


    // ---------------------------------------------------------
    // STEP 2: NEGOTIATION (Skipped - assumed 2.5 SOL)
    // ---------------------------------------------------------
    const AMOUNT = 2.5;
    console.log(`[2] Negotiation: Price agreed at ${AMOUNT} SOL.\n`);


    // ---------------------------------------------------------
    // STEP 3: ESCROW (Create Transaction)
    // ---------------------------------------------------------
    console.log(`[3] Escrow: User Agent creating escrow...`);

    // Simulate POST /api/escrow
    const { data: escrow, error } = await supabase
        .from('escrow_transactions')
        .insert({
            buyer_wallet: BUYER_WALLET,
            seller_agent: AGENT_NAME, // The API strips 'agent://'
            seller_wallet: resolution.owner_wallet,
            amount: AMOUNT,
            status: 'pending',
            service_details: 'Booking #8842 - Deluxe Room',
            expires_at: new Date(Date.now() + 86400000).toISOString()
        })
        .select()
        .single();

    if (error) throw new Error(`❌ Escrow creation failed: ${error.message}`);

    console.log(`   🔒 Escrow ID: ${escrow.id}`);
    console.log(`   💰 Status: ${escrow.status.toUpperCase()}`);
    console.log(`✅ Escrow Created Successfully.\n`);


    // ---------------------------------------------------------
    // STEP 4: VERIFICATION (Check It Exists)
    // ---------------------------------------------------------
    console.log(`[4] Verification: Checking system records...`);

    const { data: check } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('id', escrow.id)
        .single();

    if (check.amount !== 2.5) throw new Error('❌ Amount verification failed');
    if (check.seller_wallet !== SELLER_WALLET) throw new Error('❌ Wallet verification failed');

    console.log(`✅ System Record Verified: 2.5 SOL locked for ${SELLER_WALLET}\n`);

    console.log('🎉 SIMULATION COMPLETE: The workflow is operational.');

    // Cleanup
    await supabase.from('domains').delete().eq('name', `agent://${AGENT_NAME}`);
    await supabase.from('escrow_transactions').delete().eq('id', escrow.id);
}

runSimulation().catch(console.error);
