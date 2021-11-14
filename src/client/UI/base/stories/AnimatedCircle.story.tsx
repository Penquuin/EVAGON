import Roact, { mount, unmount } from "@rbxts/roact";
import { Animated } from "../Bases";

export = (v: UIBase) => {
  const t = mount(
    <Animated.Circle
      Position={new UDim2(0.5, 0, 0.5, 0)}
      Size={new UDim2(0, 20, 0, 20)}
      BackgroundTransparency={0.2}
      BackgroundColor3={Color3.fromHSV(0, 0.55, 0.92)}
    ></Animated.Circle>,
    v,
  );
  return () => {
    unmount(t);
  };
};
