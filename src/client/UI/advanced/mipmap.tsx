import Roact from "@rbxts/roact";
import { InDev } from "../debug/Develop";

interface Props {
  level1: Model;
  level2: Model;
}
export class MipMap extends Roact.Component<Props> {
  render() {
    return <InDev />;
  }
}
