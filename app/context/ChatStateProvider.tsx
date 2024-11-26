import { ReactNode, useState } from "react";
import { ChatContext, ChatState, initialState } from "./ChatContext";



interface Props {
    children: ReactNode;
}


const ChatStateProvider = (props : Props) => {
    const { children } = props;
    const [chatState, setChatState] = useState<ChatState>(initialState);

    const updateChatState = (state: Partial<ChatState>): void => {
        setChatState((prev: ChatState) => ({...prev, ...state}));
    }

    const addAimoComment = (comment: string): void => {
        setChatState((prev: ChatState) => ({...prev, aimo_comments: [...prev.aimo_comments, comment]}));
    }

    return (<ChatContext.Provider value={{ chatState, updateChatState, addAimoComment}}> {children} </ChatContext.Provider>);
}

export default ChatStateProvider;
