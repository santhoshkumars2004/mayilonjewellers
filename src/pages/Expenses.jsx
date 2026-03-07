import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import { useCollection } from '../hooks/useCollection';
import { useShop } from '../context/ShopContext';
import { Card, Button, PageHeader } from '../components/common/UI';
import { Plus, X, Store, Landmark, Wallet, Pencil, Check, Trash2, Calendar, User, FileText, IndianRupee, Download, FileSpreadsheet, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─── Edit Balance Inline ─── */
const EditableBalance = ({ label, icon: Icon, colorClass, value, onSave }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(String(value || ''));
    const { formatCurrency } = useShop();

    useEffect(() => { setDraft(String(value || '')); }, [value]);

    const commit = async () => {
        const num = parseFloat(draft) || 0;
        await onSave(num);
        setEditing(false);
    };

    const startEdit = () => {
        setDraft(String(value || ''));
        setEditing(true);
    };

    return (
        <article className={`expenses-balance-card ${colorClass}`}>
            <header className="expenses-balance-header">
                <span className="expenses-balance-icon"><Icon size={20} /></span>
                <span className="expenses-balance-label">{label}</span>
                {!editing ? (
                    <button
                        className="expenses-edit-btn"
                        onClick={startEdit}
                        aria-label={`Edit ${label}`}
                    >
                        <Pencil size={14} />
                    </button>
                ) : (
                    <button
                        className="expenses-edit-btn expenses-edit-btn--save"
                        onMouseDown={(e) => { e.preventDefault(); commit(); }}
                        aria-label={`Save ${label}`}
                    >
                        <Check size={14} />
                    </button>
                )}
            </header>

            {editing ? (
                <div className="expenses-balance-input-wrap">
                    <span className="expenses-rupee-prefix">₹</span>
                    <input
                        type="number"
                        className="expenses-balance-input"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && commit()}
                        onBlur={commit}
                        autoFocus
                    />
                </div>
            ) : (
                <p className="expenses-balance-value">{formatCurrency(value)}</p>
            )}
        </article>
    );
};

/* ─── Add Expense Modal ─── */
const AddExpenseModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        reason: '',
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || parseFloat(formData.amount) <= 0) return;
        await db.expenses.add({
            reason: formData.reason,
            name: formData.name,
            amount: parseFloat(formData.amount),
            date: new Date(formData.date).toISOString(),
        });
        onClose();
    };

    const update = (field, val) => setFormData((prev) => ({ ...prev, [field]: val }));

    return (
        <div className="expenses-modal-overlay" onClick={onClose}>
            <section
                className="expenses-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-label="Add Expense"
            >
                <header className="expenses-modal-header">
                    <h3>Add Expense</h3>
                    <button className="expenses-modal-close" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="expenses-modal-form">
                    <div className="expenses-field">
                        <label htmlFor="expense-reason">
                            <FileText size={14} /> Reason
                        </label>
                        <input
                            id="expense-reason"
                            value={formData.reason}
                            onChange={(e) => update('reason', e.target.value)}
                            placeholder="e.g. Advance, Rent, Material"
                            required
                        />
                    </div>

                    <div className="expenses-field">
                        <label htmlFor="expense-name">
                            <User size={14} /> Name
                        </label>
                        <input
                            id="expense-name"
                            value={formData.name}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="e.g. Raja, Supplier Name"
                            required
                        />
                    </div>

                    <div className="expenses-field">
                        <label htmlFor="expense-amount">
                            <IndianRupee size={14} /> Amount
                        </label>
                        <input
                            id="expense-amount"
                            type="number"
                            min="1"
                            value={formData.amount}
                            onChange={(e) => update('amount', e.target.value)}
                            placeholder="0"
                            required
                        />
                    </div>

                    <div className="expenses-field">
                        <label htmlFor="expense-date">
                            <Calendar size={14} /> Date
                        </label>
                        <input
                            id="expense-date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => update('date', e.target.value)}
                        />
                    </div>

                    <Button type="submit" variant="primary" className="expenses-submit-btn">
                        Submit Expense
                    </Button>
                </form>
            </section>
        </div>
    );
};

/* ─── Main Page ─── */
const Expenses = () => {
    const { formatCurrency, formatDate } = useShop();
    const [showModal, setShowModal] = useState(false);

    // Live queries
    const balancesArr = useCollection('balances');
    const expenses = useCollection('expenses', 'date', 'desc');
    const allExpenses = useCollection('expenses');

    // Ensure balance records exist in DB (handles already-upgraded DBs)
    useEffect(() => {
        const ensureBalancesExist = async () => {
            const shop = await db.balances.get('shopBalance');
            const bank = await db.balances.get('bankBalance');
            if (!shop) await db.balances.put({ key: 'shopBalance', value: 0 });
            if (!bank) await db.balances.put({ key: 'bankBalance', value: 0 });
        };
        ensureBalancesExist();
    }, []);

    // Derive balances
    const getBalance = (key) => {
        if (!balancesArr) return 0;
        const entry = balancesArr.find((b) => b.key === key);
        return entry ? entry.value : 0;
    };

    const shopBalance = getBalance('shopBalance');
    const bankBalance = getBalance('bankBalance');
    const totalWithdrawn = allExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const currentCash = shopBalance + bankBalance - totalWithdrawn;

    // Save balance handler — put is an upsert (insert or replace)
    const saveBalance = async (key, value) => {
        await db.balances.put({ key, value });
    };

    // Delete an expense
    const deleteExpense = async (id) => {
        await db.expenses.delete(id);
    };

    // ── Export / Download Logic ──
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const now = new Date();
    const [dlMonth, setDlMonth] = useState(now.getMonth()); // 0-11
    const [dlYear, setDlYear] = useState(now.getFullYear());

    // Today's date — auto-updates daily
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    // Filter expenses by selected month
    const getMonthlyExpenses = () => {
        if (!allExpenses || allExpenses.length === 0) return [];
        return allExpenses
            .filter((e) => {
                const d = new Date(e.date);
                return d.getMonth() === dlMonth && d.getFullYear() === dlYear;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological order
    };

    const fmtDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const fileLabel = `${monthNames[dlMonth]}_${dlYear}`;

    // ── Excel Export (structured & neat) ──
    const exportExcel = () => {
        const monthly = getMonthlyExpenses();
        if (monthly.length === 0) return;

        const monthTotal = monthly.reduce((s, e) => s + e.amount, 0);

        const rows = [
            ['MAYILON JEWELLERS'],
            [`Monthly Expenses Report — ${monthNames[dlMonth]} ${dlYear}`],
            [],
            ['Shop Balance', formatCurrency(shopBalance), '', 'Bank Balance', formatCurrency(bankBalance)],
            ['Current Cash', formatCurrency(currentCash), '', 'Total Expenses', formatCurrency(monthTotal)],
            [],
            ['S.No', 'Date', 'Name', 'Reason', 'Amount (₹)'],
            ...monthly.map((e, i) => [
                i + 1,
                fmtDate(e.date),
                e.name,
                e.reason,
                e.amount,
            ]),
            [],
            ['', '', '', 'TOTAL', monthTotal],
        ];

        const ws = XLSX.utils.aoa_to_sheet(rows);
        // Column widths
        ws['!cols'] = [
            { wch: 6 },   // S.No
            { wch: 16 },  // Date
            { wch: 22 },  // Name
            { wch: 28 },  // Reason
            { wch: 16 },  // Amount
        ];
        // Merge title rows for nicer look
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // MAYILON JEWELLERS
            { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Report subtitle
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${monthNames[dlMonth]} ${dlYear}`);
        XLSX.writeFile(wb, `Expenses_${fileLabel}.xlsx`);
        setShowDownloadModal(false);
    };

    // ── PDF Export ──
    const exportPDF = () => {
        const monthly = getMonthlyExpenses();
        if (monthly.length === 0) return;

        const monthTotal = monthly.reduce((s, e) => s + e.amount, 0);
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('MAYILON JEWELLERS', 14, 18);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Monthly Expenses Report — ${monthNames[dlMonth]} ${dlYear}`, 14, 26);

        // Summary
        doc.setFontSize(10);
        doc.text(`Shop Balance: ${formatCurrency(shopBalance)}`, 14, 36);
        doc.text(`Bank Balance: ${formatCurrency(bankBalance)}`, 100, 36);
        doc.text(`Current Cash: ${formatCurrency(currentCash)}`, 14, 43);
        doc.text(`Month Total: ${formatCurrency(monthTotal)}`, 100, 43);

        // Table
        autoTable(doc, {
            startY: 50,
            head: [['S.No', 'Date', 'Name', 'Reason', 'Amount (₹)']],
            body: [
                ...monthly.map((e, i) => [
                    i + 1,
                    fmtDate(e.date),
                    e.name,
                    e.reason,
                    e.amount.toLocaleString('en-IN'),
                ]),
                ['', '', '', 'TOTAL', monthTotal.toLocaleString('en-IN')],
            ],
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [217, 119, 6], fontStyle: 'bold' },
            footStyles: { fontStyle: 'bold' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 14 },
                4: { halign: 'right', cellWidth: 28 },
            },
        });

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${today}`, 14, doc.internal.pageSize.height - 10);

        doc.save(`Expenses_${fileLabel}.pdf`);
        setShowDownloadModal(false);
    };

    // ── CSV Export ──
    const exportCSV = () => {
        const monthly = getMonthlyExpenses();
        if (monthly.length === 0) return;

        const monthTotal = monthly.reduce((s, e) => s + e.amount, 0);
        const headers = ['S.No', 'Date', 'Name', 'Reason', 'Amount (₹)'];
        const csvLines = [
            `MAYILON JEWELLERS — Monthly Expenses Report`,
            `Month: ${monthNames[dlMonth]} ${dlYear}`,
            `Shop Balance: ${shopBalance} | Bank Balance: ${bankBalance} | Current Cash: ${currentCash}`,
            '',
            headers.join(','),
            ...monthly.map((e, i) =>
                [i + 1, `"${fmtDate(e.date)}"`, `"${e.name}"`, `"${e.reason}"`, e.amount].join(',')
            ),
            '',
            `,,,"TOTAL",${monthTotal}`,
        ];
        const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Expenses_${fileLabel}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setShowDownloadModal(false);
    };

    return (
        <div className="page-container expenses-page">
            <PageHeader
                title="Expenses"
                subtitle={
                    <>
                        Track shop & bank balances and daily expenses
                        <time className="expenses-date-badge" dateTime={new Date().toISOString().split('T')[0]}>
                            <Calendar size={14} /> {today}
                        </time>
                    </>
                }
                action={
                    <div className="expenses-actions">
                        <Button variant="secondary" onClick={() => setShowDownloadModal(true)}>
                            <Download size={16} /> Download
                        </Button>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Add Expense
                        </Button>
                    </div>
                }
            />

            {/* ── Balance Cards ── */}
            <section className="expenses-balances-grid" aria-label="Balance overview">
                <EditableBalance
                    label="Shop Balance"
                    icon={Store}
                    colorClass="expenses-balance-card--shop"
                    value={shopBalance}
                    onSave={(v) => saveBalance('shopBalance', v)}
                />
                <EditableBalance
                    label="Bank Balance (SBI)"
                    icon={Landmark}
                    colorClass="expenses-balance-card--bank"
                    value={bankBalance}
                    onSave={(v) => saveBalance('bankBalance', v)}
                />
                <article className="expenses-balance-card expenses-balance-card--total">
                    <header className="expenses-balance-header">
                        <span className="expenses-balance-icon"><Wallet size={20} /></span>
                        <span className="expenses-balance-label">Current Cash</span>
                    </header>
                    <p className="expenses-balance-value">{formatCurrency(currentCash)}</p>
                    <p className="expenses-balance-formula">
                        {formatCurrency(shopBalance)} + {formatCurrency(bankBalance)} − {formatCurrency(totalWithdrawn)}
                    </p>
                </article>
            </section>

            {/* ── Expense History ── */}
            <Card title="Expense History">
                <div className="expenses-history">
                    {expenses?.map((exp) => (
                        <article key={exp.id} className="expenses-history-item">
                            <div className="expenses-history-left">
                                <p className="expenses-history-name">{exp.name}</p>
                                <p className="expenses-history-reason">{exp.reason}</p>
                                <time className="expenses-history-date">{formatDate(exp.date)}</time>
                            </div>
                            <div className="expenses-history-right">
                                <p className="expenses-history-amount">−{formatCurrency(exp.amount)}</p>
                                <button
                                    className="expenses-delete-btn"
                                    onClick={() => deleteExpense(exp.id)}
                                    aria-label={`Delete expense for ${exp.name}`}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </article>
                    ))}
                    {(!expenses || expenses.length === 0) && (
                        <div className="expenses-empty">
                            <Wallet size={40} />
                            <p>No expenses recorded yet</p>
                            <p className="expenses-empty-hint">Click "Add Expense" to get started</p>
                        </div>
                    )}
                </div>
            </Card>

            {showModal && <AddExpenseModal onClose={() => setShowModal(false)} />}

            {/* ── Download Month Picker Modal ── */}
            {showDownloadModal && (
                <div className="expenses-modal-overlay" onClick={() => setShowDownloadModal(false)}>
                    <section
                        className="expenses-modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-label="Download Expenses"
                    >
                        <header className="expenses-modal-header">
                            <h3>Download Monthly Report</h3>
                            <button className="expenses-modal-close" onClick={() => setShowDownloadModal(false)} aria-label="Close">
                                <X size={20} />
                            </button>
                        </header>

                        <div className="expenses-dl-picker">
                            <div className="expenses-field">
                                <label htmlFor="dl-month"><Calendar size={14} /> Month</label>
                                <select
                                    id="dl-month"
                                    value={dlMonth}
                                    onChange={(e) => setDlMonth(Number(e.target.value))}
                                >
                                    {monthNames.map((m, i) => (
                                        <option key={i} value={i}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="expenses-field">
                                <label htmlFor="dl-year"><Calendar size={14} /> Year</label>
                                <select
                                    id="dl-year"
                                    value={dlYear}
                                    onChange={(e) => setDlYear(Number(e.target.value))}
                                >
                                    {[2024, 2025, 2026, 2027, 2028].map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <p className="expenses-dl-preview">
                            {getMonthlyExpenses().length} expense(s) found for {monthNames[dlMonth]} {dlYear}
                        </p>

                        <nav className="expenses-dl-formats" aria-label="Download formats">
                            <button className="expenses-dl-format-btn expenses-dl-format-btn--excel" onClick={exportExcel}>
                                <FileSpreadsheet size={20} />
                                <span>Excel (.xlsx)</span>
                            </button>
                            <button className="expenses-dl-format-btn expenses-dl-format-btn--pdf" onClick={exportPDF}>
                                <FileDown size={20} />
                                <span>PDF (.pdf)</span>
                            </button>
                            <button className="expenses-dl-format-btn expenses-dl-format-btn--csv" onClick={exportCSV}>
                                <FileText size={20} />
                                <span>CSV (.csv)</span>
                            </button>
                        </nav>
                    </section>
                </div>
            )}
        </div>
    );
};

export default Expenses;
