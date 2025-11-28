import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface SymptomAnalysis {
  emergencyLevel: 'low' | 'medium' | 'high';
  predictions: Array<{
    disease: string;
    confidence: number;
    description: string;
  }>;
  recommendations: string;
  shouldSeeDoctor: boolean;
  shouldCallEmergency: boolean;
}

export interface ChatResponse {
  message: string;
  analysis?: SymptomAnalysis;
  followupQuestions?: string[];
}

export async function analyzeSymptoms(
  symptoms: string[],
  duration: string,
  severity: number,
  additionalContext?: string
): Promise<SymptomAnalysis> {
  try {
    const prompt = `
      As a medical AI assistant, analyze the following symptoms:
      - Symptoms: ${symptoms.join(', ')}
      - Duration: ${duration}
      - Severity (1-10): ${severity}
      - Additional context: ${additionalContext || 'None'}
      
      Provide a comprehensive analysis in JSON format with:
      - emergencyLevel: 'low', 'medium', or 'high'
      - predictions: array of possible conditions with confidence scores (0-100)
      - recommendations: detailed advice for the patient
      - shouldSeeDoctor: boolean
      - shouldCallEmergency: boolean
      
      Be conservative with emergency assessments and always recommend professional medical advice when uncertain.
    `;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant. Always prioritize patient safety and recommend professional medical care when appropriate. Provide responses in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    return analysis;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw new Error('Failed to analyze symptoms');
  }
}

export async function generateChatResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
): Promise<ChatResponse> {
  try {
    const messages = [
      {
        role: "system" as const,
        content: "You are an empathetic AI health assistant named HealthConnect AI. Help users with health-related questions, analyze symptoms, and provide preliminary medical guidance. Always recommend professional medical care for serious concerns. Be supportive and understanding. If symptoms suggest an emergency, clearly state this and recommend immediate medical attention."
      },
      ...conversationHistory,
      {
        role: "user" as const,
        content: userMessage
      }
    ];

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: messages,
    });

    const chatResponse: ChatResponse = {
      message: response.choices[0].message.content || "I'm sorry, I couldn't process your message. Please try again.",
    };

    // If the message contains symptoms, provide additional analysis
    const symptomsKeywords = ['pain', 'headache', 'fever', 'nausea', 'dizzy', 'cough', 'tired', 'fatigue', 'hurt', 'ache'];
    if (symptomsKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      chatResponse.followupQuestions = [
        "How long have you been experiencing these symptoms?",
        "On a scale of 1-10, how severe is your discomfort?",
        "Have you taken any medication for this?",
        "Do you have any other symptoms I should know about?"
      ];
    }

    return chatResponse;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate response');
  }
}

export async function recommendHealthProducts(
  symptoms: string[],
  predictions: Array<{ disease: string; confidence: number }>
): Promise<string[]> {
  try {
    const prompt = `
      Based on these symptoms: ${symptoms.join(', ')} and possible conditions: ${predictions.map(p => p.disease).join(', ')},
      recommend relevant health products that might help. Consider:
      - Over-the-counter medications
      - Medical devices (thermometers, blood pressure monitors)
      - Supplements and vitamins
      - First aid supplies
      - Comfort items
      
      Return only product names/categories as a JSON array of strings.
    `;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a healthcare product recommendation AI. Suggest only safe, over-the-counter products and general health items. Always remind users to consult healthcare professionals."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.products || [];
  } catch (error) {
    console.error('Error recommending products:', error);
    return [];
  }
}
