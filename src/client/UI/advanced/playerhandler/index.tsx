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
