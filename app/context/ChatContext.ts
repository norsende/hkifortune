import { createContext, useContext } from "react";

type ChatMode = 'aimo_chat' | 'nurse_visit';

// Define the shape of your context state
export interface ChatState {
    mode: ChatMode;
    customer_comments: string[];
    aimo_comments: string[];
}

// Define the shape of the context value
export interface ChatContextValue {
    chatState: ChatState;
    updateChatState: (newState: Partial<ChatState>) => void;
    addAimoComment: (comment: string) => void;
    currentLanguage: 'fi-FI' | 'en-US'; // Lisää tämä
    setCurrentLanguage: (language: 'fi-FI' | 'en-US') => void; // Lisää tämä
}

// Initial state
export const initialState: ChatState = {
    mode: 'aimo_chat',
    customer_comments: [],
    aimo_comments: [],
};

// Create the context with the appropriate type
export const ChatContext = createContext<ChatContextValue>({
    chatState: initialState,
    updateChatState: (newState: Partial<ChatState>) => {},
    addAimoComment: (comment: string) => {},
    currentLanguage: 'fi-FI', // Oletuskieli
    setCurrentLanguage: (language: 'fi-FI' | 'en-US') => {}, // Tyhjä funktio oletuksena
});

export const useChatContext = () => useContext(ChatContext);


