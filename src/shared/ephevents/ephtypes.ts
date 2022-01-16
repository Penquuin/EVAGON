// Ephemeral events

export namespace EphTypes {
  export type packs = {
    ephcookie: {
      increment: boolean;
    };
    quack: { yes: number };
  };
  export const ServerTypeGuard = <S extends keyof packs>(name: S, x: IServerDatapack): x is IServerDatapack<S> => {
    return x.name === name;
  };
  interface IDatapack<S extends keyof packs> {
    pack: packs[S]; // we have no ways to tell if the client
    name: S;
  }
  export interface IClientDatapack<S extends keyof packs = keyof packs> extends IDatapack<S> {}
  export interface IServerDatapack<S extends keyof packs = keyof packs> extends IDatapack<S> {
    sender?: number;
  }
}
