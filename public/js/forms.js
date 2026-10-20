// ========================================================
// StoryZIP™︎ LP - forms.js
// 相談フォーム／White Paperフォームの検証・送信・モーダル制御
//
// 送信先：Netlify Forms（form-name: consultation / whitepaper）
// 参照：https://docs.netlify.com/manage/forms/setup/
//
// 注意：
// - 本ファイルはNetlify Formsへの正常なAJAX送信を前提にしています。
// - 制作環境（Genspark preview）ではNetlify側のフォーム処理が動作しないため、
//   実際の受信テストはNetlifyへの反映後、本番相当URLで行ってください。
// - novalidate は静的HTML側には付けていません（JS無効時にネイティブの必須入力
//   チェックが働くようにするため）。カスタム検証（validateForm）が動く場合は
//   ブラウザの既定バリデーションUIより先にこちらでエラー表示を行うよう、
//   JS初期化時にだけ novalidate を付与します（修正指示 4）。
// ========================================================

(function () {
  'use strict';

  var sendEvent = window.storyzipSendEvent || function () {};
  var hasFired = window.storyzipHasFired || function () { return false; };
  var markFired = window.storyzipMarkFired || function () {};

  function encodeFormData(formEl) {
    var formData = new FormData(formEl);
    var params = new URLSearchParams();
    formData.forEach(function (value, key) {
      params.append(key, value);
    });
    return params.toString();
  }

  function showStatus(formEl, type, message) {
    var statusEl = formEl.querySelector('.form-status');
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status ' + type;
  }

  function clearFieldErrors(formEl) {
    formEl.querySelectorAll('.form-field.has-error').forEach(function (field) {
      field.classList.remove('has-error');
    });
  }

  function validateForm(formEl) {
    var isValid = true;
    var requiredFields = formEl.querySelectorAll('[required]');

    requiredFields.forEach(function (fieldEl) {
      var wrapper = fieldEl.closest('.form-field') || fieldEl.closest('.form-consent');
      var fieldValid = true;

      if (fieldEl.type === 'checkbox') {
        fieldValid = fieldEl.checked;
      } else if (fieldEl.type === 'email') {
        fieldValid = fieldEl.value.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldEl.value.trim());
      } else {
        fieldValid = fieldEl.value.trim() !== '';
      }

      if (!fieldValid) {
        isValid = false;
        if (wrapper && wrapper.classList.contains('form-field')) {
          wrapper.classList.add('has-error');
        } else if (fieldEl.type === 'checkbox') {
          // consent checkbox: ラベル全体に軽い強調のみ（専用スタイルは持たせない）
          fieldEl.setAttribute('aria-invalid', 'true');
        }
      } else if (fieldEl.type === 'checkbox') {
        fieldEl.removeAttribute('aria-invalid');
      }
    });

    return isValid;
  }

  function setSubmitting(formEl, submitting) {
    formEl.dataset.submitting = submitting ? 'true' : 'false';
    var btn = formEl.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = submitting;
    if (submitting) {
      btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
      btn.textContent = '送信中…';
    } else if (btn.dataset.originalText) {
      btn.textContent = btn.dataset.originalText;
    }
  }

  function trackFormStart(formEl, formType) {
    var storageKey = 'sz_fs_' + formType;
    formEl.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        if (!hasFired(storageKey)) {
          markFired(storageKey);
          sendEvent('lp_form_start', { form_type: formType });
        }
      }, { once: true });
    });
  }

  function submitToNetlify(formEl, formType, onSuccess, onError) {
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeFormData(formEl)
    })
      .then(function (response) {
        if (response.ok) {
          onSuccess();
        } else {
          onError('http_error');
        }
      })
      .catch(function () {
        onError('network_error');
      });
  }

  function initConsultationForm() {
    var formEl = document.getElementById('consultation-form');
    if (!formEl) return;

    // JS初期化が成功した場合のみカスタム検証に切り替える（修正指示 4）。
    // JS無効時はHTML側のnovalidate非付与＋required属性により、ネイティブ検証が働く。
    formEl.setAttribute('novalidate', 'novalidate');

    trackFormStart(formEl, 'consultation');

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      if (formEl.dataset.submitting === 'true') return;
      clearFieldErrors(formEl);

      if (!validateForm(formEl)) {
        sendEvent('lp_form_error', { error_type: 'validation', form_type: 'consultation' });
        showStatus(formEl, 'error', '入力内容をご確認ください。');
        return;
      }

      setSubmitting(formEl, true);

      submitToNetlify(
        formEl,
        'consultation',
        function onSuccess() {
          setSubmitting(formEl, false);
          showStatus(formEl, 'success', 'お申し込みを受け付けました。担当者が内容を確認し、ご入力のメールアドレスへご連絡します。');
          sendEvent('generate_lead', { lead_type: 'consultation', lp_version: 'v1.0' });
          formEl.reset();
          if (window.storyzipFillUtmFields) window.storyzipFillUtmFields();
        },
        function onError(errorType) {
          setSubmitting(formEl, false);
          showStatus(formEl, 'error', '送信できませんでした。入力内容は保持されています。時間をおいて、もう一度お試しください。');
          sendEvent('lp_form_error', { error_type: errorType, form_type: 'consultation' });
        }
      );
    });
  }

  // --------------------------------------------------------
  // フォーカス可能要素の判定（修正指示 2）
  // hidden input（type=hidden）、honeypot（.form-honeypot配下）、
  // その他 hidden 属性配下の要素は、表示されておらず操作できないため、
  // フォーカス移動・フォーカストラップの対象から明確に除外する。
  // --------------------------------------------------------
  function isTrulyVisible(elm) {
    if (!elm) return false;
    if (elm.closest('.form-honeypot')) return false;
    if (elm.closest('[hidden]')) return false;
    if (elm.hidden) return false;
    // offsetParent が null（display:none や 非表示の親を持つ）場合は除外。
    // ただし position:fixed 要素はoffsetParentがnullになりうるため、
    // getClientRectsの有無も併用して判定する。
    if (elm.offsetParent === null && elm.getClientRects().length === 0) return false;
    var style = window.getComputedStyle(elm);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    return true;
  }

  function getFocusableIn(containerEl) {
    var candidates = containerEl.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    var list = [];
    candidates.forEach(function (c) {
      if (isTrulyVisible(c)) list.push(c);
    });
    return list;
  }

  // --------------------------------------------------------
  // White Paper モーダル
  // --------------------------------------------------------
  var modalOverlay, modalDialog, formView, successView, closeBtn, lastFocusedEl;
  var mainContentEl, siteHeaderEl, siteFooterEl, stickyCtaEl;

  function setBackgroundInert(isInert) {
    // モーダル表示中は背面のリンク（例：S3の出典リンク等）へTabで
    // 移動できないよう、背面コンテンツをinert化する（修正指示 2）。
    [mainContentEl, siteHeaderEl, siteFooterEl, stickyCtaEl].forEach(function (elm) {
      if (!elm) return;
      if (isInert) {
        elm.setAttribute('inert', '');
        elm.setAttribute('aria-hidden', 'true');
      } else {
        elm.removeAttribute('inert');
        elm.removeAttribute('aria-hidden');
      }
    });
  }

  function focusFirstVisibleField() {
    // 修正指示 2 の核心：hidden の form-name ではなく、表示中で操作可能な
    // 最初のフィールド（通常は会社名入力）へフォーカスする。
    var currentView = formView.hidden ? successView : formView;
    var focusable = getFocusableIn(currentView);
    if (focusable.length) {
      focusable[0].focus();
    } else {
      // 予備策：フィールドが見つからない場合はダイアログ自体にフォーカス
      modalDialog.setAttribute('tabindex', '-1');
      modalDialog.focus();
    }
  }

  function openModal(triggerEl) {
    lastFocusedEl = triggerEl || document.activeElement;
    modalOverlay.classList.add('is-open');
    document.body.classList.add('modal-open');
    formView.hidden = false;
    successView.hidden = true;

    setBackgroundInert(true);
    focusFirstVisibleField();

    document.addEventListener('keydown', onModalKeydown);
  }

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    setBackgroundInert(false);
    document.removeEventListener('keydown', onModalKeydown);
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function onModalKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      // 表示中のビュー（フォーム or 成功画面）だけを循環対象にする（修正指示 2）。
      var currentView = formView.hidden ? successView : formView;
      var focusable = getFocusableIn(currentView);
      // 閉じるボタンは常に操作可能なので、循環対象へ含める。
      if (closeBtn && isTrulyVisible(closeBtn)) {
        focusable = [closeBtn].concat(focusable);
      }
      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (focusable.indexOf(document.activeElement) === -1) {
        // フォーカスがモーダル外（＝背景がinert化されていても万一外れた場合）に
        // ある場合は、先頭要素へ強制的に戻す。
        e.preventDefault();
        first.focus();
      }
    }
  }

  function initWhitepaperModal() {
    modalOverlay = document.getElementById('whitepaper-modal');
    if (!modalOverlay) return;
    modalDialog = modalOverlay.querySelector('.modal-dialog');
    formView = document.getElementById('whitepaper-form-view');
    successView = document.getElementById('whitepaper-success-view');
    closeBtn = document.getElementById('whitepaper-modal-close');

    mainContentEl = document.getElementById('main-content');
    siteHeaderEl = document.querySelector('.site-header');
    siteFooterEl = document.querySelector('.site-footer');
    stickyCtaEl = document.getElementById('sticky-cta');

    document.querySelectorAll('[data-open-whitepaper-modal]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(trigger);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });

    var formEl = document.getElementById('whitepaper-form');
    // JS初期化が成功した場合のみカスタム検証に切り替える（修正指示 4）。
    formEl.setAttribute('novalidate', 'novalidate');

    trackFormStart(formEl, 'whitepaper');

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      if (formEl.dataset.submitting === 'true') return;
      clearFieldErrors(formEl);

      if (!validateForm(formEl)) {
        sendEvent('lp_form_error', { error_type: 'validation', form_type: 'whitepaper' });
        showStatus(formEl, 'error', '入力内容をご確認ください。');
        return;
      }

      setSubmitting(formEl, true);

      submitToNetlify(
        formEl,
        'whitepaper',
        function onSuccess() {
          setSubmitting(formEl, false);
          sendEvent('generate_lead', { lead_type: 'whitepaper', lp_version: 'v1.0' });
          formView.hidden = true;
          successView.hidden = false;
          // 成功画面へ切り替えた後も、表示中の要素だけを循環させるため、
          // 表示中ビューの先頭要素（PDFを開くリンク）へフォーカスを移す。
          focusFirstVisibleField();
          var openLink = document.getElementById('whitepaper-open-link');
          if (openLink) {
            openLink.addEventListener('click', function onOpen() {
              sendEvent('whitepaper_open', { lp_version: 'v1.0' });
              openLink.removeEventListener('click', onOpen);
            });
          }
          formEl.reset();
          if (window.storyzipFillUtmFields) window.storyzipFillUtmFields();
        },
        function onError(errorType) {
          setSubmitting(formEl, false);
          showStatus(formEl, 'error', '送信できませんでした。入力内容は保持されています。時間をおいて、もう一度お試しください。');
          sendEvent('lp_form_error', { error_type: errorType, form_type: 'whitepaper' });
        }
      );
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initConsultationForm();
    initWhitepaperModal();
  });
})();
