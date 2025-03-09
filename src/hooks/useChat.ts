
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Message, ChatState } from "@/lib/types";
import {
  sendMessageToPerplexity,
  convertMessagesToPerplexityFormat
} from "@/services/perplexityService";

export const useChat = (apiKey: string) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });

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

      const messagesForApi = convertMessagesToPerplexityFormat(currentMessages);
      
      const result = await sendMessageToPerplexity(messagesForApi, apiKey);

      // Update AI message with received content and citations
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, content: result.content, citations: result.citations }
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

  const clearChat = () => {
    setChatState({
      messages: [],
      isLoading: false,
    });
  };

  return {
    chatState,
    handleSendMessage,
    clearChat
  };
};
