export async function compressLogo(file: File) {
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Choose a logo smaller than 8 MB.");
  }

  const image = await createImageBitmap(file);
  const scale = Math.min(1, 512 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  let currentScale = scale;

  try {
    for (let attempt = 0; attempt < 7; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.width * currentScale));
      canvas.height = Math.max(1, Math.round(image.height * currentScale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare the selected logo.");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const quality = Math.max(0.4, 0.82 - attempt * 0.07);
      const dataUrl = canvas.toDataURL("image/webp", quality);
      if (dataUrl.length <= 280_000) return dataUrl;
      currentScale *= 0.8;
    }
  } finally {
    image.close();
  }

  throw new Error(
    "This logo could not be compressed small enough. Choose a simpler image.",
  );
}