import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import { Message, ChatState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const ChatApp: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });
  
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("perplexity-api-key") || "";
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("perplexity-api-key", apiKey);
    } else {
      localStorage.removeItem("perplexity-api-key");
    }
  }, [apiKey]);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Generate unique IDs
    const userMessageId = uuidv4();
    const aiMessageId = uuidv4();

    // Add user message
    const userMessage: Message = { id: userMessageId, content, type: "user" };
    
    // Update state with user message and AI loading message
    setChatState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages, 
        userMessage,
        { id: aiMessageId, content: "", type: "ai" }
      ],
      isLoading: true,
    }));

    try {
      // Prepare conversation history - use all messages except the empty AI message we just added
      const currentMessages = [...chatState.messages, userMessage].filter(msg => 
        !(msg.id === aiMessageId || msg.content === "")
      );

      const messagesForApi = currentMessages.map(msg => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content
      }));

      console.log("Sending to Perplexity API:", {
        messages: messagesForApi
      });

      // Call Perplexity API directly instead of through a server endpoint
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: messagesForApi,
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
          // If it's not valid JSON, use the text directly
          errorMessage = errorText || `Error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // First check if we got a valid JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid content type: ${contentType}. Expected JSON.`);
      }

      const data = await response.json();
      console.log("API Response:", data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Unexpected API response format');
      }

      const generatedText = data.choices[0].message.content;

      // Update AI message with received content
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: generatedText }
            : msg
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to communicate with Perplexity"
      );
      
      // Remove the loading AI message
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.filter((msg) => msg.id !== aiMessageId),
        isLoading: false,
      }));
    }
  };

  const handleClearChat = () => {
    setChatState({
      messages: [],
      isLoading: false,
    });
  };

  return (
    <div className="flex flex-col h-full p-4 relative">
      <ApiKeyDialog apiKey={apiKey} onApiKeyChange={setApiKey} />
      
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-center flex-grow">PerplexChat</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={handleClearChat}
          className="text-muted-foreground hover:text-foreground"
          disabled={chatState.messages.length === 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin mb-4 pr-2">
        {chatState.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="mb-2">Welcome to PerplexChat</p>
              <p className="text-sm">Start a conversation by typing a message below.</p>
            </div>
          </div>
        ) : (
          // Use a unique ID for each message - the message's own ID
          chatState.messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              type={message.type}
              isLoading={chatState.isLoading && message.content === ""}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-auto">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={chatState.isLoading || !apiKey}
        />
        {!apiKey && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Please set your Perplexity API key in settings to start chatting.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
