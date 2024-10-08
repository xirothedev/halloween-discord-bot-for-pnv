interface PayOSGetPaymentData {
    code: string;
    desc: string;
    success: true;
    data: {
        accountNumber: string;
        amount: number;
        description: string;
        reference: string;
        transactionDateTime: string;
        virtualAccountNumber: string;
        counterAccountBankId: string;
        counterAccountBankName: string;
        counterAccountName: string | null;
        counterAccountNumber: string | null;
        virtualAccountName: string;
        currency: "VND";
        orderCode: number;
        paymentLinkId: string;
        code: string;
        desc: string;
    };
    signature: string;
}

interface PayOSCreatePaymentResponse {
    code: string;
    desc: string;
    data?: {
        bin: string;
        accountNumber: string;
        accountName: string;
        amount: number;
        description: string;
        orderCode: number;
        currency: string;
        paymentLinkId: string;
        status: string;
        expiredAt: number;
        checkoutUrl: string;
        qrCode: string;
    };
}
