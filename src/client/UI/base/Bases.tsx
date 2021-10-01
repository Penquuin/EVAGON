import Roact, { Children } from "@rbxts/roact";

type frameProps = Partial<JSX.IntrinsicElement<Frame>>;

function CreateSimpleComponent<C extends keyof CreatableInstances>(
	inst: C,
	defaultProps?: Partial<JSX.IntrinsicElement<CreatableInstances[C]>>,
) {
	return class extends Roact.Component<Partial<JSX.IntrinsicElement<CreatableInstances[C]>>> {
		static defaultProps = defaultProps;
		render() {
			return Roact.createElement(inst, this.props as never);
		}
	};
}

const base = { Size: UDim2.fromOffset(100, 100), BorderSizePixel: 0, BackgroundColor3: new Color3(0.2, 0.2, 0.2) };
export namespace Bases {
	export const Frame = CreateSimpleComponent("Frame", {
		...base,
	});
	export const TextLabel = CreateSimpleComponent("TextLabel", {
		...base,
		Font: "GothamSemibold",
		TextSize: 16,
		TextColor3: new Color3(1, 1, 1),
		TextWrapped: true,
	});
}
