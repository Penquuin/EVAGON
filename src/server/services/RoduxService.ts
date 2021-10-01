import { Service, OnStart, OnInit } from "@flamework/core";
import { Players } from "@rbxts/services";
import { ServerRodux } from "server/server-rodux";
import { events } from "shared/rbxnet/events";
import { SharedRodux } from "shared/shared-rodux";

@Service({})
export class RoduxService implements OnStart, OnInit {
	onInit() {
		ServerRodux.ServerStore.dispatch({ type: "Init", State: ServerRodux.DefaultServerState });
		ServerRodux.ServerStore.changed.connect((n) => {
			print("Server:", n);
		});
		events.Server.Create("MutateServer").Connect((p, a) => {
			const act = SharedRodux.Actions.CreateOSAD(a, p);
			act.ServerFrom = p;
			//^ Create emphemeral ServerFrom, will be disposed when sending to client
			ServerRodux.ServerStore.dispatch(act);
		});
		events.Server.Create("RequestData").SetCallback(() => {
			return ServerRodux.ServerStore.getState().Shared;
		});
		//Gives creator super power
		const dsmth = (p: Player) => {
			ServerRodux.ServerStore.dispatch(SharedRodux.Actions.CreateOSAD(SharedRodux.Actions.CreateAAction(p)));
			if (p.UserId === game.CreatorId) {
				const g = ServerRodux.ServerStore.getState().Shared;
				ServerRodux.ServerStore.dispatch({ type: "SetOwnership", FieldName: "BrickData", Player: p });
				ServerRodux.ServerStore.dispatch({ type: "SetOwnership", FieldName: "AllocatedData", Player: p });
			}
		};
		Players.GetPlayers().forEach(dsmth);
		Players.PlayerAdded.Connect(dsmth);
		Players.PlayerRemoving.Connect((p) => {
			ServerRodux.ServerStore.dispatch(SharedRodux.Actions.CreateOSAD(SharedRodux.Actions.CreateDAction(p)));
		});
	}

	onStart() {}
}
