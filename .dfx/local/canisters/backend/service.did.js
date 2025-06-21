export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'aiSearch' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'query' : IDL.Text,
              'answer' : IDL.Text,
              'timestamp' : IDL.Text,
              'sources' : IDL.Vec(
                IDL.Record({
                  'title' : IDL.Text,
                  'displayLink' : IDL.Opt(IDL.Text),
                  'link' : IDL.Text,
                  'snippet' : IDL.Text,
                })
              ),
            }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'geminiTransform' : IDL.Func(
        [
          IDL.Record({
            'status' : IDL.Nat16,
            'body' : IDL.Vec(IDL.Nat8),
            'headers' : IDL.Vec(
              IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text })
            ),
          }),
        ],
        [
          IDL.Record({
            'status' : IDL.Nat16,
            'body' : IDL.Vec(IDL.Nat8),
            'headers' : IDL.Vec(
              IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text })
            ),
          }),
        ],
        ['query'],
      ),
    'getConversationHistory' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'role' : IDL.Text,
              'parts' : IDL.Vec(IDL.Record({ 'text' : IDL.Text })),
            })
          ),
        ],
        ['query'],
      ),
    'getSearchAnswerHistory' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'query' : IDL.Text,
              'answer' : IDL.Text,
              'timestamp' : IDL.Text,
              'sources' : IDL.Vec(
                IDL.Record({
                  'title' : IDL.Text,
                  'displayLink' : IDL.Opt(IDL.Text),
                  'link' : IDL.Text,
                  'snippet' : IDL.Text,
                })
              ),
            })
          ),
        ],
        ['query'],
      ),
    'prompt' : IDL.Func([IDL.Text], [IDL.Text], []),
    'resetConversation' : IDL.Func([], [IDL.Text], []),
    'resetSearchAnswerHistory' : IDL.Func([], [IDL.Text], []),
    'searchTransform' : IDL.Func(
        [
          IDL.Record({
            'status' : IDL.Nat16,
            'body' : IDL.Vec(IDL.Nat8),
            'headers' : IDL.Vec(
              IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text })
            ),
          }),
        ],
        [
          IDL.Record({
            'status' : IDL.Nat16,
            'body' : IDL.Vec(IDL.Nat8),
            'headers' : IDL.Vec(
              IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text })
            ),
          }),
        ],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
