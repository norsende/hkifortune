'use client';
import { useState } from "react";
import { useChatContext } from "../context/ChatContext";
import getSpeechToken from "../actions/speechActions";
import { getGoodMorning } from "../actions/aimoActions";
import { ResultReason } from "microsoft-cognitiveservices-speech-sdk";

const CombinedView = () => {
  const { chatState, updateChatState } = useChatContext();
  const [isListening, setIsListening] = useState(false);
  const [recognizer, setRecognizer] = useState<any>();

  // Puheen syntetisointi
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
  };

  // Morning Session aloittaminen
  const onStartMorningSession = async () => {
    const response = await getGoodMorning([], true);
    sayOutLoud(response);
    updateChatState({
      customer_comments: [],
      aimo_comments: [response]
    });
  };

  // Puheentunnistus
  const getSpeechRecognizer = async (): Promise<any> => {
    const token = await getSpeechToken();
    if (!token) return;

    const speechsdk = require('microsoft-cognitiveservices-speech-sdk');
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token.token, token.region);
    speechConfig.speechRecognitionLanguage = 'fi-FI';
    return new speechsdk.SpeechRecognizer(speechConfig, speechsdk.AudioConfig.fromDefaultMicrophoneInput());
  };

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

  return (
    <div className="relative max-h-screen overflow-y-auto pb-20">
      {/* Napit */}
      <button
        onClick={onStartMorningSession}
        className="fixed top-1 left-4 z-10 bg-blue-500 text-white p-2 rounded">
        Start Morning Session
      </button>
      <button
        onClick={isListening ? onStopListening : onStartListening}
        className={`fixed top-12 left-4 z-10 p-2 rounded ${isListening ? "bg-red-500" : "bg-blue-500"} text-white`}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>

      {/* Kommentit */}
      <div className="p-4">
        {chatState.aimo_comments.map((text, idx) => (
          <p key={idx} className="m-4 p-4 border-2 border-blue-100 bg-green-50">{`Aimo: ${text}`}</p>
        ))}
        {chatState.customer_comments.map((text, idx) => (
          <p key={idx} className="m-4 p-4 border-2 border-blue-100 bg-yellow-50">{`Customer: ${text}`}</p>
        ))}
      </div>
    </div>
  );
};

export default CombinedView;
