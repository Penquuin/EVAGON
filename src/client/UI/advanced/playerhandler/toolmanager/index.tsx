/**
 * !Bugged
 */

import Maid from "@rbxts/maid";
import Roact, { Component } from "@rbxts/roact";
import Signal from "@rbxts/signal";
import { PHDescendantsProps } from "../ph-typings";

export class ToolManager extends Component<
  PHDescendantsProps & {
    UsageArray: Map<
      string,
      Partial<{
        OnInit: (tool: Tool, destroySignal: Signal) => void;
        OnEquip: (tool: Tool) => void;
        OnUnequip: (tool: Tool) => void;
        OnActivation: (tool: Tool) => void;
      }>
    >;
  },
  {}
> {
  private superiormaid = new Maid();
  private toolmaids = new Map<string, Maid>();
  private currentToolList = new Array<string>();
  protected didMount(): void {
    const backpack = this.props.Player.WaitForChild("Backpack");
    const onChange = (tname?: string) => {
      const oldTl = [...this.currentToolList];
      this.currentToolList = [];
      this.props.UsageArray.forEach((value, key) => {
        let tool: Tool | undefined;
        tool = backpack.FindFirstChild(key) as Tool | undefined;
        if (tool === undefined) tool = this.props.character.FindFirstChild(key) as Tool | undefined;
        if (tool === undefined) return;
        let maido = this.toolmaids.get(key);
        if (maido === undefined) {
          print("reconstruct ");
          maido = new Maid();
          this.toolmaids.set(key, maido);
          this.currentToolList.push(key);
          const destroysig = new Signal();
          maido.GiveTask(destroysig);
          if (value.OnInit && oldTl.indexOf(tool.Name) === -1) value.OnInit(tool, destroysig);
          if (value.OnActivation !== undefined)
            maido.GiveTask(
              tool.Activated.Connect(() => {
                if (value.OnActivation && tool) value.OnActivation(tool);
              }),
            );
          if (value.OnEquip !== undefined)
            maido.GiveTask(
              tool.Equipped.Connect(() => {
                if (value.OnEquip && tool) value.OnEquip(tool);
              }),
            );
          if (value.OnUnequip !== undefined)
            maido.GiveTask(
              tool.Unequipped.Connect(() => {
                if (value.OnUnequip && tool) value.OnUnequip(tool);
              }),
            );
          maido.GiveTask(
            tool.AncestryChanged.Connect((_, parent) => {
              if (
                (parent === undefined ||
                  (parent !== this.props.character && parent !== this.props.Player.FindFirstChild("Backpack"))) &&
                maido
              ) {
                print(`Maid "${key}" has quit their job.`);
                maido.Destroy();
                this.toolmaids.delete(key);
              }
            }),
          );
        }
      });
    };
    onChange();
    const mid = (toolname: string) => {
      onChange(toolname);
    };
    this.superiormaid.GiveTask(
      this.props.character.ChildAdded.Connect((c) => {
        if (c.IsA("Tool")) mid(c.Name);
      }),
    );
    this.superiormaid.GiveTask(
      this.props.character.ChildRemoved.Connect((c) => {
        if (c.IsA("Tool")) mid(c.Name);
      }),
    );
    this.superiormaid.GiveTask(
      backpack.ChildAdded.Connect((c) => {
        if (c.IsA("Tool")) mid(c.Name);
      }),
    );
    this.superiormaid.GiveTask(
      backpack.ChildRemoved.Connect((c) => {
        if (c.IsA("Tool")) mid(c.Name);
      }),
    );
  }
  protected willUnmount(): void {
    this.superiormaid.Destroy();
    this.toolmaids.forEach((v, k) => {
      v.Destroy();
      this.toolmaids.delete(k);
    });
  }
  render() {
    return <></>;
  }
}
