// lib/assemble-channel-rules.mjs — read tm_chronicle.cacophony_channels into a pack section.
// Optional pre-opened `chronicle` (see assemble-glossary.mjs for the pattern).
import { connect } from './connect.mjs';

export async function assembleChannelRules(chronicle) {
  const own = !chronicle;
  const conn = chronicle || (await connect());
  try {
    const docs = await conn.chronicleCollection('cacophony_channels').find({}).toArray();
    if (!docs.length) {
      return { title: 'Channel Rules (Cacophony)', channels: [], gap: '[no channel rules on record]' };
    }
    const channels = docs
      .map((d) => ({ channel: d.channel, visible: d.visible || [], invisible: d.invisible || [] }))
      .sort((a, b) => String(a.channel).localeCompare(String(b.channel)));
    return { title: 'Channel Rules (Cacophony)', channels };
  } finally {
    if (own) await conn.close();
  }
}
