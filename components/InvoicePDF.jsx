import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, Dimensions } from "react-native";
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// Note: Place your images in assets folder and import them
// import signImg from "../assets/sign.png"; 
// import ptc4 from "../assets/ptc4.jpg";
// import ptc5 from "../assets/ptc5.jpg";

export default function InvoicePDF({ formData, vehicles }) {
    const [pdfUri, setPdfUri] = useState(null);
    const [htmlContent, setHtmlContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        generatePDF();
    }, [formData, vehicles]);

    // Helper function to convert number to words (Indian system)
    const numberToWords = (n) => {
        if (typeof n !== 'number' || isNaN(n)) return 'Zero';
        const num = Math.floor(n);
        if (num === 0) return 'Zero';

        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

        const convertTens = (x) => (x < 20 ? a[x] : b[Math.floor(x / 10)] + a[x % 10]);

        const convertHundreds = (x) => {
            let s = convertTens(x % 100);
            if (x > 99) s = a[Math.floor(x / 100)] + 'Hundred ' + s;
            return s;
        };

        let words = '';
        let tempNum = num;

        let part = Math.floor(tempNum / 10000000); // Crores
        if (part > 0) words += convertTens(part) + 'Crore ';
        tempNum %= 10000000;
        
        part = Math.floor(tempNum / 100000); // Lakhs
        if (part > 0) words += convertTens(part) + 'Lakh ';
        tempNum %= 100000;

        part = Math.floor(tempNum / 1000); // Thousands
        if (part > 0) words += convertTens(part) + 'Thousand ';
        tempNum %= 1000;
        
        words += convertHundreds(tempNum);

        return words.trim() + ' Only';
    };

    const generatePDF = async () => {
        if (!formData || !vehicles || vehicles.length === 0) {
            setPdfUri(null);
            return;
        }

        setIsGenerating(true);

        try {
            // Calculate aggregated data
            const totalFreightAgg = vehicles.reduce((sum, v) => sum + parseFloat(v.totalFreight || 0), 0);
            const totalAdvanceAgg = vehicles.reduce((sum, v) => sum + parseFloat(v.advance || 0), 0);
            const totalBalanceAgg = vehicles.reduce((sum, v) => sum + parseFloat(v.balance || 0), 0);
            
            const aggregateCharges = {
                Freight: vehicles.reduce((sum, v) => sum + parseFloat(v.freight || 0), 0),
                Unloading: vehicles.reduce((sum, v) => sum + parseFloat(v.unloadingCharges || 0), 0),
                Detention: vehicles.reduce((sum, v) => sum + parseFloat(v.detention || 0), 0),
                Weight: vehicles.reduce((sum, v) => sum + parseFloat(v.weightCharges || 0), 0),
                Others: vehicles.reduce((sum, v) => sum + parseFloat(v.others || 0), 0),
                Commission: vehicles.reduce((sum, v) => sum + parseFloat(v.commission || 0), 0),
            };

            const charges = [
                { label: 'Freight', value: aggregateCharges.Freight },
                { label: 'Unloading Ch.', value: aggregateCharges.Unloading },
                { label: 'Detention Ch.', value: aggregateCharges.Detention },
                { label: 'Weight Ch.', value: aggregateCharges.Weight },
                { label: 'Other Ch.', value: aggregateCharges.Others },
                { label: 'Commission', value: aggregateCharges.Commission },
            ].filter(c => c.value > 0 || c.label === 'Freight');

            const totalDueWords = numberToWords(totalBalanceAgg);

            // Generate vehicle info list
            const vehicleInfoHTML = vehicles.map((v, idx) => 
                `<div style="margin-bottom: 8px; font-size: 11px;">
                    <strong>${idx + 1}.</strong> LR: <span style="color: #dc2626;">${v.lrNo || '-'}</span> | 
                    Veh: <span style="color: #dc2626;">${v.vehicleNo || '-'}</span> | 
                    Cont: <span style="color: #dc2626;">${v.containerNo || '-'}</span>
                </div>`
            ).join('');

            // Generate charges rows
            const chargesRowsHTML = charges.map(charge => `
                <tr>
                    <td style="padding: 6px; border: 1px solid #000; text-align: left;">${charge.label}</td>
                    <td style="padding: 6px; border: 1px solid #000; text-align: right;">${charge.value.toFixed(2)}</td>
                </tr>
            `).join('');

            // HTML template for PDF
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 10px; 
                            font-size: 12px; 
                            background: white;
                        }
                        .container { 
                            max-width: 100%; 
                            margin: 0 auto; 
                        }
                        .header { 
                            text-align: center; 
                            margin-bottom: 15px; 
                            padding: 15px; 
                            background: #f0f0f0; 
                            border-radius: 8px; 
                        }
                        .header h1 { 
                            color: #003366; 
                            font-size: 20px; 
                            margin-bottom: 5px; 
                        }
                        .header p { 
                            font-size: 10px; 
                            color: #666; 
                            margin: 2px 0;
                        }
                        .bill-info { 
                            display: flex; 
                            justify-content: space-between; 
                            margin-bottom: 12px; 
                            padding: 8px;
                            background: #fff9e6;
                        }
                        .bill-info div { 
                            font-weight: bold; 
                            color: #dc2626; 
                            font-size: 11px;
                        }
                        .party-section { 
                            background: #fff; 
                            padding: 10px; 
                            border: 1px solid #000; 
                            margin-bottom: 10px; 
                        }
                        .party-name { 
                            font-size: 14px; 
                            font-weight: bold; 
                            margin-bottom: 5px; 
                        }
                        .trip-row { 
                            display: flex; 
                            justify-content: space-between; 
                            padding: 8px; 
                            border: 1px solid #000; 
                            margin-bottom: 5px;
                            font-size: 10px;
                            flex-wrap: wrap;
                        }
                        .trip-row span {
                            margin: 2px 5px;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-bottom: 12px; 
                            font-size: 10px;
                        }
                        th, td { 
                            border: 1px solid #000; 
                            padding: 6px 4px; 
                            text-align: left; 
                        }
                        th { 
                            background: #dcdcdc; 
                            font-weight: bold; 
                            text-align: center; 
                            font-size: 9px;
                        }
                        .vehicle-info-item {
                            margin-bottom: 6px;
                            font-size: 9px;
                            line-height: 1.4;
                        }
                        .vehicle-info-item strong {
                            color: #000;
                        }
                        .vehicle-info-item span {
                            color: #dc2626;
                        }
                        .total-cell { 
                            background: #fff; 
                            font-weight: bold; 
                            text-align: right; 
                        }
                        .grand-total { 
                            background: #f0f0f0; 
                            font-weight: bold; 
                        }
                        .balance-due { 
                            background: #f0f0f0; 
                            padding: 10px; 
                            font-size: 12px; 
                            font-weight: bold; 
                            text-align: right; 
                            border: 1px solid #000;
                            margin-bottom: 12px;
                        }
                        .bank-terms { 
                            display: grid; 
                            grid-template-columns: 1fr 2fr; 
                            gap: 8px; 
                            margin-top: 12px; 
                        }
                        .bank-details, .terms { 
                            padding: 8px; 
                            border: 1px solid #000; 
                            font-size: 9px; 
                            line-height: 1.5;
                        }
                        .signature-section { 
                            margin-top: 25px; 
                            text-align: right; 
                            padding-right: 10px;
                        }
                        .signature-section div { 
                            margin-top: 40px; 
                            font-weight: bold; 
                            font-size: 11px;
                        }
                        .footer { 
                            margin-top: 25px; 
                            padding: 12px; 
                            background: #f0f0f0; 
                            text-align: center; 
                            font-size: 9px; 
                            border-radius: 8px; 
                        }
                        @media (max-width: 600px) {
                            body { padding: 5px; font-size: 10px; }
                            .header h1 { font-size: 16px; }
                            th, td { padding: 4px 2px; font-size: 8px; }
                            .bank-terms { grid-template-columns: 1fr; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <!-- Header -->
                        <div class="header">
                            <h1>PALAK TRANSPORT CORP</h1>
                            <p>Transport & Logistics Services</p>
                            <p>KALAMBOLI, MAHARASHTRA</p>
                            <p>PAN NO.: AWWPP1314Q</p>
                        </div>

                        <!-- Bill Info -->
                        <div class="bill-info">
                            <div>BILL NO. ${formData.invoiceNo || '1'}</div>
                            <div>DATE: ${formData.billDate || ''}</div>
                        </div>

                        <!-- Party Details -->
                        <div class="party-section">
                            <div class="party-name">Bill To: ${formData.partyName || ''}</div>
                            <div style="font-size: 11px;">Address: ${formData.partyAddress || 'KALAMBOLI'}</div>
                        </div>

                        <!-- Trip Details -->
                        <div class="trip-row">
                            <span><strong>Loading Date:</strong> ${formData.loadingDate || ''}</span>
                            <span><strong>Unloading Date:</strong> ${formData.unloadingDate || ''}</span>
                        </div>
                        <div class="trip-row">
                            <span><strong>From:</strong> ${formData.from || ''}</span>
                            <span><strong>To:</strong> ${formData.to || ''}</span>
                            <span><strong>Back To:</strong> ${formData.backTo || ''}</span>
                        </div>

                        <!-- Main Table -->
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 35%;">Vehicle Information</th>
                                    <th style="width: 18%;">Charge Name</th>
                                    <th style="width: 14%;">Amount</th>
                                    <th style="width: 11%;">Total Freight</th>
                                    <th style="width: 11%;">Total Advance</th>
                                    <th style="width: 11%;">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td rowspan="${charges.length}" style="vertical-align: top; padding: 8px 6px;">
                                        ${vehicles.map((v, idx) => `
                                            <div class="vehicle-info-item">
                                                <strong>${idx + 1}.</strong> 
                                                LR: <span>${v.lrNo || '-'}</span> | 
                                                Veh: <span>${v.vehicleNo || '-'}</span> | 
                                                Cont: <span>${v.containerNo || '-'}</span>
                                            </div>
                                        `).join('')}
                                    </td>
                                    ${charges.length > 0 ? `
                                        <td>${charges[0].label}</td>
                                        <td style="text-align: right;">${charges[0].value.toFixed(2)}</td>
                                        <td rowspan="${charges.length}" class="total-cell" style="vertical-align: top; padding-top: 10px;">${totalFreightAgg.toFixed(2)}</td>
                                        <td rowspan="${charges.length}" class="total-cell" style="vertical-align: top; padding-top: 10px;">${totalAdvanceAgg.toFixed(2)}</td>
                                        <td rowspan="${charges.length}" class="total-cell" style="vertical-align: top; padding-top: 10px;">${totalBalanceAgg.toFixed(2)}</td>
                                    ` : ''}
                                </tr>
                                ${charges.slice(1).map(charge => `
                                    <tr>
                                        <td>${charge.label}</td>
                                        <td style="text-align: right;">${charge.value.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                                <tr class="grand-total">
                                    <td colspan="3" style="text-align: right; padding: 8px;"><strong>TOTAL (INR)</strong></td>
                                    <td style="text-align: right;">${totalFreightAgg.toFixed(2)}</td>
                                    <td style="text-align: right;">${totalAdvanceAgg.toFixed(2)}</td>
                                    <td style="text-align: right;">${totalBalanceAgg.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Balance Due -->
                        <div class="balance-due">
                            Total Balance Due: INR ${totalBalanceAgg.toFixed(2)}<br>
                            <span style="font-size: 11px;">(In Words: ${totalDueWords})</span>
                        </div>

                        <!-- Bank Details & Terms -->
                        <div class="bank-terms">
                            <div class="bank-details">
                                <strong>BANK DETAILS</strong><br><br>
                                <strong>Bank Account:</strong><br>
                                Name: PALAK TRANSPORT CORP<br>
                                Bank: HDFC BANK LTD.<br>
                                A/c No.: 50200044714511<br>
                                IFSC: HDFC0002822<br>
                                Branch: KALAMBOLI
                            </div>
                            <div class="terms">
                                <strong>Note:</strong><br><br>
                                1) 12% Interest will be charged if the payment of this bill is not made within 15 days from the date of bill.<br><br>
                                2) You are requested to make payment to this bill by cross or order cheque in favour of "PALAK TRANSPORT CORP"
                            </div>
                        </div>

                        <!-- Signature -->
                        <div class="signature-section">
                            <div>
                                <strong>Authorised Signatory</strong><br>
                                for PALAK TRANSPORT CORP.
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="footer">
                            <p><strong>Thank you for your business!</strong></p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // Generate PDF
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            setPdfUri(uri);
            setHtmlContent(htmlContent); // Store HTML for preview
            setIsGenerating(false);
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert('Error', 'Failed to generate PDF');
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!pdfUri) return;

        try {
            const invoiceNo = formData.invoiceNo || 'DRAFT';
            const filename = `Invoice_${invoiceNo}.pdf`;
            
            if (Platform.OS === 'android') {
                // For Android, save to Downloads folder
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (!permissions.granted) {
                    Alert.alert('Permission Denied', 'Need permission to save file');
                    return;
                }
                
                const uri = await FileSystem.StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    filename,
                    'application/pdf'
                );
                
                await FileSystem.copyAsync({
                    from: pdfUri,
                    to: uri,
                });
                
                Alert.alert('Success', 'PDF saved to Downloads');
            } else {
                // For iOS, use Sharing
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(pdfUri, {
                        mimeType: 'application/pdf',
                        dialogTitle: 'Save Invoice',
                        UTI: 'com.adobe.pdf'
                    });
                }
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            Alert.alert('Error', 'Failed to download PDF');
        }
    };

    const handleShare = async () => {
        if (!pdfUri) return;

        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pdfUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Share Invoice'
                });
            }
        } catch (error) {
            console.error('Error sharing PDF:', error);
            Alert.alert('Error', 'Failed to share PDF');
        }
    };

    const handlePrint = async () => {
        if (!pdfUri) return;

        try {
            await Print.printAsync({ uri: pdfUri });
        } catch (error) {
            console.error('Error printing PDF:', error);
            Alert.alert('Error', 'Failed to print PDF');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.downloadButton, !pdfUri && styles.disabledButton]}
                    onPress={handleDownload}
                    disabled={!pdfUri || isGenerating}
                >
                    <Text style={styles.buttonText}>
                        {isGenerating ? 'Generating...' : 'Download'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.shareButton, !pdfUri && styles.disabledButton]}
                    onPress={handleShare}
                    disabled={!pdfUri || isGenerating}
                >
                    <Text style={styles.buttonText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.printButton, !pdfUri && styles.disabledButton]}
                    onPress={handlePrint}
                    disabled={!pdfUri || isGenerating}
                >
                    <Text style={styles.buttonText}>Print</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.previewContainer}>
                {isGenerating ? (
                    <View style={styles.centerContent}>
                        <Text style={styles.loadingText}>Generating PDF Preview...</Text>
                    </View>
                ) : htmlContent ? (
                    <WebView className="h-screen bg-black"
                        originWhitelist={['*']}
                        source={{ html: htmlContent }}
                        style={styles.webview}
                        scalesPageToFit={Platform.OS === 'android'}
                        startInLoadingState={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        showsVerticalScrollIndicator={true}
                        androidLayerType="hardware"
                        renderLoading={() => (
                            <View style={styles.centerContent}>
                                <Text style={styles.loadingText}>Loading Preview...</Text>
                            </View>
                        )}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.warn('WebView error: ', nativeEvent);
                        }}
                        onLoad={() => console.log('WebView loaded successfully')}
                    />
                ) : (
                    <View style={styles.centerContent}>
                        <Text style={styles.loadingText}>Waiting for data...</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f3f4f6',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    downloadButton: {
        backgroundColor: '#10b981',
    },
    shareButton: {
        backgroundColor: '#3b82f6',
    },
    printButton: {
        backgroundColor: '#8b5cf6',
    },
    disabledButton: {
        backgroundColor: '#d1d5db',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    previewContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    webview: {
        flex: 1,
        backgroundColor: 'white',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    successText: {
        fontSize: 16,
        color: '#10b981',
        textAlign: 'center',
        fontWeight: '600',
    },
});