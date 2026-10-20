// ========================================================
// StoryZIP™︎ LP - case-render.js
// data/cases.json を読み込み、事例カードと動画ギャラリーを描画する。
//
// 公開制御ルール（修正指示 1 に基づく変更）：
//  - data/cases.json 自体には「公開対象（published:true）の事例のみ」を格納する運用に統一しました。
//  - 旧URLパラメータ（?preview=1）による表示切替は廃止しました。
//    ?preview=1 は表示切替であってアクセス制限ではなく、非公開データ自体が
//    ブラウザに配信されてしまう構成だったため、本番配信物からは完全に削除しています。
//  - 未公開の事例候補（published:false）を確認したい場合は、このリポジトリの
//    internal-only/cases-master.json を、坂本さんの手元またはアクセス制限のある
//    別環境で直接開いて確認してください。internal-only/ はGitHubへコピーしない
//    運用としてください（README参照）。
//  - 公開対象が0件の場合は、見出し・リード文・カード欄をまとめて非表示にします
//    （「公開できる事例は準備中です。」等の文言も出しません。White Paper案内は残します）。
// ========================================================

(function () {
  'use strict';

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderCaseCard(caseItem) {
    var card = el('article', 'case-card');

    card.appendChild(el('h3', null, escapeHtml(caseItem.anonymous_name)));

    if (caseItem.objective) {
      card.appendChild(el('p', 'case-label', '目的'));
      card.appendChild(el('p', 'case-value', escapeHtml(caseItem.objective)));
    }
    if (caseItem.approach) {
      card.appendChild(el('p', 'case-label', '施策'));
      card.appendChild(el('p', 'case-value', escapeHtml(caseItem.approach)));
    }
    if (caseItem.cast_count) {
      card.appendChild(el('p', 'case-value', escapeHtml(caseItem.cast_count)));
    }

    if (Array.isArray(caseItem.metrics) && caseItem.metrics.length) {
      var metrics = el('div', 'case-metrics', caseItem.metrics.map(escapeHtml).join('<br>'));
      card.appendChild(metrics);
    }

    if (caseItem.period) {
      card.appendChild(el('p', 'case-value', escapeHtml(caseItem.period)));
    }

    if (caseItem.note) {
      card.appendChild(el('p', 'case-note', escapeHtml(caseItem.note)));
    }

    return card;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var block = document.getElementById('case-studies-block');
    var grid = document.getElementById('case-grid');
    var videoSection = document.getElementById('video-gallery-section');
    var videoGrid = document.getElementById('video-gallery-grid');

    if (!grid || !block) return;

    fetch('data/cases.json')
      .then(function (res) {
        if (!res.ok) throw new Error('cases.json の取得に失敗しました');
        return res.json();
      })
      .then(function (data) {
        var cases = Array.isArray(data.cases) ? data.cases : [];
        // 防御的フィルタ：万一 published:false が混入していても表示しない。
        var visibleCases = cases.filter(function (c) { return c.published === true; });

        if (visibleCases.length > 0) {
          visibleCases.forEach(function (c) {
            grid.appendChild(renderCaseCard(c));
          });
          block.hidden = false;
        }
        // visibleCases.length === 0 の場合、block は初期状態の hidden のまま
        // （見出し・リード文・カード欄いずれも表示しません）。

        // Keep the video gallery hidden until media and playback are implemented.

      })
      .catch(function (err) {
        console.error('[StoryZIP LP] 事例データの読み込みに失敗しました:', err);
        // 失敗時も block は表示しない（誤った空表示を避ける）。
      });
  });
})();
