import { Controller, OnStart, OnInit } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import { ClientRodux } from "client/client-rodux";
import { events } from "shared/rbxnet/events";
import { SharedRodux } from "shared/shared-rodux";

@Controller({})
export class RoduxController implements OnStart, OnInit {
	onInit() {
		ClientRodux.ClientStore.dispatch({ type: "Init", State: ClientRodux.DefaultClientState });
		events.Client.Get("RequestData")
			.CallServerAsync()
			.then((v) => {
				ClientRodux.ClientStore.dispatch(SharedRodux.Actions.CreateOSAD({ type: "Init", state: v }));
				// ClientRodux.ClientStore.changed.connect((n) => {
				// 	print("Client:", n);
				// });
				events.Client.Get("ServerDispatch").Connect((v) => {
					ClientRodux.ClientStore.dispatch(v);
				});
			});
	}

	onStart() {
		const c = Workspace.pillar.Touched.Connect((o) => {
			if (Players.GetPlayerFromCharacter(o.Parent) === Players.LocalPlayer) {
				c.Disconnect();
				ClientRodux.ClientStore.dispatch({
					type: "OnSharedActionDispatched",
					SharedAction: { type: "IncrementBrick" },
				});
			}
		});
	}
}
