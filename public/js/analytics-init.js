/* ========================================================
   StoryZIP™︎ LP v1.0 - analytics-init.js
   GA4 / Meta Pixel の初期化を「ここ一箇所」に統一します。

   引継ぎ値（現行LP https://lp.joyzipper.jp/ の表示・HTMLから確認済み）：
   - GA4 測定ID：G-VJMSBRJYEW
   - Meta ピクセルID：1067655327831894（fbq init と PageView のみ継承）

   安全策：
   - window.gtag は常にダミー関数（dataLayer.push のラッパー）として定義します。
     これにより main.js / forms.js の sendEvent() は本番以外でも例外なく動作します。
   - しかし実際の外部送信（gtag.js の読み込み、fbq の初期化）は
     hostname が本番ドメイン（lp.joyzipper.jp）のときだけ行います。
     Genspark preview / ローカル確認 / file:// などからの誤送信を防ぐためです
     （修正指示 7 「ローカルプレビューから外部解析へテスト送信しない」に対応）。
   - 氏名・メールアドレス・自由記述などの個人情報は、このファイル・他のJSファイルの
     どこからもGA4/Metaへ送信していません（イベント引数は種別・位置・セクション名のみ）。

   未検証事項（README参照）：
   - Google/Metaの管理画面側で、自動詳細マッチング・フォーム自動取得・拡張コンバージョン等の
     設定がOFFになっているかは、この制作環境からは確認できません。管理画面側の確認は
     坂本さんの環境で別途行ってください。
   ======================================================== */
(function () {
  'use strict';

  var PRODUCTION_HOST = 'lp.joyzipper.jp';
  var GA4_MEASUREMENT_ID = 'G-VJMSBRJYEW';
  var META_PIXEL_ID = '1067655327831894';

  // --------------------------------------------------------
  // window.gtag は常に定義する（未送信時もエラーにしないため）
  // --------------------------------------------------------
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  var isProduction = (window.location.hostname === PRODUCTION_HOST);

  if (!isProduction) {
    if (window.console && window.console.info) {
      console.info(
        '[StoryZIP LP] 本番ドメイン(' + PRODUCTION_HOST + ')以外での表示のため、' +
        'GA4/Metaへの実送信を無効化しています（プレビュー安全策）。'
      );
    }
    return;
  }

  // --------------------------------------------------------
  // GA4（本番ドメインのときだけ実際に読み込む）
  // --------------------------------------------------------
  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID);

  var ga4Script = document.createElement('script');
  ga4Script.async = true;
  ga4Script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_MEASUREMENT_ID);
  document.head.appendChild(ga4Script);

  // --------------------------------------------------------
  // Meta Pixel（現行LPで確認済みのfbq init + PageViewのみ継承。
  // 独自イベント・氏名・メール等の送信はここでは行いません）
  // --------------------------------------------------------
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
})();
