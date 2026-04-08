import { SocketEventDefinition } from "./types.js";

export function createSocketEvent<TKey extends string>(key: TKey) {
  return function <
    TPayloadArgs extends unknown[],
    TPayloadReturn,
  >(): SocketEventDefinition<TKey, TPayloadArgs, TPayloadReturn> {
    return { key };
  };
}
