declare module "react-native-paystack-webview" {
  import { Component } from "react";
  import { ViewProps } from "react-native";

  interface PaystackProps extends ViewProps {
    buttonText?: string;
    paystackKey: string;
    amount: number;
    billingEmail: string;
    activityIndicatorColor?: string;
    onSuccess?: (res: any) => void;
    onCancel?: (err: any) => void;
  }

  export default class PaystackWebView extends Component<PaystackProps> {}
}
