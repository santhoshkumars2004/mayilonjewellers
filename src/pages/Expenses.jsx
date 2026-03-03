import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useShop } from '../context/ShopContext';
import { Card, Button, PageHeader } from '../components/common/UI';
import { Plus, X, Store, Landmark, Wallet, Pencil, Check, Trash2, Calendar, User, FileText, IndianRupee } from 'lucide-react';

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
    const balancesArr = useLiveQuery(() => db.balances.toArray(), []);
    const expenses = useLiveQuery(() => db.expenses.orderBy('date').reverse().toArray(), []);
    const allExpenses = useLiveQuery(() => db.expenses.toArray(), []);

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

    // Today's date — auto-updates daily
    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

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
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add Expense
                    </Button>
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
        </div>
    );
};

export default Expenses;
