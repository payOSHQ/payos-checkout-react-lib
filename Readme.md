## Instructions for using the Payos-Checkout library for Payos integrated applications

This library will help you open payment links or payment pop ups on React JS applications

### 1. Installation

Make sure you have the payos-checkout library installed

```js
     npm install payos-checkout
```

### 2. Initialization

```js
import { usePayOS, PayOSConfig } from "payos-checkout";

const payOSConfig: PayOSConfig = {
  RETURN_URL: "YOUR_RETURN_URL",
  ELEMENT_ID:
    "YOUR_ELEMENT_ID is the id of the div element will contain the payment interface",
  CHECKOUT_URL: "YOUR_CHECKOUT_URL is the payment Link id",
  onSuccess: (event: any) => {
    //TODO: Action when the order is successfully paid
  },
  onExit: (event: any) => {
    //TODO: Action when the user clicks to exit the checkout
  },
  onCancel: (event: any) => {
    //TODO: Action when the user clicks to cancel order
  },
};

const { exit, open } = usePayOS(payOSConfig);
```

### 3. How to use

- Function `open(isEmbedded?: boolean)`: Will open the payment interface as a pop up or embedded in the page
- Function `exit()`: Will close the payment interface

Parameters in events:

```js
{
  status: string;
}
```
