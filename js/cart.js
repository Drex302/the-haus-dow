(function () {
  var STORAGE_KEY = 'thehaus_cart_v1';

  window.CART_PRODUCTS = {
    mothersDay: {
      name: "The DOW Devotionals: Mother's Day Edition",
      price: 14.99,
    },
    fathersDay: {
      name: "The DOW Devotionals: Father's Day Edition",
      price: 14.99,
    },
  };

  function loadRaw() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveRaw(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    refreshCartBadge();
    window.dispatchEvent(new CustomEvent('thehaus-cart-updated'));
  }

  window.getCart = function () {
    return loadRaw().filter(function (line) {
      return line && line.key && CART_PRODUCTS[line.key];
    });
  };

  window.getCartCount = function () {
    return getCart().reduce(function (n, line) {
      return n + (line.quantity || 1);
    }, 0);
  };

  window.getCartSubtotal = function () {
    return getCart().reduce(function (sum, line) {
      var p = CART_PRODUCTS[line.key];
      if (!p) return sum;
      return sum + p.price * (line.quantity || 1);
    }, 0);
  };

  window.addToCart = function (productKey) {
    if (!CART_PRODUCTS[productKey]) return;
    var items = loadRaw();
    var idx = items.findIndex(function (l) {
      return l.key === productKey;
    });
    if (idx >= 0) {
      items[idx].quantity = 1;
    } else {
      items.push({ key: productKey, quantity: 1 });
    }
    saveRaw(items);
  };

  window.removeFromCart = function (productKey) {
    var items = loadRaw().filter(function (l) {
      return l.key !== productKey;
    });
    saveRaw(items);
  };

  window.clearCart = function () {
    saveRaw([]);
  };

  function formatMoney(n) {
    return '$' + (Math.round(n * 100) / 100).toFixed(2);
  }

  window.refreshCartBadge = function () {
    var n = getCartCount();
    document.querySelectorAll('[data-cart-badge]').forEach(function (el) {
      el.textContent = n > 0 ? String(n) : '';
      el.style.display = n > 0 ? 'inline' : 'none';
    });
  };

  window.checkoutFromCart = function () {
    var cfg = window.STRIPE_CHECKOUT || {};
    var links = cfg.paymentLinks || {};
    var items = getCart();
    if (!items.length) {
      window.alert('Your cart is empty.');
      return;
    }

    function linkOk(k) {
      return links[k] && String(links[k]).trim();
    }

    if (items.length === 1) {
      var k = items[0].key;
      if (!linkOk(k)) {
        window.alert('Add paymentLinks.' + k + ' in js/checkout.config.js (Stripe Payment Link URL).');
        return;
      }
      window.location.href = String(links[k]).trim();
      return;
    }

    var keys = items
      .map(function (i) {
        return i.key;
      })
      .sort()
      .join(',');

    if (keys === 'fathersDay,mothersDay' && linkOk('bundle')) {
      window.location.href = String(links.bundle).trim();
      return;
    }

    if (keys === 'fathersDay,mothersDay' && !linkOk('bundle')) {
      return;
    }

    window.alert('Remove extra items or check out one product at a time.');
  };

  window.openPaymentLink = function (productKey) {
    var cfg = window.STRIPE_CHECKOUT || {};
    var url = (cfg.paymentLinks || {})[productKey];
    if (!url || !String(url).trim()) {
      window.alert('Configure paymentLinks.' + productKey + ' in js/checkout.config.js.');
      return;
    }
    window.location.href = String(url).trim();
  };

  window.renderCartPage = function () {
    var root = document.getElementById('cart-root');
    if (!root) return;

    var items = getCart();
    var subtotal = getCartSubtotal();

    if (!items.length) {
      root.innerHTML =
        '<div class="cart-empty">' +
        '<p class="cart-empty-label">Your cart is empty</p>' +
        '<p class="cart-empty-hint">Add devotionals from the shop, then return here to check out.</p>' +
        '<a href="index.html#offerings" class="cart-btn-primary">Browse The Collection</a>' +
        '</div>';
      return;
    }

    var linesHtml = items
      .map(function (line) {
        var p = CART_PRODUCTS[line.key];
        if (!p) return '';
        return (
          '<div class="cart-line">' +
          '<div class="cart-line-info">' +
          '<span class="cart-line-name">' +
          p.name +
          '</span>' +
          '<span class="cart-line-price">' +
          formatMoney(p.price) +
          '</span>' +
          '</div>' +
          '<button type="button" class="cart-line-remove" onclick="removeFromCart(\'' +
          line.key +
          '\')">Remove</button>' +
          '</div>'
        );
      })
      .join('');

    var keysSorted = items
      .map(function (i) {
        return i.key;
      })
      .sort()
      .join(',');
    var isPair = keysSorted === 'fathersDay,mothersDay';
    var cfg = window.STRIPE_CHECKOUT || {};
    var hasBundle = cfg.paymentLinks && cfg.paymentLinks.bundle && String(cfg.paymentLinks.bundle).trim();

    var actionsHtml = '';
    if (items.length === 1 || (isPair && hasBundle)) {
      actionsHtml =
        '<div class="cart-actions">' +
        '<button type="button" class="cart-btn-primary cart-btn-full" onclick="checkoutFromCart()">' +
        (isPair && hasBundle ? 'Checkout — bundle' : 'Proceed to checkout') +
        '</button>' +
        '<p class="cart-note">You will complete payment on Stripe’s secure checkout.</p>' +
        '</div>';
    } else if (isPair && !hasBundle) {
      actionsHtml =
        '<div class="cart-actions cart-actions-split">' +
        '<p class="cart-split-note">Payment Links process one charge at a time. Check out each edition below, or add a combined <strong>bundle</strong> Payment Link in <code>checkout.config.js</code> for a single checkout.</p>' +
        '<button type="button" class="cart-btn-primary cart-btn-full" onclick="openPaymentLink(\'mothersDay\')">Checkout Mother\'s Day — ' +
        formatMoney(CART_PRODUCTS.mothersDay.price) +
        '</button>' +
        '<button type="button" class="cart-btn-primary cart-btn-full" onclick="openPaymentLink(\'fathersDay\')">Checkout Father\'s Day — ' +
        formatMoney(CART_PRODUCTS.fathersDay.price) +
        '</button>' +
        '</div>';
    } else {
      actionsHtml =
        '<div class="cart-actions">' +
        '<button type="button" class="cart-btn-primary cart-btn-full" onclick="checkoutFromCart()">Proceed to checkout</button>' +
        '</div>';
    }

    root.innerHTML =
      '<div class="cart-panel">' +
      '<div class="cart-lines">' +
      linesHtml +
      '</div>' +
      '<div class="cart-subtotal-row">' +
      '<span>Subtotal</span>' +
      '<span>' +
      formatMoney(subtotal) +
      '</span>' +
      '</div>' +
      actionsHtml +
      '<a href="index.html#offerings" class="cart-continue">Continue shopping</a>' +
      '</div>';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refreshCartBadge);
  } else {
    refreshCartBadge();
  }
})();
