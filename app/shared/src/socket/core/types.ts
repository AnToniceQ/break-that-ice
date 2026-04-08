export interface SocketEventDefinition<
  TKey extends string,
  _TPayloadArgs extends unknown[],
  _TPayloadReturn,
> {
  key: TKey;
}

export type ExtractSocketEventKeyType<
  T extends SocketEventDefinition<string, unknown[], unknown>,
> = T["key"];

export type ExtractSocketEventArgsType<T> =
  T extends SocketEventDefinition<string, infer TPayloadArgs, unknown>
    ? TPayloadArgs
    : never;

export type ExtractSocketEventReturnType<T> =
  T extends SocketEventDefinition<string, unknown[], infer TPayloadReturn>
    ? TPayloadReturn
    : never;

export type ExtractSocketEventPayloadType<T> =
  T extends SocketEventDefinition<
    string,
    infer TPayloadArgs,
    infer TPayloadReturn
  >
    ? (...args: TPayloadArgs) => TPayloadReturn
    : never;
