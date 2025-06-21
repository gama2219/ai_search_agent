import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'aiSearch' : ActorMethod<
    [string],
    {
        'Ok' : {
          'query' : string,
          'answer' : string,
          'timestamp' : string,
          'sources' : Array<
            {
              'title' : string,
              'displayLink' : [] | [string],
              'link' : string,
              'snippet' : string,
            }
          >,
        }
      } |
      { 'Err' : string }
  >,
  'geminiTransform' : ActorMethod<
    [
      {
        'status' : number,
        'body' : Uint8Array | number[],
        'headers' : Array<{ 'value' : string, 'name' : string }>,
      },
    ],
    {
      'status' : number,
      'body' : Uint8Array | number[],
      'headers' : Array<{ 'value' : string, 'name' : string }>,
    }
  >,
  'getConversationHistory' : ActorMethod<
    [],
    Array<{ 'role' : string, 'parts' : Array<{ 'text' : string }> }>
  >,
  'getSearchAnswerHistory' : ActorMethod<
    [],
    Array<
      {
        'query' : string,
        'answer' : string,
        'timestamp' : string,
        'sources' : Array<
          {
            'title' : string,
            'displayLink' : [] | [string],
            'link' : string,
            'snippet' : string,
          }
        >,
      }
    >
  >,
  'prompt' : ActorMethod<[string], string>,
  'resetConversation' : ActorMethod<[], string>,
  'resetSearchAnswerHistory' : ActorMethod<[], string>,
  'searchTransform' : ActorMethod<
    [
      {
        'status' : number,
        'body' : Uint8Array | number[],
        'headers' : Array<{ 'value' : string, 'name' : string }>,
      },
    ],
    {
      'status' : number,
      'body' : Uint8Array | number[],
      'headers' : Array<{ 'value' : string, 'name' : string }>,
    }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
