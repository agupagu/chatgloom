
import React from "react";
import { cn } from "@/lib/utils";

export type MessageType = "user" | "ai";

interface ChatMessageProps {
  content: string;
  type: MessageType;
  isLoading?: boolean;
  citations?: string[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, type, isLoading = false, citations = [] }) => {
  // Function to replace citation references with hyperlinks
  const renderContentWithCitations = (text: string) => {
    if (!citations || citations.length === 0) return text;

    // Create a regex pattern to match citation references like [1], [2], etc.
    const citationRegex = /\[(\d+)\]/g;
    
    // Split the content by citation references and create an array of parts
    const parts = text.split(citationRegex);
    
    // Find all citation references
    const references = text.match(citationRegex) || [];
    
    // Return the content with hyperlinked citations
    return parts.map((part, index) => {
      // Even indices are text content
      if (index % 2 === 0) {
        return part;
      } else {
        // Odd indices are citation numbers
        const citationIndex = parseInt(part) - 1;
        if (citationIndex >= 0 && citationIndex < citations.length) {
          return (
            <a 
              key={`citation-${index}`}
              href={citations[citationIndex]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              [{part}]
            </a>
          );
        }
        return `[${part}]`;
      }
    });
  };

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
          <p className="whitespace-pre-wrap">
            {type === "ai" && citations && citations.length > 0 
              ? renderContentWithCitations(content)
              : content
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
