import Rodux from "@rbxts/rodux";
import { Players } from "@rbxts/services";
import { CharacterRodux } from "shared/otherrodux/allocate/character-rodux";
import { AllocatedRodux } from "shared/otherrodux/allocated-rodux";
import { events } from "shared/rbxnet/events";
import { SharedRodux } from "shared/shared-rodux";
import { SharedRoduxUtil } from "shared/shared-rodux-util";

export namespace ServerRodux {
  export interface ServerState {
    Shared: SharedRodux.SharedState;
  }
  export namespace Actions {
    type BaseOwnershipAct = {
      FieldName: keyof SharedRodux.SharedState;
      Player?: Player;
    };
    export type SetOwnership = Rodux.Action<"SetOwnership"> & BaseOwnershipAct;
    export type RemoveOwnership = Rodux.Action<"RemoveOwnership"> & BaseOwnershipAct;
    export type InitAction = Rodux.Action<"Init"> & { State: ServerState };
    export type ServerActions = InitAction | SharedRodux.OnSharedActionDispatched | SetOwnership | RemoveOwnership;
  }

  export const DefaultServerState: ServerState = {
    Shared: { ...SharedRodux.DefaultSharedState },
  };
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
            let dto = true;
            //If it's Silkmatic
            if (!supremacy) {
              if (SharedRodux.SharedGuard("DispatchAllocAction", a.SharedAction)) {
                //Override cloud storage key
                a.SharedAction.key = SharedRodux.GenerateKey(a.ServerFrom);
                //Rate limiting
                dto = RateLimiting.AllocCache.CheckRate(a.ServerFrom, a.SharedAction.action.type);
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
            if (dto) {
              Events.ServerDispatch.SendToAllPlayersExcept(a.ServerFrom, rep);
            }
          } else {
            Events.ServerDispatch.SendToAllPlayers({ ...a });
          }
        }
        n(a as Actions.ServerActions & Rodux.AnyAction);
      };
    };
  }
  const ServerGuard = SharedRoduxUtil.CreateActionGuard<Actions.ServerActions>();
  export const ServerStore = new Rodux.Store<ServerState, Actions.ServerActions, Actions.ServerActions>(
    ServerReducer,
    undefined,
    [CreateServerMiddleware()],
  );
  export namespace RateLimiting {
    type actToNum<T extends Rodux.Action> = { [a in T["type"]]: number };
    class RLCache<T extends Rodux.Action> {
      private Buffer = new Map<string, Partial<actToNum<T>>>();
      private readonly standard: actToNum<T>;
      constructor(rlbase: actToNum<T>) {
        this.standard = rlbase;
        print(rlbase);
        Players.PlayerAdded.Connect((p) => {
          this.Add(p);
        });
        Players.PlayerRemoving.Connect((p) => {
          this.Remove(p);
        });
      }
      public CheckRate(player: Player, actiontype: T["type"]): boolean {
        const k = this.Get(player);
        if (k !== undefined) {
          const j = k[actiontype];
          if (j !== undefined) {
            const elapse = tick() - (j as number);
            if (elapse <= this.standard[actiontype] && this.standard[actiontype] > 0) {
              /**
               * !DEBUG
               */
              warn("Player has exceeded time for: " + actiontype);
              return false;
            }
          }
          this.SetTick(player, actiontype);
          return true;
        }
        return false;
      }
      public Add(player: Player) {
        const k = SharedRodux.GenerateKey(player);
        if (this.Buffer.get(k) === undefined) {
          this.Buffer.set(k, {});
        }
      }
      private SetTick(player: Player, actiontype: T["type"]) {
        const t = this.Buffer.get(SharedRodux.GenerateKey(player));
        if (t !== undefined) {
          const g = { ...t };
          g[actiontype] = tick();
        }
      }
      public Get(player: Player) {
        return this.Buffer.get(SharedRodux.GenerateKey(player));
      }
      public Remove(player: Player) {
        const k = SharedRodux.GenerateKey(player);
        if (this.Buffer.get(k) !== undefined) {
          this.Buffer.delete(k);
        }
      }
    }
    export const AllocCache = new RLCache<AllocatedRodux.Actions.AllocatedActions>({
      DispatchChar: -1,
      Init: -1,
    });
    export const CharCache = new RLCache<CharacterRodux.Actions.CharacterActions>({
      Init: -1,
      SetLookUnit: 1 / 30,
    });
  }
}
