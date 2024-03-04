import cloudinary from "./cloudinary.js";

const folder = "MUGEMA Project Images";

export const uploadSingle = async (image) => {
  try {
    return await cloudinary.uploader.upload(image, {
      folder,
    });
  } catch (error) {
    const err = error.error?.toString();
    throw new Error(err?.split(": ")[2]?.split(",")[0] || err || error.message);
  }
};

export const uploadMultiple = async (images) => {
  const imageUrls = [];
  const errors = [];
  for (const i in images) {
    try {
      const data = await uploadSingle(images[i]);
      imageUrls.push(data.secure_url);
    } catch (error) {
      errors.push(error.message);
    }
  }
  return { images: imageUrls, errors: message(imageUrls.length, errors) };
};

function message(imageLen, errors) {
  if (errors.length > 0) {
    return `${
      imageLen === 0 ? "No" : imageLen
    } other project images were uploaded, (${
      errors.length
    }) went wrong as ${errors
      .filter((error, index) => errors.indexOf(error) === index)
      .join(", ")}`;
  }
}
