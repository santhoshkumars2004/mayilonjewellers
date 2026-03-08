import React, { useState } from 'react';
import { db } from '../db/db';
import { useCollection } from '../hooks/useCollection';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button } from '../components/common/UI';
import { Plus, X, ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronUp, Trash2, User, Phone, IndianRupee, Percent, Scale, Calendar, FileText, FileText as LedgerIcon } from 'lucide-react';

/* ═══════════════════════════════════════════
   ADD DEALER MODAL
   — includes Name, Phone, Default Rate, Default Purity
   ═══════════════════════════════════════════ */
const AddDealerModal = ({ onClose }) => {
    const [form, setForm] = useState({ name: '', phone: '', defaultRate: '', defaultPurity: '99.90' });
    const up = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        await db.dealers.add({
            name: form.name.trim(),
            phone: form.phone.trim(),
            defaultRate: parseFloat(form.defaultRate) || 0,
            defaultPurity: parseFloat(form.defaultPurity) || 99.90,
            createdAt: new Date().toISOString(),
        });
        onClose();
    };

    return (
        <div className="expenses-modal-overlay" onClick={onClose}>
            <section className="expenses-modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="Add Dealer">
                <header className="expenses-modal-header">
                    <h3>Add New Dealer</h3>
                    <button className="expenses-modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
                </header>
                <form onSubmit={handleSubmit} className="expenses-modal-form">
                    <div className="expenses-field">
                        <label htmlFor="dealer-name"><User size={14} /> Dealer Name</label>
                        <input id="dealer-name" value={form.name} onChange={e => up('name', e.target.value)} placeholder="e.g. Santhosh" required />
                    </div>
                    {/* <div className="expenses-field">
                        <label htmlFor="dealer-phone"><Phone size={14} /> Phone (optional)</label>
                        <input id="dealer-phone" value={form.phone} onChange={e => up('phone', e.target.value)} placeholder="e.g. 9876543210" />
                    </div> */}
                    <div className="dealers-form-row">
                        <div className="expenses-field">
                            <label htmlFor="dealer-rate"><IndianRupee size={14} /> Default Rate (₹/g)</label>
                            <input id="dealer-rate" type="number" step="1" value={form.defaultRate} onChange={e => up('defaultRate', e.target.value)} placeholder="e.g. 4000" />
                        </div>
                        <div className="expenses-field">
                            <label htmlFor="dealer-purity"><Percent size={14} /> Default Purity (%)</label>
                            <input id="dealer-purity" type="number" step="0.01" min="0" max="100" value={form.defaultPurity} onChange={e => up('defaultPurity', e.target.value)} placeholder="e.g. 99.90" />
                        </div>
                    </div>
                    <Button type="submit" variant="primary" className="expenses-submit-btn">Add Dealer</Button>
                </form>
            </section>
        </div>
    );
};

/* ═══════════════════════════════════════════
   GOLD IN / GOLD OUT MODAL
   — Weight, Rate, Purity (%), Date, Note
   — Shows live Pure Gold calculation
   ═══════════════════════════════════════════ */
const GoldModal = ({ dealer, type, onClose }) => {
    const isIn = type === 'in';
    const title = isIn ? `⬇ Gold Received — ${dealer.name}` : `⬆ Gold Used — ${dealer.name}`;

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
                            <input id="g-weight" type="number" step="0.001" min="0" value={form.weight} onChange={e => up('weight', e.target.value)} placeholder="e.g. 6.000" required autoFocus />
                        </div>
                        <div className="expenses-field">
                            <label htmlFor="g-purity"><Percent size={14} /> Purity (%)</label>
                            <input id="g-purity" type="number" step="0.01" min="0" max="100" value={form.purity} onChange={e => up('purity', e.target.value)} placeholder="e.g. 99.90" required />
                        </div>
                    </div>

                    {/* Live pure weight calculation */}
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
   MAIN DEALERS PAGE — TABLE LAYOUT
   ═══════════════════════════════════════════ */
const Dealers = () => {
    const { formatCurrency } = useShop();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [goldModal, setGoldModal] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    // Live queries
    const dealers = useCollection('dealers');
    const allTxns = useCollection('dealerTransactions');

    const txnsFor = (id) => (allTxns || []).filter(t => t.dealerId === id);

    // Pure weight calculation — uses percentage purity from the transaction
    const purify = (txn) => {
        if (txn.pureWeight) return txn.pureWeight;
        const pct = typeof txn.purity === 'number' ? txn.purity : parseFloat(txn.purity) || 0;
        return (txn.weight || 0) * pct / 100;
    };

    // Per-dealer computed data
    const dealerRows = (dealers || []).map(d => {
        const txns = txnsFor(d.id);
        const inTxns = txns.filter(t => t.type === 'received');
        const outTxns = txns.filter(t => t.type === 'used');
        const totalIn = inTxns.reduce((s, t) => s + purify(t), 0);
        const totalOut = outTxns.reduce((s, t) => s + purify(t), 0);
        const balance = totalIn - totalOut;
        const latest = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        return {
            ...d,
            totalIn, totalOut, balance,
            displayRate: d.defaultRate || latest?.rate || 0,
            displayPurity: d.defaultPurity || latest?.purity || '—',
            txns: [...txns].sort((a, b) => new Date(b.date) - new Date(a.date)),
        };
    });

    // Grand totals
    const grandIn = dealerRows.reduce((s, r) => s + r.totalIn, 0);
    const grandOut = dealerRows.reduce((s, r) => s + r.totalOut, 0);
    const grandBalance = grandIn - grandOut;

    const deleteDealer = async (id) => {
        if (!window.confirm('Delete this dealer and all their transactions?')) return;
        await db.dealerTransactions.where('dealerId').equals(id).delete();
        await db.dealers.delete(id);
        if (expandedId === id) setExpandedId(null);
    };

    const deleteTxn = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        await db.dealerTransactions.delete(id);
    };

    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

    // Build running balance for history
    const runningBalances = (txns) => {
        const chrono = [...txns].sort((a, b) => new Date(a.date) - new Date(b.date));
        let bal = 0;
        const map = {};
        chrono.forEach(t => {
            bal += t.type === 'received' ? purify(t) : -purify(t);
            map[t.id] = bal;
        });
        return map;
    };

    return (
        <div className="page-container expenses-page">
            <PageHeader
                title="Dealers"
                subtitle="Track pure gold balance with each dealer"
                action={<Button variant="primary" onClick={() => setShowAddModal(true)}><Plus size={18} /> Add Dealer</Button>}
            />

            {/* ── Summary Bar ── */}
            <section className="dealers-summary-bar" aria-label="Summary">
                <div className="dealers-summary-item">
                    <span className="dealers-summary-label">Total Dealers</span>
                    <strong className="dealers-summary-value">{dealerRows.length}</strong>
                </div>
                <div className="dealers-summary-divider" aria-hidden="true"></div>
                <div className="dealers-summary-item">
                    <span className="dealers-summary-label">Total Pure Gold Balance</span>
                    <strong className="dealers-summary-value dealers-summary-value--gold">{grandBalance.toFixed(3)} g</strong>
                </div>
            </section>

            {/* ── Main Table ── */}
            <section className="dealers-table-wrapper" aria-label="Dealers list">
                <table className="dealers-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Dealer Name</th>
                            {/* <th>Phone</th> */}
                            <th>Rate (₹/g)</th>
                            <th>Purity (%)</th>
                            <th className="dealers-col--in">Gold In (g)</th>
                            <th className="dealers-col--out">Gold Out (g)</th>
                            <th className="dealers-col--balance">Pure Balance (g)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dealerRows.length > 0 ? dealerRows.map((row, idx) => (
                            <React.Fragment key={row.id}>
                                {/* ── Main Row ── */}
                                <tr className={`dealers-row ${expandedId === row.id ? 'dealers-row--expanded' : ''}`}>
                                    <td className="dealers-cell--sno" data-label="S.No">{idx + 1}</td>
                                    <td className="dealers-cell--name" data-label="Dealer Name">
                                        <button
                                            onClick={() => navigate(`/dealers/${row.id}`)}
                                            style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 'bold', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                        >
                                            {row.name}
                                        </button>
                                    </td>
                                    <td data-label="Rate (₹/g)">{row.displayRate ? `₹${Number(row.displayRate).toLocaleString('en-IN')}` : '—'}</td>
                                    <td data-label="Purity (%)">{row.displayPurity !== '—' ? `${row.displayPurity}%` : '—'}</td>
                                    <td className="dealers-cell--in" data-label="Gold In (g)"><strong>{row.totalIn.toFixed(3)}</strong></td>
                                    <td className="dealers-cell--out" data-label="Gold Out (g)"><strong>{row.totalOut.toFixed(3)}</strong></td>
                                    <td className={`dealers-cell--balance ${row.balance < 0 ? 'dealers-cell--negative' : ''}`} data-label="Pure Balance (g)">
                                        <strong>{row.balance.toFixed(3)}</strong>
                                    </td>
                                    <td data-label="Actions">
                                        <div className="dealers-cell--actions">
                                            <button className="dealers-tbl-btn dealers-tbl-btn--in" title="Gold In" onClick={() => setGoldModal({ dealer: row, type: 'in' })}>
                                                <ArrowDownLeft size={14} /> In
                                            </button>
                                            <button className="dealers-tbl-btn dealers-tbl-btn--out" title="Gold Out" onClick={() => setGoldModal({ dealer: row, type: 'out' })}>
                                                <ArrowUpRight size={14} /> Out
                                            </button>
                                            <button className="dealers-tbl-btn dealers-tbl-btn--ledger" title="Open Ledger" onClick={() => navigate(`/dealers/${row.id}`)}>
                                                <LedgerIcon size={14} /> Ledger
                                            </button>
                                            <button className="dealers-tbl-btn dealers-tbl-btn--delete dealers-tbl-btn--icon-only" title="Delete" onClick={() => deleteDealer(row.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        )) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
                                    <Scale size={36} style={{ opacity: 0.3, marginBottom: '8px' }} /><br />
                                    No dealers added yet. Click "Add Dealer" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>

                    {dealerRows.length > 0 && (
                        <tfoot>
                            <tr className="dealers-totals-row">
                                <td colSpan="4" style={{ textAlign: 'right' }}><strong>TOTALS</strong></td>
                                <td className="dealers-cell--in"><strong>{grandIn.toFixed(3)}</strong></td>
                                <td className="dealers-cell--out"><strong>{grandOut.toFixed(3)}</strong></td>
                                <td className="dealers-cell--balance"><strong>{grandBalance.toFixed(3)}</strong></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </section>

            {/* ── Modals ── */}
            {showAddModal && <AddDealerModal onClose={() => setShowAddModal(false)} />}
            {goldModal && <GoldModal dealer={goldModal.dealer} type={goldModal.type} onClose={() => setGoldModal(null)} />}
        </div>
    );
};

export default Dealers;
