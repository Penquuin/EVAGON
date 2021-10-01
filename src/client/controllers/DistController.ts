import { Controller, OnStart, OnInit } from "@flamework/core";
import Roact from "@rbxts/roact";
import { TestElement } from "client/UI/head/testelement";

@Controller({})
export class DistController implements OnStart, OnInit {
	onInit() {}

	onStart() {
		Roact.mount(Roact.createElement(TestElement));
	}
}
