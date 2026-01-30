import { BaseScene } from "@/scenes/BaseScene";
import { Button } from "@/components/elements/Button";
import { RoundRectangle } from "@/components/elements/RoundRectangle";
import { LazyImage } from "@/components/elements/LazyImage";
import { Color } from "@/utils/colors";
import { languageManager } from "@/utils/LanguageManager";
import { GrayScalePostFilter } from "@/utils/pipelines/GrayScalePostFilter";
import { Collection } from "@/utils/interfaces";

export class CollectionButton extends Button {
	private border: RoundRectangle;
	private image: LazyImage;
	private title: Phaser.GameObjects.Text;
	private loader: Phaser.GameObjects.Image;
	private isLoading: boolean;

	constructor(
		scene: BaseScene,
		x: number,
		y: number,
		width: number,
		height: number,
		collection: Collection,
	) {
		super(scene, x, y);
		this.width = width;
		this.height = height;
		this.isLoading = false;

		const p = 12;
		this.border = new RoundRectangle(scene, {
			width: this.width + p,
			height: this.height + p,
			radius: p / 2,
			color: Color.Slate800,
		});
		this.add(this.border);

		this.image = new LazyImage(scene, 0, 0);
		this.add(this.image);

		/* Loader spinner */

		this.loader = scene.add.image(0, 0, "vis_c_logo_white");
		this.loader.setTint(0xffffff);
		this.loader.setAlpha(0.5);
		this.loader.setScale((0.4 * width) / this.loader.width);
		this.add(this.loader);

		const titleHeight = width / 8;
		let titleBg = scene.add.rectangle(
			0,
			height / 2 - titleHeight / 2,
			width,
			titleHeight,
			Color.Black,
			0.4,
		);
		this.add(titleBg);

		this.title = scene.addText({
			y: height / 2 - titleHeight / 2,
			size: 0.6 * titleHeight,
			fontFamily: "Lato-Bold",
			color: "white",
			text: collection.name,
		});
		this.title.setStroke("black", 4);
		this.title.setShadow(0, 2, "black", 8);
		this.title.setOrigin(0.5);
		this.setText(collection.name);
		this.add(this.title);

		this.bindInteractive(this.image);

		/* Setup collection image loading */

		this.isLoading = true;
		this.image.on("loaded", (loaded: boolean) => {
			this.isLoading = !loaded;
			if (loaded) {
				this.updateImageDisplay();
			}
		});
		this.image.setTexture(collection.image);
	}

	update(time: number, delta: number) {
		this.setScale(1 - 0.04 * this.holdSmooth);

		if (this.isLoading) {
			this.loader.angle = time / 2;
			this.loader.visible = true;
		} else {
			this.loader.visible = false;
		}
	}

	private updateImageDisplay() {
		this.image.setScale(this.width / this.image.width);
		const cropW = this.width / this.image.scaleX;
		const cropH = this.height / this.image.scaleY;
		const cropX = 0;
		const cropY = (this.image.height - cropH) / 2;
		this.image.setCrop(cropX, cropY, cropW, cropH);
		this.image.input!.hitArea.setTo(cropX, cropY, cropW, cropH);
	}

	setText(key: string) {
		if (languageManager.get(key, false)) {
			languageManager.bind(this.title, key, () => {
				this.title.setScale(1);
				if (this.title.displayWidth > this.width - 40) {
					this.title.displayWidth = this.width - 40;
					this.title.scaleY = this.title.scaleX;
				}
			});
		} else {
			this.title.setText(key);
		}
	}

	disable() {
		this.image.setPostPipeline(GrayScalePostFilter);
		this.border.setColor(Color.Slate800);
		this.image.setAlpha(0.5);
		this.image.input!.enabled = false;
	}
}
