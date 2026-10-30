"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePayOS = void 0;
var PAYOS_CONSTANT = {
    RESPONSE_IFRAME_TYPE: {
        STATUS: 'status',
        ERROR: 'error',
        PAYMENT_RESPONSE: 'payment_response',
    },
    PAYMENT_STATUS: {
        PENDING: 'PENDING',
        PAID: 'PAID',
        PROCESSING: 'PROCESSING',
        CANCELLED: 'CANCELLED',
        DELETED: 'DELETED',
    },
};
var ALLOWED_ORIGINS = ['https://pay.payos.vn', 'https://dev.pay.payos.vn'];
var PAYMENT_LINK_PATH = /^\/web\/([a-fA-F0-9]{32})\/?$/;
var PayOSCheckout = /** @class */ (function () {
    function PayOSCheckout(props) {
        var _this = this;
        var _a;
        this.iframe = null;
        this.expectedOrigin = '';
        this.paymentLinkId = '';
        this.receiveMessage = function (event) {
            var _a;
            if (!(_this.iframe && event.source === _this.iframe.contentWindow && event.origin === _this.expectedOrigin)) {
                return;
            }
            if (typeof event.data !== 'string')
                return;
            var data;
            try {
                data = JSON.parse(event.data);
            }
            catch (_b) {
                return;
            }
            if (data === null || typeof data !== 'object' || Array.isArray(data))
                return;
            //Người dùng tắt iframe
            if ([PAYOS_CONSTANT.RESPONSE_IFRAME_TYPE.STATUS, PAYOS_CONSTANT.RESPONSE_IFRAME_TYPE.ERROR].includes(data.type)) {
                _this.closeIframe();
                _this.onExit(data.data);
            }
            //Người dùng bấm Thanh toán hoặc Hủy thanh toán
            else if (data.type === PAYOS_CONSTANT.RESPONSE_IFRAME_TYPE.PAYMENT_RESPONSE) {
                if (!(typeof ((_a = data.data) === null || _a === void 0 ? void 0 : _a.id) === 'string' && data.data.id.toLowerCase() === _this.paymentLinkId)) {
                    return;
                }
                // Người dùng hủy thanh toán
                if (data.data.status === PAYOS_CONSTANT.PAYMENT_STATUS.CANCELLED) {
                    _this.closeIframe();
                    _this.onCancel(data.data);
                }
                //Thanh toán thành công
                if (data.data.status === PAYOS_CONSTANT.PAYMENT_STATUS.PAID) {
                    _this.closeIframe();
                    _this.onSuccess(data.data);
                }
            }
        };
        this.RETURN_URL = props.RETURN_URL;
        this.ELEMENT_ID = props.ELEMENT_ID;
        this.CHECKOUT_URL = props.CHECKOUT_URL;
        this.embedded = (_a = props.embedded) !== null && _a !== void 0 ? _a : false;
        if (props.onSuccess) {
            this.onSuccess = props.onSuccess;
        }
        if (props.onExit) {
            this.onExit = props.onExit;
        }
        if (props.onCancel) {
            this.onCancel = props.onCancel;
        }
    }
    PayOSCheckout.prototype.onSuccess = function (event) { };
    PayOSCheckout.prototype.onExit = function (event) { };
    PayOSCheckout.prototype.onCancel = function (event) { };
    PayOSCheckout.prototype.openIframe = function () {
        var url;
        try {
            url = new URL(this.CHECKOUT_URL);
        }
        catch (_a) {
            console.error('Invalid CHECKOUT_URL');
            return;
        }
        var match = url.pathname.match(PAYMENT_LINK_PATH);
        if (url.protocol !== 'https:' || !ALLOWED_ORIGINS.includes(url.origin) || !match) {
            console.error('Invalid CHECKOUT_URL');
            return;
        }
        this.expectedOrigin = url.origin;
        this.paymentLinkId = match[1].toLowerCase();
        var divElement = document.getElementById(this.ELEMENT_ID);
        if (!divElement) {
            console.error("Element ID:".concat(this.ELEMENT_ID, " not exist"));
            return;
        }
        var src = new URL(url.origin);
        if (this.embedded) {
            src.pathname = '/embedded/' + match[1];
        }
        else {
            src.pathname = '/web/' + match[1];
            src.searchParams.set('iframe', 'true');
        }
        src.searchParams.set('redirect_uri', this.RETURN_URL);
        var iframe = document.createElement('iframe');
        iframe.allow = 'clipboard-write';
        iframe.width = '100%';
        iframe.src = src.toString();
        if (this.embedded) {
            iframe.height = '100%';
        }
        else {
            iframe.height = window.innerHeight.toString();
            iframe.allowFullscreen = true;
            iframe.style.zIndex = '1000';
            iframe.style.position = 'fixed';
        }
        this.iframe = iframe;
        divElement.appendChild(iframe);
        window.addEventListener('message', this.receiveMessage, false);
    };
    PayOSCheckout.prototype.closeIframe = function () {
        window.removeEventListener('message', this.receiveMessage, false);
        var iframe = this.iframe;
        this.iframe = null;
        var removed = !!(iframe === null || iframe === void 0 ? void 0 : iframe.parentNode);
        if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
        if (!document.getElementById(this.ELEMENT_ID)) {
            console.error("Element ID:".concat(this.ELEMENT_ID, " not exist"));
            return;
        }
        if (removed)
            return;
        console.error('No iframe to remove');
    };
    return PayOSCheckout;
}());
function usePayOS(config) {
    var payOSCheckout = new PayOSCheckout(config);
    return {
        open: payOSCheckout.openIframe.bind(payOSCheckout),
        exit: payOSCheckout.closeIframe.bind(payOSCheckout),
    };
}
exports.usePayOS = usePayOS;
