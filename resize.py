from PIL import Image
import os

# Täze ölçeg (eni, boýy)
new_size = (180, 292)

# Suratlaryň ýollary
image_paths = [
    r"C:\Users\User\Desktop\e-commerce backend\uploads\images\50-schoolers-sunscreen-broad-spectrum-for-school-going-kids-boy-original-imahchvzgfzehtz2.jpeg",
    r"C:\Users\User\Desktop\e-commerce backend\uploads\images\portable-baby-powder-puff-with-box-holder-container-for-newborn-original-imahdnusbhyfaywz (2).jpeg",
    r"C:\Users\User\Desktop\e-commerce backend\uploads\images\300-baby-massage-oil-8901138512590-himalaya-original-imafzze9gtcdyxzh.jpeg"
]

# Çykýan papka: "tazelik"
output_folder = r"C:\Users\User\Desktop\tazelik"
os.makedirs(output_folder, exist_ok=True)

# Resize edip täze papkada sakla
for path in image_paths:
    if os.path.exists(path):
        try:
            with Image.open(path) as img:
                resized = img.resize(new_size)
                filename = os.path.basename(path)
                output_path = os.path.join(output_folder, filename)
                resized.save(output_path)
                print(f"✔ Saklandy: {output_path}")
        except Exception as e:
            print(f"⚠ Ýalňyşlyk: {path} — {e}")
    else:
        print(f"❌ Tapylmady: {path}")
