const puppeteer = require('puppeteer-core');
const rp = require('request-promise');
const Constants = require('./constants.js');

const sendMessage = async (text) => await rp.post({
  uri: Constants.slackHooksUrl,
  headers: { 'Content-Type': 'application/json' },
  json: {
    text
  }
});

async function checkRankingAndSendMessage() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage();
    await page.goto('https://tenki.jp/amedas/ranking/');
    const rankText = await page.evaluate(() => {
      const kyotoCity = Array.from(document.querySelectorAll('.pref'))
        .filter(e => e.innerText === '京都府')
        .find(e => e.parentElement.querySelector('.point').innerText === '京都');
      return kyotoCity && kyotoCity.parentElement.querySelector('.rank').innerText;
    });
    if (rankText) {
      const rank = Number(rankText);
      let text;
      switch (rank) {
        case 1: text = `:first_place_medal:京都市は全国アメダスランキング(気温(高温順))で現在 \`1\` 位です！！ :fireball::skull_and_crossbones::atsumori:\nhttps://tenki.jp/amedas/ranking/`; break;
        case 2: text = `:second_place_medal:京都市は全国アメダスランキング(気温(高温順))で現在 \`2\` 位です！！ :fireball::zany_face::atsumori:\nhttps://tenki.jp/amedas/ranking/`; __break;
        case 3: text = `:third_place_medal:京都市は全国アメダスランキング(気温(高温順))で現在 \`3\` 位です！！ :fireball::exploding_head::atsumori:\nhttps://tenki.jp/amedas/ranking/`; break;
        default: text = `:medal:京都市は全国アメダスランキング(気温(高温順))で現在 *${rank}* 位です！！ :fireball::face_with_thermometer:\nhttps://tenki.jp/amedas/ranking/`; break;
      }
      await sendMessage(text);
    }
  }
  finally {
    browser.close();
  }
}

(async () => {
  checkRankingAndSendMessage();
})();
