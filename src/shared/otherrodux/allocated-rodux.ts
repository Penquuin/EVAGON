import Rodux from "@rbxts/rodux";
import { SharedRodux } from "shared/shared-rodux";
import { SharedRoduxUtil } from "shared/shared-rodux-util";
import { CharacterRodux } from "./allocate/character-rodux";
import { SettingsRodux } from "./allocate/settings-rodux";

export namespace AllocatedRodux {
  export interface AllocatedState {
    CharacterState: CharacterRodux.CharacterState;
    SettingsState: SettingsRodux.SettingsState;
  }
  export namespace Actions {
    export type InitAction = Rodux.Action<"Init"> & { state: AllocatedState };
    export type DispatchCharAction = Rodux.Action<"DispatchChar"> & {
      action: CharacterRodux.Actions.CharacterActions;
    };
    export type DispatchSettingsAction = Rodux.Action<"DispatchSettings"> & {
      action: SettingsRodux.Actions.SettingsActions;
    };
    export type AllocatedActions = InitAction | DispatchCharAction | DispatchSettingsAction;
  }

  export function GetAllocData(key: string, state: SharedRodux.SharedState): AllocatedState | undefined {
    const g = state.AllocatedData.value.get(key);
    if (g !== undefined) {
      return { ...g };
    }
  }

  export const DefaultAllocatedState: AllocatedState = {
    CharacterState: { ...CharacterRodux.DefaultCharacterState },
    SettingsState: { ...SettingsRodux.DefaultSettingsState },
  };
  export const AllocatedReducer = Rodux.createReducer<AllocatedState, Actions.AllocatedActions>(DefaultAllocatedState, {
    Init: (_, a) => a.state,
    DispatchChar: (s, a) => {
      const g = { ...s };
      g.CharacterState = CharacterRodux.CharacterReducer(g.CharacterState, a.action);
      return g;
    },
    DispatchSettings: (s, a) => {
      const g = { ...s };
      g.SettingsState = SettingsRodux.SettingsRoduxReducer(g.SettingsState, a.action);
      return g;
    },
  });
  export const AllocGuard = SharedRoduxUtil.CreateActionGuard<Actions.AllocatedActions>();
}
