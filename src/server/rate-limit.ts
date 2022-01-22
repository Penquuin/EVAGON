/**
 * This system is currently used to prevent massive incoming packages sent from the clients connected to the game.
 * Its types have been optimized for future usages. The current rate-limiting method is the density approach, which
 * is detonated in the unit defined as `Discrete Number of Events / Unit Time`.
 */

import Rodux from "@rbxts/rodux";
import { Players } from "@rbxts/services";
import { CharacterRodux } from "shared/otherrodux/allocate/character-rodux";
import { AllocatedRodux } from "shared/otherrodux/allocated-rodux";
import { SharedRodux } from "shared/shared-rodux";
import { EphTypes } from "shared/ephevents/ephtypes";
import { SettingsRodux } from "shared/otherrodux/allocate/settings-rodux";

export namespace RateLimiting {
  type baseToNum<T extends string> = { [x in T]: number };
  class BaseCache<T extends string, M extends baseToNum<T> = baseToNum<T>> {
    private Buffer = new Map<string, Partial<M>>();
    private readonly standard: M;
    constructor(rlbase: M) {
      this.standard = rlbase;
      print(rlbase);
      Players.PlayerAdded.Connect((p) => {
        this.Add(p);
      });
      Players.PlayerRemoving.Connect((p) => {
        this.Remove(p);
      });
    }
    /**
     *
     * @returns The returned value indicates whether the player has passed the rate-limiting process (True) or not (False).
     */
    public CheckRate(player: Player, uniType: T): boolean {
      const k = this.Get(player);
      if (k !== undefined) {
        const j = k[uniType];
        if (j !== undefined) {
          const elapse = tick() - (j as number);
          if (elapse <= this.standard[uniType] && this.standard[uniType] > 0) {
            /**
             * !DEBUG
             */
            warn("Player has exceeded time for: " + uniType);
            return false;
          }
        }
        this.SetTick(player, uniType);
        return true;
      } else {
        this.SetTick(player, uniType);
      }
      return false;
    }
    private Add(player: Player) {
      const k = SharedRodux.GenerateKey(player);
      if (this.Buffer.get(k) === undefined) {
        this.Buffer.set(k, {});
      }
    }
    private SetTick(player: Player, uniType: T) {
      const gen = SharedRodux.GenerateKey(player);
      const t = this.Buffer.get(gen);
      if (t !== undefined) {
        const g = { ...t };
        /**
         * !This fix is temporary.
         */
        g[uniType] = tick() as M[T];
        this.Buffer.set(gen, g);
      }
    }
    private Get(player: Player) {
      return this.Buffer.get(SharedRodux.GenerateKey(player));
    }
    private Remove(player: Player) {
      const k = SharedRodux.GenerateKey(player);
      if (this.Buffer.get(k) !== undefined) {
        this.Buffer.delete(k);
      }
    }
  }
  class RLCache<T extends Rodux.Action> extends BaseCache<T["type"]> {}
  export const AllocCache = new RLCache<AllocatedRodux.Actions.AllocatedActions>({
    DispatchChar: -1,
    Init: -1,
    DispatchSettings: -1,
  });
  export const CharCache = new RLCache<CharacterRodux.Actions.CharacterActions>({
    Init: -1,
    SetLookUnit: 1 / 40,
  });
  export const SettingsCache = new RLCache<SettingsRodux.Actions.SettingsActions>({
    Init: -1,
    ChangeMode: 1 / 10,
  });
  export const EphCache = new BaseCache<keyof EphTypes.packs>({
    ephcookie: 1 / 20,
    quack: -1,
  });
}
