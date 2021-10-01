import Rodux from "@rbxts/rodux";
import { SharedRodux } from "shared/shared-rodux";

export namespace AllocatedRodux {
	export interface AllocatedState {}
	export namespace Actions {
		export type InitAction = Rodux.Action<"Init"> & { state: AllocatedState };
		export type AllocatedActions = InitAction;
	}

	export function GetAllocData(key: string, state: SharedRodux.SharedState): AllocatedState | undefined {
		const g = state.AllocatedData.value.get(key);
		if (g !== undefined) {
			return { ...g };
		}
	}

	export const DefaultAllocatedState: AllocatedState = {};
	export const AllocatedReducer = Rodux.createReducer<AllocatedState, Actions.AllocatedActions>(
		DefaultAllocatedState,
		{
			Init: (_, a) => a.state,
		},
	);
}
