import Roact from "@rbxts/roact";
import Rodux from "@rbxts/rodux";
import { Players, RunService, Workspace } from "@rbxts/services";
import { ClientRodux } from "client/client-rodux";
import { Animated } from "client/UI/base/Bases";
import { Billboards } from "client/UI/base/Portals";
import { CharacterRodux } from "shared/otherrodux/allocate/character-rodux";
import { AllocatedRodux } from "shared/otherrodux/allocated-rodux";
import { SharedRodux } from "shared/shared-rodux";

interface CHandlerState {
  debugcircle: boolean;
}
interface ICharHandlersProps {
  Player: Player;
  character: Character;
}
export class CharHeadHandler extends Roact.Component<ICharHandlersProps, CHandlerState> {
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
                pr.ToObjectSpace(CFrame.fromMatrix(new Vector3(), lv.Cross(uv), uv)).add(h.Neck.C0.Position),
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
              if (t - this.lastSubmit > 1 / 30) {
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
            <uilistlayout Padding={new UDim(0, 10)} HorizontalAlignment={"Center"} FillDirection={"Horizontal"} />
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
