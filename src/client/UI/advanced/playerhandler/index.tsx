import Maid from "@rbxts/maid";
import Roact, { Element, Portal } from "@rbxts/roact";
import Rodux from "@rbxts/rodux";
import { LogService, Players, RunService, Workspace } from "@rbxts/services";
import { ClientRodux } from "client/client-rodux";
import { CharacterRodux } from "shared/otherrodux/allocate/character-rodux";
import { AllocatedRodux } from "shared/otherrodux/allocated-rodux";
import { SharedRodux } from "shared/shared-rodux";
import { Animated } from "../../base/Bases";
import { Billboards, Portals } from "../../base/Portals";
import { LogOnce } from "../../debug/Develope";
import { CharHeadHandler } from "./CharHeadHandler";
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
      <screengui ResetOnSpawn={false}>
        <frame BackgroundTransparency={1} Visible={false}>
          {this.state.Elements}
        </frame>
      </screengui>
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
  private minimaid?: Maid;
  constructor(p: IPlayerHandlerProps) {
    super(p);
    this.setState({
      character: this.props.Player.Character ? (this.props.Player.Character as Character) : undefined,
    });
  }
  didMount() {
    this.maid.GiveTask(
      this.props.Player.CharacterAdded.Connect((c) => {
        print("to");
        this.minimaid?.Destroy();
        this.minimaid = new Maid();
        this.minimaid.GiveTask(
          (c.WaitForChild("Humanoid") as Humanoid).Died.Connect(() => {
            const go = { ...this.state };
            go.character = undefined;
            print(go);
            this.setState(go);
            this.minimaid?.Destroy();
          }),
        );
        const g = { ...this.state };
        g.character = c as Character;
        this.setState(g);
      }),
    );
  }
  willUnmount() {
    print("bye");
    this.minimaid?.Destroy();
    this.maid.Destroy();
  }
  render() {
    print("RE");
    if (this.state.character === undefined) return;
    print("shame");
    print(this.state.character);
    return (
      <>
        <CharHeadHandler Key={"CharheadHandler"} Player={this.props.Player} character={this.state.character} />
      </>
    );
  }
}
