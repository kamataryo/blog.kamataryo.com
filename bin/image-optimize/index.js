import imagemin from "imagemin-keep-folder"
import imageminPngquant from "imagemin-pngquant"
import imageminWebp from "imagemin-webp"
import imageminSvgo from "imagemin-svgo"
import imageminMozjpeg from "imagemin-mozjpeg"
import imageminGifsicle from "imagemin-gifsicle"

const srcDir = "./content/posts/**/*.{jpg,jpeg,png,gif,svg}";
const outDir = "./content/posts_out/**/*";

const convertWebp = (targetFiles) => {
  imagemin([targetFiles], {
    use: [imageminWebp({ quality: 50 })],
  });
};

imagemin([srcDir], {
  plugins: [
    imageminMozjpeg(),
    imageminPngquant(),
    imageminGifsicle(),
    imageminSvgo(),
  ],
  replaceOutputDir: (output) => {
    return output.replace(/content\/posts\//, "content/posts_out/");
  },
}).then(() => {
  convertWebp(outDir);
  console.log("Images optimized!");
});
