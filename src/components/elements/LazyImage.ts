import { BaseScene } from "@/scenes/BaseScene";
import { textureManager, TextureState } from "@/utils/TextureManager";

const PLACEHOLDER = "blank";

export class LazyImage extends Phaser.GameObjects.Image {
	public scene: BaseScene;

	private currentTextureKey: string;
	private unsubscribeCallback: (() => void) | null = null;

	constructor(scene: BaseScene, x: number, y: number) {
		super(scene, x, y, PLACEHOLDER);
		scene.add.existing(this);
		this.scene = scene;
	}

	setTexture(key: string): this {
		this.currentTextureKey = key;

		// Clean up previous subscription
		if (this.unsubscribeCallback) {
			this.unsubscribeCallback();
		}

		const isLoaded = key !== PLACEHOLDER && this.scene.textures.exists(key);

		if (key !== PLACEHOLDER) {
			this.unsubscribeCallback = textureManager.subscribeToTexture(
				key,
				this.refreshTexture.bind(this),
			);

			if (!isLoaded) textureManager.requestTexture(this.scene, key, true);
		}

		super.setTexture(isLoaded ? key : PLACEHOLDER);
		this.emit("loaded", isLoaded);

		return this;
	}

	protected refreshTexture(state: TextureState): void {
		if (
			state == "loaded" &&
			this.currentTextureKey &&
			this.scene.textures.exists(this.currentTextureKey)
		) {
			super.setTexture(this.currentTextureKey);
			this.emit("loaded", true);
		}
		// Texture is missing, show cross
		else if (state == "failed") {
			super.setTexture(PLACEHOLDER);
			this.emit("error");
		}
		// Texture was removed, show placeholder
		else {
			super.setTexture(PLACEHOLDER);
			this.emit("loaded", false);
		}
	}

	destroy(fromScene?: boolean): void {
		if (this.unsubscribeCallback) {
			this.unsubscribeCallback();
			this.unsubscribeCallback = null;
		}

		super.destroy(fromScene);
	}
}
