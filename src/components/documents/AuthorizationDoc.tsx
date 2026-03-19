import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#112244',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1d4ed8', // Blue-600
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    section: {
        margin: 10,
        padding: 10,
    },
    text: {
        fontSize: 11,
        marginBottom: 5,
        lineHeight: 1.5,
        textAlign: 'justify',
    },
    bold: {
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
    },
    signatureBox: {
        marginTop: 50,
        borderTopWidth: 1,
        borderTopColor: '#000',
        width: 200,
        textAlign: 'center',
        paddingTop: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 10,
        color: 'grey',
    },
});

interface AuthorizationProps {
    ownerName: string;
    ownerDni: string;
    propertyAddress: string;
    price: string;
    agentName?: string;
}

export const AuthorizationDocument = ({ ownerName, ownerDni, propertyAddress, price, agentName }: AuthorizationProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>ALROS INVESTMENTS S.L.</Text>
                <Text style={{ fontSize: 10 }}>Avda. Juan Luis Peralta, 22 - Benalmádena</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Autorización de Venta / Alquiler</Text>

            {/* Content */}
            <View style={styles.section}>
                <Text style={styles.text}>
                    En Benalmádena, a {new Date().toLocaleDateString()}.
                </Text>

                <Text style={{ ...styles.text, marginTop: 15 }}>
                    D./Dña. <Text style={styles.bold}>{ownerName}</Text>, con DNI/NIE <Text style={styles.bold}>{ownerDni}</Text>, en calidad de propietario/a (o representante legal).
                </Text>

                <Text style={{ ...styles.text, marginTop: 15 }}>
                    <Text style={styles.bold}>AUTORIZA</Text> a ALROS INVESTMENTS S.L. a realizar las gestiones necesarias para la mediación en la VENTA/ALQUILER del inmueble sito en:
                </Text>

                <Text style={{ ...styles.text, marginLeft: 20, marginTop: 5, marginBottom: 5, fontStyle: 'italic' }}>
                    {propertyAddress}
                </Text>

                <Text style={{ ...styles.text, marginTop: 15 }}>
                    El precio pactado para la operación es de <Text style={styles.bold}>{price} €</Text> (comisión de agencia no incluida / incluida según pacto anexo).
                </Text>

                <Text style={{ ...styles.text, marginTop: 15 }}>
                    La agencia se compromete a promocionar el inmueble a través de sus medios habituales, incluyendo página web, portales inmobiliarios y cartera de clientes, con la máxima diligencia y profesionalidad.
                </Text>

                <Text style={{ ...styles.text, marginTop: 15 }}>
                    El propietario autoriza el uso de imágenes y datos del inmueble para su promoción pública, eximiendo datos de contacto directos que permanecerán confidenciales.
                </Text>
            </View>

            {/* Signatures */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 50 }}>
                <View style={styles.signatureBox}>
                    <Text style={styles.text}>Fdo: La Propiedad</Text>
                </View>
                <View style={styles.signatureBox}>
                    <Text style={styles.text}>Fdo: Alros Investments S.L.</Text>
                    {agentName && <Text style={{ fontSize: 9, marginTop: 2 }}>Agente: {agentName}</Text>}
                </View>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                Alros Investments S.L. - Documento generado automáticamente el {new Date().toLocaleDateString()}
            </Text>
        </Page>
    </Document>
);
