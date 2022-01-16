import Maid from "@rbxts/maid";
import Roact, { Element } from "@rbxts/roact";
import { ClientEph } from "client/client-eph";
import { Bases } from "client/UI/base/Bases";
import { EphTypes } from "shared/ephevents/ephtypes";

interface CHandlerState {
  CurrentCookies: number;
}
interface ICharHandlersProps {
  Player: Player;
  character: Character;
}
export class CookieHandler extends Roact.Component<ICharHandlersProps, CHandlerState> {
  private maid = new Maid();
  constructor(p: ICharHandlersProps) {
    super(p);
    this.setState({ CurrentCookies: 0 });
  }
  protected increment(inc: boolean): void {
    const g = { ...this.state };
    g.CurrentCookies = math.clamp(this.state.CurrentCookies + (inc ? 1 : -1), 0, 100);
    this.setState(g);
  }
  protected didMount(): void {
    this.maid.GiveTask(
      ClientEph.EventDispatch.Connect((serverpack) => {
        if (EphTypes.ServerTypeGuard<"ephcookie">("ephcookie", serverpack)) {
          this.increment(serverpack.pack.increment);
        }
      }),
    );
  }
  protected willUnmount(): void {
    this.maid.Destroy();
  }

  render() {
    const Cookies: Element[] = [];
    for (let index = 0; index < this.state.CurrentCookies; index++) {
      Cookies.push(
        <imagelabel
          BackgroundTransparency={1}
          Size={new UDim2(0, 40, 0, 40)}
          Position={new UDim2(0, 30 * index, 1, 0)}
          AnchorPoint={new Vector2(0, 1)}
          Image={"rbxassetid://6941492499"}
        ></imagelabel>,
      );
    }
    return (
      <screengui ResetOnSpawn={false}>
        <frame Transparency={1} Position={new UDim2(0, 0, 0, 0)} Size={new UDim2(1, 0, 1, 0)}>
          <frame
            Transparency={1}
            Position={new UDim2(0, 0, 1, -5)}
            AnchorPoint={new Vector2(0, 1)}
            Size={new UDim2(1, 0, 0, 20)}
          >
            {...Cookies}
          </frame>
          <Bases.TextButton
            Position={new UDim2(1, 0, 1, 0)}
            AnchorPoint={new Vector2(1, 1)}
            Size={new UDim2(0, 150, 0, 50)}
            Text={"Spawn Cookie"}
            Event={{
              MouseButton1Click: () => {
                const a = true;
                this.increment(a);
                ClientEph.SendEvent.SendToServer({ name: "ephcookie", pack: { increment: a } });
              },
            }}
          ></Bases.TextButton>
        </frame>
      </screengui>
    );
  }
}
