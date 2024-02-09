import os, csv, re, json
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


folders = {
    "color": "CleanColor",
    "old": "Nkpg",
    "new": "Nkpg",
    "flood": "Flood",
    "missing": "Missing",
}
image_groups = [
    fetch_images(["rasters/color"]),
    fetch_images(["rasters/old"]),
    fetch_images(["rasters/new"]),
    fetch_images(["rasters/flood"]),
]
datasets = [
    read_csv("rasters/dataset_color.csv"),
    read_csv("rasters/dataset_layers.csv"),
    read_csv("rasters/dataset_flood.csv"),
]
datasets = sum(datasets, [])

# Map "texture" -> "path". New images are prioritized.
image_map = {}
for image_group in image_groups:
    for path in image_group:
        texture = path.split("/")[-1]
        texture = texture.split(".png")[0]
        texture = re.sub("[^a-zA-Z0-9-]", "_", texture)
        image_map[texture] = path

found_textures = {}
found_textures_names = {}
missing_textures = set()

# Pair up textures with image paths
for args in datasets:
    _, extent, name, texture = args

    texture = texture.split("'")[1]
    texture = texture.split("/")[4]
    texture = texture.split(".")[0]

    if texture in image_map:
        if name in found_textures:
            print(f"Duplicate name found: '{name}'")
        found_textures[name] = image_map[texture]
        found_textures_names[texture] = name
    else:
        print(f"Cannot find texture: '{texture}'")
print()

for name in image_map:
    if name not in found_textures_names:
        print(name)
        found_textures[name] = image_map[name]
        missing_textures.add(name)

# Create output folder
if not os.path.exists("output"):
    os.makedirs("output")
if not os.path.exists("output/thumbnails"):
    os.makedirs("output/thumbnails")
for key in folders:
    if not os.path.exists("output/thumbnails/" + folders[key]):
        os.makedirs("output/thumbnails/" + folders[key])
if not os.path.exists("output/map"):
    os.makedirs("output/map")
for key in folders:
    if not os.path.exists("output/map/" + folders[key]):
        os.makedirs("output/map/" + folders[key])

# Thumbnail image magic
for name, path in found_textures.items():
    print(f"Converting thumbnail for {name}...")
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
    if width > height:
        scaled_image = scaled_image.transpose(Image.ROTATE_90)

    folder = folders[path.split("/")[1]]
    if name in missing_textures:
        folder = "Missing"
    scaled_image.save(f"output/thumbnails/{folder}/{name}.png")

# Map image magic
for name, path in found_textures.items():
    print(f"Converting map image for {name}...")
    image = Image.open(path)

    # Setting the points for cropped image
    width, height = image.size

    # Cropped image of above dimension
    new_width = 730
    new_height = int(730 * (3849 / 5120))
    if width > height:
        scaled_image = image.resize((new_width, new_height), Image.ANTIALIAS)
        rotated_image = scaled_image.transpose(Image.ROTATE_90)
    else:
        rotated_image = image.resize((new_height, new_width), Image.ANTIALIAS)

    folder = folders[path.split("/")[1]]
    if name in missing_textures:
        folder = "Missing"
    rotated_image.save(f"output/map/{folder}/{name}.png")

# Write layers.json

layers = []
for name, path in found_textures.items():
    folder = folders[path.split("/")[1]]
    if name in missing_textures:
        folder = "Missing"
    layers.append(f"{folder}/{name}")

with open("output/layers.json", "w") as f:
    json.dump({"layers": layers}, f, indent="\t")

print(f"Wrote {len(layers)} layers to output/layers.json")
