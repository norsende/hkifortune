'use client';
import { useEffect, useState } from "react";
import { getGoodMorning, getNurseMemo, getNurseVisitReport, getSentimentAnalysis } from "../actions/aimoActions";
import { Analysis, NurseMemo, NurseVisitReport } from "../actions/models";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import getSpeechToken from "../actions/speechActions";
import NurseMemoDialog from "./NurseMemoDialog";
import { Dialog } from "./models";
import AnalysisDialog from "./AnalysisDialog";
import { useChatContext } from "../context/ChatContext";
import NurseVisitMemoDialog from "./NurseVisitReportDialog";
import ProcessingDialog from "./ProcessingDialog";
import CrystalBallSpinner from "./CrystalBallSpinner";

const AimoView = () => {
    const { status: authStatus } = useSession();
    const router = useRouter()
    const [analysis, setAnalysis] = useState<Analysis>();
    const [nurseMemo, setNurseMemo] = useState<NurseMemo | undefined>();
    const [nuseVisitReport, setNurseVisitReport] = useState<NurseVisitReport>();
    const { chatState, updateChatState, addAimoComment, currentLanguage, setCurrentLanguage } = useChatContext();
    const [nurseVisitText, setNurseVisitText] = useState("Start Nurse Visit");
    const [chatHistory, setChatHistory] = useState<Dialog[]>([]);
    const [processing, setProcessing] = useState<string | undefined>(undefined);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);
    const [isScreenFading, setIsScreenFading] = useState(false);
    const [showRestartButton, setShowRestartButton] = useState(false);

    // const [currentLanguage, setCurrentLanguage] = useState<'fi-FI' | 'en-US'>('fi-FI'); // Käytössä oleva kieli

    const onQuestionHandled = async (language: 'fi-FI' | 'en-US') => {
        await sayGoodMorning(false, language); // Oraakkeli vastaa käyttäjän kielellä

        // Fade-to-black ja restart-napin logiikka vain kysymyksen jälkeen
        setTimeout(() => {
            setIsScreenFading(true);

            // Näytetään restart-nappi fade-animaation jälkeen
            setTimeout(() => {
                setShowRestartButton(true);
            }, 10000); // Fade kestää 5 sekuntia
        }, 25000); // 30 sekuntia ennen fadea
    };

    const resetUI = () => {
        window.location.reload();
    };

    /*
    useEffect(() => {
        if (authStatus === "unauthenticated") {
            router.push('/login');
        }
    });
*/

    useEffect(() => {
        if (chatState.mode === 'aimo_chat' && chatState.customer_comments.length > 0) {
            onQuestionHandled(currentLanguage); // Kutsutaan vain, kun käyttäjä esittää kysymyksen
        }
    }, [chatState.customer_comments]);

    /*
        useEffect(() => {
            if (chatState.mode === 'aimo_chat' && chatState.customer_comments.length > 0) {
                sayGoodMorning(false, currentLanguage);
            }
        }, [chatState.customer_comments])
    */
    const sayGoodMorning = async (firstQuery: boolean, language: 'fi-FI' | 'en-US') => {
        setShowSpinner(true);
        setAnalysis(undefined);
        setCurrentLanguage(language);
        //var nextComment = await getGoodMorning(createChatHistory(), firstQuery);
        var nextComment = await new Promise((resolve) =>
            setTimeout(async () => {
                const response = await getGoodMorning(createChatHistory(), firstQuery, language);
                resolve(response);
            }, 1) // 0.001 sekunnin odotus
        );
        setShowSpinner(false);
        sayOutLoud(nextComment as string, language);
    }

    const createChatHistory = (): Dialog[] => {
        const dialog: Dialog[] = chatHistory;
        for (let idx = 0; idx < chatState.aimo_comments.length; idx++) {
            dialog.push({
                query: chatState.aimo_comments[idx],
                response: chatState.customer_comments[idx] ?? '<ei vastausta>'
            })
        }

        return dialog;
    };

    const sayOutLoud = async (text: string, language: 'fi-FI' | 'en-US') => {
        const token = await getSpeechToken();
        if (!token) return;

        const speechsdk = require('microsoft-cognitiveservices-speech-sdk')
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token.token, token.region);
        speechConfig.speechSynthesisVoiceName = language === 'fi-FI' ? "fi-FI-HarriNeural" : "en-US-GuyNeural";

        const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();

        const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
        synthesizer.speakTextAsync(
            text,
            (result: any) => {
                synthesizer.close();
            },
            (error: any) => {
                console.error('Error during synthesis: ', error);
                synthesizer.close();
            }
        );

        addAimoComment(text)
        //updateChatState({ aimo_comments: aimoComments });
    }

    const onStartMorningSession = async (language: 'fi-FI' | 'en-US') => {
        setIsProcessing(true);
        try {
            setChatHistory(createChatHistory());
            updateChatState({
                customer_comments: [],
                aimo_comments: []
            });
            await sayGoodMorning(true, language);
        } finally {
            setIsProcessing(false);
        }

    };

    return (
        <>
            {showSpinner && <CrystalBallSpinner />}
            {isScreenFading && <div className="fade-overlay"></div>}
            {/* Restart-nappi */}
            {showRestartButton && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-transparent z-[200]"
                >
                    <button
                        onClick={resetUI}
                        className="bg-[#e49b3f] text-black text-xl shadow-lg p-4 rounded border border-[#e49b3f] max-w-xs"
                        style={{
                            width: 'auto', // Napin leveys määräytyy sisällön mukaan
                            padding: '1rem 2rem', // Lisää sisäistä marginaalia
                        }}
                    >
                        Aloita alusta / Start Again
                    </button>
                </div>
            )}


            <div className="relative max-h-screen overflow-y-auto pb-20">
                {/* Suomenkielinen nappi */}
                <button
                    onClick={() => {
                        setCurrentLanguage('fi-FI'); // Päivitetään kontekstin kieliasetus
                        onStartMorningSession('fi-FI');
                    }}
                    className={`fixed right-4 z-10 ${isProcessing && currentLanguage === 'fi-FI' ? 'bg-gray-400' : 'bg-[#e49b3f]'
                        } text-black shadow-lg p-2 rounded top-1`}
                >
                    {isProcessing && currentLanguage === 'fi-FI' ? 'Kutsutaan...' : 'Kutsu Oraakkeli'}
                </button>

                <button
                    onClick={() => {
                        setCurrentLanguage('en-US'); // Päivitetään kontekstin kieliasetus
                        onStartMorningSession('en-US');
                    }}
                    className={`fixed right-4 z-10 ${isProcessing && currentLanguage === 'en-US' ? 'bg-gray-400' : 'bg-[#e49b3f]'
                        } text-black shadow-lg p-2 rounded top-16`}
                >
                    {isProcessing && currentLanguage === 'en-US' ? 'Summoning...' : 'Summon the Oracle'}
                </button>


                {/* Chat-historian kommentit */}
                <div className="p-4">
                    {chatState?.aimo_comments.map((text: string, idx: number) => (
                        <p key={idx} className="m-4 mr-40 p-4 border-1 italic bg-[#e49b3f] text-black shadow-lg">
                            {text}
                        </p>
                    ))}
                </div>
            </div>
        </>
    );
};

export default AimoView;