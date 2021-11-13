import Maid from "@rbxts/maid";
import Roact, { Element } from "@rbxts/roact";
import Rodux from "@rbxts/rodux";
import { LogService, Players, RunService, Workspace } from "@rbxts/services";
import { ClientRodux } from "client/client-rodux";
import { CharacterRodux } from "shared/otherrodux/allocate/character-rodux";
import { AllocatedRodux } from "shared/otherrodux/allocated-rodux";
import { SharedRodux } from "shared/shared-rodux";
import { LogOnce } from "../debug/Develope";
interface IPlayerHandlerProps {
	Player: Player;
}

interface IPhSState {
	Elements: Map<string, Element>;
}
export class PlayerHandlerService extends Roact.Component<{}, IPhSState> {
	private maid = new Maid();
	constructor() {
		super({});
		this.setState({
			Elements: new Map<string, Element>(),
		});
	}
	didMount() {
		const onplr = (p: Player) => {
			const g = { ...this.state };
			g.Elements.set(SharedRodux.GenerateKey(p), <PlayerHandler Player={p} />);
			this.setState(g);
		};
		Players.GetPlayers().forEach(onplr);
		this.maid.GiveTask(Players.PlayerAdded.Connect(onplr));
		this.maid.GiveTask(
			Players.PlayerRemoving.Connect((p) => {
				const g = { ...this.state };
				g.Elements.delete(SharedRodux.GenerateKey(p));
				this.setState(g);
			}),
		);
	}
	willUnmount() {
		this.maid.Destroy();
	}
	render() {
		return (
			<frame BackgroundTransparency={1} Visible={false}>
				{this.state.Elements}
			</frame>
		);
	}
}
export class PlayerHandler extends Roact.Component<IPlayerHandlerProps> {
	render() {
		return (
			<>
				<CharacterHandler Player={this.props.Player} />
			</>
		);
	}
}

interface CHandlerState {
	character?: Character;
}
class CharacterHandler extends Roact.Component<IPlayerHandlerProps, CHandlerState> {
	private maid = new Maid();
	private islocal = this.props.Player.UserId === Players.LocalPlayer.UserId;
	private sig?: Rodux.Signal;
	private cdata?: CharacterRodux.CharacterState;
	private loccache?: CharacterRodux.CharacterState;
	private rtime = true;
	private lastSubmit = tick();
	constructor(p: IPlayerHandlerProps) {
		super(p);
		this.setState({
			character: this.props.Player.Character ? (this.props.Player.Character as Character) : undefined,
		});
	}
	didMount() {
		const retrievecdata = () => {
			if (this.islocal) {
				const s = ClientRodux.GetPlayerAlloc();
				if (s) {
					this.loccache = s?.CharacterState;
				}
				return;
			}
			const s = AllocatedRodux.GetAllocData(
				SharedRodux.GenerateKey(this.props.Player),
				ClientRodux.ClientStore.getState().Shared,
			);
			if (s) {
				this.cdata = { ...s.CharacterState };
			}
		};
		retrievecdata();
		this.maid.GiveTask(
			this.props.Player.CharacterAdded.Connect((c) => {
				const g = { ...this.state };
				g.character = c as Character;
				this.setState(g);
			}),
		);
		this.sig = ClientRodux.ClientStore.changed.connect(retrievecdata);
		task.spawn(() => {
			while (this.rtime) {
				const cam = Workspace.CurrentCamera;
				if (cam && this.state.character) {
					const h = this.state.character.Head || this.state.character.WaitForChild("Head");
					const seto = (lv: Vector3, uv: Vector3) => {
						h.Neck.C0 = h.Neck.C0.Lerp(CFrame.fromMatrix(h.Neck.C0.Position, lv.Cross(uv), uv), 0.2);
					};
					if (cam.CFrame.Position.sub(h.Position).Magnitude < 15 || this.islocal) {
						//start refreshing data!
						const hrp = this.state.character.HumanoidRootPart;
						const uv = hrp.CFrame.UpVector;
						if (this.islocal) {
							//update instead!
							const lv = cam.CFrame.LookVector;
							const cuv = cam.CFrame.UpVector;
							const product = uv.Lerp(cuv, 0.5);
							seto(lv, product);
							const t = tick();
							if (t - this.lastSubmit > 0.1) {
								this.lastSubmit = t;
								ClientRodux.ClientStore.dispatch(
									ClientRodux.Thunks.EasyDAA({
										type: "DispatchChar",
										action: {
											type: "SetLookUnit",
											value: {
												LookVector: lv,
												UpVector: product,
											},
										},
									}),
								);
							}
						} else {
							if (this.cdata) {
								const lv = this.cdata.LookUnit.LookVector;
								const cuv = this.cdata.LookUnit.UpVector;
								seto(lv, cuv);
							}
						}
						RunService.RenderStepped.Wait();
						continue;
					}
				}
				task.wait(0.1);
			}
		});
	}
	willUnmount() {
		this.rtime = false;
		this.maid.Destroy();
		this.sig?.disconnect();
	}
	render() {
		return <frame Visible={false} Key={this.props.Player.Name + "_char"} />;
	}
}
