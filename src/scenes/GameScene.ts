import { BaseScene } from "@/scenes/BaseScene";
import { BlurPostFilter } from "@/utils/pipelines/BlurPostFilter";
import { languageManager } from "@/utils/LanguageManager";

import { TestButton } from "@/components/TestButton";

export enum State {
	First = "First",
	Second = "Second",
	Third = "Third",
	Fourth = "Fourth",
}

export class GameScene extends BaseScene {
	private state: State;
	private attractionOpen: boolean;
	private infoWindowOpen: boolean;
	private blurTween: Phaser.Tweens.Tween;

	private socket: WebSocket;

	private debugTexts: Phaser.GameObjects.Text[];
	private testButtons: TestButton[];

	constructor() {
		super({ key: "GameScene" });
	}

	create(): void {
		this.fade(false, 200, 0x000000);
		this.cameras.main.setBackgroundColor(0x0f172a);
		this.initBlur();
		this.initWebSocket();

		// this.background = this.add.image(0, 0, "background");
		// this.background.setOrigin(0);
		// this.fitToScreen(this.background);

		let margin = 100;
		let layout = new Phaser.Geom.Rectangle(
			margin,
			margin,
			this.W - 2 * margin,
			this.H - 2 * margin
		);

		let map = this.add.image(0, 0, "karta");
		map.angle = -90;
		map.setScale(layout.height / map.width);
		map.setPosition(layout.right - map.displayHeight / 2, layout.centerY);

		// this.turtle = new Turtle(this, this.CX, this.CY);

		// this.ui = new UI(this);

		let title = this.addText({
			x: layout.left,
			y: layout.top,
			size: 100,
			color: "white",
		});
		languageManager.bind(title, "bread_title");

		let bread = this.addText({
			x: layout.left,
			y: layout.top + 1.25 * title.displayHeight,
			size: 32,
			color: "white",
		});
		languageManager.bind(bread, "bread_text");
		bread.setWordWrapWidth(layout.width - map.displayHeight - 100);

		// Test buttons

		const buttonConfigs: any = [
			{
				text: "Knapp 1",
				color: 0xb91c1c,
				callback: () => {
					this.sendSocketData({
						message: "Hello world!",
					});
				},
			},
			{
				text: "Knapp 2",
				color: 0xb45309,
				callback: () => {
					this.sendSocketData({
						type: "thing_1",
					});
					this.sendSocketData({
						type: "thing_2",
					});
				},
			},
			{
				text: "Knapp 3",
				color: 0x4d7c0f,
				callback: () => {
					this.sendSocketData({
						type: "lots_of_data",
						name: "Name",
						size: 12345,
						location: "Norrköping",
					});
				},
			},
			{
				text: "Knapp 4",
				color: 0x1d4ed8,
				callback: () => {
					this.sendSocketData({
						type: "lists_and_stuff",
						numbers: [1, 2, 3, 4, 5],
						things: [{ name: "foo" }, { name: "bar" }],
						object: {
							message: "Hello",
						},
					});
				},
			},
		];

		this.testButtons = [];
		buttonConfigs.forEach((config: any, index: number) => {
			let x = layout.left;
			let y = layout.bottom;
			let button = new TestButton(this, x, y, config.text, config.color);
			button.x += button.width / 2 + index * (button.width + 25);
			button.on("click", config.callback);
			this.testButtons.push(button);
		});

		this.debugTexts = [];
	}

	update(time: number, delta: number) {
		this.testButtons.forEach((testButton) => {
			testButton.update(time, delta);
		});
	}

	/* Logic */

	restart() {
		this.setState(State.First);
	}

	setState(state: State) {
		this.state = state;
	}

	/* WebSocket */

	initWebSocket(): void {
		// const url = `wss://omni.itn.liu.se/ws/`;
		const url = `ws://localhost:8000/ws/`;
		this.socket = new WebSocket(url);

		this.socket.onopen = () => {
			const data = JSON.stringify({
				token: "CLIENT-TOKEN-HERE",
			});
			this.socket.send(data);
			this.addDebugMessage(data);
		};

		this.socket.onclose = () => {
			this.addDebugMessage("Connection closed");
		};

		this.socket.onmessage = (event: MessageEvent) => {
			const data = JSON.parse(event.data);
			this.addDebugMessage(JSON.stringify(data));

			// Bounce message
			this.socket.send(event.data);

			// Insert logic here
			// if (event.data.type == "something_cool") {
			// Use event.data.param123
			// }
		};
	}

	sendSocketData(data: any) {
		this.addDebugMessage(JSON.stringify(data), true);
		this.socket.send(JSON.stringify(data));
	}

	addDebugMessage(text: string, dim = false) {
		let temp = this.addText({
			size: 32,
			color: dim ? "#3b82f6" : "white",
			text,
		});
		temp.setOrigin(1);
		temp.setStroke("black", 8);
		temp.x = this.W - 50;
		temp.y = this.H - 50;

		this.debugTexts.forEach((text) => {
			text.y -= 32 * 1.5;
		});
		this.debugTexts.push(temp);

		var tween = this.tweens.addCounter({
			from: 0,
			to: 1,
			ease: "Linear",
			duration: 10000,
			onUpdate: (tween, targets, key, current, previous, param) => {
				var value = current;
				temp.setAlpha(8 - 8 * current);
			},
			onComplete: () => {
				temp.destroy();
				this.debugTexts.splice(this.debugTexts.indexOf(temp), 1);
			},
		});
	}

	/* Blur */

	initBlur(): void {
		// Listen for events from the UI scene
		this.scene.get("UIScene").events.on(
			"attraction",
			(state: boolean) => {
				this.attractionOpen = state;

				this.updateBlur();
				// this.foodWeb.toggleAttraction(state);
			},
			this
		);

		this.scene.get("UIScene").events.on(
			"info",
			(state: boolean) => {
				this.infoWindowOpen = state;
				this.updateBlur();
			},
			this
		);

		this.scene.get("UIScene").events.on(
			"restart",
			() => {
				this.restart();
			},
			this
		);
	}

	updateBlur(): void {
		let filter = this.cameras.main.getPostPipeline(
			BlurPostFilter
		) as BlurPostFilter;
		let isActive = this.cameras.main.hasPostPipeline;
		let shouldBeActive = this.attractionOpen || this.infoWindowOpen;

		if (shouldBeActive) {
			if (!isActive) {
				this.cameras.main.setPostPipeline(BlurPostFilter);
				filter = this.cameras.main.getPostPipeline(
					BlurPostFilter
				) as BlurPostFilter;
			}

			if (this.blurTween) {
				this.blurTween.stop();
			}

			this.blurTween = this.tweens.add({
				targets: filter,
				steps: { from: filter.steps, to: 5 },
				offsetX: { from: filter.offsetX, to: 2.4 },
				offsetY: { from: filter.offsetY, to: 2.4 },
				ease: "Linear",
				duration: 250,
			});
		} else {
			if (this.blurTween) {
				this.blurTween.stop();
			}

			this.blurTween = this.tweens.add({
				targets: filter,
				steps: { from: filter.steps, to: 0 },
				offsetX: { from: filter.offsetX, to: 0 },
				offsetY: { from: filter.offsetY, to: 0 },
				ease: "Linear",
				duration: 250,
				onComplete: () => {
					this.cameras.main.resetPostPipeline();
				},
			});
		}
	}
}
