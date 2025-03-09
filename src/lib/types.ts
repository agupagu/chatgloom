
export interface Message {
  id: string;
  content: string;
  type: "user" | "ai";
  citations?: string[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}
