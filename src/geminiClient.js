// ⚠️ API key hardcoded directly in frontend source — see note below
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const GEMINI_MODEL = 'gemini-3.5-flash'

// Sends a question + data context to Gemini and returns the AI's text reply.
// Used by both ChatBot.jsx (employee) and AdminChatBot.jsx (admin) —
// `context` is the big block of attendance/leave data built by buildContext(),
// `question` is whatever the user typed or clicked as a quick-reply.
export async function askGemini(context, question) {
  // Debug log to verify the key is loaded correctly (doesn't print the full key)
  console.log('KEY LENGTH:', GEMINI_API_KEY.length, 'STARTS WITH:', GEMINI_API_KEY.slice(0, 5))

  if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
    throw new Error('API key not set. Add your key in the geminiClient.js file.')
  }

  // Gemini's generateContent endpoint, with the API key passed as a query param
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  // Full prompt: the data context + the user's question + instructions on how
  // to answer (stay on-topic, don't guess, match user's language/style)
  const prompt = `${context}

User's question: "${question}"

Based on the data given above, give a direct, short, and correct answer (in the same language/style the user asked in). If the answer to the question is not in this data, clearly say that this information is not available — never guess or give false information. If the question is about something other than attendance/leave, politely say you can only help with attendance/leave related questions.`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 500 }, // low temperature = more consistent/factual answers
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API error (${res.status}): ${errText}`)
  }

  const data = await res.json()
  // Navigate Gemini's response structure to extract the actual generated text
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('No response received from Gemini')
  }

  return text.trim()
}