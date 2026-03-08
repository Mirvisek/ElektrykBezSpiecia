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
    page: { padding: 30, fontFamily: 'Roboto', fontSize: 9, color: '#1f2937', lineHeight: 1.4 },
    header: { textAlign: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 10 },
    title: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    subtitle: { fontSize: 10, color: '#475569' },

    section: { marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between' },
    box: { width: '48%', borderWidth: 1, borderColor: '#cbd5e1', padding: 8 },
    boxTitle: { fontSize: 8, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' },
    boxText: { fontSize: 10, fontWeight: 'bold' },

    table: { width: '100%', borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 20 },
    tRowHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 1, borderColor: '#cbd5e1', fontWeight: 'bold', textAlign: 'center', paddingVertical: 4 },
    tRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e8f0', textAlign: 'center', paddingVertical: 4 },

    colSmall: { width: '5%', borderRightWidth: 1, borderColor: '#e2e8f0' },
    colName: { width: '35%', textAlign: 'left', paddingLeft: 4, borderRightWidth: 1, borderColor: '#e2e8f0' },
    colIn: { width: '10%', borderRightWidth: 1, borderColor: '#e2e8f0' },
    colDeltaIn: { width: '15%', borderRightWidth: 1, borderColor: '#e2e8f0' },
    colTa: { width: '15%', borderRightWidth: 1, borderColor: '#e2e8f0' },
    colRes: { width: '20%' },

    footerBox: { borderWidth: 1, borderColor: '#cbd5e1', padding: 8, marginBottom: 20 },
    signBox: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 },
    signLine: { width: 150, borderTopWidth: 1, borderTopColor: '#94a3b8', textAlign: 'center', paddingTop: 4, fontSize: 8, color: '#64748b' }
});

export default function ProtocolPDF({ protocol, settings }: { protocol: any, settings: any }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {settings?.logoBase64 && (
                            <Image src={settings.logoBase64} style={{ width: 100, marginBottom: 15, objectFit: 'contain' }} />
                        )}
                        <Text style={styles.title}>PROTOKÓŁ Z BADAŃ WYŁĄCZNIKÓW RÓŻNICOWOPRĄDOWYCH</Text>
                        <Text style={styles.subtitle}>Wykaz pomiarów i ocena skuteczności działania wyłączników RCD</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.box}>
                        <Text style={styles.boxTitle}>Dane zlecającego (Inwestor)</Text>
                        <Text style={styles.boxText}>{protocol.clientName}</Text>
                        <Text style={{ marginTop: 2 }}>{protocol.clientAddress}</Text>
                    </View>
                    <View style={styles.box}>
                        <Text style={styles.boxTitle}>Obiekt badany (Miejsce inst.)</Text>
                        <Text style={styles.boxText}>{protocol.objectAddress}</Text>
                        <Text style={{ marginTop: 2 }}>Data pomiarów: {protocol.date}</Text>
                    </View>
                </View>

                <View style={[styles.box, { width: '100%', marginBottom: 20 }]}>
                    <Text style={styles.boxTitle}>Użyte przyrządy pomiarowe</Text>
                    <Text style={styles.boxText}>Model miernika: {protocol.eqModel} | Numer seryjny: {protocol.eqSerial}</Text>
                    <Text>Świadectwo wzorcowania ważne do: {protocol.eqCal}</Text>
                </View>

                <Text style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 4 }}>Wyniki Badań Wyłączników (Czas zadziałania przy kr. In=1):</Text>

                <View style={styles.table}>
                    <View style={styles.tRowHeader}>
                        <Text style={styles.colSmall}>Lp.</Text>
                        <Text style={styles.colName}>Obwód (Nazwa)</Text>
                        <Text style={styles.colIn}>IΔn [mA]</Text>
                        <Text style={styles.colDeltaIn}>IΔA [mA]</Text>
                        <Text style={styles.colTa}>Czas tA [ms]</Text>
                        <Text style={{ ...styles.colRes, borderRightWidth: 0 }}>Ocena</Text>
                    </View>

                    {protocol.measurements.map((m: any, i: number) => (
                        <View key={i} style={styles.tRow}>
                            <Text style={styles.colSmall}>{i + 1}</Text>
                            <Text style={styles.colName}>{m.name}</Text>
                            <Text style={styles.colIn}>{m.In}</Text>
                            <Text style={styles.colDeltaIn}>{m.deltaIA.toFixed(1)}</Text>
                            <Text style={styles.colTa}>{m.ta.toFixed(1)}</Text>
                            <Text style={styles.colRes}>{m.result}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.footerBox}>
                    <Text style={styles.boxTitle}>Orzeczenie i końcowe wnioski, uwagi</Text>
                    <Text style={{ fontWeight: 'bold', marginTop: 4 }}>{protocol.notes}</Text>
                    <Text style={{ fontSize: 8, color: '#64748b', marginTop: 8 }}>
                        Powyższe pomiary zostały wykonane zgodnie z normą PN-HD 60364-6. Wyłączniki oznaczone statusem 'Pozytywny' spełniają warunki samoczynnego wyłączenia zasilania w czasie dopuszczalnym zasilającym.
                    </Text>
                </View>

                <View style={styles.signBox}>
                    <View>
                        <Text style={styles.signLine}>Zleceniodawca (podpis)</Text>
                    </View>
                    <View>
                        <Text style={{ fontSize: 10, textAlign: 'center', fontWeight: 'bold', marginBottom: 40 }}>{settings?.myName}</Text>
                        <Text style={styles.signLine}>Pomiary wykonał (podpis)</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
