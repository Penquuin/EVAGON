import { SingleMotor, Spring } from "@rbxts/flipper";
import Roact, { Children } from "@rbxts/roact";
import { Players, Workspace } from "@rbxts/services";
import { RenderBool } from "./renderbool";

interface Props {
  object: Player | BasePart | Roact.Ref<BasePart>;
  reference: "Camera" | "Character";
  maxdist: number;
  useBind?: (x: number) => void;
}
interface State {
  rendered: boolean;
}

function CheckRef(x: Props["object"]): x is Roact.Ref<BasePart> {
  return !typeIs(x, "userdata");
}
export class RenderDist extends Roact.Component<Props, State> {
  static defaultProps = {
    maxdist: 20,
  };
  private motor: SingleMotor;
  constructor(p: Props) {
    super(p);
    this.motor = new SingleMotor(0);
    this.InitMotor();
  }
  private InitMotor() {
    if (this.props.useBind) {
      this.motor.onComplete(() => {
        if (this.motor.getValue() === 0) {
          this.SafeSetRendered(false);
        }
      });
      this.motor.onStep(this.props.useBind);
    }
  }
  private GetBasePosition(): Vector3 | void {
    if (this.props.reference === "Camera") return Workspace.CurrentCamera?.CFrame.Position;
    else {
      const c = Players.LocalPlayer.Character as Character;
      if (!c) return;
      const h = c.Head;
      if (!h) return;
      return h.Position;
    }
  }
  private SafeSetRendered(b: boolean) {
    if (this.state.rendered !== b) {
      const g = { ...this.state };
      g.rendered = b;
      this.setState(g);
      if (b && this.props.useBind) this.motor.setGoal(new Spring(1, { frequency: 3 }));
    }
  }
  private ConductPlayer(P: Player | BasePart) {
    if (!P) return false;
    if (P.IsA("BasePart")) {
      return this.ConductPart(P);
    }
    const c = P.Character as Character;
    if (!c) return false;
    const h = c.Head;
    if (!h) return false;
    return this.ConductPart(h);
  }
  private ConductPart(P: BasePart): boolean {
    const g = this.GetBasePosition();
    if (!g) return false;
    const d = g.sub(P.Position).Magnitude;
    if (d <= this.props.maxdist) {
      this.SafeSetRendered(true);
      return true;
    }
    return false;
  }
  private Mounted = true;
  didUpdate(prevprop: Props) {
    if (prevprop.useBind !== this.props.useBind) {
      this.InitMotor();
    }
  }
  didMount() {
    task.spawn(() => {
      while (this.Mounted) {
        task.wait(0.1);
        const o = this.props.object;
        let res = true;
        if (CheckRef(o)) {
          const v = o.getValue();
          if (v) res = this.ConductPlayer(v);
        } else res = this.ConductPlayer(o);
        if (!res) {
          if (this.props.useBind !== undefined) this.motor.setGoal(new Spring(0, { frequency: 3 }));
          else this.SafeSetRendered(false);
        }
      }
    });
  }
  willUnmount() {
    this.Mounted = false;
  }
  render() {
    return <RenderBool rendered={this.state.rendered}>{this.props[Children]}</RenderBool>;
  }
}
