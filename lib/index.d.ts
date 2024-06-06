export interface PayOSConfig {
    RETURN_URL: string;
    ELEMENT_ID: string;
    CHECKOUT_URL: string;
    onSuccess?: (event: any) => void;
    onExit?: (event: any) => void;
    onCancel?: (event: any) => void;
}
export declare function usePayOS(config: PayOSConfig): {
    open: (isEmbedded?: boolean) => void;
    exit: () => void;
};
