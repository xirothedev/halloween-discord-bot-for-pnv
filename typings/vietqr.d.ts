interface QRGenerateResponse {
    code: string;
    desc: string;
    data: {
        acpId: number;
        accountName: string;
        qrCode: string;
        qrDataURL: string;
    };
}
