import os, csv, re
from PIL import Image


# Fetch paths to all images
def fetch_images(dirs):
    paths = []
    for dir_path in dirs:
        files = os.listdir(dir_path)
        for filename in files:
            path = os.path.join(dir_path, filename)
            paths.append(path)
    return paths


# Read Unreal data
def read_csv(file):
    lines = []
    with open(file, "r") as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            lines.append(row)
    return lines


new_images = fetch_images(["rasters/new"])
old_images = fetch_images(["rasters/old"])
lines = read_csv("dataset.csv")

# Map "texture" -> "path". New images are prioritized.
image_map = {}
for path in old_images:
    texture = path.split("/")[-1]
    texture = texture.split(".png")[0]
    texture = re.sub("[^a-zA-Z0-9]", "_", texture)
    image_map[texture] = path
for path in new_images:
    texture = path.split("/")[-1]
    texture = texture.split(".png")[0]
    texture = re.sub("[^a-zA-Z0-9]", "_", texture)
    image_map[texture] = path

found_textures = {}
missing_textures = []

# Pair up textures with image paths
for args in lines:
    _, extent, name, texture = args

    texture = texture.split("'")[1]
    texture = texture.split("/")[4]
    texture = texture.split(".")[0]

    if texture in image_map:
        if name in found_textures:
            print(f"Duplicate name found: '{name}'")
        found_textures[name] = image_map[texture]
    else:
        print(f"Cannot find texture: '{texture}'")
print()

# Create output folder
if not os.path.exists("thumbnails"):
    os.makedirs("thumbnails")

# Image magic
for name, path in found_textures.items():
    print(f"Converting {name}...")
    image = Image.open(path)

    # Setting the points for cropped image
    width, height = image.size
    new_size = min(width, height)
    cx = width / 2
    cy = height / 2

    left = round(cx - new_size / 2)
    top = round(cy - new_size / 2)
    right = round(cx + new_size / 2)
    bottom = round(cy + new_size / 2)

    # Cropped image of above dimension
    cropped_image = image.crop((left, top, right, bottom))
    scaled_image = cropped_image.resize((256, 256), Image.ANTIALIAS)

    # Preview image
    # image.show()
    # cropped.show()
    # scaled_image.show()
    # break

    scaled_image.save(f"thumbnails/{name}.png")
