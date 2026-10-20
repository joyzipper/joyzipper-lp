// ========================================================
// StoryZIP™︎ LP - main.js
// ナビゲーション / Sticky CTA / FAQ / セクション計測 / CTAクリック計測 / UTM引継ぎ
// ========================================================

(function () {
  'use strict';

  // --------------------------------------------------------
  // GA4 安全送信ヘルパー（gtag未設定でもエラーにしない。
  // 実際に外部へ送るかどうかは js/analytics-init.js が本番ドメイン判定で制御します）
  // --------------------------------------------------------
  function sendEvent(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }
  window.storyzipSendEvent = sendEvent;

  // --------------------------------------------------------
  // セッション内重複防止ヘルパー（同一タブの再読込・ページ遷移で重複しないようにする）
  // sessionStorageが使えない環境（プライベートブラウズ等）でも例外にしない。
  // --------------------------------------------------------
  function hasFired(key) {
    try { return sessionStorage.getItem(key) === '1'; } catch (e) { return false; }
  }
  function markFired(key) {
    try { sessionStorage.setItem(key, '1'); } catch (e) { /* noop */ }
  }
  window.storyzipHasFired = hasFired;
  window.storyzipMarkFired = markFired;

  // --------------------------------------------------------
  // UTM引継ぎ：訪問時にURLのUTMパラメータをsessionStorageへ保存し、
  // 同一タブでの以降の遷移でも保持する。氏名・メール・自由記述は一切扱わない。
  // フォームのhidden項目（data-utm属性）へ値を反映し、Netlify側の受信内容と
  // 流入経路を照合できるようにする（GA4へは送らない）。
  // --------------------------------------------------------
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var UTM_STORAGE_KEY = 'sz_utm_v1';

  function captureUtmParams() {
    var out = {};
    try {
      var params = new URLSearchParams(window.location.search);
      var any = false;
      UTM_KEYS.forEach(function (k) {
        var v = params.get(k);
        if (v) { out[k] = v; any = true; }
      });
      if (any) {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(out));
      } else {
        var stored = sessionStorage.getItem(UTM_STORAGE_KEY);
        if (stored) { out = JSON.parse(stored); }
      }
    } catch (e) { /* noop */ }
    return out;
  }

  function fillUtmFields() {
    var utm = captureUtmParams();
    document.querySelectorAll('[data-utm]').forEach(function (input) {
      var key = input.getAttribute('data-utm');
      input.value = utm[key] || '';
    });
  }

  window.storyzipFillUtmFields = fillUtmFields;

  document.addEventListener('DOMContentLoaded', function () {

    fillUtmFields();

    // --------------------------------------------------------
    // cta_click 計測（data-cta-type / data-cta-position を持つ要素）
    // --------------------------------------------------------
    document.querySelectorAll('[data-cta-type]').forEach(function (el) {
      el.addEventListener('click', function () {
        sendEvent('cta_click', {
          cta_type: el.getAttribute('data-cta-type') || '',
          position: el.getAttribute('data-cta-position') || ''
        });
      });
    });

    // --------------------------------------------------------
    // FAQ アコーディオン
    // --------------------------------------------------------
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        var answer = document.getElementById(btn.getAttribute('aria-controls'));
        btn.setAttribute('aria-expanded', String(!expanded));
        if (answer) {
          if (expanded) {
            answer.classList.remove('is-open');
          } else {
            answer.classList.add('is-open');
          }
        }
      });
    });

    // --------------------------------------------------------
    // Sticky CTA：Heroが見えている間、または相談フォームが見えている間は隠し、
    // どちらも見えていない状態になったら表示する（一元的な状態判定）。
    // 修正前は「上へ戻って相談欄を離れた際に再表示する処理がない」不具合が
    // あったため、2つの可視状態を都度合成して判定する方式に変更しました。
    // --------------------------------------------------------
    var stickyCta = document.getElementById('sticky-cta');
    var heroSection = document.getElementById('hero');
    var consultationPanel = document.querySelector('.consultation-panel');

    if (stickyCta && heroSection) {
      var heroVisible = true;
      var formVisible = false;

      function updateStickyVisibility() {
        var shouldShow = !heroVisible && !formVisible;
        stickyCta.classList.toggle('is-visible', shouldShow);
      }

      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          heroVisible = entry.isIntersecting;
          updateStickyVisibility();
        });
      }, { threshold: 0 });
      heroObserver.observe(heroSection);

      if (consultationPanel) {
        var formObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            formVisible = entry.isIntersecting;
            updateStickyVisibility();
          });
        }, { threshold: 0.15 });
        formObserver.observe(consultationPanel);
      } else {
        updateStickyVisibility();
      }
    }

    // --------------------------------------------------------
    // section_view: section enters the viewport, once per tab session.
    // With normal downward reading, this occurs when its top enters the viewport.
    var sectionTargets = document.querySelectorAll('[data-section-view]');
    if (sectionTargets.length && 'IntersectionObserver' in window) {
      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var key = entry.target.getAttribute('data-section-view');
          var storageKey = 'sz_sv_' + key;
          if (entry.isIntersecting && key && !hasFired(storageKey)) {
            markFired(storageKey);
            sendEvent('section_view', { section: key, lp_version: 'v1.0' });
          }
        });
      }, { threshold: 0 });
      sectionTargets.forEach(function (el) { sectionObserver.observe(el); });
    }

  });
})();
