import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import { useShop } from '../context/ShopContext';
import { Button, Input, Card, PageHeader } from '../components/common/UI';
import { Save, Check } from 'lucide-react';

const Settings = () => {
    const { settings } = useShop();
    const [formData, setFormData] = useState({
        shopName: '',
        address: '',
        phone: '',
        gstNumber: '',
        goldRate24k: '',
        goldRate22k: '',
        silverRate: '',
        taxRate: '',
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (settings) {
            const newData = { ...formData };
            settings.forEach(s => {
                if (newData.hasOwnProperty(s.key)) {
                    newData[s.key] = s.value;
                }
            });
            setFormData(newData);
        }
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            const updates = Object.keys(formData).map(key => ({
                key,
                value: formData[key]
            }));
            await db.settings.bulkPut(updates);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    return (
        <div className="page-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <PageHeader title="Settings" subtitle="Shop configuration" />

            <Card title="Shop Information" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Input label="Shop Name" name="shopName" value={formData.shopName} onChange={handleChange} />
                    <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
                    <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                    <Input label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
                </div>
            </Card>

            <Card title="Metal Rates (₹/gram)" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Input label="Gold 24K" name="goldRate24k" type="number" value={formData.goldRate24k} onChange={handleChange} />
                        <Input label="Gold 22K" name="goldRate22k" type="number" value={formData.goldRate22k} onChange={handleChange} />
                    </div>
                    <Input label="Silver" name="silverRate" type="number" value={formData.silverRate} onChange={handleChange} />
                </div>
            </Card>

            <Card title="Tax Settings" style={{ marginBottom: '20px' }}>
                <Input label="GST Rate (%)" name="taxRate" type="number" value={formData.taxRate} onChange={handleChange} />
            </Card>

            <Button onClick={handleSave} variant="primary" style={{ width: '100%', padding: '14px' }}>
                {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
            </Button>
        </div>
    );
};

export default Settings;
