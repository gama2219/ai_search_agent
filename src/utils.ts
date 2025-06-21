import { Principal,canisterSelf } from 'azle'; 
import { azleFetch } from 'azle/src/experimental/lib/fetch'; 
import { 
    Result, 
    Ok, 
    Err, 
    IChatMessage, 
    ISearchResultItem, 
    IChatContentPart,
    
} from './types';

// Environment Variables (Loaded by DFX/Azle) 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

// --- LLM (Gemini) Integration ---
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

//Calls the Gemini API with the given conversation history.
export async function callGeminiAPI(
    conversationHistory: IChatMessage[]
): Promise<Result<string, string>> {
    if (!GEMINI_API_KEY) {
        return Err("GEMINI_API_KEY not set in canister environment.");
    }

    const requestBody = {
        contents: conversationHistory.map(msg => ({
            role: msg.role,
            parts: msg.parts.map((part: IChatContentPart) => ({ text: part.text }))
        })),
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
    };

    try {
        const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
        
        // Define the options object directly.
        // The 'transform' property is recognized by azleFetch even if not explicitly in RequestInit from standard lib.
        const options = { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: new TextEncoder().encode(JSON.stringify(requestBody)),
            transform: {
                function: [canisterSelf(), 'geminiTransform'] as [Principal, string], 
                context: new Uint8Array()
            }, 
            cycles:50_000_000_000n,
        };

        const response = await azleFetch(url, options as RequestInit); // Cast to RequestInit here if needed

        if (response.status !== 200) {
            const errorDetails = await response.text(); 
            return Err(`Gemini API HTTP Error: ${response.status}. Details: ${errorDetails}`);
        }

        const data = await response.json(); 

        if (data.promptFeedback && data.promptFeedback.blockReason) {
            return Err(`Gemini blocked response due to safety: ${data.promptFeedback.blockReason}`);
        }

        if (data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content && data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0) {
            return Ok(data.candidates[0].content.parts[0].text);
        } else {
            return Err('Unexpected Gemini response format or no valid candidate generated.');
        }

    } catch (error: any) {
        return Err(`Error during Gemini API call: ${error.message || 'Unknown error'}`);
    }
}

// Web Search Integration (Google Custom Search API)
const GOOGLE_CSE_URL = 'https://www.googleapis.com/customsearch/v1';

//Performs a web search using Google Custom Search API.
export async function performWebSearch(query: string): Promise<Result<ISearchResultItem[], string>> {
    if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
        return Err("GOOGLE_CSE_API_KEY or GOOGLE_CSE_ID not set in canister environment.");
    }

    const searchUrl = `${GOOGLE_CSE_URL}?key=${GOOGLE_CSE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=5`;
    
    try {
        const options = { 
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            transform: {
                function: [canisterSelf(), 'searchTransform'] as [Principal, string], 
                context: new Uint8Array()
            },
        };

        const response = await azleFetch(searchUrl, options as RequestInit); // Cast to RequestInit here if needed

        if (response.status !== 200) {
            const errorDetails = await response.text(); 
            return Err(`Web Search API HTTP Error: ${response.status}. Details: ${errorDetails}`);
        }

        const data = await response.json(); 

        if (data.items && Array.isArray(data.items)) {
            const formattedResults: ISearchResultItem[] = data.items.map((item: any) => ({
                title: item.title || 'No Title',
                link: item.link || '#',
                snippet: item.snippet || 'No snippet available.',
                displayLink: item.displayLink ? item.displayLink :" "
            }));
            return Ok(formattedResults);
        } else {
            return Ok([]); 
        }

    } catch (error: any) {
        return Err(`Error during Web Search API call: ${error.message || 'Unknown error'}`);
    }
}