import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf', fontStyle: 'italic' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf', fontWeight: 'bold' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf', fontWeight: 'bold', fontStyle: 'italic' }
    ]
});

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Roboto', fontSize: 12, color: '#333' },
    header: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold' },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#000', marginTop: 20 },
    text: { marginBottom: 4, lineHeight: 1.4 },
    bold: { fontWeight: 'bold' },
    flexRow: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    party: { width: '45%' },
    tableRow: { display: 'flex', flexDirection: 'row', borderBottom: '1px solid #ccc', paddingBottom: 5, paddingTop: 5 },
    tableHeader: { fontWeight: 'bold', fontSize: 10, color: '#666', borderBottom: '1px solid #000' },
    col1: { width: '5%', textAlign: 'center' },
    col2: { width: '55%' },
    col3: { width: '15%', textAlign: 'center' },
    col4: { width: '25%', textAlign: 'right' },
    totalSection: { display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: 30, paddingTop: 10, borderTop: '2px solid #000' },
    totalText: { fontSize: 16, fontWeight: 'bold' }
});

export const InvoicePDF = ({ data, settings }: any) => {
    const baseAmount = data.items && data.items.length > 0
        ? data.items.reduce((sum: number, item: any) => sum + (item.total || parseFloat(item.amount || item.price || 0) || 0), 0)
        : data.discount && data.discount > 0 ? parseFloat(data.amount) / (1 - data.discount / 100) : parseFloat(data.amount);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        {settings?.logoBase64 && (
                            <Image src={settings.logoBase64} style={{ width: 120, marginBottom: 15, objectFit: 'contain' }} />
                        )}
                        <Text style={styles.title}>Rachunek nr {data.docNumber}</Text>
                        <Text style={styles.text}>Data wystawienia: {data.issueDate}</Text>
                        <Text style={styles.text}>Data wykonania usługi: {data.execDate}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={{ fontSize: 18, color: '#0056b3' }}>Oryginał</Text>
                    </View>
                </View>

                <View style={styles.flexRow}>
                    <View style={styles.party}>
                        <Text style={styles.sectionTitle}>Sprzedawca:</Text>
                        <Text style={styles.text}>{settings?.myName}</Text>
                        <Text style={styles.text}>{settings?.myAddress}</Text>
                    </View>
                    <View style={styles.party}>
                        <Text style={styles.sectionTitle}>Nabywca:</Text>
                        <Text style={styles.text}>{data.clientName}</Text>
                        <Text style={styles.text}>{data.clientData}</Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 40 }]}>Pozycje na rachunku:</Text>
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.col1}>Lp.</Text>
                    <Text style={styles.col2}>Nazwa towaru lub usługi</Text>
                    <Text style={styles.col3}>Ilość</Text>
                    <Text style={styles.col4}>Wartość brutto</Text>
                </View>

                {data.items && data.items.length > 0 ? data.items.map((item: any, index: number) => (
                    <View style={styles.tableRow} key={index}>
                        <Text style={styles.col1}>{index + 1}</Text>
                        <Text style={styles.col2}>{item.name}</Text>
                        <Text style={styles.col3}>{item.quantity || 1}</Text>
                        <Text style={styles.col4}>{item.total ? item.total.toFixed(2) : parseFloat(item.amount || item.price || 0).toFixed(2)} zł</Text>
                    </View>
                )) : (
                    <View style={styles.tableRow}>
                        <Text style={styles.col1}>1</Text>
                        <Text style={styles.col2}>{data.serviceName}</Text>
                        <Text style={styles.col3}>1</Text>
                        <Text style={styles.col4}>{data.amount} zł</Text>
                    </View>
                )}

                <View style={styles.totalSection}>
                    <View>
                        {data.discount && data.discount > 0 ? (
                            <>
                                <Text style={{ fontSize: 12, marginBottom: 4, color: '#555' }}>
                                    Razem bez rabatu: {baseAmount.toFixed(2)} zł
                                </Text>
                                <Text style={{ fontSize: 12, marginBottom: 4, color: '#e11d48' }}>
                                    Rabat: {data.discount}%
                                </Text>
                            </>
                        ) : null}
                        <Text style={[styles.totalText, { color: '#e11d48' }]}>Razem do zapłaty: {data.amount} zł</Text>
                        {data.paymentMethod === 'Gotówka' && <Text style={{ marginTop: 10, marginBottom: 10 }}>Forma płatności: Zapłacono gotówką</Text>}
                        {data.paymentMethod === 'Przelew' && (
                            <View style={{ marginTop: 10, marginBottom: 10 }}>
                                <Text>Forma płatności: Przelew (termin: {data.paymentDays} dni)</Text>
                                <Text>Nr konta bankowego: {settings?.bankAccount || 'Brak ustawionego konta w Ustawieniach'}</Text>
                                <Text>Tytuł przelewu: {data.docNumber}</Text>
                            </View>
                        )}
                        {data.paymentMethod === 'Przedpłata' && <Text style={{ marginTop: 10, marginBottom: 10 }}>Forma płatności: Przedpłata. Zapłacono z góry.</Text>}
                        <Text>Podstawa zwolnienia z VAT:</Text>
                        <Text style={{ fontStyle: 'italic', fontSize: 10 }}>{settings?.exemptionBasis}</Text>
                    </View>
                </View>

                <View style={[styles.flexRow, { marginTop: 60 }]}>
                    <View style={{ width: '40%', borderTop: '1px dashed #ccc', textAlign: 'center', paddingTop: 10 }}>
                        <Text style={{ fontSize: 10 }}>Podpis wystawcy</Text>
                    </View>
                    <View style={{ width: '40%', borderTop: '1px dashed #ccc', textAlign: 'center', paddingTop: 10 }}>
                        <Text style={{ fontSize: 10 }}>Podpis nabywcy</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
