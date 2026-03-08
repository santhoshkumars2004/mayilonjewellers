import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { useCollection } from '../hooks/useCollection';
import { useShop } from '../context/ShopContext';
import { PageHeader, Button } from '../components/common/UI';
import { ArrowLeft, Plus, X, ArrowDownLeft, ArrowUpRight, Scale, IndianRupee, Percent, Calendar, FileText, Trash2 } from 'lucide-react';

/* ═══════════════════════════════════════════
   Add Transaction Modal
   ═══════════════════════════════════════════ */
const LedgerTxnModal = ({ dealer, type, onClose }) => {
    const isIn = type === 'in';
    const title = isIn ? `⬇ Receive Gold — ${dealer.name}` : `⬆ Send Gold — ${dealer.name}`;

    const [form, setForm] = useState({
        weight: '',
        rate: String(dealer.defaultRate || ''),
        purity: String(dealer.defaultPurity || '99.90'),
        date: new Date().toISOString().split('T')[0],
        note: '',
    });
    const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const w = parseFloat(form.weight) || 0;
    const p = parseFloat(form.purity) || 0;
    const pureWeight = (w * p / 100);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (w <= 0) return;

        await db.dealerTransactions.add({
            dealerId: dealer.id,
            type: isIn ? 'received' : 'used',
            weight: w,
            rate: parseFloat(form.rate) || 0,
            purity: p,
            pureWeight,
            date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
            note: form.note.trim(),
        });
        onClose();
    };

    return (
        <div className="expenses-modal-overlay" onClick={onClose}>
            <section className="expenses-modal" onClick={e => e.stopPropagation()} role="dialog" aria-label={title}>
                <header className="expenses-modal-header">
                    <h3>{title}</h3>
                    <button className="expenses-modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
                </header>
                <form onSubmit={handleSubmit} className="expenses-modal-form">
                    <div className="dealers-form-row">
                        <div className="expenses-field">
                            <label htmlFor="g-weight"><Scale size={14} /> Weight (g)</label>
                            <input id="g-weight" type="number" step="0.001" min="0" value={form.weight} onChange={e => up('weight', e.target.value)} placeholder="0.000" required autoFocus />
                        </div>
                        <div className="expenses-field">
                            <label htmlFor="g-purity"><Percent size={14} /> Purity (%)</label>
                            <input id="g-purity" type="number" step="0.01" min="0" max="100" value={form.purity} onChange={e => up('purity', e.target.value)} placeholder="99.90" required />
                        </div>
                    </div>

                    {w > 0 && (
                        <div className="dealers-pure-calc">
                            <span>Pure Gold:</span>
                            <strong>{pureWeight.toFixed(3)} g</strong>
                            <small>({form.weight} × {form.purity}%)</small>
                        </div>
                    )}

                    <div className="expenses-field">
                        <label htmlFor="g-date"><Calendar size={14} /> Date</label>
                        <input id="g-date" type="date" value={form.date} onChange={e => up('date', e.target.value)} />
                    </div>

                    <Button type="submit" variant="primary" className="expenses-submit-btn">
                        {isIn ? '⬇ Record Gold In' : '⬆ Record Gold Out'}
                    </Button>
                </form>
            </section>
        </div>
    );
};


/* ═══════════════════════════════════════════
   DEALER LEDGER PAGE
   ═══════════════════════════════════════════ */
const DealerLedger = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { formatCurrency } = useShop();

    const [dealer, setDealer] = useState(null);
    const [modalType, setModalType] = useState(null); // 'in' or 'out'

    // Fetch Dealer Details
    useEffect(() => {
        const fetchDealer = async () => {
            const d = await db.dealers.get(id);
            if (d) setDealer(d);
            else navigate('/dealers');
        };
        fetchDealer();
    }, [id, navigate]);

    // Live Transactions for this Dealer
    const allTxns = useCollection('dealerTransactions');
    const txns = (allTxns || [])
        .filter(t => t.dealerId === id)
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Chronological order for running balance

    if (!dealer) return null;

    // Calculate pure weight
    const purify = (txn) => {
        if (txn.pureWeight) return txn.pureWeight;
        const pct = typeof txn.purity === 'number' ? txn.purity : parseFloat(txn.purity) || 0;
        return (txn.weight || 0) * (pct / 100);
    };

    // Calculate Running Balance Map
    let currentBalance = 0;
    const balanceMap = {};
    txns.forEach(t => {
        const pure = purify(t);
        currentBalance += (t.type === 'received' ? pure : -pure);
        balanceMap[t.id] = currentBalance;
    });

    const totalIn = txns.filter(t => t.type === 'received').reduce((s, t) => s + purify(t), 0);
    const totalOut = txns.filter(t => t.type === 'used').reduce((s, t) => s + purify(t), 0);

    const deleteTxn = async (txnId) => {
        if (!window.confirm("Delete this transaction?")) return;
        await db.dealerTransactions.delete(txnId);
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

    return (
        <div className="page-container expenses-page">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <button
                    onClick={() => navigate('/dealers')}
                    style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}
                >
                    <ArrowLeft size={18} /> Back
                </button>
            </div>

            <PageHeader
                title={`Ledger: ${dealer.name}`}
                subtitle={dealer.phone ? `Ph: ${dealer.phone}` : 'Statement of Account'}
                action={
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="ghost" onClick={() => setModalType('in')} style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                            <ArrowDownLeft size={16} /> Gold In
                        </Button>
                        <Button variant="ghost" onClick={() => setModalType('out')} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <ArrowUpRight size={16} /> Gold Out
                        </Button>
                    </div>
                }
            />

            {/* ── Summary & Opening Balance ── */}
            <section className="dealers-summary-bar" aria-label="Ledger Summary" style={{ marginBottom: '24px' }}>
                <div className="dealers-summary-item">
                    <span className="dealers-summary-label">Total Gold In</span>
                    <strong className="dealers-summary-value" style={{ color: '#10b981' }}>{totalIn.toFixed(3)} g</strong>
                </div>
                <div className="dealers-summary-divider" aria-hidden="true"></div>
                <div className="dealers-summary-item">
                    <span className="dealers-summary-label">Total Gold Out</span>
                    <strong className="dealers-summary-value" style={{ color: '#ef4444' }}>{totalOut.toFixed(3)} g</strong>
                </div>
                <div className="dealers-summary-divider" aria-hidden="true"></div>
                <div className="dealers-summary-item">
                    <span className="dealers-summary-label">Running Balance</span>
                    <strong className="dealers-summary-value dealers-summary-value--gold">{currentBalance.toFixed(3)} g</strong>
                </div>
            </section>

            {/* ── Ledger Table ── */}
            <section className="dealers-table-wrapper" aria-label="Ledger Transactions">
                <table className="dealers-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Particulars</th>
                            <th>Formula / Calculation</th>
                            <th className="dealers-col--in">Gold In (Credit)</th>
                            <th className="dealers-col--out">Gold Out (Debit)</th>
                            <th className="dealers-col--balance">Balance (P)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {txns.length > 0 ? txns.reverse().map((txn) => {
                            const pure = purify(txn);
                            const formulaStr = txn.rate > 0 && txn.weight > 0 ? `₹${(txn.rate * txn.weight).toFixed(0)} ÷ ₹${txn.rate}/g` : `${txn.weight.toFixed(3)}g × ${txn.purity}%`;

                            return (
                                <tr key={txn.id} className={txn.type === 'received' ? 'dealers-txn--in' : 'dealers-txn--out'}>
                                    <td>{fmtDate(txn.date)}</td>
                                    <td className="dealers-cell--note"><strong>{txn.note || (txn.type === 'received' ? 'Recv' : 'Paid')}</strong></td>
                                    <td style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                        {formulaStr}
                                    </td>
                                    <td className="dealers-cell--in">
                                        {txn.type === 'received' ? <strong>{pure.toFixed(3)}</strong> : '—'}
                                    </td>
                                    <td className="dealers-cell--out">
                                        {txn.type === 'used' ? <strong>{pure.toFixed(3)}</strong> : '—'}
                                    </td>
                                    <td className="dealers-cell--balance">
                                        <strong>{balanceMap[txn.id]?.toFixed(3)}</strong>
                                    </td>
                                    <td>
                                        <button className="dealers-tbl-btn dealers-tbl-btn--delete" title="Delete" onClick={() => deleteTxn(txn.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                                    <FileText size={36} style={{ opacity: 0.3, marginBottom: '8px' }} /><br />
                                    No ledger entries. Click "Gold In" or "Gold Out" to begin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {modalType && (
                <LedgerTxnModal
                    dealer={dealer}
                    type={modalType}
                    onClose={() => setModalType(null)}
                />
            )}
        </div>
    );
};

export default DealerLedger;
