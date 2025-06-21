// backend_canister/src/index.ts
import {
    update,
    query,
    Principal, 
    StableBTreeMap,
    IDL,
    msgCaller
} from 'azle';
import * as llm from '@dfinity/llm'


import { callGeminiAPI, performWebSearch } from './utils';
import {
    ChatMessage,
    IChatMessage,
    SearchResultItem,
    ISearchResultItem,
    AISearchAnswer,
    IAISearchAnswer,
    SessionData,
    ISessionData,
    Result,
    Ok, 
    Err, 
    HttpResponse,
    IHttpResponse
} from './types';


/*Canister State: Stable Storage for Sessions ---
Stores session data for each user (identified by their Principal).
 The '0' is the memory ID for this StableBTreeMap.
 */
let sessions = new StableBTreeMap<Principal, ISessionData>(0);

// Max number of messages to keep in conversation history for LLM context (per session)
const MAX_CONVERSATION_HISTORY_LENGTH = 10; 
/* Helper to get/initialize session data 
  Retrieves the current caller's session data, or initializes it if it doesn't exist. 
 */
function getCallerSession(): ISessionData {
    const callerPrincipal: Principal =msgCaller();
    let sessionOpt = sessions.get(callerPrincipal);

    
    if (sessionOpt) { 
        // Initialize new session data for this principal
        const newSession: ISessionData = {
            conversationHistory: [],
            searchAnswerHistory: []
        };
        sessions.insert(callerPrincipal, newSession);
        return newSession;
    } else {
        return {  conversationHistory: [],
            searchAnswerHistory: []};
    }
}

//Saves the updated session data for the current caller.
function saveCallerSession(sessionData: ISessionData): void {
    const callerPrincipal: Principal = msgCaller();
    sessions.insert(callerPrincipal, sessionData);
}


export default class {
    /*Initial greeting (query function - read-only)
    @query([], IDL.Text)
    greet(): string {
        return `Hello from ICP AI Search Agent Backend! Your Principal:${msgCaller().toText()}`;
    }*/
	//test llm prompt
    @update([IDL.Text], IDL.Text)
    async prompt(prompt: string): Promise<string> {
        return await llm.prompt(llm.Model.Llama3_1_8B, prompt);
    }
        // Resets the conversation history for the current caller's session.

    @update([], IDL.Text)
    resetConversation(): string {
        const session = getCallerSession();
        session.conversationHistory = [];
        saveCallerSession(session);
        return "Conversation history reset for your session.";
    }

    // Resets the search answer history for the current caller's session.
  
    @update([], IDL.Text)
    resetSearchAnswerHistory(): string {
        const session = getCallerSession();
        session.searchAnswerHistory = [];
        saveCallerSession(session);
        return "Search answer history reset for your session.";
    }

    /*
      Submits a search query, uses LLM for processing, performs web search,
      and synthesizes an answer. Stores history per session.
     */
    @update([IDL.Text], Result(AISearchAnswer, IDL.Text))
    async aiSearch(userQuery: string): Promise<Result<IAISearchAnswer, string>> {
        

        const session = getCallerSession(); // Get session data for current caller

        // 1. Add user's query to conversation history for LLM context
        session.conversationHistory.push({
            role: 'user',
            parts: [{ text: userQuery }]
        });

        // Truncate conversation history to manage token limits
        if (session.conversationHistory.length > MAX_CONVERSATION_HISTORY_LENGTH) {
            session.conversationHistory = session.conversationHistory.slice(
                session.conversationHistory.length - MAX_CONVERSATION_HISTORY_LENGTH
            );
            
        }

        // Step 1: Use LLM to understand and potentially formulate search query 
        const searchQueryPrompt: IChatMessage[] = [
            ...session.conversationHistory, // Provide full context for the LLM
            {
                role: 'user',
                parts: [{
                    text: `Based on the conversation history, what is the most concise and effective search query to find information for "${userQuery}"? Provide only the search query, nothing else.`
                }]
            }
        ];
        const extractedQueryResult: Result<string, string> = await callGeminiAPI(searchQueryPrompt);

        let queryForWebSearch: string = userQuery;
        if ('Ok' in extractedQueryResult) { 
            queryForWebSearch = extractedQueryResult.Ok.trim();

        } else {
            
        }

        // Step 2: Perform Web Search 
        const searchResultsResult: Result<ISearchResultItem[], string> = await performWebSearch(queryForWebSearch);

        let relevantSources: ISearchResultItem[] = [];
        let searchContentForLLM: string = "No search results found.";

        if ('Ok' in searchResultsResult && searchResultsResult.Ok.length > 0) { 
            relevantSources = searchResultsResult.Ok;
            // Format search results into a string for the LLM to synthesize
            searchContentForLLM = "Search Results:\n" +
                relevantSources.map((item, idx) =>
                    `[${idx + 1}] Title: ${item.title}\nLink: ${item.link}\nSnippet: ${item.snippet}`
                ).join('\n\n');

        } else if ('Err' in searchResultsResult) {

            searchContentForLLM = `Error during web search: ${searchResultsResult.Err}`;
        } else {

        }

        //  Step 3: Use LLM to synthesize the answer from search results ---
        const synthesisPrompt: IChatMessage[] = [
            ...session.conversationHistory, // Provide conversation context
            {
                role: 'user',
                parts: [{
                    text: `Given the following search results:\n\n${searchContentForLLM}\n\nBased on these results and the user's original query "${userQuery}", provide a concise and helpful answer. If the results are insufficient, state that you cannot find a definitive answer. Do not make up information. Always cite sources by their [number] if available.`
                }]
            }
        ];

        const synthesizedAnswerResult: Result<string, string> = await callGeminiAPI(synthesisPrompt);

        let finalAnswer: string;

        if ('Ok' in synthesizedAnswerResult) { 
            finalAnswer = synthesizedAnswerResult.Ok;
            
        } else {
            finalAnswer = `Sorry, I couldn't synthesize an answer: ${synthesizedAnswerResult.Err}`;
           
        }

        // 4. Add model's response to conversation history
        session.conversationHistory.push({
            role: 'model',
            parts: [{ text: finalAnswer }]
        });

        const currentTimestamp: string = new Date().toISOString();
        const aiSearchAnswer: IAISearchAnswer = {
            query: userQuery,
            answer: finalAnswer,
            sources: relevantSources,
            timestamp: currentTimestamp
        };

        // 5. Store the full AI search answer in history for this session
        session.searchAnswerHistory.push(aiSearchAnswer);
        saveCallerSession(session);

        
        return Ok(aiSearchAnswer); 
    }

    //Retrieves the conversation history for the current caller's session.
    @query([], IDL.Vec(ChatMessage))
    getConversationHistory(): IChatMessage[] {
        const session = getCallerSession();
        return session.conversationHistory;
    }

    //Retrieves the history of all AI search answers for the current caller's session.
    @query([], IDL.Vec(AISearchAnswer))
    getSearchAnswerHistory(): IAISearchAnswer[] {
        const session = getCallerSession();
        return session.searchAnswerHistory;
    }

    // HTTP Outcall Transform Functions 
    //Transform function for Gemini API response.
    @query([HttpResponse], HttpResponse)
    geminiTransform(args: IHttpResponse): IHttpResponse {
        return {
            status: args.status,
            headers: [], // Clear headers to minimize size for consensus
            body: args.body
        };
    }

    //Transform function for Google Custom Search API response.

    @query([HttpResponse], HttpResponse)
    searchTransform(args: IHttpResponse): IHttpResponse {
        return {
            status: args.status,
            headers: [], // Clear headers to minimize size for consensus
            body: args.body
        };
    }
}
