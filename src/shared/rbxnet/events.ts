import { Definitions } from "@rbxts/net";
import { EphTypes } from "shared/ephevents/ephtypes";
import { SharedRodux } from "shared/shared-rodux";

export const events = Definitions.Create({
  MutateServer: Definitions.ClientToServerEvent<[SharedRodux.SharedActions]>(),
  ServerDispatch: Definitions.ServerToClientEvent<[SharedRodux.OnSharedActionDispatched]>(),
  RequestData: Definitions.ServerAsyncFunction<() => SharedRodux.SharedState>(),
  SendEvent: Definitions.ClientToServerEvent<[EphTypes.IClientDatapack<keyof EphTypes.packs>]>(),
  EventDispatch: Definitions.ServerToClientEvent<[EphTypes.IServerDatapack<keyof EphTypes.packs>]>(),
});
