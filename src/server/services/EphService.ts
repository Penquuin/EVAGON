import { Service, OnStart, OnInit } from "@flamework/core";
import { ServerEph } from "server/server-eph";
import { EphTypes } from "shared/ephevents/ephtypes";

const Buffered: { [key in keyof EphTypes.packs]: boolean } = {
  ephcookie: true,
  quack: true,
};

@Service({})
export class EphService implements OnStart, OnInit {
  onInit() {
    ServerEph.SendEvent.Connect((player, dp) => {
      if (Buffered[dp.name] && dp.name !== undefined) {
        const toothers: EphTypes.IServerDatapack<typeof dp["name"]> = {
          name: dp.name,
          pack: dp.pack,
          sender: player.UserId,
        };
        ServerEph.EventDispatch.SendToAllPlayersExcept(player, toothers);
      }
    });
  }

  onStart() {}
}
