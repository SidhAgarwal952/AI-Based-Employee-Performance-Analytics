/**
 * OpenRouter AI Service for Employee Analytics
 * Processes employees to generate promotions, constructive feedback, 
 * department/cohort rankings, and custom training suggestions.
 * Includes a robust offline recruitment solver that handles all UI actions instantly.
 */

const getAIRecommendations = async (employees, options = {}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  const scope = options.scope || 'cohort';

  // 1. Trigger offline recruiter engine if no key is configured
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_key')) {
    console.log('ℹ️  No OpenRouter API Key detected. Utilizing local offline reasoning engine.');
    return generateOfflineRecommendations(employees, scope);
  }

  // 2. Prepare prompt payload
  const employeesData = employees.map((emp, idx) => {
    return `${idx + 1}. Name: ${emp.name}
    Email: ${emp.email}
    Department: ${emp.department}
    Skills: ${emp.skills.join(', ')}
    Experience: ${emp.experience} years
    Performance Score: ${emp.performanceScore}/100`;
  }).join('\n\n');

  const systemPrompt = `You are a world-class AI Chief Human Resources Officer (CHRO) and performance analytics system.
Your job is to analyze employee performance, rank them, and provide specific, actionable recommendations.

You MUST respond with a raw JSON object containing three fields:
1. "summary": A high-level professional evaluation summary of the employee(s) (2-3 sentences).
2. "recommendations": An array of specific, tailored recommendations.
3. "rankedList": An array of employees ranked based on their overall career suitability (score, experience, skills).

The output must be pure JSON. Do not include any conversational text, explanations, or Markdown code fences (e.g. \`\`\`json). The output must be directly parseable by JSON.parse().

JSON Schema Details:
{
  "summary": "Overall cohort performance review or single employee growth synopsis.",
  "recommendations": [
    {
      "type": "promotion" | "feedback" | "training",
      "employeeName": "Employee's exact name",
      "employeeEmail": "Employee's exact email",
      "recommendationText": "Core high-level summary recommendation.",
      "details": "For promotion: Suggest next job title (e.g. Senior Developer, Team Lead) and timeline. For feedback: Constructive advice. For training: Specifically recommend 1-2 actual courses (e.g., 'Docker Mastery on Udemy' or 'Google Cloud Architecture on Coursera') and required modern skills to learn."
    }
  ],
  "rankedList": [
    {
      "name": "Employee's exact name",
      "email": "Employee's exact email",
      "department": "Employee's exact department",
      "aiScore": 92, // An integer score between 0 and 100 representing overall contribution
      "tier": "Star Performer" | "Strong Performer" | "Needs Training & Support",
      "feedback": "A concise 1-2 sentence professional recruiter comment explaining this ranking and their potential."
    }
  ]
}

Ensure that:
- High performers (performance score >= 80) get "promotion" recommendation types.
- Underperformers (performance score < 70) get "feedback" recommendation types emphasizing performance restoration.
- Employees missing advanced modern tools get "training" recommendations with actual course titles.
- The rankedList is sorted in descending order of "aiScore".`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'AI Employee Performance Analytics System'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Here are the employees to analyze:\n\n${employeesData}`
          }
        ],
        temperature: 0.2 // Low temperature for high structural consistency
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with status ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    // Remove code fences if LLM returns them
    if (content.startsWith('```')) {
      content = content.replace(/^```json/i, '').replace(/```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(content);
      // Validate schema has required attributes
      if (parsed.summary && Array.isArray(parsed.recommendations) && Array.isArray(parsed.rankedList)) {
        return parsed;
      }
      throw new Error('AI Response did not match the required schema fields.');
    } catch (parseErr) {
      console.error('Failed to parse AI response content:', content);
      throw new Error('AI returned an invalid JSON schema. Falling back.');
    }
  } catch (err) {
    console.error('OpenRouter live integration failed:', err.message);
    console.log('🔄 Triggering safe offline fallback...');
    return generateOfflineRecommendations(employees, scope);
  }
};

/**
 * Deterministic recruiter engine to simulate HR analyst reasoning.
 * Yields highly realistic suggestions, course names, and ranked metrics.
 */
function generateOfflineRecommendations(employees, scope) {
  const rankedList = employees.map(emp => {
    // Custom mathematical score: 70% performance score + 30% experience weighting
    const expFactor = Math.min(emp.experience * 3, 30);
    const rawScore = (emp.performanceScore * 0.7) + expFactor;
    const aiScore = Math.max(10, Math.min(100, Math.round(rawScore)));

    let tier = 'Strong Performer';
    let feedback = '';

    if (emp.performanceScore >= 80) {
      tier = 'Star Performer';
      feedback = `${emp.name} displays exemplary dedication with a performance score of ${emp.performanceScore}%. They possess strong technical capabilities in ${emp.skills.slice(0, 2).join(' & ')} and are primed for expanded leadership responsibilities.`;
    } else if (emp.performanceScore < 70) {
      tier = 'Needs Training & Support';
      feedback = `${emp.name} is currently facing delivery lags (Score: ${emp.performanceScore}%). They have valuable baseline experience (${emp.experience} years) but require structured skill alignment and closer mentorship to hit core KPIs.`;
    } else {
      tier = 'Strong Performer';
      feedback = `${emp.name} is a reliable team asset with solid core metrics. They show a consistent application of ${emp.skills.join(', ') || 'their primary skills'} and possess the potential to level up with targeted learning tracks.`;
    }

    return {
      name: emp.name,
      email: emp.email,
      department: emp.department,
      aiScore,
      tier,
      feedback
    };
  });

  // Sort cohort by computed aiScore descending
  rankedList.sort((a, b) => b.aiScore - a.aiScore);

  // Generate recommendations
  const recommendations = [];
  employees.forEach(emp => {
    // 1. Check for promotion (High Performer)
    if (emp.performanceScore >= 80) {
      const nextRole = emp.experience >= 5 ? `Principal Specialist / Lead Engineer` : `Senior Associate / Senior Engineer`;
      recommendations.push({
        type: 'promotion',
        employeeName: emp.name,
        employeeEmail: emp.email,
        recommendationText: `Expedite Promotion to ${nextRole}`,
        details: `${emp.name} consistently operates at a high level. We recommend promoting them to ${nextRole} within the next 3 months. Provide an active leadership mentor and clear ownership of a high-impact project route.`
      });
    }

    // 2. Check for constructive feedback (Low Performer)
    if (emp.performanceScore < 70) {
      recommendations.push({
        type: 'feedback',
        employeeName: emp.name,
        employeeEmail: emp.email,
        recommendationText: 'Enroll in Performance Recovery Plan',
        details: `${emp.name} has a performance index of ${emp.performanceScore}%. Implement a 60-day performance improvement plan focusing on objective milestones. Schedule bi-weekly feedback reviews with the department head.`
      });
    }

    // 3. Training suggestion based on their current stack
    const skillsLower = emp.skills.map(s => s.toLowerCase());
    let courseName = 'Cloud Architecture on Coursera';
    let missingSkill = 'AWS / Cloud Engineering';

    if (!skillsLower.includes('react') && !skillsLower.includes('frontend')) {
      courseName = 'React - The Complete Guide on Udemy';
      missingSkill = 'React Frontend development';
    } else if (!skillsLower.includes('node') && !skillsLower.includes('node.js') && !skillsLower.includes('backend')) {
      courseName = 'Node.js, Express & MongoDB Masterclass';
      missingSkill = 'Node.js Backend integrations';
    } else if (!skillsLower.includes('docker') && !skillsLower.includes('kubernetes') && !skillsLower.includes('devops')) {
      courseName = 'Docker and Kubernetes: The Complete Guide';
      missingSkill = 'DevOps & Containerization';
    }

    recommendations.push({
      type: 'training',
      employeeName: emp.name,
      employeeEmail: emp.email,
      recommendationText: `Upskill in ${missingSkill}`,
      details: `To boost productivity and bridge operational gaps, ${emp.name} should complete the course "${courseName}" over the next 45 days. This will strengthen their architectural alignment with modern stack requirements.`
    });
  });

  // Compose general synopses
  let summary = '';
  if (scope === 'single') {
    const emp = employees[0];
    summary = `Performance profile evaluation for ${emp.name} (${emp.department} Dept). With ${emp.experience} years in the industry and a performance score of ${emp.performanceScore}%, their current career trajectory points towards tailored upskilling and targeted growth plans.`;
  } else {
    const stars = employees.filter(e => e.performanceScore >= 80).length;
    summary = `Cohort analysis of ${employees.length} employee(s) across departments. The group maintains a healthy distribution of capability, with ${stars} standout performer(s) positioned for leadership roles and others receiving dedicated training pathways.`;
  }

  return {
    summary,
    recommendations,
    rankedList
  };
}

module.exports = { getAIRecommendations };
