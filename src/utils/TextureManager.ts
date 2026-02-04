import { config } from "./RuntimeConfig";
import { BaseScene } from "@/scenes/BaseScene";
import { filesystem } from "@neutralinojs/lib";

type SubscriptionCallback = (isLoaded: boolean) => void;

/**
 * Raster-related folders that are updated together.
 * When refreshRasters is called, only these folders are refreshed.
 */
const RASTER_REFRESH_FOLDERS = ["thumbnails", "minimaps", "rasters", "videos"];

class TextureManager {
	private priorityQueue: Array<{
		scene: BaseScene;
		textureKey: string;
		resolve: (value: boolean) => void;
	}>;
	private preloadQueue: Array<{
		scene: BaseScene;
		textureKey: string;
		resolve: (value: boolean) => void;
	}>;
	private isLoading: boolean;
	private textureSubscriptions: Map<string, Array<SubscriptionCallback>>;

	constructor() {
		this.priorityQueue = [];
		this.preloadQueue = [];
		this.isLoading = false;
		this.textureSubscriptions = new Map();
	}

	/**
	 * Loads a media asset image asynchronously on-demand.
	 * Takes a texture key (e.g., "thumbnails_Buller") and loads the corresponding file.
	 * Images are loaded sequentially to avoid blocking the main thread.
	 * Priority items are loaded before preload items.
	 * Returns true if the load was queued/triggered, false if the texture already exists.
	 */
	async requestTexture(
		scene: BaseScene,
		textureKey: string,
		priority = false,
	): Promise<boolean> {
		// Check if texture already exists
		if (scene.textures.exists(textureKey)) {
			return false;
		}

		return new Promise((resolve) => {
			// Add to appropriate queue
			if (priority) {
				this.priorityQueue.push({ scene, textureKey, resolve });
			} else {
				this.preloadQueue.push({ scene, textureKey, resolve });
			}

			// Process queue if not already loading
			if (!this.isLoading) {
				this.processLoadQueue();
			}
		});
	}

	/**
	 * Extracts the folder and filename from a texture key.
	 * Texture keys are formatted as "{folder}_{filename}" from mediaLoader.
	 * Returns { folder, filename } or null if the key format is invalid.
	 */
	private extractFolderAndFilename(
		textureKey: string,
	): { folder: string; filename: string } | null {
		const parts = textureKey.split("_");
		if (parts.length < 2) {
			console.warn(`Invalid texture key format: ${textureKey}`);
			return null;
		}

		const folder = parts[0];
		const filename = parts.slice(1).join("_"); // Handle filenames with underscores

		return { folder, filename };
	}

	/**
	 * Attempts to find a file with the given filename and any supported extension.
	 * Returns an object with the full file path and MIME type, or null if not found.
	 */
	private async findMediaFile(
		baseFolder: string,
		filename: string,
	): Promise<{ filePath: string; mimeType: string } | null> {
		const mimeTypes: Record<string, string> = {
			".png": "image/png",
			".jpg": "image/jpeg",
			".jpeg": "image/jpeg",
		};

		for (const ext of Object.keys(mimeTypes)) {
			const filePath = `${config.MEDIA_PATH}\\${baseFolder}\\${filename}${ext}`;

			try {
				await filesystem.readBinaryFile(filePath);
				return { filePath, mimeType: mimeTypes[ext] };
			} catch {
				continue;
			}
		}

		return null;
	}

	/**
	 * Processes the load queues sequentially, loading one image at a time.
	 * Priority queue is processed first, then preload queue.
	 */
	private async processLoadQueue(): Promise<void> {
		if (
			this.isLoading ||
			(this.priorityQueue.length === 0 && this.preloadQueue.length === 0)
		) {
			return;
		}

		this.isLoading = true;
		// Dequeue from priority queue first, then preload queue
		const queueItem = this.priorityQueue.shift() ?? this.preloadQueue.shift();
		if (!queueItem) {
			this.isLoading = false;
			return;
		}
		const { scene, textureKey, resolve } = queueItem;

		// Skip if texture already exists
		if (scene.textures.exists(textureKey)) {
			resolve(false);
			this.isLoading = false;
			this.processLoadQueue();
			return;
		}

		const folderAndFile = this.extractFolderAndFilename(textureKey);
		if (!folderAndFile) {
			resolve(false);
			this.isLoading = false;
			this.processLoadQueue();
			return;
		}

		const { folder, filename } = folderAndFile;

		try {
			// Find the media file with any supported extension
			const mediaFile = await this.findMediaFile(folder, filename);

			if (!mediaFile) {
				console.error(
					`Failed to find media asset ${textureKey} with any supported extension (png, jpg, jpeg)`,
				);
				resolve(false);
				this.isLoading = false;
				this.processLoadQueue();
				return;
			}

			const { filePath, mimeType } = mediaFile;

			// Read the binary file
			const data = await filesystem.readBinaryFile(filePath);
			const blob = new Blob([data], { type: mimeType });
			const objectUrl = URL.createObjectURL(blob);

			// Add the image to the loader
			scene.load.image(textureKey, objectUrl);

			// Start the loader and handle completion
			scene.load.once("complete", () => {
				console.log(`Loaded texture: ${textureKey}`);

				// Revoke the object URL after loading
				URL.revokeObjectURL(objectUrl);

				// Notify all subscribers that this texture is loaded
				this.notifyTextureSubscribers(textureKey, true);

				resolve(true);

				// Move to next item in queue
				this.isLoading = false;
				this.processLoadQueue();
			});

			scene.load.start();
		} catch (error) {
			console.error(`Failed to load media asset ${textureKey}:`, error);
			resolve(false);

			// Continue with next item in queue
			this.isLoading = false;
			this.processLoadQueue();
		}
	}

	/**
	 * Subscribe a callback to be called when a texture is loaded.
	 * The callback will be invoked when the texture becomes available.
	 * @param textureKey The texture key to subscribe to
	 * @param callback Function to call when texture is loaded
	 * @returns An unsubscribe function
	 */
	subscribeToTexture(
		textureKey: string,
		callback: SubscriptionCallback,
	): () => void {
		if (!this.textureSubscriptions.has(textureKey)) {
			this.textureSubscriptions.set(textureKey, []);
		}

		this.textureSubscriptions.get(textureKey)!.push(callback);

		// Return unsubscribe function
		return () => {
			const callbacks = this.textureSubscriptions.get(textureKey);
			if (callbacks) {
				const index = callbacks.indexOf(callback);
				if (index !== -1) {
					callbacks.splice(index, 1);
				}
			}
		};
	}

	/**
	 * Notify all subscribers that a texture has been loaded.
	 * Called internally when a texture finishes loading.
	 */
	private notifyTextureSubscribers(
		textureKey: string,
		isLoaded: boolean,
	): void {
		const callbacks = this.textureSubscriptions.get(textureKey);
		if (callbacks) {
			callbacks.forEach((callback) => callback(isLoaded));
		}
	}

	/**
	 * Check if a texture key belongs to a raster-related folder.
	 */
	private isRasterRelatedTexture(textureKey: string): boolean {
		return RASTER_REFRESH_FOLDERS.some((folder) =>
			textureKey.startsWith(folder + "_"),
		);
	}

	/**
	 * Refresh all raster-related textures.
	 * Notifies all subscribers of raster-related textures to reset to placeholder,
	 * removes them from the scene, and requeues them for loading.
	 */
	async refreshRasterTextures(scene: BaseScene): Promise<void> {
		// Notify all subscribers of raster-related textures to reset to placeholder
		const subscribedTextures = Array.from(this.textureSubscriptions.keys());
		for (const textureKey of subscribedTextures) {
			if (this.isRasterRelatedTexture(textureKey)) {
				this.notifyTextureSubscribers(textureKey, false);
			}
		}

		// Remove all raster-related textures from the scene
		for (const textureKey of subscribedTextures) {
			if (this.isRasterRelatedTexture(textureKey)) {
				if (scene.textures.exists(textureKey)) {
					scene.textures.remove(textureKey);
				}
			}
		}

		// Load all raster-related textures that have subscribers
		for (const textureKey of subscribedTextures) {
			if (this.isRasterRelatedTexture(textureKey)) {
				await this.requestTexture(scene, textureKey);
			}
		}
	}
}

export const textureManager = new TextureManager();
