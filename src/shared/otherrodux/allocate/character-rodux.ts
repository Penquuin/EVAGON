import Rodux from "@rbxts/rodux";

export namespace CharacterRodux {
	export interface CharacterState {
		LookUnit: Vector3;
	}
	export namespace Actions {
		export type InitAction = Rodux.Action<"Init"> & { state: CharacterState };
		export type SetLookUnitAction = Rodux.Action<"SetLookUnit"> & { value: Vector3 };
		export type CharacterActions = InitAction | SetLookUnitAction;
	}

	export const DefaultCharacterState: CharacterState = {
		LookUnit: new Vector3(1, 0, 0),
	};
	export const CharacterReducer = Rodux.createReducer<CharacterState, Actions.CharacterActions>(
		DefaultCharacterState,
		{
			Init: (_, a) => a.state,
			SetLookUnit: (s, a) => {
				const g = { ...s };
				g.LookUnit = a.value;
				return g;
			},
		},
	);
	//Rate limit: per sec
	export const RateLimits: {
		[a in Actions.CharacterActions["type"]]?: number;
	} = {
		SetLookUnit: 4,
	};
}
