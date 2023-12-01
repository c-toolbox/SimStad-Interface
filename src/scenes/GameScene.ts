import { BaseScene } from "@/scenes/BaseScene";
import { BlurPostFilter } from "@/utils/pipelines/BlurPostFilter";
import { languageManager } from "@/utils/LanguageManager";

// import { Thing } from "@/components/Thing";

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

	// private background: Phaser.GameObjects.Image;
	// private turtle: Turtle;
	// private ui: UI;

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
	}

	update(time: number, delta: number) {
		// this.turtle.update(time, delta);

		if (Math.random() < 0.002) {
			this.addMessage("{what look its a reall ylong message or something}");
		}
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
		const chatSocket = new WebSocket(url);

		chatSocket.onopen = () => {
			const data = JSON.stringify({
				token: "CLIENT-TOKEN-HERE",
			});
			chatSocket.send(data);
			this.addMessage(data);
		};

		chatSocket.onclose = () => {
			this.addMessage("Connection closed");
		};

		chatSocket.onmessage = (event: MessageEvent) => {
			const data = JSON.parse(event.data);
			this.addMessage(JSON.stringify(data));

			// Bounce message
			chatSocket.send(event.data);
		};
	}

	addMessage(text: string) {
		let temp = this.addText({
			size: 32,
			color: "white",
			text,
		});
		temp.setOrigin(1);
		temp.setStroke("black", 8);

		var tween = this.tweens.addCounter({
			from: 0,
			to: 1,
			ease: "Linear",
			duration: 4000,
			onUpdate: (tween, targets, key, current, previous, param) => {
				var value = current;
				temp.x = this.W - 50;
				temp.y = this.H - 50 - 100 * value;
				temp.setAlpha(2 - 2 * current);
			},
			onComplete: () => {
				temp.destroy();
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
