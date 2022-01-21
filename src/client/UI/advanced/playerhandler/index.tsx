import Maid from "@rbxts/maid";
import Roact, { Element, Portal } from "@rbxts/roact";
import Rodux from "@rbxts/rodux";
import { LogService, Players, RunService, Workspace } from "@rbxts/services";
import { ClientRodux } from "client/client-rodux";
import { CharacterRodux } from "shared/otherrodux/allocate/character-rodux";
import { SettingsRodux } from "shared/otherrodux/allocate/settings-rodux";
import { AllocatedRodux } from "shared/otherrodux/allocated-rodux";
import { SharedRodux } from "shared/shared-rodux";
import { Tools } from "../../../../../types/Tools";
import { Animated } from "../../base/Bases";
import { Billboards, Portals } from "../../base/Portals";
import { LogOnce } from "../../debug/Develop";
import { CharHeadHandler } from "./CharHeadHandler";
import { CookieHandler } from "./CookieHandler";
import { ToolManager } from "./toolmanager";
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

class CharacterHandler extends Roact.Component<IPlayerHandlerProps, { character?: Character; render: boolean }> {
  private maid = new Maid();
  private minimaid?: Maid;
  constructor(p: IPlayerHandlerProps) {
    super(p);
    this.setState({
      character: this.props.Player.Character ? (this.props.Player.Character as Character) : undefined,
      render: true,
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
            go.render = false;
            this.setState(go);
            this.minimaid?.Destroy();
          }),
        );
        const g = { ...this.state };
        g.character = c as Character;
        g.render = true;
        this.setState(g);
      }),
    );
  }
  willUnmount() {
    this.minimaid?.Destroy();
    this.maid.Destroy();
  }
  render() {
    if (!this.state.render || !this.state.character) return;
    return (
      <>
        <CookieHandler Key={"CookieHandler"} Player={this.props.Player} character={this.state.character} />
        <ToolManager
          Key={"ToolManager"}
          Player={this.props.Player}
          character={this.state.character}
          UsageArray={
            new Map([
              [
                "DebugTool",
                {
                  OnInit: (_tool, ds) => {
                    let currentStatus: string | undefined;
                    const txt = (s: string) => {
                      currentStatus = s;
                      (_tool as Tools.DebugTool).DisplayPanel.SurfaceGui.TextLabel.Text = s;
                      (_tool as Tools.DebugTool).DisplayPanel.Color = BrickColor.random().Color;
                    };
                    const f = () => {
                      const dat = ClientRodux.GetPlayerAlloc(this.props.Player);
                      if (dat === undefined) return;
                      const n = dat.SettingsState.DebugToolStatus;
                      if (n !== currentStatus) txt(n);
                    };
                    f();
                    const sig = ClientRodux.ClientStore.changed.connect(f);
                    ds.Connect(() => {
                      sig.disconnect();
                    });
                  },
                  OnActivation: (_tool) => {
                    if (this.props.Player !== Players.LocalPlayer) return;
                    ClientRodux.ClientStore.dispatch(
                      ClientRodux.Thunks.EasyDSA({
                        type: "ChangeMode",
                        status: SettingsRodux.statustab[math.random(0, 2)],
                      }),
                    );
                  },
                },
              ],
            ])
          }
        />
        <CharHeadHandler Key={"CharheadHandler"} Player={this.props.Player} character={this.state.character} />
      </>
    );
  }
}
