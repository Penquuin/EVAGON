import Roact from "@rbxts/roact";
import { InDev } from "../debug/Develope";

interface Props {
	level1: Model;
	level2: Model;
}
export class MipMap extends Roact.Component<Props> {
	render() {
		return <InDev />;
	}
}
