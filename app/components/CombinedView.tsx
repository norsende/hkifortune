'use client';
import { useEffect, useState } from "react";
import { useChatContext } from "../context/ChatContext";
import getSpeechToken from "../actions/speechActions";
import { getGoodMorning } from "../actions/aimoActions";
import { ResultReason } from "microsoft-cognitiveservices-speech-sdk";

const CombinedView = () => {
  const { chatState, updateChatState, addAimoComment } = useChatContext();
  const [currentAction, setCurrentAction] = useState<"morning_session" | "listening">("morning_session");
  const [recognizer, setRecognizer] = useState<any>();
  const [isThinking, setIsThinking] = useState(false); // Animaation tila

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
    addAimoComment(text);
  };

  // Morning Session aloittaminen
  const onStartMorningSession = async () => {
    const response = await getGoodMorning([], true);
    sayOutLoud(response);
    updateChatState({
      customer_comments: [],
      aimo_comments: [response]
    });
    setCurrentAction("listening"); // Vaihda toiminto seuraavaan
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
    const recognizer = await getSpeechRecognizer();
    recognizer.recognized = async (s: any, e: any) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        const userQuestion = e.result.text;
        updateChatState({ customer_comments: [...chatState.customer_comments, userQuestion] });

        // Näytä mysteerinen animaatio ennen vastausta
        setIsThinking(true);
        setTimeout(async () => {
          setIsThinking(false);
          const response = await getGoodMorning(chatState.customer_comments.concat(userQuestion), false);
          sayOutLoud(response);
          addAimoComment(response);
        }, 5000); // 5 sekunnin viive
      }
    };
    await recognizer.recognizeOnceAsync();
    setRecognizer(undefined); // Ei jatkuvaa kuuntelua
    setCurrentAction("morning_session"); // Vaihda toiminto takaisin Morning Sessioniin
  };

  const handleButtonClick = async () => {
    if (currentAction === "morning_session") {
      await onStartMorningSession();
    } else {
      await onStartListening();
    }
  };

  // Enter-näppäimen kuuntelu
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleButtonClick(); // Simuloi napin painallusta
      }
    };

    // Lisää kuuntelija
    window.addEventListener("keydown", handleKeyPress);

    // Siivoa kuuntelija komponentin poistuessa
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentAction]); // Kuuntelee aina napin nykyistä tilaa

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      {/* Jos botti miettii, näytetään animaatio */}
      {isThinking ? (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-t-transparent border-[#e49b3f] rounded-full animate-spin mb-4"></div>
          <p className="text-e49b3f text-xl">Kristallipallo miettii...</p>
        </div>
      ) : (
        <>
          {/* Yksi iso nappi keskellä ruutua */}
          <button
            onClick={handleButtonClick}
            className="px-12 py-6 bg-[#e49b3f] text-black text-2xl rounded shadow-lg hover:brightness-90 transition-transform transform hover:scale-105">
            {currentAction === "morning_session" ? "Kutsu ennustajaa" : "Aloita kuuntelu"}
          </button>
        </>
      )}

      {/* Kommentit */}
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#e49b3f] text-black rounded shadow-lg max-h-1/2 overflow-y-auto">
        {chatState.aimo_comments.map((text, idx) => (
          <p key={idx} className="m-2 p-2 border-2 border-black">{`Aimo: ${text}`}</p>
        ))}
        {chatState.customer_comments.map((text, idx) => (
          <p key={idx} className="m-2 p-2 border-2 border-black">{`Asiakas: ${text}`}</p>
        ))}
      </div>
    </div>
  );
};

export default CombinedView;
