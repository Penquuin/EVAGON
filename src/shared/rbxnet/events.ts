import { Definitions } from "@rbxts/net";
import { SharedRodux } from "shared/shared-rodux";

export const events = Definitions.Create({
	MutateServer: Definitions.ClientToServerEvent<[SharedRodux.SharedActions]>(),
	ServerDispatch: Definitions.ServerToClientEvent<[SharedRodux.OnSharedActionDispatched]>(),
	RequestData: Definitions.ServerAsyncFunction<() => SharedRodux.SharedState>(),
});
