import Roact, { Binding } from "@rbxts/roact";
import RoactRodux from "@rbxts/roact-rodux";
import { HttpService, Workspace } from "@rbxts/services";
import { ClientRoactRodux } from "client/client-roact-rodux";
import { ClientRodux } from "client/client-rodux";
import { RenderDist } from "../advanced/renderdist";
import { Bases } from "../base/Bases";
import { Portals } from "../base/Portals";

type ADisActs = ClientRoactRodux.CreateDispatchActs<"OnClick">;
interface AEProps {
	ClientValue: string;
	t: Binding<number>;
}

const AnElement = RoactRodux.connect<{ ClientValue: string }, ADisActs, AEProps, ClientRodux.ClientState>(
	(s) => {
		return { ClientValue: HttpService.JSONEncode(s) };
	},
	(d) => {
		return {
			OnClick: () => {},
		};
	},
)(
	class extends Roact.Component<AEProps & ADisActs> {
		render() {
			return (
				<Bases.TextLabel
					Text={this.props.ClientValue}
					Size={new UDim2(0, 400, 0, 160)}
					Position={new UDim2(0, 15, 0, 15)}
					Event={{
						MouseEnter: this.props.OnClick,
					}}
					Transparency={this.props.t.map((v) => 1 - v)}
				/>
			);
		}
	},
);

export class TestElement extends Roact.Component {
	private tbind: Roact.Binding<number>;
	private ubind: (v: number) => void;
	constructor() {
		super({});
		const [a, b] = Roact.createBinding<number>(0);
		this.tbind = a;
		this.ubind = b;
	}
	render() {
		return (
			<Portals.PlayerGui>
				<screengui ZIndexBehavior={Enum.ZIndexBehavior.Global} ResetOnSpawn={false}>
					<RenderDist reference="Character" object={Workspace.pillar} useBind={this.ubind}>
						<RoactRodux.StoreProvider store={ClientRodux.ClientStore}>
							<AnElement t={this.tbind} />
						</RoactRodux.StoreProvider>
					</RenderDist>
				</screengui>
			</Portals.PlayerGui>
		);
	}
}
