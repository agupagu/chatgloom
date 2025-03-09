
import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ApiKeyDialog from "@/components/ApiKeyDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";

const ChatApp: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("perplexity-api-key") || "";
  });
  
  const { chatState, handleSendMessage, clearChat } = useChat(apiKey);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("perplexity-api-key", apiKey);
    } else {
      localStorage.removeItem("perplexity-api-key");
    }
  }, [apiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatState.messages]);

  return (
    <div className="flex flex-col h-full p-4 relative">
      <ApiKeyDialog apiKey={apiKey} onApiKeyChange={setApiKey} />
      
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-center flex-grow">SgFinance AI Chatbot</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={clearChat}
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
          chatState.messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              type={message.type}
              citations={message.citations}
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
