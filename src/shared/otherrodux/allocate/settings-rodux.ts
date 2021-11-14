import Rodux from "@rbxts/rodux";

/**
 * TODO:Create some settings
 */

export namespace SettingsRodux {
  export interface SettingsState {}
  export namespace Actions {
    export type InitAction = Rodux.Action<"Init"> & { state: SettingsState };
    export type SettingsActions = InitAction;
  }

  export const DefaultSettingsState: SettingsState = {};
  export const SettingsRodux = Rodux.createReducer<SettingsState, Actions.SettingsActions>(DefaultSettingsState, {
    Init: (_, a) => a.state,
  });
}
