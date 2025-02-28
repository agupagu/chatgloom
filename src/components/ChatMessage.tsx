
import React from "react";
import { cn } from "@/lib/utils";

export type MessageType = "user" | "ai";

interface ChatMessageProps {
  content: string;
  type: MessageType;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, type, isLoading = false }) => {
  return (
    <div
      className={cn(
        "my-2 max-w-[80%]",
        type === "user" ? "ml-auto" : "mr-auto"
      )}
    >
      <div
        className={cn(
          "break-words",
          type === "user" ? "chat-bubble-user" : "chat-bubble-ai"
        )}
      >
        {isLoading ? (
          <div className="flex space-x-1 items-center justify-center h-6 w-12">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse-subtle"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-pulse-subtle delay-75"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-pulse-subtle delay-150"></div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
