'use client';
import { useState } from "react";
import { useChatContext } from "../context/ChatContext";
import getSpeechToken from "../actions/speechActions";
import { getGoodMorning } from "../actions/aimoActions";
import { ResultReason } from "microsoft-cognitiveservices-speech-sdk";

const CombinedView = () => {
  const { chatState, updateChatState, addAimoComment } = useChatContext();
  const [currentAction, setCurrentAction] = useState<"morning_session" | "listening">("morning_session");
  const [recognizer, setRecognizer] = useState<any>();

  // Puheen syntetisointi
  const sayOutLoud = async (text: string) => {
    const token = await getSpeechToken();
    if (!token) {
      console.error("Puhesynteesin tokenia ei saatu");
      return;
    }

    const speechsdk = require("microsoft-cognitiveservices-speech-sdk");
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token.token, token.region);
    speechConfig.speechSynthesisVoiceName = "fi-FI-HarriNeural"; // Käytetään aina suomalaista ääntä

    const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, speechsdk.AudioConfig.fromDefaultSpeakerOutput());

    synthesizer.speakTextAsync(
      text,
      () => synthesizer.close(),
      (error: any) => {
        console.error("Puheen synteesivirhe:", error);
        synthesizer.close();
      }
    );
    addAimoComment(text);
  };


  // Morning Session aloittaminen
  const onStartMorningSession = async () => {
    const response = await getGoodMorning([], true);
    sayOutLoud(response); // Sano vastaus ääneen
    updateChatState({
      customer_comments: [],
      aimo_comments: [response], // Lisää vastaus suoraan tilaan
    });
    setCurrentAction("listening"); // Vaihda toiminto kuuntelemiseen
  };


  // Puheentunnistus
  const getSpeechRecognizer = async (): Promise<any> => {
    const token = await getSpeechToken();
    if (!token) {
      console.error("Puheentunnistuksen tokenia ei saatu");
      return;
    }

    const speechsdk = require("microsoft-cognitiveservices-speech-sdk");
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(token.token, token.region);
    speechConfig.speechRecognitionLanguage = "fi-FI"; // Suomen kieli
    return new speechsdk.SpeechRecognizer(speechConfig, speechsdk.AudioConfig.fromDefaultMicrophoneInput());
  };

  const onStartListening = async () => {
    if (isListening) return; // Estä päällekkäiset kutsut
    setIsListening(true);

    const recognizer = await getSpeechRecognizer();
    recognizer.recognized = async (s: any, e: any) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        const userQuestion = e.result.text;
        updateChatState({ customer_comments: [...chatState.customer_comments, userQuestion] });

        // Botti vastaa käyttäjän kysymykseen
        const response = await getGoodMorning(chatState.customer_comments.concat(userQuestion), false);
        sayOutLoud(response);
        addAimoComment(response);
      }
    };

    await recognizer.recognizeOnceAsync();
    setRecognizer(undefined); // Ei jatkuvaa kuuntelua
  };


  const handleButtonClick = async () => {
    if (isThinking || isListening) return; // Estä toiminto, jos botti jo miettii tai kuuntelee
    if (currentAction === "morning_session") {
      await onStartMorningSession(); // Aloita Morning Session
    } else if (currentAction === "listening") {
      await onStartListening(); // Aloita kuuntelu
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* Yksi iso nappi keskellä ruutua */}
      <button
        onClick={handleButtonClick}
        className="px-12 py-6 bg-blue-500 text-white text-2xl rounded shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105">
        {currentAction === "morning_session" ? "Kutsu ennustajaa" : "Aloita kuuntelu"}
      </button>

      {/* Kommentit */}
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-white rounded shadow-lg max-h-1/2 overflow-y-auto">
        {chatState.aimo_comments.map((text, idx) => (
          <p key={idx} className="m-2 p-2 border-2 border-blue-100 bg-green-50">{`Aimo: ${text}`}</p>
        ))}
        {chatState.customer_comments.map((text, idx) => (
          <p key={idx} className="m-2 p-2 border-2 border-blue-100 bg-yellow-50">{`Asiakas: ${text}`}</p>
        ))}
      </div>

    </div>
  );
};

export default CombinedView;
