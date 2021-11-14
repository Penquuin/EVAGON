import { Linear, SingleMotor, Spring } from "@rbxts/flipper";
import Roact, { Binding, Children, Component, createBinding } from "@rbxts/roact";
import { TweenService } from "@rbxts/services";

type defProps<C extends keyof CreatableInstances> = Partial<JSX.IntrinsicElement<CreatableInstances[C]>>;

function CreateSimpleComponent<C extends keyof CreatableInstances>(inst: C, defaultProps?: defProps<C>) {
	return class extends Roact.Component<defProps<C>> {
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

export namespace Animated {
	type ACProps = Omit<Omit<defProps<"Frame">, "Size">, "BackgroundTransparency"> & {
		Size?: UDim2;
		BackgroundTransparency?: number;
	};
	type TWProps = Omit<Omit<Omit<defProps<"TextLabel">, "Text">, "BackgroundTransparency">, "TextTransparency"> & {
		Text: string;
		BackgroundTransparency?: number;
		TextTransparency?: number;
	};
	export class Circle extends Component<ACProps> {
		static defaultProps = { ...base, AnchorPoint: new Vector2(0.5, 0.5), BackgroundTransparency: 0 };
		private mo: SingleMotor;
		private b: Binding<number>;
		constructor(p: ACProps) {
			super(p);
			this.mo = new SingleMotor(0);
			const [a, b] = createBinding<number>(this.mo.getValue());
			this.b = a;
			this.mo.onStep(b);
		}
		didMount() {
			this.mo.setGoal(new Spring(1, { frequency: 2 }));
		}
		render() {
			const g = { ...this.props } as defProps<"Frame">;
			g.Size = this.b.map((v) => {
				return this.props.Size !== undefined
					? new UDim2().Lerp(this.props.Size, v)
					: new UDim2(0, 0, 0, 0).Lerp(new UDim2(0, 8, 0, 8), v);
			});
			g.BackgroundTransparency = this.b.map((v) => {
				return 1 + (this.props.BackgroundTransparency! - 1) * v;
			});
			g[Children] = undefined;
			return (
				<Bases.Frame {...g}>
					<uicorner CornerRadius={new UDim(1, 0)} />
				</Bases.Frame>
			);
		}
	}
	export class TypeWriter extends Component<TWProps, { render: boolean }> {
		public Retype() {
			this.setState({ render: true });
			this.mo.setGoal(new Spring(1, { frequency: 20 / this.props.Text.size(), dampingRatio: 0.8 }));
			this.fo.setGoal(new Spring(1, { frequency: 1.2 }));
		}
		static defaultProps: Partial<TWProps> = {
			...base,
			AnchorPoint: new Vector2(0.5, 0.5),
			BackgroundTransparency: 0,
			TextXAlignment: Enum.TextXAlignment.Left,
			TextYAlignment: Enum.TextYAlignment.Top,
		};
		private mo: SingleMotor;
		private fo: SingleMotor;
		private b: Binding<number>;
		private fb: Binding<number>;
		private rtime = true;
		constructor(p: TWProps) {
			super(p);
			this.setState({ render: true });
			this.mo = new SingleMotor(0);
			const [a, b] = createBinding<number>(this.mo.getValue());
			this.b = a;
			this.mo.onStep(b);

			this.fo = new SingleMotor(0);
			const [c, d] = createBinding<number>(this.mo.getValue());
			this.fb = c;
			this.fo.onStep(d);
			this.mo.onComplete(() => {
				if (this.rtime) if (this.mo.getValue() >= 0.9) this.fo.setGoal(new Linear(0, { velocity: 2 }));
			});
			this.fo.onComplete(() => {
				if (this.rtime) if (this.fo.getValue() <= 0.1) this.setState({ render: false });
			});
		}
		didMount() {
			this.setState({ render: true });
			this.mo.setGoal(new Linear(1, { velocity: 20 / this.props.Text.size() }));
			this.fo.setGoal(new Spring(1, { frequency: 1.2 }));
		}
		willUnmount() {
			this.rtime = false;
		}
		render() {
			if (!this.state.render) return undefined;
			const g = { ...this.props } as defProps<"TextLabel">;
			g.Text = this.b.map((v) => {
				return this.props.Text.sub(
					1,
					math.ceil(this.props.Text.size() * TweenService.GetValue(v, "Quad", "InOut")),
				);
			});
			g.BackgroundTransparency = this.fb.map((v) => {
				if (this.props.BackgroundTransparency !== undefined)
					return 1 + (this.props.BackgroundTransparency - 1) * v;
				return 1 - v;
			});
			g.TextTransparency = this.fb.map((v) => {
				if (this.props.TextTransparency !== undefined) return 1 + (this.props.TextTransparency - 1) * v;
				return 1 - v;
			});
			return <Bases.TextLabel {...g} />;
		}
	}
}
