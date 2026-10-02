import { BaseScene } from "./BaseScene";
import { languageManager, LanguageKey } from "@/utils/LanguageManager";
import { layoutManager as layout } from "@/utils/LayoutManager";
import { config } from "@/utils/RuntimeConfig";

import { InfoWindow } from "@/components/attraction/InfoWindow";
import { ToolboxButton } from "@/components/attraction/ToolboxButton";
import { AttractionView } from "@/components/attraction/AttractionView";
import { Lockdown } from "@/components/attraction/Lockdown";
import { getLocalStorage, setLocalStorage } from "@/utils/functions";
import { blocksManager } from "@/utils/BlocksManager";

export class UIScene extends BaseScene {
	private attractionView: AttractionView;
	private idleTimer: number;
	private fader: Phaser.GameObjects.Rectangle;
	private lockdown: Lockdown;

	private infoWindow: InfoWindow;
	private toolButtons: ToolboxButton[];
	private currentLanguage: LanguageKey;
	private audioEnabled: boolean;

	private allowInput: boolean;

	constructor() {
		super({ key: "UIScene" });
	}

	create(): void {
		this.fade(false, 250, 0x000000);

		this.currentLanguage = languageManager.getCurrentLanguage();
		this.audioEnabled = true;
		blocksManager.setBlocksAudio(this.audioEnabled);

		this.allowInput = false;
		setTimeout(() => {
			this.allowInput = true;
		}, 200);

		/* Attraction mode */

		const showAttraction = false;
		this.idleTimer = -2;
		// this.add.rectangle(this.CX, this.CY, this.W, this.H, 0xFFFFFF, 0.3);
		this.attractionView = new AttractionView(this);
		this.attractionView.on("click", this.wakeUp, this);

		if (showAttraction) {
			this.attractionView.show();
		} else {
			this.attractionView.hide();
		}

		/* Info window (clicking info-button) */

		this.infoWindow = new InfoWindow(this, 0x261e07, 0x8f6b18);
		this.infoWindow.on(
			"close",
			() => {
				this.events.emit("info", false);
			},
			this
		);
		this.infoWindow.on("guide", (value: boolean) => {
			this.events.emit("guide", value);
			setLocalStorage("guide", value);
		});

		if (getLocalStorage("guide", false)) {
			this.infoWindow.setGuideMode(true);
		}

		/* Toolbar */

		const toolButtons = [
			{
				image: "info",
				function: this.onInfoButton,
			},
			{
				image: this.audioEnabled ? "audio-loud" : "audio-mute",
				function: this.onAudioButton,
			},
			{
				image: "reset",
				function: () => {
					this.onRestartButton(true);
				},
			},
			{
				image:
					this.currentLanguage == LanguageKey.Swedish ? "flag-en" : "flag-se",
				function: this.onLanguageButton,
			},
		];

		this.toolButtons = [];
		for (let i = 0; i < toolButtons.length; i++) {
			let button = toolButtons[i];
			let size = 35;
			let x = layout.toolbar.centerX;
			let y =
				layout.toolbar.bottom -
				(toolButtons.length - 1 - i) * 1.75 * size -
				0.5 * size;

			let obj = new ToolboxButton(this, x, y, size, button.image);
			this.add.existing(obj);
			this.toolButtons.push(obj);

			obj.on("click", button.function, this);
		}

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

		/* Lockdown */

		this.lockdown = new Lockdown(this);
		this.scene
			.get("GameScene")
			.events.on("lockdown", this.lockdown.trigger, this.lockdown);
	}

	update(time: number, delta: number): void {
		this.attractionView.update(time, delta);
		this.infoWindow.update(time, delta);
		this.lockdown.update(time, delta);

		this.attractionView.alpha *= 1 - 0.99 * this.infoWindow.alpha;

		for (let button of this.toolButtons) {
			button.update(time, delta);
		}

		if (this.allowInput) {
			this.idleTimer += delta / 1000;
			if (
				!this.attractionView.visible ||
				this.infoWindow.isOpen ||
				this.currentLanguage != LanguageKey.Swedish ||
				!this.audioEnabled
			) {
				if (this.idleTimer > config.IDLE_TIME) {
					this.fader.setVisible(true);
					this.fader.setAlpha(
						Math.pow((this.idleTimer - config.IDLE_TIME) / config.IDLE_FADE, 0.7)
					);

					if (this.idleTimer > config.IDLE_TIME + config.IDLE_FADE / 3) {
						this.fader.input!.enabled = true;
					}

					if (this.idleTimer > config.IDLE_TIME + config.IDLE_FADE) {
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

	onInfoButton() {
		if (!this.allowInput) return;

		if (this.infoWindow.isClosed) {
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
			this.attractionView.show();
			this.infoWindow.setGuideMode(false);

			this.events.emit("restart");
			this.events.emit("attraction", true);
			this.events.emit("info", false);
		}

		if (this.currentLanguage == LanguageKey.English) {
			this.onLanguageButton();
		}

		if (!this.audioEnabled) {
			this.onAudioButton();
		}
	}

	onLanguageButton() {
		if (!this.allowInput) return;

		const languageButton = this.toolButtons[3];

		if (this.currentLanguage == LanguageKey.Swedish) {
			this.currentLanguage = LanguageKey.English;
			languageManager.setLanguage(LanguageKey.English);
			languageButton.setTexture("flag-se");
		} else {
			this.currentLanguage = LanguageKey.Swedish;
			languageManager.setLanguage(LanguageKey.Swedish);
			languageButton.setTexture("flag-en");
		}
	}

	onAudioButton() {
		if (!this.allowInput) return;

		const audioButton = this.toolButtons[1];

		if (this.audioEnabled) {
			this.audioEnabled = false;
			audioButton.setTexture("audio-mute");
			audioButton.setTint(0xff0000);
		} else {
			this.audioEnabled = true;
			audioButton.setTexture("audio-loud");
			audioButton.setTint(0xffffff);
		}

		blocksManager.setBlocksAudio(this.audioEnabled);
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
