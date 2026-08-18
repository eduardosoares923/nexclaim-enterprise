import React, { useState, useEffect } from 'react';
import { Vehicle, Person, Claim } from '../types';
import { extractTextFromPdf, firebaseService } from '../services/firebase';
import { SignaturePad } from '../components/SignaturePad';

export interface WorkOrderItem {
  id: string;
  description: string;
  type: 'Peça' | 'Mão de Obra' | 'Chapeação' | 'Pintura' | 'Mecânica';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  date: string;
  vehiclePlate: string;
  vehiclePrefix: string;
  driverName: string;
  workshopName: string;
  status: 'Orçamento' | 'Aprovada' | 'Em Execução' | 'Concluída' | 'Faturada';
  items: WorkOrderItem[];
  notes: string;
  budgetPdfUrl?: string;
  extractedPdfText?: string;
  signatureDataUrl?: string;
  requiresSignature?: boolean;
}

interface WorkOrdersViewProps {
  vehicles: Vehicle[];
  people: Person[];
  claims: Claim[];
  orders: WorkOrder[];
  onSaveOrder: (data: Omit<WorkOrder, 'id'>) => void;
  onUpdateOrder: (id: string, data: Partial<WorkOrder>) => void;
  onDeleteOrder: (id: string) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  vehicles,
  people,
  claims,
  orders = [],
  onSaveOrder,
  onUpdateOrder,
  onDeleteOrder,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);

  // Form state
  const [newPlate, setNewPlate] = useState(vehicles[0]?.plate || 'JCO8C10');
  const [newDriver, setNewDriver] = useState(people[0]?.name || 'ANDREIA MERCEDES ROCHA DE ARAUJO');
  const [newWorkshop, setNewWorkshop] = useState('Oficina Central Trans Pinho Gravataí');
  const [newStatus, setNewStatus] = useState<WorkOrder['status']>('Orçamento');
  const [newItems, setNewItems] = useState<WorkOrderItem[]>([
    { id: '1', description: 'Mão de Obra de Chapeação', type: 'Chapeação', quantity: 1, unitPrice: 500, total: 500 },
  ]);
  const [newNotes, setNewNotes] = useState('');

  // PDF & Signature states
  const [budgetPdfUrl, setBudgetPdfUrl] = useState<string>('');
  const [extractedPdfText, setExtractedPdfText] = useState<string>('');
  const [isExtractingPdf, setIsExtractingPdf] = useState<boolean>(false);
  const [newSignature, setNewSignature] = useState<string | null>(null);
  const [newRequiresSignature, setNewRequiresSignature] = useState<boolean>(true);

  // Sync form inputs when editingOrder changes
  useEffect(() => {
    if (editingOrder) {
      setNewPlate(editingOrder.vehiclePlate || vehicles[0]?.plate || '');
      setNewDriver(editingOrder.driverName || people[0]?.name || '');
      setNewWorkshop(editingOrder.workshopName || 'Oficina Central Trans Pinho Gravataí');
      setNewStatus(editingOrder.status || 'Orçamento');
      setNewItems(
        editingOrder.items && editingOrder.items.length > 0
          ? editingOrder.items
          : [{ id: '1', description: 'Mão de Obra de Chapeação', type: 'Chapeação', quantity: 1, unitPrice: 500, total: 500 }]
      );
      setNewNotes(editingOrder.notes || '');
      setBudgetPdfUrl(editingOrder.budgetPdfUrl || '');
      setExtractedPdfText(editingOrder.extractedPdfText || '');
      setNewSignature(editingOrder.signatureDataUrl || null);
      setNewRequiresSignature(
        editingOrder.requiresSignature !== undefined ? editingOrder.requiresSignature : true
      );
    } else {
      setNewPlate(vehicles[0]?.plate || 'JCO8C10');
      setNewDriver(people[0]?.name || 'ANDREIA MERCEDES ROCHA DE ARAUJO');
      setNewWorkshop('Oficina Central Trans Pinho Gravataí');
      setNewStatus('Orçamento');
      setNewItems([
        { id: '1', description: 'Mão de Obra de Chapeação', type: 'Chapeação', quantity: 1, unitPrice: 500, total: 500 },
      ]);
      setNewNotes('');
      setBudgetPdfUrl('');
      setExtractedPdfText('');
      setNewSignature(null);
      setNewRequiresSignature(true);
    }
  }, [editingOrder, vehicles, people]);

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingOrder(null);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingPdf(true);
    try {
      // 1. Extrair texto do PDF com pdfjs-dist
      const text = await extractTextFromPdf(file);
      setExtractedPdfText(text);

      // 2. Upload do arquivo original para o Cloud Storage
      const url = await firebaseService.uploadFile(file, 'work-orders');
      if (url) {
        setBudgetPdfUrl(url);
      }
    } catch (err: any) {
      alert(`Erro ao processar PDF: ${err?.message || err}`);
    } finally {
      setIsExtractingPdf(false);
      e.target.value = '';
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const calculateTotal = (items: WorkOrderItem[]) =>
    items.reduce((acc, item) => acc + (item.total || 0), 0);

  const handleAddItem = () => {
    setNewItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        description: '',
        type: 'Peça',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof WorkOrderItem, value: any) => {
    setNewItems((prev) => {
      const copy = [...prev];
      const current = { ...copy[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        current.total = (Number(current.quantity) || 0) * (Number(current.unitPrice) || 0);
      }
      copy[index] = current;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setNewItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedV = vehicles.find((v) => v.plate === newPlate);

    if (editingOrder) {
      onUpdateOrder(editingOrder.id, {
        vehiclePlate: newPlate,
        vehiclePrefix: matchedV?.prefix || editingOrder.vehiclePrefix || '',
        driverName: newDriver,
        workshopName: newWorkshop,
        status: newStatus,
        items: newItems,
        notes: newNotes,
        budgetPdfUrl: budgetPdfUrl || undefined,
        extractedPdfText: extractedPdfText || undefined,
        signatureDataUrl: newRequiresSignature ? (newSignature || undefined) : undefined,
        requiresSignature: newRequiresSignature,
      });
    } else {
      const orderData: Omit<WorkOrder, 'id'> = {
        orderNumber: `OS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        date: new Date().toISOString().split('T')[0],
        vehiclePlate: newPlate,
        vehiclePrefix: matchedV?.prefix || '24127',
        driverName: newDriver,
        workshopName: newWorkshop,
        status: 'Orçamento',
        items: newItems,
        notes: newNotes,
        budgetPdfUrl: budgetPdfUrl || undefined,
        extractedPdfText: extractedPdfText || undefined,
        signatureDataUrl: newRequiresSignature ? (newSignature || undefined) : undefined,
        requiresSignature: newRequiresSignature,
      };
      onSaveOrder(orderData);
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="badge bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded border border-amber-300 uppercase tracking-wider">
            Manutenção & Reparação • Trans Pinho
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Orçamentos & Ordens de Serviço (OS Chapeação)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Discriminação de peças, mão de obra, chapeação e pintura de avarias da frota.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingOrder(null);
            setShowCreateModal(true);
          }}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition active:scale-95"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Nova Ordem de Serviço</span>
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orders.map((order) => {
          const totalVal = calculateTotal(order.items);
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-400 transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-base">{order.orderNumber}</span>
                  <span className="ml-2 text-xs text-slate-500">{order.date}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    order.status === 'Aprovada'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : order.status === 'Concluída' || order.status === 'Faturada'
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : order.status === 'Em Execução'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700">
                <p>
                  <strong>Veículo / Prefixo:</strong>{' '}
                  <span className="font-mono font-bold text-slate-900">{order.vehiclePlate}</span> (Prefixo{' '}
                  {order.vehiclePrefix})
                </p>
                <p>
                  <strong>Condutor:</strong> {order.driverName}
                </p>
                <p>
                  <strong>Oficina / Prestador:</strong> {order.workshopName}
                </p>
                {order.budgetPdfUrl && (
                  <p className="text-amber-800 font-semibold flex items-center gap-1 mt-1 pt-1 border-t border-slate-200">
                    <i className="fa-solid fa-file-pdf text-rose-500"></i>
                    <span>Possui Orçamento PDF anexado</span>
                  </p>
                )}
                {order.signatureDataUrl && (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1">
                    <i className="fa-solid fa-signature text-emerald-600"></i>
                    <span>Assinatura Digital Registrada</span>
                  </p>
                )}
              </div>

              {/* Items summary */}
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="text-[11px] font-bold uppercase text-slate-400">Itens / Serviços ({order.items.length})</div>
                {order.items.slice(0, 3).map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-600">
                    <span className="truncate max-w-[220px]">
                      {it.quantity}x {it.description}
                    </span>
                    <span className="font-semibold text-slate-900">{formatCurrency(it.total)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="text-[10px] text-amber-600 font-semibold">+ {order.items.length - 3} outros itens</div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total da OS</span>
                  <div className="text-base font-black text-slate-900">{formatCurrency(totalVal)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingOrder(order)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition border border-slate-200"
                    title="Editar OS"
                  >
                    <i className="fa-solid fa-pen-to-square text-slate-600"></i>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <i className="fa-solid fa-print text-amber-400"></i>
                    <span>Ver OS / Imprimir</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal View / Print OS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  OS
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase text-white">{selectedOrder.orderNumber}</h3>
                  <span className="text-[10px] text-amber-400">Ordem de Serviço Oficial de Chapeação e Pintura</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition"
                >
                  <i className="fa-solid fa-print"></i> Imprimir OS
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>
            </div>

            {/* Printable Sheet */}
            <div className="p-8 sm:p-12 overflow-y-auto max-h-[75vh] bg-white print:p-0 print:max-h-none font-sans text-slate-900 leading-relaxed space-y-6">
              {/* Header Empresa */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h1 className="text-base font-black uppercase text-slate-950">
                  JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)
                </h1>
                <p className="text-xs text-slate-600">Rua Florida, 116 – Nossa Chácara – Gravataí/ RS</p>
                <p className="text-xs text-slate-600">Telefone: (051) 3047-0212 / (051) 98266-0028</p>
                <h2 className="text-sm font-bold uppercase mt-3 tracking-wider bg-slate-100 py-1 border border-slate-300">
                  ORDEM DE SERVIÇO & ORÇAMENTO DE REPARO • {selectedOrder.orderNumber}
                </h2>
              </div>

              {/* Link para Orçamento Original PDF (se existir) */}
              {selectedOrder.budgetPdfUrl && (
                <div className="print:hidden flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-amber-950 font-bold">
                    <i className="fa-solid fa-file-pdf text-rose-500 text-base"></i>
                    <span>Documento de Orçamento Original da Oficina em Anexo</span>
                  </div>
                  <a
                    href={selectedOrder.budgetPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> Ver Orçamento Original (PDF)
                  </a>
                </div>
              )}

              {/* Dados do Veículo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Placa</span>
                  <span className="font-mono font-bold text-slate-900">{selectedOrder.vehiclePlate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Prefixo</span>
                  <span className="font-bold text-slate-900">{selectedOrder.vehiclePrefix}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Data</span>
                  <span>{selectedOrder.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="font-bold text-amber-700">{selectedOrder.status}</span>
                </div>
              </div>

              {/* Tabela de Itens */}
              <div>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Tipo</th>
                      <th className="p-2 border-r border-slate-300">Descrição da Peça / Serviço</th>
                      <th className="p-2 border-r border-slate-300 text-center">Qtd</th>
                      <th className="p-2 border-r border-slate-300 text-right">Valor Unitário</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border-r border-slate-200 font-semibold text-[11px]">{it.type}</td>
                        <td className="p-2 border-r border-slate-200">{it.description}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-bold">{it.quantity}</td>
                        <td className="p-2 border-r border-slate-200 text-right">{formatCurrency(it.unitPrice)}</td>
                        <td className="p-2 text-right font-bold text-slate-900">{formatCurrency(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black text-sm border-t-2 border-slate-900">
                      <td colSpan={4} className="p-2 text-right uppercase">
                        Valor Total Geral:
                      </td>
                      <td className="p-2 text-right text-slate-950">
                        {formatCurrency(calculateTotal(selectedOrder.items))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Observações */}
              {selectedOrder.notes && (
                <div className="text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <strong>Observações:</strong> {selectedOrder.notes}
                </div>
              )}

              {/* Assinaturas */}
              <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs">
                <div className="border-t border-slate-900 pt-2">
                  <p className="font-bold uppercase text-slate-900">{selectedOrder.workshopName}</p>
                  <p className="text-[10px] text-slate-500">Oficina Responsável</p>
                </div>

                {selectedOrder.requiresSignature === false ? (
                  <div className="pt-4 flex items-center justify-center">
                    <span className="text-[11px] text-slate-500 italic">
                      Assinatura não exigida para esta Ordem de Serviço
                    </span>
                  </div>
                ) : (
                  <div className="border-t border-slate-900 pt-2 flex flex-col items-center">
                    {selectedOrder.signatureDataUrl && (
                      <img
                        src={selectedOrder.signatureDataUrl}
                        alt="Assinatura de Aprovação"
                        className="h-12 max-h-12 object-contain mb-1"
                      />
                    )}
                    <p className="font-bold uppercase text-slate-900">{selectedOrder.driverName}</p>
                    <p className="text-[10px] text-slate-500">Aprovação / Trans Pinho</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create / Edit OS */}
      {(showCreateModal || editingOrder !== null) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <i className="fa-solid fa-wrench text-amber-500"></i>
                {editingOrder
                  ? `Editar Ordem de Serviço ${editingOrder.orderNumber}`
                  : 'Nova Ordem de Serviço & Orçamento'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-700">
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Veículo / Prefixo *</label>
                  <select
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold text-slate-900"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.plate}>
                        {v.plate} • Prefixo {v.prefix} ({v.model})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condutor *</label>
                  <select
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-semibold text-slate-900"
                  >
                    {people.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={editingOrder ? 'grid grid-cols-2 gap-3' : ''}>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Oficina / Prestador de Serviço</label>
                  <input
                    type="text"
                    value={newWorkshop}
                    onChange={(e) => setNewWorkshop(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                {editingOrder && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status da Ordem de Serviço *</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as WorkOrder['status'])}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-bold text-slate-900"
                    >
                      <option value="Orçamento">Orçamento</option>
                      <option value="Aprovada">Aprovada</option>
                      <option value="Em Execução">Em Execução</option>
                      <option value="Concluída">Concluída</option>
                      <option value="Faturada">Faturada</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Importar Orçamento (PDF) Section */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                      <i className="fa-solid fa-file-pdf text-rose-500"></i>
                      Importar Orçamento (PDF)
                    </span>
                    <p className="text-[11px] text-amber-800">
                      Anexe o orçamento da oficina para extrair o texto automaticamente e arquivar o documento.
                    </p>
                  </div>

                  <label className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition cursor-pointer self-start sm:self-auto">
                    <i className={`fa-solid ${isExtractingPdf ? 'fa-spinner fa-spin' : 'fa-upload'}`}></i>
                    <span>{isExtractingPdf ? 'Lendo PDF...' : 'Selecionar PDF'}</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      disabled={isExtractingPdf}
                      className="hidden"
                    />
                  </label>
                </div>

                {budgetPdfUrl && (
                  <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 p-2 rounded border border-emerald-200">
                    <i className="fa-solid fa-circle-check text-emerald-600"></i>
                    <span>PDF anexado com sucesso.</span>
                    <a
                      href={budgetPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline ml-auto font-bold text-emerald-900 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Ver PDF Anexado
                    </a>
                  </div>
                )}

                {extractedPdfText && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] text-amber-900 font-semibold flex items-center justify-between">
                      <span>Texto Extraído do PDF:</span>
                      <button
                        type="button"
                        onClick={() => setExtractedPdfText('')}
                        className="text-amber-800 hover:text-rose-600 text-[10px]"
                      >
                        Ocultar texto
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-600 bg-amber-100/50 p-1.5 rounded border border-amber-200">
                      ⚠️ Texto extraído do PDF. Confira os valores e preencha os itens abaixo manualmente, a extração automática de tabelas não é sempre precisa.
                    </p>
                    <textarea
                      readOnly
                      value={extractedPdfText}
                      rows={4}
                      className="w-full p-2 text-[10px] font-mono bg-white border border-slate-300 rounded leading-tight text-slate-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Items list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Discriminação de Peças e Serviços</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1"
                  >
                    <i className="fa-solid fa-plus"></i> Adicionar Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {newItems.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div className="col-span-3">
                        <select
                          value={item.type}
                          onChange={(e) => handleUpdateItem(idx, 'type', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded bg-white text-[11px]"
                        >
                          <option value="Peça">Peça</option>
                          <option value="Chapeação">Chapeação</option>
                          <option value="Pintura">Pintura</option>
                          <option value="Mão de Obra">Mão de Obra</option>
                          <option value="Mecânica">Mecânica</option>
                        </select>
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Descrição do item"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded bg-white text-[11px]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qtd"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded bg-white text-[11px] text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Valor Un."
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded bg-white text-[11px] text-right font-bold"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-right font-bold text-slate-900 text-xs pt-2">
                  Total Estimado: <span className="text-sm font-black">{formatCurrency(calculateTotal(newItems))}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações do Sinistro / Reparo</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                  placeholder="Ex: Danos decorrentes de colisão traseira. Peças genuínas solicitadas."
                ></textarea>
              </div>

              {/* Seção de Assinatura com Toggle */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newRequiresSignature}
                      onChange={(e) => setNewRequiresSignature(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
                    />
                    <span className="font-bold text-xs text-slate-900">
                      Exigir Assinatura de Aprovação nesta OS
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {newRequiresSignature ? 'Assinatura ativa' : 'Isenta de assinatura'}
                  </span>
                </div>

                {newRequiresSignature ? (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <label className="block font-bold text-slate-700 text-xs">
                      Assinatura do Responsável pela Aprovação:
                    </label>
                    <SignaturePad
                      value={newSignature}
                      onChange={(dataUrl) => setNewSignature(dataUrl)}
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-100 rounded text-center text-xs text-slate-500 italic">
                    Assinatura não exigida para esta OS.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-lg shadow-sm"
                >
                  {editingOrder ? 'Salvar Alterações' : 'Salvar Ordem de Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersView;
