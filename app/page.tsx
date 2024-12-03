'use client';
import { SessionProvider } from "next-auth/react";
import ChatStateProvider from "./context/ChatStateProvider";
import CombinedView from "./components/CombinedView";

export default function Home() {
  return (
    <div className="flex w-screen h-screen text-black">
      <SessionProvider>
        <ChatStateProvider>
          <CombinedView />
        </ChatStateProvider>
      </SessionProvider>
    </div>
  );
}
