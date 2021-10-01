import Roact, { Children } from "@rbxts/roact";

interface Props {
	rendered: boolean;
}
export class RenderBool extends Roact.Component<Props> {
	render() {
		if (this.props.rendered) {
			return <>{this.props[Children]}</>;
		}
		return undefined;
	}
}
