import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, messages } = await req.json();
    
    // Use provided API key or fallback to environment variable
    const key = apiKey || perplexityApiKey;
    
    if (!key) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
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
          ...messages.map((msg: any) => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ],
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

    // First check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        // Try to parse the error as JSON
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || 'Unknown API error';
      } catch (e) {
        // If it's not valid JSON, use the text directly
        errorMessage = errorText || `Error: ${response.status}`;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If response is OK, safely parse the JSON response
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON response from API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return new Response(
        JSON.stringify({ error: 'Unexpected API response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const generatedText = data.choices[0].message.content;
    const citations = data.citations || [];

    // Process the text to replace citation markers with clickable links
    let processedText = generatedText;
    citations.forEach((citation, index) => {
      // Replace [n] with [n](url)
      const marker = `[${index + 1}]`;
      const link = `[${index + 1}](${citation})`;
      processedText = processedText.replace(marker, link);
    });

    return new Response(
      JSON.stringify({ generatedText: processedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat-completion function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
