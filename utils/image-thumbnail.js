// utils/image-thumbnail.js
const path = require('path');
const sharp = require('sharp');

const generateThumbnails = async (filePath) => {
  const sizes = [100, 250, 500];
  const fileExtension = path.extname(filePath);
  const baseName = path.basename(filePath, fileExtension);

  await Promise.all(sizes.map(async (size) => {
    const outputPath = path.join(path.dirname(filePath), `${baseName}_${size}${fileExtension}`);
    await sharp(filePath).resize(size).toFile(outputPath);
  }));
};

module.exports = {
  generateThumbnails,
};
