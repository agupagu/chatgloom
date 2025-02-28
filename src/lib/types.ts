
export interface Message {
  id: string;
  content: string;
  type: "user" | "ai";
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}
