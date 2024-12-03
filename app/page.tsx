'use client';
import CustomerView from "./components/CustomerView";
import AimoView from "./components/AimoView";
import { SessionProvider } from "next-auth/react";
import ChatStateProvider from "./context/ChatStateProvider";

export default function Home() {

  return (
    <div className="flex w-screen h-screen text-black">
      <SessionProvider>
        <ChatStateProvider>
          <div className="flex-[1.4] flex justify-center items-center border">
            <CustomerView />
          </div>
          <div className="flex-[2] flex justify-center items-center border">
            <AimoView />
          </div>
        </ChatStateProvider>
      </SessionProvider>
    </div>
  );
}
