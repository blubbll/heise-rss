const express = require("express"),
  app = express(),
  request = require("request"),
  sass = require("node-sass"),
  fs = require("fs"),
  es6tr = require("es6-transpiler"),
  Terser = require("terser");

app.use(express.static(".public"));

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

app.get("/heise-dev-news", (req, res) => {
  request(`https://www.heise.de/developer/rss/news-atom.xml`).pipe(res);
});

{
  let building = false;
  const transpile = (file, direct) => {
    const result = es6tr.run({ filename: file });
    const outFile = `${file.replace("/build", "/.public")}`;

    if (result.src) {
      const outResult = result.src.replace(/\0/gi, "").replace(/\\r\n/gi, "");

      if (!direct)
        [
          fs.writeFileSync(outFile, `${atto}\r\n${outResult}`),
          console.log(`Transpiled ${file} to ${outFile}!`)
        ];
      else {
        //console.log(`Transpiled ${file}!`);
        return outResult;
      }
    } else console.warn(`Error at transpiling of file ${file}:`, result);
  };
  const atto = "/*!💜I love you monad.*/";
  //SASS
  const COMPILE_CSS = () => {
    if (building) return;
    else building = true;
    const bundleFile = `${__dirname}/.public/bundle.css`;
    let bundle = "";

    const styles = [`${__dirname}/build/css/style.sass.css`];
    for (const style of styles) {
      bundle += sass
        .renderSync({
          data: fs.readFileSync(style, "utf8") || "/**/",
          outputStyle: "compressed"
        })
        .css.toString("utf8");
    }
    //write bundle
    fs.writeFileSync(bundleFile, `${atto}\r\n${bundle}`, "utf8");
    console.log(`Bundled ${styles} into ${bundleFile}!`);
    building = false;
  };
  //BUNDLE JS
  const COMPILE_JS = () => {
    if (building) return;
    else building = true;
    const bundleFile = `${__dirname}/.public/bundle.js`;
    let bundle = "";

    const scripts = [`${__dirname}/build/js/client.js`];
    for (const script of scripts) {
      bundle += transpile(script, true);
    }
    //write bundle
    const minified = Terser.minify(bundle);
    minified.error
      ? console.warn(minified.error)
      : fs.writeFileSync(bundleFile, `${atto}\r\n${minified.code}`, "utf8");
    console.log(`Bundled ${scripts} into ${bundleFile}!`);
    building = false;
  };
  {
    COMPILE_CSS();
    COMPILE_JS();
    //watch changes
    fs.watch(`${__dirname}/build/css`, COMPILE_CSS);
    fs.watch(`${__dirname}/build/js/`, COMPILE_JS);
  }
}

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
