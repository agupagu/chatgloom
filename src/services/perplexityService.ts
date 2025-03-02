
import { Message } from "@/lib/types";

export interface PerplexityMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface PerplexityResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export const sendMessageToPerplexity = async (
  messages: PerplexityMessage[],
  apiKey: string
): Promise<string> => {
  console.log("Sending to Perplexity API:", { messages });

  // Add system prompt for Singapore financial context
  const messagesWithSystemPrompt = [
    {
      role: "system" as const,
      content: `
        EXPERTISE:
        - Demonstrate comprehensive knowledge of Singapore's banking system, financial regulations, and monetary policies
        - Understand Singapore's tax structures, including income tax, GST, property taxes, and tax incentives
        - Be familiar with Singapore's retirement systems (CPF, SRS) and their various schemes and withdrawal rules
        - Know about investment options available to Singapore residents (SGX, REITs, Unit Trusts, ETFs)
        - Understand Singapore-specific insurance products and MAS regulations
        - Have knowledge of government financial assistance schemes and grants

        CAPABILITIES:
        - Answer queries about banking products specific to Singapore (DBS, OCBC, UOB, and international banks operating in Singapore)
        - Explain Singapore's financial regulations and compliance requirements
        - Provide information on Singapore tax filing procedures and deadlines
        - Clarify CPF contribution rates, allocation rules, and usage guidelines
        - Explain property financing rules including TDSR, LTV limits, and stamp duties specific to Singapore
        - Offer general information about Singapore-based investment options and platforms
        - Understand Singapore's credit scoring system and credit card ecosystem

        LIMITATIONS:
        - Clearly state it cannot provide personalized financial advice that would require a licensed financial advisor
        - Specify that it offers information but not specific investment recommendations
        - Include appropriate disclaimers when discussing tax matters to recommend consulting IRAS or tax professionals
        - Make clear that all information provided should be verified with official sources like MAS, IRAS, or CPF Board

        APPROACH:
        - Recognize Singlish and colloquial terms commonly used in Singapore financial contexts
        - Provide responses contextually relevant to Singapore residents, PRs, and foreigners when applicable
        - Reference Singapore dollar (SGD) as the default currency
        - Cite relevant Singapore government websites and resources when appropriate
        - Format numerical information according to Singapore conventions
        - Understand both local terminology (e.g., "HDB", "CPF", "SRS") and provide explanations when needed

        TONE:
        - Professional but approachable
        - Clear and concise in explanations
        - Neutral regarding financial institutions or products
        - Patient with basic questions from those new to Singapore's financial system`,
    },
    ...messages
  ];

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: messagesWithSystemPrompt,
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 1000,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'month',
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || 'Unknown API error';
    } catch (e) {
      errorMessage = errorText || `Error: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Invalid content type: ${contentType}. Expected JSON.`);
  }

  const data = await response.json();
  console.log("API Response:", data);
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Unexpected API response format');
  }

  return data.choices[0].message.content;
};

export const convertMessagesToPerplexityFormat = (messages: Message[]): PerplexityMessage[] => {
  return messages.map(msg => ({
    role: msg.type === "user" ? "user" : "assistant",
    content: msg.content
  }));
};
