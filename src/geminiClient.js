const GEMINI_API_KEY = 'AQ.Ab8RN6J_h_X7Hhr4csE5neBkSyByzQxtR1OQFNsgU-PP2IPeSA'

const GEMINI_MODEL = 'gemini-2.5-flash'

export async function askGemini(context, question) {
  console.log('KEY LENGTH:', GEMINI_API_KEY.length, 'STARTS WITH:', GEMINI_API_KEY.slice(0, 5))
  if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
    throw new Error('API key not set. Add your key in the geminiClient.js file.')
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const prompt = `${context}

User's question: "${question}"

Based on the data given above, give a direct, short, and correct answer (in the same language/style the user asked in). If the answer to the question is not in this data, clearly say that this information is not available — never guess or give false information. If the question is about something other than attendance/leave, politely say you can only help with attendance/leave related questions.`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API error (${res.status}): ${errText}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('No response received from Gemini')
  }

  return text.trim()
}