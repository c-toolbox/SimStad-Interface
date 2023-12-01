import { BaseScene } from "./BaseScene";
import { languageManager, LanguageKey } from "@/utils/LanguageManager";
import { VERSION, IDLE_TIME, IDLE_FADE, SCALE } from "@/utils/constants";

import { InfoWindow } from "@/components/attraction/InfoWindow";
import { ToolboxButton } from "@/components/attraction/ToolboxButton";
import { AttractionView } from "@/components/attraction/AttractionView";
import { RoundRectangle } from "@/components/elements/RoundRectangle";

export class UIScene extends BaseScene {
	private attractionView: AttractionView;
	private idleTimer: number;
	private fader: Phaser.GameObjects.Rectangle;

	private infoWindow: InfoWindow;
	// private storyWindow: StoryWindow;
	private toolButtons: ToolboxButton[];
	private currentLanguage: LanguageKey;

	private allowInput: boolean;

	constructor() {
		super({ key: "UIScene" });
	}

	create(): void {
		this.fade(false, 250, 0x000000);

		this.currentLanguage = languageManager.getCurrentLanguage();

		this.allowInput = false;
		setTimeout(() => {
			this.allowInput = true;
		}, 200);

		/* Attraction mode */

		const showAttraction = false;
		this.idleTimer = -2;
		// this.add.rectangle(this.CX, this.CY, this.W, this.H, 0xFFFFFF, 0.3);
		this.attractionView = new AttractionView(this, "#FFF", "streets", 0xFFFFFF);
		this.attractionView.on("click", this.wakeUp, this);
		this.events.emit("attraction", showAttraction);

		if (showAttraction) {
			this.attractionView.show();
		} else {
			this.attractionView.hide();
		}

		/* Info window (clicking info-button) */

		this.infoWindow = new InfoWindow(this, 0x261e07, 0x755917);
		this.infoWindow.on(
			"close",
			() => {
				this.events.emit("info", false);
			},
			this
		);

		/* Toolbar */

		let ctW = 0.04 * this.W;
		let sbH = 0.22 * this.H;
		let tbX = this.W - ctW / 2;
		let tbY = this.H - sbH / 2;

		const toolButtons = [
			{
				image: "icon-info-dot",
				function: this.onInfoButton,
			},
			{
				image: "icon-reset",
				function: () => {
					this.onRestartButton(true);
				},
			},
			{
				image:
					this.currentLanguage == LanguageKey.Swedish
						? "icon-menu-flag-en"
						: "icon-menu-flag-se",
				function: this.onLanguageButton,
			},
		];

		this.toolButtons = [];
		for (let i = 0; i < toolButtons.length; i++) {
			let button = toolButtons[i];
			// let size = 0.024 * this.H;
			let size = 0.03 * this.H;
			let x = tbX;
			let y = tbY + (i - (toolButtons.length - 1) / 2) * 1.75 * size;

			let obj = new ToolboxButton(this, x, y, size, button.image);
			this.add.existing(obj);
			this.toolButtons.push(obj);

			obj.on("click", button.function, this);
		}

		// let land = this.add.image(this.CX, this.H - sbH - NODE_SIZE/2, "bg_land");
		// this.containToScreen(land);

		/* Fader */

		this.fader = this.add.rectangle(this.CX, this.CY, this.W, this.H, 0);
		this.fader.setVisible(false);
		this.fader
			.setInteractive({ useHandCursor: true })
			.on("pointerdown", this.wakeUp, this);
		this.fader.input!.enabled = false;

		/* Escape to reset */
		this.input.keyboard!.on(
			"keydown-ESC",
			() => {
				this.onRestartButton(true);
			},
			this
		);

		this.input.on(
			"pointerdown",
			() => {
				if (this.idleTimer > 0) this.idleTimer = 0;
			},
			this
		);
		this.input.on(
			"pointerup",
			() => {
				if (this.idleTimer > 0) this.idleTimer = 0;
			},
			this
		);
	}

	update(time: number, delta: number): void {
		this.attractionView.update(time, delta);
		this.infoWindow.update(time, delta);
		// this.storyWindow.update(time, delta);

		this.attractionView.alpha *= 1 - 0.99 * this.infoWindow.alpha;

		for (let button of this.toolButtons) {
			button.update(time, delta);
		}

		if (this.allowInput) {
			this.idleTimer += delta / 1000;
			if (
				!this.attractionView.visible ||
				this.infoWindow.isOpen ||
				this.currentLanguage != LanguageKey.Swedish
			) {
				if (this.idleTimer > IDLE_TIME) {
					this.fader.setVisible(true);
					this.fader.setAlpha(
						Math.pow((this.idleTimer - IDLE_TIME) / IDLE_FADE, 0.7)
					);

					if (this.idleTimer > IDLE_TIME + IDLE_FADE / 3) {
						this.fader.input!.enabled = true;
					}

					if (this.idleTimer > IDLE_TIME + IDLE_FADE) {
						this.onRestartButton(false);
						this.idleTimer = -2;
					}
				} else {
					this.fader.setVisible(false);
				}
			} else if (this.fader.visible) {
				this.fader.input!.enabled = false;
				this.fader.setAlpha(-this.idleTimer / 2);
				if (this.fader.alpha <= 0) {
					this.fader.setVisible(false);
				}
			}
		}
	}

	// bookmarkButton() {
	// }

	onInfoButton() {
		if (!this.allowInput) return;

		if (this.infoWindow.isClosed /*&& this.storyWindow.isClosed*/) {
			this.events.emit("info", true);
			this.infoWindow.show();
		} else if (this.infoWindow.isOpen) {
			this.events.emit("info", false);
			this.infoWindow.hide();
		}
	}

	onRestartButton(manually: boolean) {
		if (!this.allowInput) return;

		if (!this.attractionView.visible || this.infoWindow.isOpen) {
			this.infoWindow.hide();
			// this.storyWindow.hide();
			this.attractionView.show();

			this.events.emit("restart");
			this.events.emit("attraction", true);
			this.events.emit("info", false);
			// this.events.emit("story", false);
		}

		if (this.currentLanguage == LanguageKey.English) {
			this.onLanguageButton();
		}
	}

	onLanguageButton() {
		if (!this.allowInput) return;

		const languageButton = this.toolButtons[this.toolButtons.length - 1];

		if (this.currentLanguage == LanguageKey.Swedish) {
			this.currentLanguage = LanguageKey.English;
			languageManager.setLanguage(LanguageKey.English);
			languageButton.setTexture("icon-menu-flag-se");
		} else {
			this.currentLanguage = LanguageKey.Swedish;
			languageManager.setLanguage(LanguageKey.Swedish);
			languageButton.setTexture("icon-menu-flag-en");
		}
	}

	wakeUp() {
		if (!this.allowInput) return;

		if (this.attractionView.visible && !this.fader.input!.enabled) {
			this.attractionView.hide();
			this.events.emit("attraction", false);
		}
		this.fader.setVisible(false);
		this.fader.input!.enabled = false;
		this.idleTimer = 0;
	}
}
