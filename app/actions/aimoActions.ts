'use server';
import OpenAI from 'openai';
import { morningSession, sentimetAnalyzis, memoForNurse, nurseVisitMemo } from './resources/aimoInstructions';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { Analysis, NurseMemo, NurseVisitReport } from './models';
import authOptions from '../lib/authOptions';
import { getServerSession } from 'next-auth';

const getNurseVisitReport = async (visit: string): Promise<NurseVisitReport> => {
    /*
    const session = await getServerSession(authOptions);
    if (!session) {
        throw Error("Unauthorized")
    }
*/
    const chat = getOpenAIClient();

    const messages: ChatCompletionMessageParam[] = [];
    messages.push({
        role: 'system', 
        content: nurseVisitMemo.instructions
    });
    messages.push({
        role: 'user',
        content: "Tässä on tallenne vierailulta, muodosta raportti tämän perusteella: " + visit
    });

    const gptResult = await chat.completions.create({
        messages,
        model: 'gpt-4o',
        response_format: { type: 'json_object' }
    });

    return JSON.parse(gptResult.choices[0].message.content ?? "");
}

const getNurseMemo = async (chatHistory: any[]): Promise<NurseMemo | undefined> => {
    /*
    const session = await getServerSession(authOptions);
    if (!session) {
        throw Error("Unauthorized")
    }
*/
    const messages: ChatCompletionMessageParam[] = [];
    messages.push({
        role: 'system', 
        content: memoForNurse.instructions
    });
    messages.push({
        role: 'user',
        content: 'tässä keskusteluhistoria: ' + JSON.stringify(chatHistory)
    });

    const chat = getOpenAIClient();
    const gptResult = await chat.completions.create({
        messages,
        model: 'gpt-4o',
        response_format: { type: 'json_object' }
    });

    return JSON.parse(gptResult.choices[0].message.content ?? "");
}

const getGoodMorning = async (chatHistory : any[], firstQuery: boolean = false): Promise<string> => {
    /*
    const session = await getServerSession(authOptions);
    if (!session) {
        throw Error("Unauthorized")
    }
*/
    const chat = getOpenAIClient();

    const messages: ChatCompletionMessageParam[] = [];

    // first message do not refer to earlier comments
    if (firstQuery) {
        messages.push({
            role: 'system', 
            content: morningSession.instructions
        });
    } else {
        messages.push({
            role: 'system', 
            content: morningSession.instructions        
        });    

        // add chat history
        for (const chatDialog of chatHistory) {
            messages.push({
                role: 'assistant',
                content: chatDialog.query,
            });

            if (chatDialog.response !== undefined) {
                messages.push({
                    role: 'user',
                    content: chatDialog.response,
                });    
            }
        }
    }

    const gptResult = await chat.completions.create({
        messages,
        model: 'gpt-4o',
    });

    return gptResult.choices[0].message.content ?? "";
} 

const getSentimentAnalysis = async (chatHistory : any[]): Promise<Analysis> => {
    /*
    const session = await getServerSession(authOptions);
    if (!session) {
        throw Error("Unauthorized")
    }
*/
    const chat = getOpenAIClient();

    const messages: ChatCompletionMessageParam[] = [];

    messages.push({
        role: 'system', 
        content: sentimetAnalyzis.instructions + ": " + JSON.stringify(chatHistory),
    });

    const test = await chat.completions.create({
        messages,
        model: 'gpt-4o',
        response_format: { type: 'json_object' }
    });

    return JSON.parse(test.choices[0].message.content ?? "{}");
} 

const getOpenAIClient = () : OpenAI.Chat =>  {
    const openai = new OpenAI({
        apiKey: process.env[process.env.OPENAI_API_KEY ?? ''],
    });

    return openai.chat;
}

export { getGoodMorning, getSentimentAnalysis, getNurseMemo, getNurseVisitReport }