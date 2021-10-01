import Rodux from "@rbxts/rodux";
import { SharedRodux } from "shared/shared-rodux";

export namespace RestrictedRodux {
	export interface RestrictedState {}
	export namespace Actions {
		export type InitAction = Rodux.Action<"Init"> & { state: RestrictedState };
		export type RestrictedAction = InitAction;
	}

	export function GetRestrictedData(key: string, state: SharedRodux.SharedState): RestrictedState | undefined {
		const g = state.RestrictedData.value.get(key);
		if (g !== undefined) {
			return { ...g };
		}
	}

	export const DefaultRestrictedState: RestrictedState = {};
	export const RestrictedReducer = Rodux.createReducer<RestrictedState, Actions.RestrictedAction>(
		DefaultRestrictedState,
		{
			Init: (_, a) => a.state,
		},
	);
}
