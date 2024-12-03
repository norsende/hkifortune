'use client';
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChatContext } from "../context/ChatContext";
import getSpeechToken from "../actions/speechActions";
import { getGoodMorning, getSentimentAnalysis, getNurseMemo, getNurseVisitReport } from "../actions/aimoActions";
import NurseMemoDialog from "./NurseMemoDialog";
import AnalysisDialog from "./AnalysisDialog";
import NurseVisitMemoDialog from "./NurseVisitReportDialog";
import ProcessingDialog from "./ProcessingDialog";
import { Dialog } from "./models";
import { ResultReason } from "microsoft-cognitiveservices-speech-sdk";

const CombinedView = () => {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const { chatState, updateChatState, addAimoComment } = useChatContext();

  // States
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState<string | undefined>();
  const [analysis, setAnalysis] = useState<any>();
  const [nurseMemo, setNurseMemo] = useState<any>();
  const [nurseVisitReport, setNurseVisitReport] = useState<any>();
  const [recognizer, setRecognizer] = useState<any>();
  const [nurseVisitText, setNurseVisitText] = useState("Start Nurse Visit");

  // Puheentunnistus ja -syntetisointi
  const getSpeechRecognizer = async (): Promise<any> => {
    const token = await getSpeechToken();
    if (!token) return;

    const speechsdk = require('microsoft-cognitiveservices-speech-sdk');
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token.token, token.region);
    speechConfig.speechRecognitionLanguage = 'fi-FI';
    return new speechsdk.SpeechRecognizer(speechConfig, speechsdk.AudioConfig.fromDefaultMicrophoneInput());
  };

  const sayOutLoud = async (text: string) => {
    const token = await getSpeechToken();
    if (!token) return;

    const speechsdk = require('microsoft-cognitiveservices-speech-sdk');
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token.token, token.region);
    speechConfig.speechSynthesisVoiceName = "fi-FI-HarriNeural";
    const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, speechsdk.AudioConfig.fromDefaultSpeakerOutput());

    synthesizer.speakTextAsync(
      text,
      () => synthesizer.close(),
      (error: any) => {
        console.error('Speech synthesis error:', error);
        synthesizer.close();
      }
    );
    addAimoComment(text);
  };

  // Tapahtumakäsittelijät
  const onStartListening = async () => {
    setIsListening(true);
    const recognizer = await getSpeechRecognizer();
    recognizer.recognized = (s: any, e: any) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        updateChatState({ customer_comments: [...chatState.customer_comments, e.result.text] });
      }
    };
    await recognizer.startContinuousRecognitionAsync();
    setRecognizer(recognizer);
  };

  const onStopListening = async () => {
    if (recognizer) {
      await recognizer.stopContinuousRecognitionAsync();
      recognizer.close();
      setRecognizer(undefined);
    }
    setIsListening(false);
  };

  const onCreateAnalysis = async () => {
    setProcessing("Creating Analysis");
    const result = await getSentimentAnalysis(chatState.customer_comments);
    setProcessing(undefined);
    setAnalysis(result);
  };

  const onCreateNurseMemo = async () => {
    setProcessing("Creating Nurse Memo");
    const memo = await getNurseMemo(chatState.customer_comments);
    setProcessing(undefined);
    setNurseMemo(memo);
  };

  const onStartNurseVisit = async () => {
    if (chatState.mode === 'nurse_visit') {
      sayOutLoud("Hoitajavierailu päättyi");
      setNurseVisitText("Start Nurse Visit");
      const report = await getNurseVisitReport(chatState.customer_comments.join(' '));
      setNurseVisitReport(report);
      updateChatState({ mode: 'aimo_chat' });
    } else {
      sayOutLoud("Hoitajavierailu aloitettu");
      setNurseVisitText("End Nurse Visit");
      updateChatState({ mode: 'nurse_visit', customer_comments: [], aimo_comments: [] });
    }
  };

  return (
    <div className="relative max-h-screen overflow-y-auto pb-20">
      {processing && <ProcessingDialog process={processing} />}
      {nurseMemo && <NurseMemoDialog nurseMemo={nurseMemo} onClose={() => setNurseMemo(undefined)} />}
      {analysis && <AnalysisDialog analysis={analysis} onClose={() => setAnalysis(undefined)} />}
      {nurseVisitReport && <NurseVisitMemoDialog visitReport={nurseVisitReport} onClose={() => setNurseVisitReport(undefined)} />}

      <button onClick={onStartListening} className="fixed left-4 top-1 bg-blue-500 text-white p-2 rounded">
        Start Listening
      </button>
      <button onClick={onStopListening} className="fixed left-4 top-12 bg-red-500 text-white p-2 rounded">
        Stop Listening
      </button>
      <button onClick={onStartNurseVisit} className="fixed right-4 top-1 bg-blue-500 text-white p-2 rounded">
        {nurseVisitText}
      </button>
      <button onClick={onCreateNurseMemo} className="fixed right-4 top-12 bg-blue-500 text-white p-2 rounded">
        Create Nurse Memo
      </button>
      <button onClick={onCreateAnalysis} className="fixed right-4 top-24 bg-blue-500 text-white p-2 rounded">
        Create Analysis
      </button>

      <div className="p-4">
        {chatState.customer_comments.map((text, idx) => (
          <p key={idx} className="m-4 p-4 border-2 border-blue-100 bg-green-50">{text}</p>
        ))}
        {chatState.aimo_comments.map((text, idx) => (
          <p key={idx} className="m-4 mr-40 p-4 border-2 border-blue-100 bg-green-50">{text}</p>
        ))}
      </div>
    </div>
  );
};

export default CombinedView;
