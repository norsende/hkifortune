'use server';

import axios from "axios";

interface SpeechToken {
    token: string;
    region: string;
}

const getSpeechToken = async (): Promise<SpeechToken | undefined> => {
    const headers = { 
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.SPEECH_KEY ?? '',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    try {
        const tokenResponse = await axios.post(`https://${process.env.SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);
        return { token: tokenResponse.data, region: process.env.SPEECH_REGION ?? '' };
    } catch (err) {
        console.error("cannot get token", err);
        return undefined;
    }
}

export default getSpeechToken;