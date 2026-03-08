import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
    ],
});

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#1f2937' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e40af', marginBottom: 8 },
    infoText: { fontSize: 10, color: '#4b5563', marginBottom: 4 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12, backgroundColor: '#f3f4f6', padding: 6 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    col: { width: '45%' },
    table: { width: '100%', marginBottom: 30 },
    tableHeaderRow: { flexDirection: 'row', backgroundColor: '#e5e7eb', padding: 8, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#cbd5e1' },
    tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    colDesc: { flex: 4, paddingRight: 8 },
    colQty: { flex: 1, textAlign: 'center' },
    colPrice: { flex: 2, textAlign: 'right' },
    colTotal: { flex: 2, textAlign: 'right', fontWeight: 'bold' },
    totalSection: { marginTop: 20, alignItems: 'flex-end', borderTopWidth: 2, borderTopColor: '#2563eb', paddingTop: 10 },
    totalText: { fontSize: 14, fontWeight: 'bold', marginTop: 4, color: '#1e40af' },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 }
});

export default function QuotePDF({ quote, settings }: { quote: any, settings: any }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        {settings?.logoBase64 && (
                            <Image src={settings.logoBase64} style={{ width: 120, marginBottom: 15, objectFit: 'contain' }} />
                        )}
                        <Text style={styles.title}>OFERTA / KOSZTORYS</Text>
                        <Text style={styles.infoText}>Nr dokumentu: {quote.documentNumber}</Text>
                        <Text style={styles.infoText}>Data wystawienia: {quote.date}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={{ ...styles.infoText, fontWeight: 'bold', fontSize: 12, color: '#1e3a8a' }}>Wystawca:</Text>
                        <Text style={styles.infoText}>{settings?.myName}</Text>
                        <Text style={styles.infoText}>{settings?.myAddress}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dane inwestora</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>{quote.clientName}</Text>
                    {quote.clientData ? <Text>{quote.clientData}</Text> : null}
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={{ width: 30 }}>Lp.</Text>
                        <Text style={styles.colDesc}>Nazwa towaru / usługi</Text>
                        <Text style={styles.colQty}>Ilość</Text>
                        <Text style={styles.colPrice}>Cena jn.</Text>
                        <Text style={styles.colTotal}>Kwota netto/brutto</Text>
                    </View>
                    {quote.items.map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={{ width: 30 }}>{i + 1}</Text>
                            <Text style={styles.colDesc}>{item.name}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colPrice}>{item.price?.toFixed(2)} zł</Text>
                            <Text style={styles.colTotal}>{(item.price * item.quantity).toFixed(2)} zł</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.totalSection}>
                    <Text style={styles.totalText}>Razem do zapłaty: {quote.amount?.toFixed(2)} zł</Text>
                    <Text style={{ ...styles.infoText, marginTop: 8, fontStyle: 'italic', color: '#64748b' }}>Podana kwota jest kwotą ostateczną, zwolnioną z VAT.</Text>
                </View>

                <View style={{ marginTop: 50, color: '#64748b', fontSize: 9 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Dodatkowe informacje / Uwagi:</Text>
                    <Text>{quote.notes}</Text>
                    <Text style={{ marginTop: 20 }}>Oferta nie stanowi umowy wiążącej do momentu jej oficjalnej akceptacji.</Text>
                </View>

                <Text style={styles.footer}>
                    Oferta wygenerowana automatycznie z aplikacji dla Działalności Nierejestrowanej.
                </Text>
            </Page>
        </Document>
    );
}
