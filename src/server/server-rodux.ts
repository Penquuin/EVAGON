import Rodux from "@rbxts/rodux";
import { events } from "shared/rbxnet/events";
import { SharedRodux } from "shared/shared-rodux";

export namespace ServerRodux {
	export interface ServerState {
		Shared: SharedRodux.SharedState;
	}
	export namespace Actions {
		type BaseOwnershipAct = { FieldName: keyof SharedRodux.SharedState; Player?: Player };
		export type SetOwnership = Rodux.Action<"SetOwnership"> & BaseOwnershipAct;
		export type RemoveOwnership = Rodux.Action<"RemoveOwnership"> & BaseOwnershipAct;
		export type InitAction = Rodux.Action<"Init"> & { State: ServerState };
		export type ServerActions = InitAction | SharedRodux.OnSharedActionDispatched | SetOwnership | RemoveOwnership;
	}

	export const DefaultServerState: ServerState = { Shared: SharedRodux.DefaultSharedState };
	const ServerReducer = Rodux.createReducer<ServerState, Actions.ServerActions>(DefaultServerState, {
		Init: (_, a) => a.State,
		OnSharedActionDispatched: (s, a) => {
			const g = { ...s };
			g.Shared = SharedRodux.SharedReducer({ ...g.Shared }, a.SharedAction);
			return g;
		},
		SetOwnership: (s, a) => {
			const g = { ...s };
			if (!a.Player) {
				//clean all owners
				g.Shared[a.FieldName].Ownership = [];
				return g;
			}
			const i = g.Shared[a.FieldName].Ownership.indexOf(SharedRodux.GenerateKey(a.Player));
			if (i === -1) {
				g.Shared[a.FieldName].Ownership.push(SharedRodux.GenerateKey(a.Player));
			}
			return g;
		},
		RemoveOwnership: (s, a) => {
			if (!a.Player) return s;
			const g = { ...s };
			const i = g.Shared[a.FieldName].Ownership.indexOf(SharedRodux.GenerateKey(a.Player));
			if (i !== -1) {
				g.Shared[a.FieldName].Ownership.remove(i);
			}
			return g;
		},
	});
	namespace Events {
		export const ServerDispatch = events.Server.Create("ServerDispatch");
	}
	function CheckOwnership(field: SharedRodux.WithOwnership<unknown>, key: string): boolean {
		const i = field.Ownership.indexOf(key);
		return i !== -1;
	}
	function CreateServerMiddleware(): Rodux.Middleware<Actions.ServerActions, ServerState> {
		return (n, _) => {
			return (i: Actions.ServerActions) => {
				const a: Actions.ServerActions = { ...i };
				const s = ServerStore.getState();
				if (ServerGuard("OnSharedActionDispatched", a)) {
					//If it modifies the shared
					if (a.From !== undefined && a.ServerFrom !== undefined) {
						//If it's from a player
						const supremacy = a.ServerFrom.UserId === game.CreatorId;
						//If it's Silkmatic
						if (!supremacy) {
							if (SharedRodux.SharedGuard("DispatchAllocAction", a.SharedAction)) {
								//Override cloud storage key
								a.SharedAction.key = SharedRodux.GenerateKey(a.ServerFrom);
							} else {
								const fn = SharedRodux.OwnershipMap[a.SharedAction.type];
								if (fn === "none" || !CheckOwnership(s.Shared[fn], a.From)) {
									print(`Violate from ${a.ServerFrom.Name} for ${a.SharedAction.type}`);
									return;
								}
							}
						}
						const rep = { ...a };
						rep.ServerFrom = undefined; //Dispose ephemeral property
						Events.ServerDispatch.SendToAllPlayersExcept(a.ServerFrom, rep);
					} else {
						Events.ServerDispatch.SendToAllPlayers({ ...a });
					}
				}
				n(a as Actions.ServerActions & Rodux.AnyAction);
			};
		};
	}
	const ServerGuard = SharedRodux.CreateActionGuard<Actions.ServerActions>();
	export const ServerStore = new Rodux.Store<ServerState, Actions.ServerActions, Actions.ServerActions>(
		ServerReducer,
		undefined,
		[CreateServerMiddleware()],
	);
}
