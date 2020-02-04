const { fetch, moment } = window;

const RSS_URL = `https://www.heise.de/developer/rss/news-atom.xml`;

moment.locale("de");

fetch("/heise-dev-news")
  .then(response => response.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => {
    console.log(data);
    const items = data.querySelectorAll("entry");
    let html = ``;
    items.forEach(el => {
      html += `
        <article>
          <h3>🕒${moment(el.querySelector("updated").innerHTML).format("DD.MM.YYYY -hh:mm")}</h3>
          <h2>
            <a href="${
              el.querySelector("link").innerHTML
            }" target="_blank" rel="noopener">
              ${el.querySelector("title").innerHTML}
            </a>
          </h2>
        </article>
      `;
    });
    document.body.insertAdjacentHTML("beforeend", html);
  });
