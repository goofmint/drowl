#!/bin/bash
# Generate self-signed SSL certificates for local HTTPS development
# Usage: bash generate-certs.sh

set -e

DOMAIN="drowl.test"
CERT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DAYS_VALID=365

echo "🔐 Generating self-signed SSL certificates for ${DOMAIN}..."

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: openssl is not installed"
    echo "   Install it using: brew install openssl (macOS) or apt-get install openssl (Linux)"
    exit 1
fi

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out "${CERT_DIR}/${DOMAIN}.key" 2048

# Generate certificate signing request (CSR)
echo "📝 Generating certificate signing request..."
openssl req -new \
    -key "${CERT_DIR}/${DOMAIN}.key" \
    -out "${CERT_DIR}/${DOMAIN}.csr" \
    -subj "/C=US/ST=Development/L=Local/O=drowl/OU=Development/CN=${DOMAIN}"

# Generate self-signed certificate
echo "📝 Generating self-signed certificate (valid for ${DAYS_VALID} days)..."
openssl x509 -req \
    -in "${CERT_DIR}/${DOMAIN}.csr" \
    -signkey "${CERT_DIR}/${DOMAIN}.key" \
    -out "${CERT_DIR}/${DOMAIN}.crt" \
    -days ${DAYS_VALID} \
    -sha256

# Clean up CSR file
rm "${CERT_DIR}/${DOMAIN}.csr"

# Set appropriate permissions
chmod 644 "${CERT_DIR}/${DOMAIN}.crt"
chmod 600 "${CERT_DIR}/${DOMAIN}.key"

echo "✅ SSL certificates generated successfully!"
echo ""
echo "📁 Certificate: ${CERT_DIR}/${DOMAIN}.crt"
echo "🔑 Private key: ${CERT_DIR}/${DOMAIN}.key"
echo ""
echo "⚠️  IMPORTANT: Add the following line to your /etc/hosts file:"
echo "   127.0.0.1 ${DOMAIN}"
echo ""
echo "📚 To trust the certificate in your browser (macOS):"
echo "   1. Open Keychain Access"
echo "   2. Drag ${DOMAIN}.crt into 'System' keychain"
echo "   3. Double-click the certificate and set 'Always Trust'"
echo ""
echo "📚 To trust the certificate in your browser (Linux):"
echo "   sudo cp ${DOMAIN}.crt /usr/local/share/ca-certificates/"
echo "   sudo update-ca-certificates"
echo ""
echo "🚀 You can now start nginx and access https://${DOMAIN}"
