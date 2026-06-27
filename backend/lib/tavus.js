const TAVUS_API_URL = 'https://tavusapi.com/v2/conversations';

function resolveIdentity() {
  const palId = process.env.TAVUS_PAL_ID;
  const faceId = process.env.TAVUS_FACE_ID || process.env.TAVUS_REPLICA_ID;

  if (!palId && !faceId) {
    throw new Error('Set TAVUS_PAL_ID and/or TAVUS_FACE_ID (or TAVUS_REPLICA_ID) in .env');
  }

  return {
    ...(palId ? { pal_id: palId } : {}),
    ...(faceId ? { face_id: faceId } : {}),
  };
}

async function createConversation({
  conversationName,
  conversationalContext,
  customGreeting,
  testMode = false,
}) {
  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) {
    throw new Error('TAVUS_API_KEY must be set in .env');
  }

  const payload = {
    ...resolveIdentity(),
    conversation_name: conversationName,
    conversational_context: conversationalContext,
    ...(customGreeting ? { custom_greeting: customGreeting } : {}),
    ...(testMode ? { test_mode: true } : {}),
  };

  const response = await fetch(TAVUS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.message || data.error || JSON.stringify(data);
    throw new Error(`Tavus API error (${response.status}): ${detail}`);
  }

  return data;
}

/** End a live conversation and free a Tavus concurrency slot. */
async function endConversation(conversationId) {
  const apiKey = process.env.TAVUS_API_KEY;
  if (!apiKey) {
    throw new Error('TAVUS_API_KEY must be set in .env');
  }
  if (!conversationId || typeof conversationId !== 'string') {
    throw new Error('conversationId is required');
  }

  const response = await fetch(`${TAVUS_API_URL}/${conversationId}/end`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
  });

  if (response.ok || response.status === 204) {
    return { ok: true };
  }

  const data = await response.json().catch(() => ({}));
  const detail = data.message || data.error || JSON.stringify(data);
  throw new Error(`Tavus end error (${response.status}): ${detail}`);
}

module.exports = {
  TAVUS_API_URL,
  resolveIdentity,
  createConversation,
  endConversation,
};
