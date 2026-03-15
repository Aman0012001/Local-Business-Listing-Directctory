import VendorProfileClient from './VendorProfileClient';

export default async function VendorProfilePage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = await params;
    return <VendorProfileClient vendorId={vendorId} />;
}
