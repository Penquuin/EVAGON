import Maid from "@rbxts/maid";
import Roact, { Element, Portal } from "@rbxts/roact";
import Rodux from "@rbxts/rodux";
import { LogService, Players, RunService, Workspace } from "@rbxts/services";
import { ClientRodux } from "client/client-rodux";
import { CharacterRodux } from "shared/otherrodux/allocate/character-rodux";
import { AllocatedRodux } from "shared/otherrodux/allocated-rodux";
import { SharedRodux } from "shared/shared-rodux";
import { Animated } from "../base/Bases";
import { Billboards, Portals } from "../base/Portals";
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

class CharacterHandler extends Roact.Component<IPlayerHandlerProps, { character?: Character }> {
	private maid = new Maid();
	constructor(p: IPlayerHandlerProps) {
		super(p);
		this.setState({
			character: this.props.Player.Character ? (this.props.Player.Character as Character) : undefined,
		});
	}
	didMount() {
		this.maid.GiveTask(
			this.props.Player.CharacterAdded.Connect((c) => {
				const g = { ...this.state };
				g.character = c as Character;
				this.setState(g);
			}),
		);
	}
	willUnmount() {
		this.maid.Destroy();
	}
	render() {
		if (!this.state.character) return;
		return (
			<>
				<CharHeadHandler Key={"CharheadHandler"} Player={this.props.Player} character={this.state.character} />
			</>
		);
	}
}
interface CHandlerState {
	debugcircle: boolean;
}
interface ICharHandlersProps {
	Player: Player;
	character: Character;
}
class CharHeadHandler extends Roact.Component<ICharHandlersProps, CHandlerState> {
	private islocal = this.props.Player.UserId === Players.LocalPlayer.UserId;
	private sig?: Rodux.Signal;
	private cdata?: CharacterRodux.CharacterState;
	private rtime = true;
	private lastSubmit = tick();
	constructor(p: ICharHandlersProps) {
		super(p);
		this.setState({
			debugcircle: false,
		});
	}
	didMount() {
		const retrievecdata = () => {
			const s = AllocatedRodux.GetAllocData(
				SharedRodux.GenerateKey(this.props.Player),
				ClientRodux.ClientStore.getState().Shared,
			);
			if (s) {
				this.cdata = { ...s.CharacterState };
			}
		};
		retrievecdata();
		this.sig = ClientRodux.ClientStore.changed.connect(retrievecdata);
		task.spawn(() => {
			while (this.rtime) {
				const cam = Workspace.CurrentCamera;
				if (cam && this.props.character) {
					const h = (this.props.character.FindFirstChild("Head") ||
						this.props.character.WaitForChild("Head")) as Character["Head"];
					if (cam.CFrame.Position.sub(h.Position).Magnitude < 30 || this.islocal) {
						if (!this.state.debugcircle) {
							const g = { ...this.state };
							g.debugcircle = true;
							this.setState(g);
						}
						//start refreshing data!
						const hrp = this.props.character.HumanoidRootPart;
						const pr = hrp.CFrame.sub(hrp.Position);
						const seto = (lv: Vector3, uv: Vector3) => {
							h.Neck.Transform = new CFrame();
							h.Neck.C0 = h.Neck.C0.Lerp(
								pr
									.ToObjectSpace(CFrame.fromMatrix(new Vector3(), lv.Cross(uv), uv))
									.add(h.Neck.C0.Position),
								0.1,
							);
						};
						const rlv = hrp.CFrame.LookVector;
						const uv = hrp.CFrame.UpVector;
						if (this.islocal) {
							//update instead!
							let lv = cam.CFrame.LookVector;
							const rad = math.acos(rlv.Dot(lv) / (rlv.Magnitude * lv.Magnitude));
							if (math.deg(rad) > 70) lv = rlv.Lerp(lv, 0.5);
							const cuv = cam.CFrame.UpVector;
							const product = uv.Lerp(cuv, 0.5);
							seto(lv, product);
							const t = tick();
							if (t - this.lastSubmit > 0.1) {
								this.lastSubmit = t;
								ClientRodux.ClientStore.dispatch(
									ClientRodux.Thunks.EasyDCA({
										type: "SetLookUnit",
										value: {
											LookVector: lv,
											UpVector: product,
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
						RunService.Stepped.Wait();
						continue;
					} else {
						if (this.state.debugcircle) {
							const g = { ...this.state };
							g.debugcircle = false;
							this.setState(g);
						}
					}
				}
				task.wait(0.1);
			}
		});
	}
	willUnmount() {
		this.rtime = false;
		this.sig?.disconnect();
	}
	render() {
		return (
			<frame Visible={false} Key={this.props.Player.Name + "_char"}>
				{this.state.debugcircle ? (
					<Billboards.Heado
						chr={this.props.character}
						Size={new UDim2(0, 100, 0, 20)}
						ExtentsOffsetWorldSpace={new Vector3(0, 2, 0)}
						ClipsDescendants={false}
					>
						<uilistlayout
							Padding={new UDim(0, 10)}
							HorizontalAlignment={"Center"}
							FillDirection={"Horizontal"}
						/>
						{/* <Animated.Circle
							Size={new UDim2(1, 0, 1, 0)}
							Position={new UDim2(0, 0, 0.5, 0)}
							SizeConstraint={Enum.SizeConstraint.RelativeYY}
							BackgroundTransparency={0.4}
							BackgroundColor3={Color3.fromRGB(255, 156, 156)}
						/> */}
						<Animated.TypeWriter
							Text={`Animating ${this.props.Player.Name}`}
							TextWrap={false}
							TextSize={14}
							Size={new UDim2(0.8, 0, 1, 0)}
							Position={new UDim2(1, 0, 0, 0)}
							AnchorPoint={new Vector2(1, 0)}
							BackgroundTransparency={1}
							TextTransparency={0.2}
						/>
					</Billboards.Heado>
				) : undefined}
			</frame>
		);
	}
}
