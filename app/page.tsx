'use client';
import CustomerView from "./components/CustomerView";
import AimoView from "./components/AimoView";
import { SessionProvider } from "next-auth/react";
import ChatStateProvider from "./context/ChatStateProvider";
import StarrySky from './components/StarrySky';
import Particles from './components/Particles';

export default function Home() {

  return (
    <div className="flex w-screen h-screen text-black">
      <div className="absolute inset-0 z-0">
        <StarrySky />
      </div>
      <div className="absolute inset-0 z-0">
        <Particles />
      </div>
      <SessionProvider>
        <ChatStateProvider>
          <div className="relative z-10 flex-[1.4] flex justify-center items-center border border-[#e49b3f]">
            <CustomerView />
          </div>
          <div className="relative z-10 flex-[2] flex justify-center items-center border border-[#e49b3f]">
            <AimoView />
          </div>
        </ChatStateProvider>
      </SessionProvider>
    </div>
  );
}
