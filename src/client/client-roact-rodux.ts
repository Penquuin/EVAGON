export namespace ClientRoactRodux {
  export type CreateDispatchActs<T extends string> = { [i in T]: () => void };
}
