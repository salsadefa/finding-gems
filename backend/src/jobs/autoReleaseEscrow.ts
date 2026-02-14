// ============================================
// Escrow Auto-Release Job - Finding Gems Backend
// Releases held escrow after 7 days
// ============================================

import { supabase } from '../config/supabase';

async function recalcCreatorBalance(creatorId: string) {
  await supabase.rpc('recalculate_creator_balance', { p_creator_id: creatorId });
}

async function main() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  console.log('[Escrow Cron] Starting auto-release job', { cutoff });

  const { data: heldOrders, error: selectError } = await supabase
    .from('orders')
    .select('id, creator_id')
    .eq('status', 'paid')
    .eq('escrow_status', 'held')
    .lte('paid_at', cutoff)
    .limit(1000);

  if (selectError) {
    console.error('[Escrow Cron] Failed to select held orders', selectError);
    process.exitCode = 1;
    return;
  }

  const orders = heldOrders || [];
  if (orders.length === 0) {
    console.log('[Escrow Cron] No orders to release');
    return;
  }

  const orderIds = orders.map((o: any) => o.id);
  const creatorIds = Array.from(new Set(orders.map((o: any) => o.creator_id).filter(Boolean)));

  console.log('[Escrow Cron] Releasing orders', { count: orderIds.length, creators: creatorIds.length });

  const { error: updateError } = await supabase
    .from('orders')
    .update({
      escrow_status: 'released',
      escrow_released_at: new Date().toISOString(),
      escrow_release_reason: 'auto_release_7days',
      updated_at: new Date().toISOString(),
    })
    .in('id', orderIds);

  if (updateError) {
    console.error('[Escrow Cron] Failed to update orders', updateError);
    process.exitCode = 1;
    return;
  }

  for (const creatorId of creatorIds) {
    try {
      await recalcCreatorBalance(creatorId);
    } catch (err) {
      console.error('[Escrow Cron] Failed to recalc creator balance', { creatorId, err });
      process.exitCode = 1;
    }
  }

  console.log('[Escrow Cron] Completed');
}

main().catch((err) => {
  console.error('[Escrow Cron] Fatal error', err);
  process.exit(1);
});
