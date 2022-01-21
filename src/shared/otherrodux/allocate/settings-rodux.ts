import Rodux from "@rbxts/rodux";
import { $terrify } from "rbxts-transformer-t";

/**
 * TODO:Create some settings
 */

export namespace SettingsRodux {
  export const statustab: Array<SettingsState["DebugToolStatus"]> = ["Phi", "Sigmoid", "Vue"];
  export interface SettingsState {
    DebugToolStatus: "Phi" | "Sigmoid" | "Vue";
  }
  export namespace Actions {
    export type InitAction = Rodux.Action<"Init"> & { state: SettingsState };
    export type ChangeModeAction = Rodux.Action<"ChangeMode"> & { status: string };
    export type SettingsActions = InitAction | ChangeModeAction;
  }

  export const DefaultSettingsState: SettingsState = { DebugToolStatus: "Phi" };
  export const SettingsRoduxReducer = Rodux.createReducer<SettingsState, Actions.SettingsActions>(
    DefaultSettingsState,
    {
      Init: (_, a) => a.state,
      ChangeMode: (s, a) => {
        if (!$terrify<SettingsState["DebugToolStatus"]>()(a.status)) return s;
        const g = { ...s };
        g.DebugToolStatus = a.status;
        return g;
      },
    },
  );
}
