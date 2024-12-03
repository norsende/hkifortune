'use client';
import { SessionProvider } from "next-auth/react";
import ChatStateProvider from "./context/ChatStateProvider";
import CombinedView from "./components/CombinedView";

export default function Home() {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black">
      <SessionProvider>
        <ChatStateProvider>
          <CombinedView />
        </ChatStateProvider>
      </SessionProvider>
    </div>
  );
}
