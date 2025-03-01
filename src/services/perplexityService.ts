
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

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages,
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 1000,
      return_images: false,
      return_related_questions: false,
      search_domain_filter: ['perplexity.ai'],
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
