import Rodux from "@rbxts/rodux";
import { Players, RunService } from "@rbxts/services";
import { AllocatedRodux } from "./otherrodux/allocated-rodux";
import { RestrictedRodux } from "./otherrodux/restricted-rodux";

export namespace SharedRodux {
	export interface SharedState {
		BrickData: WithOwnership<number>;
		AllocatedData: WithOwnership<Map<string, AllocatedRodux.AllocatedState>>;
		RestrictedData: WithOwnership<Map<string, RestrictedRodux.RestrictedState>>;
	}
	export type WithOwnership<T> = { Ownership: string[]; value: T };
	export namespace Actions {
		export type Allocate = Rodux.Action<"Allocate"> & { key: string; state?: AllocatedRodux.AllocatedState };
		export type Dellocate = Rodux.Action<"Dellocate"> & { key: string };
		export type Init = Rodux.Action<"Init"> & { state: SharedState };
		export type DispatchAllocAction = Rodux.Action<"DispatchAllocAction"> & {
			key: string;
			action: AllocatedRodux.Actions.AllocatedActions;
		};
		export type DispatchRestrictedAction = Rodux.Action<"DispatchRestrictedAction"> & {
			key: string;
			action: RestrictedRodux.Actions.RestrictedAction;
		};
		export type IncrementBrick = Rodux.Action<"IncrementBrick">;
		export function CreateAAction(p: Player, state?: AllocatedRodux.AllocatedState): Allocate {
			return { type: "Allocate", key: GenerateKey(p), state: state };
		}
		export function CreateDAction(p: Player): Dellocate {
			return { type: "Dellocate", key: GenerateKey(p) };
		}
		export function CreateOSAD(x: SharedRodux.SharedActions, from?: Player): OnSharedActionDispatched {
			return {
				type: "OnSharedActionDispatched",
				From: from ? GenerateKey(from) : undefined,
				SharedAction: x,
			};
		}
	}
	export const OwnershipMap: { [a in SharedRodux.SharedActions["type"]]: keyof SharedRodux.SharedState | "none" } = {
		IncrementBrick: "BrickData",
		Allocate: "AllocatedData",
		Dellocate: "AllocatedData",
		DispatchAllocAction: "AllocatedData",
		Init: "none",
		DispatchRestrictedAction: "RestrictedData",
	};
	export type SharedActions =
		| Actions.IncrementBrick
		| Actions.Allocate
		| Actions.Dellocate
		| Actions.DispatchAllocAction
		| Actions.Init
		| Actions.DispatchRestrictedAction;
	export const DefaultSharedState: SharedState = {
		BrickData: { value: 5, Ownership: [] },
		AllocatedData: { value: new Map<string, AllocatedRodux.AllocatedState>(), Ownership: [] },
		RestrictedData: { value: new Map<string, RestrictedRodux.RestrictedState>(), Ownership: [] },
	};
	export function GenerateKey(p: Player): string {
		return `K_${p.UserId}`;
	}
	export const SharedReducer = Rodux.createReducer<SharedState, SharedActions>(DefaultSharedState, {
		IncrementBrick: (s) => {
			const g = { ...s };
			g.BrickData.value++;
			return g;
		},
		Allocate: (s, a) => {
			const g = { ...s };
			if (g.AllocatedData.value.get(a.key) === undefined && g.RestrictedData.value.get(a.key) === undefined) {
				g.AllocatedData.value.set(
					a.key,
					a.state !== undefined ? a.state : AllocatedRodux.DefaultAllocatedState,
				);
				g.RestrictedData.value.set(
					a.key,
					a.state !== undefined ? a.state : RestrictedRodux.DefaultRestrictedState,
				);
			}
			return g;
		},
		Dellocate: (s, a) => {
			const g = { ...s };
			if (g.AllocatedData.value.get(a.key) !== undefined && g.RestrictedData.value.delete(a.key) !== undefined) {
				g.AllocatedData.value.delete(a.key);
				g.RestrictedData.value.delete(a.key);
			}
			return g;
		},
		DispatchAllocAction: (s, a) => {
			const g = { ...s };
			const data = g.AllocatedData.value.get(a.key);
			if (data !== undefined) {
				const d = AllocatedRodux.AllocatedReducer({ ...data }, a.action);
				g.AllocatedData.value.set(a.key, d);
			}
			return g;
		},
		DispatchRestrictedAction: (s, a) => {
			const g = { ...s };
			const data = g.RestrictedData.value.get(a.key);
			if (data !== undefined) {
				const d = RestrictedRodux.RestrictedReducer({ ...data }, a.action);
				g.RestrictedData.value.set(a.key, d);
			}
			return g;
		},
		Init: (_, a) => a.state,
	});
	export function CreateActionGuard<J extends Rodux.Action>() {
		return function <T extends J["type"]>(tc: T, x: J | Rodux.Action<T>): x is Rodux.Action<T> {
			return x.type === tc;
		};
	}
	export const SharedGuard = CreateActionGuard<SharedActions>();
	export type OnSharedActionDispatched = Rodux.Action<"OnSharedActionDispatched"> & {
		SharedAction: SharedRodux.SharedActions;
		From?: string;
		ServerFrom?: Player;
	};
}
