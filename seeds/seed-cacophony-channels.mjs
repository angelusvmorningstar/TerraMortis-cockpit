// seeds/seed-cacophony-channels.mjs — populate tm_chronicle.cacophony_channels with the
// allow/deny filter applied to every rumour slot before output. Idempotent (upsert by `channel`).
// Content from the suite's downtime-grounding-hardening.md §2.C (audit instance 5).
import { connect } from '../lib/connect.mjs';

const CHANNELS = [
  {
    channel: 'cacophony',
    visible: ['clan', 'covenant', 'public title', 'observable behaviour'],
    invisible: ['bloodline', 'devotions', 'haven specifics', 'Court-private matters'],
    source: 'hardening §2.C (audit instance 5)',
  },
];

async function seedChannels() {
  const conn = await connect();
  try {
    const col = conn.chronicleCollection('cacophony_channels');
    let upserted = 0;
    for (const doc of CHANNELS) {
      await col.updateOne({ channel: doc.channel }, { $set: doc }, { upsert: true });
      upserted += 1;
    }
    console.log(`cacophony_channels: upserted ${upserted} channel(s).`);
  } finally {
    await conn.close();
  }
}

seedChannels().catch((err) => {
  console.error(`Seed FAILED: ${err.message}`);
  process.exit(1);
});
