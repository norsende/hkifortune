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
    const {chatState, updateChatState, addAimoComment} = useChatContext();
    const [nurseVisitText, setNurseVisitText] = useState("Start Nurse Visit");
    const [chatHistory, setChatHistory] = useState<Dialog[]>([]);
    const [processing, setProcessing] = useState<string | undefined>(undefined);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);

    /*
    useEffect(() => {
        if (authStatus === "unauthenticated") {
            router.push('/login');
        }
    });
*/
    useEffect(() => {
        if (chatState.mode === 'aimo_chat' && chatState.customer_comments.length > 0) {
            sayGoodMorning(false);
        }
    }, [chatState.customer_comments])

    const sayGoodMorning = async (firstQuery: boolean) => {
        setShowSpinner(true);
        setAnalysis(undefined);
        //var nextComment = await getGoodMorning(createChatHistory(), firstQuery);
        var nextComment = await new Promise((resolve) =>
            setTimeout(async () => {
                const response = await getGoodMorning(createChatHistory(), firstQuery);
                resolve(response);
            }, 1) // 0.001 sekunnin odotus
        );
        setShowSpinner(false);
        sayOutLoud(nextComment as string);
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

    const sayOutLoud = async (text: string) => {
        const token = await getSpeechToken();
        if (!token) return;

        const speechsdk = require('microsoft-cognitiveservices-speech-sdk')
        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token.token, token.region);
        speechConfig.speechSynthesisVoiceName = "fi-FI-HarriNeural";

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

    const onStartMorningSession = async () => {
        setIsProcessing(true);
        try {
            setChatHistory(createChatHistory());
            updateChatState({
                customer_comments: [],
                aimo_comments: []
            });
            await sayGoodMorning(true);
        } finally {
            setIsProcessing(false);
        }

    };

    const onCreateAnalysis = async () => {
        setProcessing("Creating Analysis");
        const sentimentAnalysis = await getSentimentAnalysis(createChatHistory());
        setProcessing(undefined);
        setAnalysis(sentimentAnalysis);
    }

    const onCreateNurseMemo = async () => {
        setProcessing("Creating Nurse Memo");
        const nurseMemo = await getNurseMemo(createChatHistory());
        setProcessing(undefined);
        if (nurseMemo) {
            setNurseMemo(nurseMemo);
        }
    }

    const onNurseMemoClosed = () => {
        setNurseMemo(undefined);
    }

    const onAnalysisClosed = () => {
        setAnalysis(undefined);
    }

    const onNurseVisitReportClosed = () => {
        setNurseVisitReport(undefined);
        updateChatState({
            mode: 'aimo_chat',
            customer_comments: [],
            aimo_comments: []
        });
    }

    const onStartNurseVisit = async () => {
        if (chatState.mode === 'nurse_visit') {
            sayOutLoud("Hoitajavierailu päättyi");
            setNurseVisitText("Start Nurse Visit");
            setProcessing("Creating Nurse Visit Report");
            const report = await getNurseVisitReport(chatState.customer_comments.join(' '));
            setProcessing(undefined);
            setNurseVisitReport(report);
        } else {
            sayOutLoud("Hoitajavierailu aloitettu");
            setNurseVisitText("End Nurse Visit");
            updateChatState({
                mode: 'nurse_visit',
                customer_comments: [],
                aimo_comments: []
            });    
        }
    }

    return (
        <>
            {showSpinner && <CrystalBallSpinner />}
            {processing && <ProcessingDialog process={processing}></ProcessingDialog>}
            {nurseMemo && <NurseMemoDialog nurseMemo={nurseMemo} onClose={onNurseMemoClosed}></NurseMemoDialog>}
            {analysis && <AnalysisDialog analysis={analysis} onClose={onAnalysisClosed}></AnalysisDialog>}
            {nuseVisitReport && <NurseVisitMemoDialog visitReport={nuseVisitReport} onClose={onNurseVisitReportClosed}></NurseVisitMemoDialog>}
            <div className="relative max-h-screen overflow-y-auto pb-20">
                <button
                    onClick={onStartMorningSession}
                    className={`fixed right-4 z-10 ${
                        isProcessing ? "bg-gray-400" : "bg-[#e49b3f]"
                    } text-black shadow-lg p-2 rounded top-1`}
                >
                    {isProcessing ? "Summoning..." : "Summon the Oracle"}
                </button>
                
                <div className="p-4">
                    {chatState?.aimo_comments.map((text: string, idx: number) => (
                        <p key={idx} className="m-4 mr-40 p-4 border-1 italic bg-[#e49b3f] text-black shadow-lg">
                            {text}
                        </p>
                    ))}
                </div>
            </div>
        </>
    )
};

export default AimoView;