'use client';
import { IntentRecognitionResult, ResultReason } from "microsoft-cognitiveservices-speech-sdk";
import { useEffect, useState } from "react";
import getSpeechToken from "../actions/speechActions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChatContext } from "../context/ChatContext";


const CustomerView = () => {
    const { status: authStatus } = useSession();
    const router = useRouter();
    const [isListening, setIsListening] = useState(false);
    const { chatState, updateChatState } = useChatContext();
    const [buttonText, setButtonText] = useState("Start Listening");
    const [recognizer, setRecognizer] = useState<any>();

/*
    useEffect(() => {
        if (authStatus === "unauthenticated") {
            router.push('/login');
        }
    });
*/
    useEffect(() => {
        if (chatState.mode === 'nurse_visit') {
            setButtonText("Start Listening Nurse Visit");
        } else {
            setButtonText("Start Listening ");
        }
    }, [chatState.mode]);

    const getSpeechRecognizer = async (): Promise<any> => {
        const token = await getSpeechToken();
        if (!token) return;

        const speechsdk = require('microsoft-cognitiveservices-speech-sdk')
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token.token, token.region);
        speechConfig.speechRecognitionLanguage = 'fi-FI';
        const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
        return new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
    }

    const listen = async () => {

        const recognizer = await getSpeechRecognizer();
        await recognizer.recognizeOnceAsync((e: IntentRecognitionResult) => {
            if (e.text?.length > 0) {
                updateChatState({ customer_comments: [...chatState.customer_comments, e.text] });
            }
            setIsListening(false);
        });
    }

    const listenContinuously = async (): Promise<void> => {
        const recognizer = await getSpeechRecognizer();
        setRecognizer(recognizer);

        recognizer.recognized = (s: any, e: any) => {
            if (e.result.reason == ResultReason.RecognizedSpeech) {
                const comments = chatState.customer_comments ?? [];
                comments.push(e.result.text);
                updateChatState({ customer_comments: comments });
            }
        };

        await recognizer.startContinuousRecognitionAsync();
    }

    const onStartButtonClicked = async () => {
        setIsListening(true);
        if (chatState.mode === 'aimo_chat') {
            await listen();
        } else {
            await listenContinuously();
        }
    }

    const onStopNurseVisitListening = async () => {
        if (recognizer) {
            await recognizer.stopContinuousRecognitionAsync();
            recognizer.close();
            setRecognizer(undefined);
        }
        setIsListening(false);
    }

    return (
        <div className="relative max-h-screen overflow-y-auto pb-20">
            <button
                onClick={onStartButtonClicked}
                className="fixed top-1 left-4 z-10 bg-[#e49b3f] text-black rounded shadow-lg p-2 rounded">
                {buttonText}
            </button>
            <div className="p-4">
                {chatState.customer_comments.map((text: string, idx: number) => (
                    <p key={idx} className="m-4 p-4 border-1 bg-[#e49b3f] text-black shadow-lg">
                        {text}
                    </p>
                ))}
            </div>
            {isListening && (
                <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50">
                    <div className="bg-wh   ite p-8 rounded shadow-lg">
                        <h2 className="text-xl p-4 bg-[#e49b3f] rounded shadow-lg text-mb-4">Listening...</h2>
                        {chatState.mode === 'nurse_visit' && (
                            <button
                                className="z-10 bg-[#e49b3f] text-black rounded shadow-lg"
                                onClick={onStopNurseVisitListening}
                            >
                                Stop listening
                            </button>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}

export default CustomerView;
