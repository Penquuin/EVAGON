import Rodux, { thunkMiddleware } from "@rbxts/rodux";
import { Players } from "@rbxts/services";
import { AllocatedRodux } from "shared/otherrodux/allocated-rodux";
import { events } from "shared/rbxnet/events";
import { SharedRodux } from "shared/shared-rodux";

export namespace ClientRodux {
	export interface ClientState {
		Shared: SharedRodux.SharedState;
	}
	export namespace Actions {
		export type InitAction = Rodux.Action<"Init"> & { State: ClientState };
		export type ClientActions = InitAction | SharedRodux.OnSharedActionDispatched;
	}
	export namespace Thunks {
		export type ClientThunk = Rodux.ThunkDispatcher<ClientState, Actions.ClientActions>;
		export type ClientThunkAction = Rodux.ThunkAction<void, ClientState, {}, Actions.ClientActions>;
		//client shared
		function EasyDAA(action: AllocatedRodux.Actions.AllocatedActions): SharedRodux.OnSharedActionDispatched {
			return CreateSendOSAD(CreateClientDAA(action));
		}
	}

	export function GetPlayerAlloc(s?: SharedRodux.SharedState): AllocatedRodux.AllocatedState | undefined {
		return AllocatedRodux.GetAllocData(
			SharedRodux.GenerateKey(Players.LocalPlayer),
			s ? s : ClientStore.getState().Shared,
		);
	}

	export const DefaultClientState: ClientState = {
		Shared: SharedRodux.DefaultSharedState,
	};
	export function CreateSendOSAD(x: SharedRodux.SharedActions) {
		return SharedRodux.Actions.CreateOSAD(x, Players.LocalPlayer);
	}
	export function CreateClientDAA(
		x: AllocatedRodux.Actions.AllocatedActions,
	): SharedRodux.Actions.DispatchAllocAction {
		return {
			type: "DispatchAllocAction",
			key: SharedRodux.GenerateKey(Players.LocalPlayer),
			action: x,
		};
	}
	const ClientReducer = Rodux.createReducer<ClientState, Actions.ClientActions>(DefaultClientState, {
		Init: (_, a) => a.State,
		OnSharedActionDispatched: (s, a) => {
			const g = { ...s };
			g.Shared = SharedRodux.SharedReducer({ ...g.Shared }, a.SharedAction);
			return g;
		},
	});
	const ClientGuard = SharedRodux.CreateActionGuard<Actions.ClientActions>();
	function CreateClientMiddleware(): Rodux.Middleware<Actions.ClientActions, ClientState> {
		return (nd, s) => {
			return (a: Actions.ClientActions) => {
				if (!typeIs(a, "function")) {
					if (ClientGuard("OnSharedActionDispatched", a)) {
						//is shared
						if (
							a.From === SharedRodux.GenerateKey(Players.LocalPlayer) &&
							(SharedRodux.OwnershipMap[a.SharedAction.type] !== "none" ||
								a.SharedAction.type === "DispatchAllocAction")
						) {
							//from self
							events.Client.Get("MutateServer").SendToServer(a.SharedAction);
						}
					}
				}
				nd(a as Actions.ClientActions & Rodux.AnyAction);
			};
		};
	}
	export const ClientStore = new Rodux.Store<
		ClientState,
		Actions.ClientActions,
		Actions.ClientActions,
		Thunks.ClientThunk
	>(ClientReducer, undefined, [CreateClientMiddleware(), thunkMiddleware]);
}
