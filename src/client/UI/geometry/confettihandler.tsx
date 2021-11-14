import Maid from "@rbxts/maid";
import Roact, { Binding, Element } from "@rbxts/roact";
import { RunService } from "@rbxts/services";

interface CState {
  confs: Map<string, Element>;
}
export class ConfettiHandler extends Roact.Component<{}, CState> {
  private id = 0;
  constructor() {
    super({});
    const c = new Map<string, Element>();
    this.setState({
      confs: c,
    });
  }
  private running = true;
  didMount() {
    task.spawn(() => {
      while (this.running) {
        wait(0.1);
        const g = { ...this.state };
        const x0 = new Vector2(math.random(), math.random());
        const am = 2 + math.round(math.random() * 10);
        const s = 2 + math.round(math.random() * 5);
        for (let i = 0; i < am; i++) {
          const b = BrickColor.random().Color.Lerp(new Color3(0.5, 0.5, 1), 0.5);
          const rad = math.random() * math.pi * 2;
          const mag = 0.3 + 0.1 * math.random();
          this.id++;
          const k = "K" + tostring(this.id);
          g.confs.set(
            k,
            <Confetti
              Rad={rad}
              Mag={mag}
              color={b.Lerp(new Color3(1, 1, 1), (1 - i / am) / 4)}
              Size={new UDim2(0, am, 0, am)}
              stop={() => {
                const n = { ...this.state };
                n.confs.delete(k);
                this.setState(n);
              }}
              x0={x0}
            />,
          );
        }
        if (this.running) {
          this.setState(g);
        }
      }
    });
  }
  willUnmount() {
    this.running = false;
  }
  render() {
    return <>{this.state.confs}</>;
  }
}

interface CProps {
  Rad: number;
  Mag: number;
  Size: UDim2;
  Acc: Vector2;
  x0: Vector2;
  color: Color3;
  stop: () => void;
}
class Confetti extends Roact.Component<CProps, { r: boolean }> {
  static defaultProps: Partial<CProps> = {
    Acc: new Vector2(0, -0.5),
    x0: new Vector2(),
    Mag: 0,
  };
  private v0: Vector2 = new Vector2(math.cos(this.props.Rad), math.sin(this.props.Rad)).mul(this.props.Mag);
  private getX(t: number): Vector2 {
    return this.props.Acc.mul(1 / 2)
      .mul(math.pow(t, 2))
      .add(this.v0.mul(t))
      .add(new Vector2(-0.5 + this.props.x0.X, this.props.x0.Y));
  }
  private pbind: Binding<Vector2>;
  private rbind: Binding<number>;
  private uRBind: (x: number) => void;
  private updateP: (x: Vector2) => void;
  constructor(s: CProps) {
    super(s);
    this.setState({
      r: true,
    });
    const [a, b] = Roact.createBinding<Vector2>(new Vector2(0, 0));
    this.pbind = a;
    this.updateP = b;
    const [c, d] = Roact.createBinding<number>(0);
    this.rbind = c;
    this.uRBind = d;
  }
  private m = new Maid();
  didMount() {
    task.spawn(() => {
      let ct = 0;
      let l: Vector2;
      this.m.GiveTask(
        RunService.RenderStepped.Connect((d) => {
          ct += d * 2.5;
          l = this.pbind.getValue();
          this.updateP(this.getX(ct));
          const n = this.pbind.getValue();
          if (n.Y < 0) {
            const g = { ...this.state };
            g.r = false;
            this.setState(g);
            this.m.DoCleaning();
            this.props.stop();
            return;
          }
          if (l === undefined) {
            const g = { ...this.state };
            g.r = false;
            this.setState(g);
          } else if (this.state.r === false) {
            const g = { ...this.state };
            g.r = true;
            this.setState(g);
          }
          const t = n.sub(l);
          const angle = math.sign(t.X) * math.deg(math.acos(t.Dot(new Vector2(0, 1)) / t.Magnitude));
          if (angle < 0) {
            this.uRBind(360 + angle);
          } else {
            this.uRBind(angle);
          }
        }),
      );
    });
  }
  willUnmount() {
    this.m.Destroy();
  }
  render() {
    if (!this.state.r) return;
    return (
      <frame
        Position={this.pbind.map((v) => {
          return new UDim2(0.5 + v.X, 0, 1 - v.Y, 0);
        })}
        BackgroundColor3={this.props.color}
        Size={this.props.Size}
        Rotation={this.rbind}
        BorderSizePixel={0}
      ></frame>
    );
  }
}
