const { Jimp } = require('jimp');

async function invertIcon() {
  try {
    // Read the black icon
    const image = await Jimp.read('./public/icon-logo.png');
    
    // Iterate through all pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      // Get alpha channel
      const alpha = this.bitmap.data[idx + 3];
      
      // If it's not fully transparent, make it white
      if (alpha > 0) {
        this.bitmap.data[idx] = 255;     // red
        this.bitmap.data[idx + 1] = 255; // green
        this.bitmap.data[idx + 2] = 255; // blue
      }
    });

    // Resize to standard icon sizes for app/icon.png
    image.resize(512, 512);

    // Save as icon.png in src/app/ (Next.js automatically uses icon.png)
    await image.writeAsync('./src/app/icon.png');
    
    // Save as favicon.ico just in case
    await image.resize(32, 32).writeAsync('./src/app/favicon.ico');
    
    console.log('Successfully created white icon.png and favicon.ico');
    
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

invertIcon();
