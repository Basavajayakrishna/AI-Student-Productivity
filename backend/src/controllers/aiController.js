/**
 * POST /api/ai/chat
 * Handles conversational queries with the AI Tutor using OpenRouter
 */
const chatWithTutor = async (req, res) => {
  try {
    const { message } = req.body

    // Validate that message is present and non-empty
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Message is required and cannot be empty.',
      })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return res.status(500).json({
        status: 'error',
        message: 'OpenRouter API key is not configured on the server. Please set OPENROUTER_API_KEY in your .env file.',
      })
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'user',
            content: message.trim(),
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('OpenRouter API error response:', data?.error?.message || data?.error || response.statusText)
      return res.status(500).json({
        status: 'error',
        message: data?.error?.message || 'Failed to process AI tutor request.',
      })
    }

    const aiMessage = data?.choices?.[0]?.message?.content || ''

    return res.status(200).json({
      status: 'success',
      message: aiMessage,
    })
  } catch (error) {
    console.error('AI Tutor error:', error.message)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process AI tutor request.',
    })
  }
}

/**
 * POST /api/ai/study-plan
 * Generates a structured study schedule using OpenRouter
 */
const generateStudyPlan = async (req, res) => {
  try {
    const {
      subjects,
      examDate,
      studyHoursPerDay,
      weakSubjects,
      preferredStudyTime,
      additionalInstructions,
    } = req.body

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide at least one subject.',
      })
    }

    if (!examDate) {
      return res.status(400).json({
        status: 'fail',
        message: 'Exam date is required.',
      })
    }

    const hours = Number(studyHoursPerDay) || 3

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return res.status(500).json({
        status: 'error',
        message: 'OpenRouter API key is not configured on the server. Please set OPENROUTER_API_KEY in your .env file.',
      })
    }

    const prompt = `You are an expert AI Academic Coach and Study Planner. Generate a realistic, highly personalized study plan based on the following student details:

- Subjects to prepare: ${subjects.join(', ')}
- Target Exam Date: ${examDate}
- Available Study Hours Per Day: ${hours} hour(s)
- Weak Subjects (need higher priority/more time): ${weakSubjects && weakSubjects.length > 0 ? weakSubjects.join(', ') : 'None specified'}
- Preferred Study Time: ${preferredStudyTime || 'Flexible'}
- Additional Schedule Constraints / Instructions: ${additionalInstructions || 'None'}

Requirements:
1. Break down study time into focused 45-90 minute sessions with clear, actionable topics and goals.
2. Allocate significantly more time and earlier sessions to the weak subjects.
3. Include revision sessions and practice/testing sessions.
4. Align session start and end times with the student's preferred study time (${preferredStudyTime || 'Flexible'}) and respect any additional constraints.
5. Provide a realistic plan with 3 to 7 structured daily schedules leading toward the exam date.
6. Return the response STRICTLY as a valid JSON object with the following structure:
{
  "summary": "Brief 2-3 sentence overview of the study strategy and milestones",
  "daily_plan": [
    {
      "date": "YYYY-MM-DD",
      "day": "Day of the week (e.g. Monday)",
      "sessions": [
        {
          "start_time": "HH:MM",
          "end_time": "HH:MM",
          "subject": "Subject Name",
          "topic": "Specific Topic Name",
          "duration_minutes": 60,
          "goal": "Measurable goal for this session"
        }
      ]
    }
  ]
}

CRITICAL: Return ONLY raw, valid JSON. Do NOT include markdown code blocks (such as \`\`\`json or \`\`\`), conversational text, or explanations.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          {
            role: 'system',
            content: 'You are an AI study planner that outputs ONLY valid JSON matching the requested schema. No conversational chatter or markdown fences.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('OpenRouter Study Planner error response:', data?.error?.message || data?.error || response.statusText)
      return res.status(500).json({
        status: 'error',
        message: data?.error?.message || 'Failed to generate study plan from AI.',
      })
    }

    const rawContent = data?.choices?.[0]?.message?.content || ''

    if (!rawContent) {
      return res.status(500).json({
        status: 'error',
        message: 'No response received from AI model.',
      })
    }

    // Clean and parse JSON
    let cleaned = rawContent.trim()
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    } else {
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1)
      }
    }

    let parsedPlan
    try {
      parsedPlan = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('Study Planner JSON parse failed:', parseErr.message, 'Raw content snippet:', rawContent.slice(0, 300))
      return res.status(500).json({
        status: 'error',
        message: 'AI returned an invalid plan format. Please try generating again.',
      })
    }

    return res.status(200).json({
      status: 'success',
      plan: parsedPlan,
    })
  } catch (error) {
    console.error('Study Planner error:', error.message)
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process study plan request.',
    })
  }
}

module.exports = {
  chatWithTutor,
  generateStudyPlan,
}


