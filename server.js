const express = require("express"),
  app = express(),
  request = require("request"),
  sass = require("node-sass"),
  fs = require("fs");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

app.get("/heise-dev-news", (req, res) => {
  request(`https://www.heise.de/developer/rss/news-atom.xml`).pipe(res);
});

{
  let building = false;

  const atto = "/*!💜I love you monad.*/";
  //SASS
  const COMPILE_CSS = () => {
    if (building) return;
    else building = true;
    const bundleFile = `${__dirname}/public/bundle.css`;
    let bundle = "";

    const styles = [
      `${__dirname}/build/css/style.sass.css`
    ];
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
  {
    COMPILE_CSS();
    //watch changes
    fs.watch(`${__dirname}/build/css`, COMPILE_CSS);
  }
}

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
