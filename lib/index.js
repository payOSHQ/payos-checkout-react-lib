"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePayOS = void 0;
var PAYOS_CONSTANT = {
    RESPONSE_IFRAME_TYPE: {
        STATUS: "status",
        ERROR: "error",
        PAYMENT_RESPONSE: "payment_response",
    },
    PAYMENT_STATUS: {
        PENDING: "PENDING",
        PAID: "PAID",
        PROCESSING: "PROCESSING",
        CANCELLED: "CANCELLED",
        DELETED: "DELETED",
    },
    ORIGIN: [
        "https://dev.pay.payos.vn",
        "https://next.dev.pay.payos.vn",
        "https://pay.payos.vn",
    ],
};
var PayOSCheckout = /** @class */ (function () {
    function PayOSCheckout(props) {
        var _this = this;
        this.receiveMessage = function (event) {
            //check origin
            if (PAYOS_CONSTANT.ORIGIN.includes(event.origin)) {
                var data = JSON.parse(event.data);
                //Người dùng tắt iframe
                if ([
                    PAYOS_CONSTANT.RESPONSE_IFRAME_TYPE.STATUS,
                    PAYOS_CONSTANT.RESPONSE_IFRAME_TYPE.ERROR,
                ].includes(data === null || data === void 0 ? void 0 : data.type)) {
                    _this.closeIframe();
                    _this.onExit(data.data);
                }
                //Người dùng bấm Thanh toán hoặc Hủy thanh toán
                else if ((data === null || data === void 0 ? void 0 : data.type) === PAYOS_CONSTANT.RESPONSE_IFRAME_TYPE.PAYMENT_RESPONSE) {
                    // Người dùng hủy thanh toán
                    if ((data === null || data === void 0 ? void 0 : data.data.status) === PAYOS_CONSTANT.PAYMENT_STATUS.CANCELLED) {
                        _this.closeIframe();
                        _this.onCancel(data.data);
                    }
                    //Thanh toán thành công
                    if ((data === null || data === void 0 ? void 0 : data.data.status) === PAYOS_CONSTANT.PAYMENT_STATUS.PAID) {
                        _this.closeIframe();
                        _this.onSuccess(data.data);
                    }
                }
            }
        };
        this.RETURN_URL = props.RETURN_URL;
        this.ELEMENT_ID = props.ELEMENT_ID;
        this.CHECKOUT_URL = props.CHECKOUT_URL;
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
    PayOSCheckout.prototype.openIframe = function (isEmbedded) {
        window.addEventListener("message", this.receiveMessage, false);
        var divElement = document.getElementById(this.ELEMENT_ID);
        if (!divElement) {
            console.error("Element ID:".concat(this.ELEMENT_ID, " not exist"));
            return;
        }
        var iframe = document.createElement("iframe");
        iframe.allow = "clipboard-write";
        iframe.width = "100%";
        if (isEmbedded) {
            iframe.src = "".concat(this.CHECKOUT_URL, "?iframe=true&embedded=true&redirect_uri=").concat(this.RETURN_URL);
            iframe.height = "100%";
            divElement.appendChild(iframe);
            return;
        }
        iframe.src = "".concat(this.CHECKOUT_URL, "?iframe=true&redirect_uri=").concat(this.RETURN_URL);
        iframe.height = window.innerHeight.toString();
        iframe.allowFullscreen = true;
        iframe.style.zIndex = "1000";
        iframe.style.position = "fixed";
        divElement.appendChild(iframe);
    };
    PayOSCheckout.prototype.closeIframe = function () {
        var divElement = document.getElementById(this.ELEMENT_ID);
        if (!divElement) {
            console.error("Element ID:".concat(this.ELEMENT_ID, " not exist"));
            return;
        }
        var iframe = divElement.querySelector("iframe");
        if (iframe) {
            divElement.removeChild(iframe);
            window.removeEventListener("message", this.receiveMessage, false);
            return;
        }
        console.error("No iframe to remove");
    };
    return PayOSCheckout;
}());
function usePayOS(config) {
    var payOSCheckout = new PayOSCheckout(config);
    return {
        open: function (isEmbedded) {
            if (isEmbedded === void 0) { isEmbedded = false; }
            return payOSCheckout.openIframe.call(payOSCheckout, isEmbedded);
        },
        exit: payOSCheckout.closeIframe.bind(payOSCheckout),
    };
}
exports.usePayOS = usePayOS;
