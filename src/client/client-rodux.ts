import Llama from "@rbxts/llama";
import Rodux, { thunkMiddleware } from "@rbxts/rodux";
import { Players } from "@rbxts/services";
import Signal from "@rbxts/signal";
import { CharacterRodux } from "shared/otherrodux/allocate/character-rodux";
import { SettingsRodux } from "shared/otherrodux/allocate/settings-rodux";
import { AllocatedRodux } from "shared/otherrodux/allocated-rodux";
import { events } from "shared/rbxnet/events";
import { SharedRodux } from "shared/shared-rodux";
import { SharedRoduxUtil } from "shared/shared-rodux-util";

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
    /**
     * Create Dispatch Allocated Action
     */
    export function EasyDAA(action: AllocatedRodux.Actions.AllocatedActions): SharedRodux.OnSharedActionDispatched {
      return CreateSendOSAD(CreateClientDAA(action));
    }
    /**
     * Create Dispatch Character Action
     */
    export function EasyDCA(action: CharacterRodux.Actions.CharacterActions): SharedRodux.OnSharedActionDispatched {
      return EasyDAA({ type: "DispatchChar", action: action });
    }
    /**
     * Create Dispatch Settings Action
     */
    export function EasyDSA(action: SettingsRodux.Actions.SettingsActions): SharedRodux.OnSharedActionDispatched {
      return EasyDAA({ type: "DispatchSettings", action: action });
    }
  }

  export function GetPlayerAlloc(
    player: Player,
    s?: SharedRodux.SharedState,
  ): AllocatedRodux.AllocatedState | undefined {
    return AllocatedRodux.GetAllocData(SharedRodux.GenerateKey(player), s ? s : ClientStore.getState().Shared);
  }
  export function GetLocalPlayerAlloc(s?: SharedRodux.SharedState): AllocatedRodux.AllocatedState | undefined {
    return GetPlayerAlloc(Players.LocalPlayer, s);
  }

  export const DefaultClientState: ClientState = {
    Shared: { ...SharedRodux.DefaultSharedState },
  };
  export function CreateSendOSAD(x: SharedRodux.SharedActions) {
    return SharedRodux.Actions.CreateOSAD(x, Players.LocalPlayer);
  }
  export function CreateClientDAA(x: AllocatedRodux.Actions.AllocatedActions): SharedRodux.Actions.DispatchAllocAction {
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
  export const ClientGuard = SharedRoduxUtil.CreateActionGuard<Actions.ClientActions>();
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
        Events.OnActionDispatched.Fire(a);
      };
    };
  }
  export namespace Events {
    export const OnActionDispatched = new Signal<(a: Actions.ClientActions) => void>();
  }
  export const ClientStore = new Rodux.Store<
    ClientState,
    Actions.ClientActions,
    Actions.ClientActions,
    Thunks.ClientThunk
  >(ClientReducer, undefined, [CreateClientMiddleware(), thunkMiddleware]);
}
