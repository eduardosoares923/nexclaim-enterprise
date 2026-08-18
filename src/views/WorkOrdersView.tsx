import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Vehicle, Person, Claim } from '../types';
import { extractTextFromPdf, extrairItensDoTexto, firebaseService } from '../services/firebase';
import { SignaturePad } from '../components/SignaturePad';

export const COMPANY_BRANDS: Record<string, {
  name: string;
  subtitle: string;
  address: string;
  phone: string;
  initials: string;
  defaultPaymentPhone: string;
  defaultPaymentBank: string;
  defaultPaymentHolderName: string;
}> = {
  'trans-pinho': {
    name: 'JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)',
    subtitle: '',
    address: 'Rua Florida, 116 – Nossa Chácara – Gravataí/ RS',
    phone: '(051) 3047-0212 / (051) 98266-0028',
    initials: 'TP',
    defaultPaymentPhone: '',
    defaultPaymentBank: '',
    defaultPaymentHolderName: '',
  },
  'vieira-center': {
    name: 'VIEIRA CENTER',
    subtitle: 'FUNILARIA, CHAPEAÇÃO E ESTÉTICA AUTOMOTIVA',
    address: '',
    phone: '',
    initials: 'VC',
    defaultPaymentPhone: '(51) 99432-4224',
    defaultPaymentBank: 'Itaú Unibanco',
    defaultPaymentHolderName: 'Fabiano da Silva Vieira',
  },
};

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
  companyBrand?: keyof typeof COMPANY_BRANDS | string;
  paymentPhone?: string;
  paymentBank?: string;
  paymentHolderName?: string;
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
  const [newCompanyBrand, setNewCompanyBrand] = useState<string>('trans-pinho');
  const [newPlate, setNewPlate] = useState(vehicles[0]?.plate || 'JCO8C10');
  const [newDriver, setNewDriver] = useState(people[0]?.name || 'ANDREIA MERCEDES ROCHA DE ARAUJO');
  const [newWorkshop, setNewWorkshop] = useState('Oficina Central Trans Pinho Gravataí');
  const [newStatus, setNewStatus] = useState<WorkOrder['status']>('Orçamento');
  const [newPaymentPhone, setNewPaymentPhone] = useState<string>('');
  const [newPaymentBank, setNewPaymentBank] = useState<string>('');
  const [newPaymentHolderName, setNewPaymentHolderName] = useState<string>('');
  const [newItems, setNewItems] = useState<WorkOrderItem[]>([
    { id: '1', description: 'Mão de Obra de Chapeação', type: 'Chapeação', quantity: 1, unitPrice: 500, total: 500 },
  ]);
  const [newNotes, setNewNotes] = useState('');

  // PDF & Signature states
  const [budgetPdfUrl, setBudgetPdfUrl] = useState<string>('');
  const [extractedPdfText, setExtractedPdfText] = useState<string>('');
  const [detectedPdfItems, setDetectedPdfItems] = useState<
    Array<{ id: string; description: string; quantity: number; unitPrice: number; total: number; selected: boolean }>
  >([]);
  const [isExtractingPdf, setIsExtractingPdf] = useState<boolean>(false);
  const [newSignature, setNewSignature] = useState<string | null>(null);
  const [newRequiresSignature, setNewRequiresSignature] = useState<boolean>(true);

  // Sync form inputs when editingOrder changes
  useEffect(() => {
    if (editingOrder) {
      const brandKey = editingOrder.companyBrand || 'trans-pinho';
      setNewCompanyBrand(brandKey);
      setNewPlate(editingOrder.vehiclePlate || vehicles[0]?.plate || '');
      setNewDriver(editingOrder.driverName || people[0]?.name || '');
      setNewWorkshop(editingOrder.workshopName || 'Oficina Central Trans Pinho Gravataí');
      setNewStatus(editingOrder.status || 'Orçamento');
      setNewPaymentPhone(editingOrder.paymentPhone || '');
      setNewPaymentBank(editingOrder.paymentBank || '');
      setNewPaymentHolderName(editingOrder.paymentHolderName || '');
      setNewItems(
        editingOrder.items && editingOrder.items.length > 0
          ? editingOrder.items
          : [{ id: '1', description: 'Mão de Obra de Chapeação', type: 'Chapeação', quantity: 1, unitPrice: 500, total: 500 }]
      );
      setNewNotes(editingOrder.notes || '');
      setBudgetPdfUrl(editingOrder.budgetPdfUrl || '');
      setExtractedPdfText(editingOrder.extractedPdfText || '');
      setDetectedPdfItems([]);
      setNewSignature(editingOrder.signatureDataUrl || null);
      setNewRequiresSignature(
        editingOrder.requiresSignature !== undefined ? editingOrder.requiresSignature : true
      );
    } else {
      setNewCompanyBrand('trans-pinho');
      setNewPlate(vehicles[0]?.plate || 'JCO8C10');
      setNewDriver(people[0]?.name || 'ANDREIA MERCEDES ROCHA DE ARAUJO');
      setNewWorkshop('Oficina Central Trans Pinho Gravataí');
      setNewStatus('Orçamento');
      setNewPaymentPhone('');
      setNewPaymentBank('');
      setNewPaymentHolderName('');
      setNewItems([
        { id: '1', description: 'Mão de Obra de Chapeação', type: 'Chapeação', quantity: 1, unitPrice: 500, total: 500 },
      ]);
      setNewNotes('');
      setBudgetPdfUrl('');
      setExtractedPdfText('');
      setDetectedPdfItems([]);
      setNewSignature(null);
      setNewRequiresSignature(true);
    }
  }, [editingOrder, vehicles, people]);

  const handleCompanyBrandChange = (newBrandKey: string) => {
    setNewCompanyBrand(newBrandKey);
    const brandConfig = COMPANY_BRANDS[newBrandKey];
    if (brandConfig) {
      // Se os campos ainda estiverem vazios (não digitados manualmente), preenche automaticamente
      if (!newPaymentPhone.trim() && !newPaymentBank.trim() && !newPaymentHolderName.trim()) {
        setNewPaymentPhone(brandConfig.defaultPaymentPhone || '');
        setNewPaymentBank(brandConfig.defaultPaymentBank || '');
        setNewPaymentHolderName(brandConfig.defaultPaymentHolderName || '');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingOrder(null);
    setDetectedPdfItems([]);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingPdf(true);
    try {
      // 1. Extrair texto do PDF com pdfjs-dist
      const text = await extractTextFromPdf(file);
      setExtractedPdfText(text);

      // 2. Extrair itens do formato de orçamento
      const itensDetectados = extrairItensDoTexto(text);
      if (itensDetectados.length > 0) {
        setDetectedPdfItems(
          itensDetectados.map((it, idx) => ({
            id: `det-${Date.now()}-${idx}`,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.quantity * it.unitPrice,
            selected: true,
          }))
        );
      } else {
        setDetectedPdfItems([]);
      }

      // 3. Upload do arquivo original para o Cloud Storage
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

  const handleAddSelectedPdfItems = () => {
    const selected = detectedPdfItems.filter((it) => it.selected);
    if (selected.length === 0) return;

    const newItemsToAdd: WorkOrderItem[] = selected.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      description: it.description,
      type: 'Peça',
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.quantity * it.unitPrice,
    }));

    setNewItems((prev) => {
      const isOnlyDefault =
        prev.length === 1 &&
        prev[0].description === 'Mão de Obra de Chapeação' &&
        prev[0].unitPrice === 500;
      return isOnlyDefault ? newItemsToAdd : [...prev, ...newItemsToAdd];
    });

    setDetectedPdfItems([]);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const calculateTotal = (items: WorkOrderItem[]) =>
    items.reduce((acc, item) => acc + (item.total || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovada': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Concluída': case 'Faturada': return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'Em Execução': return 'bg-indigo-50 text-indigo-700 border-indigo-300';
      default: return 'bg-amber-50 text-amber-800 border-amber-300';
    }
  };

  const handlePrintOrder = () => {
    const tituloOriginal = document.title;
    document.title = `OS-${selectedOrder?.orderNumber || 'documento'}`;
    window.print();
    setTimeout(() => {
      document.title = tituloOriginal;
    }, 500);
  };

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
        companyBrand: newCompanyBrand,
        paymentPhone: newPaymentPhone || undefined,
        paymentBank: newPaymentBank || undefined,
        paymentHolderName: newPaymentHolderName || undefined,
      });
    } else {
      const orderCount = orders.length + 1;
      const orderNumber = `OS-${new Date().getFullYear()}-${String(orderCount).padStart(3, '0')}`;
      onSaveOrder({
        orderNumber,
        date: new Date().toISOString().split('T')[0],
        vehiclePlate: newPlate,
        vehiclePrefix: matchedV?.prefix || 'TP-000',
        driverName: newDriver,
        workshopName: newWorkshop,
        status: 'Orçamento',
        items: newItems,
        notes: newNotes,
        budgetPdfUrl: budgetPdfUrl || undefined,
        extractedPdfText: extractedPdfText || undefined,
        signatureDataUrl: newRequiresSignature ? (newSignature || undefined) : undefined,
        requiresSignature: newRequiresSignature,
        companyBrand: newCompanyBrand,
        paymentPhone: newPaymentPhone || undefined,
        paymentBank: newPaymentBank || undefined,
        paymentHolderName: newPaymentHolderName || undefined,
      });
    }

    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-wrench text-amber-500"></i>
            <span>Ordens de Serviço & Orçamentos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão oficial de consertos, chapeação, pintura e compras vinculadas à frota Trans Pinho e Vieira Center.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingOrder(null);
            setShowCreateModal(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition self-stretch sm:self-auto justify-center"
        >
          <i className="fa-solid fa-plus text-amber-400"></i>
          <span>Nova Ordem de Serviço</span>
        </button>
      </div>

      {/* Grid of Work Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const totalVal = calculateTotal(order.items || []);
          const brandConfig = COMPANY_BRANDS[order.companyBrand || 'trans-pinho'] || COMPANY_BRANDS['trans-pinho'];

          return (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {order.orderNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                      {brandConfig.initials}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                    <i className="fa-solid fa-truck-front text-slate-400 text-xs"></i>
                    <span>{order.vehiclePlate}</span>
                    <span className="text-slate-400 font-normal text-xs">({order.vehiclePrefix})</span>
                  </h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    <i className="fa-solid fa-user-gear mr-1 text-slate-400"></i>
                    {order.driverName}
                  </p>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1 border border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Oficina:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">{order.workshopName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Itens / Peças:</span>
                    <span className="font-bold text-slate-800">{order.items?.length || 0} item(ns)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Data:</span>
                    <span>{order.date}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Total</span>
                  <div className="text-base font-black text-slate-900">{formatCurrency(totalVal)}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingOrder(order)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition border border-slate-200"
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Editar
                  </button>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition"
                  >
                    <i className="fa-solid fa-eye"></i> Detalhes
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Tem certeza que deseja excluir a Ordem de Serviço ${order.orderNumber}? Essa ação não pode ser desfeita.`)) {
                        onDeleteOrder(order.id);
                      }
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition border border-rose-200"
                    title="Excluir Ordem de Serviço"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal View / Print OS */}
      {selectedOrder && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full my-8 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
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
                  onClick={handlePrintOrder}
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
            {(() => {
              const brand = COMPANY_BRANDS[selectedOrder.companyBrand || 'trans-pinho'] || COMPANY_BRANDS['trans-pinho'];
              const mostrarCliente = (selectedOrder.companyBrand || 'trans-pinho') !== 'trans-pinho';
              const TIPO_SIGLA: Record<string, string> = { 'Mão de Obra': 'MO', 'Chapeação': 'CHP', 'Pintura': 'PNT', 'Mecânica': 'MEC', 'Peça': 'PC' };
              const itensServico = selectedOrder.items.filter((it) => it.type !== 'Peça');
              const itensPeca = selectedOrder.items.filter((it) => it.type === 'Peça');
              const totalServicos = itensServico.reduce((acc, it) => acc + (it.total || 0), 0);
              const totalPecas = itensPeca.reduce((acc, it) => acc + (it.total || 0), 0);

              return (
                <div className="trans-pinho-doc p-8 sm:p-12 overflow-y-auto max-h-[75vh] bg-white print:p-0 print:max-h-none font-sans text-slate-900 leading-relaxed space-y-6">
                  {/* 1. Faixa Superior e Cabeçalho */}
                  <div className="-mx-8 sm:-mx-12 -mt-8 sm:-mt-12 mb-4 h-1.5 bg-blue-500 print:mx-0 print:mt-0" />
                  <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-base shrink-0">
                        {brand.initials}
                      </div>
                      <div>
                        <h1 className="text-base font-black uppercase text-slate-950 tracking-tight leading-tight">{brand.name}</h1>
                        {brand.subtitle && <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">{brand.subtitle}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Detalhes de Serviço</span>
                      <p className="text-xs text-slate-600 mt-1">OS Nº <span className="font-black text-slate-900">{selectedOrder.orderNumber}</span></p>
                      <p className="text-xs text-slate-600">Data <span className="font-bold text-slate-900">{selectedOrder.date}</span></p>
                    </div>
                  </div>

                  {/* 2. Caixas de Dados (Cliente/Condutor + Veículo) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
                      <span className="text-[10px] font-bold uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                        <i className="fa-solid fa-user"></i> {mostrarCliente ? 'Dados do Cliente' : 'Dados do Condutor'}
                      </span>
                      <div className="mt-1.5 text-xs space-y-0.5">
                        {mostrarCliente ? (
                          <>
                            <p className="font-bold text-slate-900">JOÃO BATISTA DE SOUZA PINHO EPP (TRANS PINHO)</p>
                            <p className="text-slate-600">CNPJ: 94.476.207/0001-80</p>
                            <p className="text-slate-600">Tel: (051) 3047-0212 / (051) 98266-0028</p>
                            <p className="text-slate-600">E-mail: operacional@transpinho.com</p>
                          </>
                        ) : (
                          <p className="font-bold text-slate-900">{selectedOrder.driverName}</p>
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
                      <span className="text-[10px] font-bold uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                        <i className="fa-solid fa-truck"></i> Dados do Veículo
                      </span>
                      <div className="mt-1.5 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Placa</span>
                          <span className="font-mono font-bold text-slate-900">{selectedOrder.vehiclePlate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Prefixo</span>
                          <span className="font-bold text-slate-900">{selectedOrder.vehiclePrefix}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Relatório Técnico (se houver observações) */}
                  {selectedOrder.notes && (
                    <div className="p-3 bg-slate-50 border-l-4 border-blue-500 rounded-r-lg">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">Relatório Técnico</span>
                      <p className="text-xs text-slate-700 leading-relaxed">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* 4. Link para Orçamento Original PDF (se existir) */}
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

                  {/* 5. Tabela de Serviços */}
                  {itensServico.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1.5">Serviços & Peças</span>
                      <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-900 text-white">
                          <tr>
                            <th className="p-2">Tipo</th>
                            <th className="p-2">Descrição</th>
                            <th className="p-2 text-center">Qtd</th>
                            <th className="p-2 text-right">V. Unit</th>
                            <th className="p-2 text-right">V. Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 [&>tr:nth-child(even)]:bg-slate-50">
                          {itensServico.map((it, idx) => (
                            <tr key={idx}>
                              <td className="p-2"><span className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-bold text-slate-700">{TIPO_SIGLA[it.type] || it.type}</span></td>
                              <td className="p-2">{it.description || <span className="text-slate-400 italic">Sem descrição detalhada</span>}</td>
                              <td className="p-2 text-center font-bold">{it.quantity}</td>
                              <td className="p-2 text-right">{formatCurrency(it.unitPrice)}</td>
                              <td className="p-2 text-right font-bold text-slate-900">{formatCurrency(it.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 6. Tabela de Peças / Materiais */}
                  {itensPeca.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider block mb-1.5">Peças & Materiais</span>
                      <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-emerald-50 text-emerald-900 border-b border-emerald-200">
                          <tr>
                            <th className="p-2">Item</th>
                            <th className="p-2 text-center">Und</th>
                            <th className="p-2 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {itensPeca.map((it, idx) => (
                            <tr key={idx}>
                              <td className="p-2">{it.description || <span className="text-slate-400 italic">Sem descrição</span>}</td>
                              <td className="p-2 text-center font-bold">{it.quantity}</td>
                              <td className="p-2 text-right font-bold text-emerald-700">{formatCurrency(it.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 7. Rodapé: Pagamento + Resumo Financeiro */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    {(selectedOrder.paymentPhone || selectedOrder.paymentBank || selectedOrder.paymentHolderName) ? (
                      <div className="text-xs p-3 bg-amber-50 border-l-4 border-amber-500 border-t border-r border-b border-slate-200 rounded-r-lg space-y-1">
                        <span className="font-bold uppercase text-[10px] text-amber-800 flex items-center gap-1.5">
                          <i className="fa-solid fa-money-bill-wave"></i> Pagamento
                        </span>
                        {selectedOrder.paymentPhone && <p><span className="text-slate-500">Chave PIX:</span> <span className="font-bold">{selectedOrder.paymentPhone}</span></p>}
                        {selectedOrder.paymentBank && <p><span className="text-slate-500">Banco:</span> <span className="font-bold">{selectedOrder.paymentBank}</span></p>}
                        {selectedOrder.paymentHolderName && <p><span className="text-slate-500">Favorecido:</span> <span className="font-bold">{selectedOrder.paymentHolderName}</span></p>}
                      </div>
                    ) : <div />}

                    <div className="text-xs space-y-1.5">
                      {totalServicos > 0 && (
                        <div className="flex justify-between"><span className="text-slate-500">Serviços / Mão de Obra</span><span className="font-bold text-slate-900">{formatCurrency(totalServicos)}</span></div>
                      )}
                      {totalPecas > 0 && (
                        <div className="flex justify-between"><span className="text-emerald-700">Peças & Materiais</span><span className="font-bold text-emerald-700">{formatCurrency(totalPecas)}</span></div>
                      )}
                      <div className="flex justify-between items-center bg-slate-900 text-white px-3 py-2 rounded-lg mt-2">
                        <span className="text-xs font-bold uppercase">Valor Total</span>
                        <span className="text-base font-black text-amber-400">{formatCurrency(calculateTotal(selectedOrder.items))}</span>
                      </div>
                    </div>
                  </div>

                  {/* 8. Rodapé de Texto Legal */}
                  <p className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    Este documento é um detalhamento técnico dos serviços prestados. A garantia de peças e serviços obedece à legislação em vigor.
                  </p>

                  {/* Assinaturas */}
                  {selectedOrder.requiresSignature !== false && (
                    <div className="grid grid-cols-2 gap-8 pt-10 text-center text-xs">
                      <div className="border-t border-slate-900 pt-2">
                        <p className="font-bold uppercase text-slate-900">{selectedOrder.workshopName}</p>
                        <p className="text-[10px] text-slate-500">Oficina Responsável</p>
                      </div>
                      <div className="border-t border-slate-900 pt-2 flex flex-col items-center">
                        {selectedOrder.signatureDataUrl && (
                          <img
                            src={selectedOrder.signatureDataUrl}
                            alt="Assinatura de Aprovação"
                            className="h-12 max-h-12 object-contain mb-1"
                          />
                        )}
                        <p className="font-bold uppercase text-slate-900">{selectedOrder.driverName}</p>
                        <p className="text-[10px] text-slate-500">Aprovação / {brand.name.split(' ')[0]}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Modal Create / Edit OS */}
      {(showCreateModal || editingOrder !== null) && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4 my-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
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
              {/* Seleção de Identidade / Marca da Empresa */}
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                <label className="block font-bold text-amber-950 mb-1">
                  <i className="fa-solid fa-building mr-1.5 text-amber-600"></i>
                  Identidade no Documento (Marca / Cabeçalho) *
                </label>
                <select
                  value={newCompanyBrand}
                  onChange={(e) => handleCompanyBrandChange(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                >
                  {Object.entries(COMPANY_BRANDS).map(([key, brand]) => (
                    <option key={key} value={key}>
                      {brand.name} {brand.subtitle ? `• ${brand.subtitle}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-800 mt-1">
                  Define o cabeçalho impresso oficial e sugere os dados de pagamento padrão.
                </p>
              </div>

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

              {/* Dados para Pagamento / PIX */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <i className="fa-solid fa-money-bill-transfer text-emerald-600"></i>
                    <span>Dados para Pagamento / Transferência / PIX</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Opcional</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Telefone / Chave PIX</label>
                    <input
                      type="text"
                      placeholder="Ex: (51) 99432-4224"
                      value={newPaymentPhone}
                      onChange={(e) => setNewPaymentPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs text-slate-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Banco</label>
                    <input
                      type="text"
                      placeholder="Ex: Itaú Unibanco"
                      value={newPaymentBank}
                      onChange={(e) => setNewPaymentBank(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs text-slate-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Titular da Conta</label>
                    <input
                      type="text"
                      placeholder="Ex: Fabiano da Silva Vieira"
                      value={newPaymentHolderName}
                      onChange={(e) => setNewPaymentHolderName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs text-slate-900 font-semibold"
                    />
                  </div>
                </div>
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
                      ⚠️ Texto extraído do PDF. Os itens estruturados abaixo foram detectados automaticamente da tabela.
                    </p>
                    <textarea
                      readOnly
                      value={extractedPdfText}
                      rows={3}
                      className="w-full p-2 text-[10px] font-mono bg-white border border-slate-300 rounded leading-tight text-slate-800 focus:outline-none"
                    />
                  </div>
                )}

                {/* Painel de Itens Detectados no PDF */}
                {detectedPdfItems.length > 0 && (
                  <div className="p-3.5 bg-emerald-50/90 border border-emerald-300 rounded-lg space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <i className="fa-solid fa-list-check text-emerald-600"></i>
                        Itens Detectados no Orçamento ({detectedPdfItems.filter((i) => i.selected).length}/{detectedPdfItems.length} selecionados)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDetectedPdfItems((prev) => {
                            const allSelected = prev.every((i) => i.selected);
                            return prev.map((i) => ({ ...i, selected: !allSelected }));
                          })
                        }
                        className="text-[10px] text-emerald-800 hover:underline font-semibold"
                      >
                        {detectedPdfItems.every((i) => i.selected) ? 'Desmarcar Todos' : 'Marcar Todos'}
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 bg-white p-2.5 rounded-lg border border-emerald-200 divide-y divide-slate-100">
                      {detectedPdfItems.map((item, idx) => (
                        <label
                          key={item.id}
                          className="flex items-center justify-between gap-2 text-[11px] text-slate-800 pt-1.5 first:pt-0 cursor-pointer hover:bg-emerald-50/50 p-1 rounded"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setDetectedPdfItems((prev) =>
                                  prev.map((it, i) => (i === idx ? { ...it, selected: checked } : it))
                                );
                              }}
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            />
                            <span className="font-semibold truncate">{item.description}</span>
                          </div>
                          <div className="flex items-center gap-3 text-right shrink-0">
                            <span className="text-slate-500">{item.quantity} UN</span>
                            <span className="font-bold text-slate-900">{formatCurrency(item.unitPrice)}</span>
                            <span className="text-slate-500 text-[10px] font-semibold">{formatCurrency(item.total)}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-emerald-900 font-bold">
                        Total Selecionado:{' '}
                        {formatCurrency(
                          detectedPdfItems
                            .filter((i) => i.selected)
                            .reduce((acc, i) => acc + i.total, 0)
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={handleAddSelectedPdfItems}
                        disabled={!detectedPdfItems.some((i) => i.selected)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition disabled:opacity-50"
                      >
                        <i className="fa-solid fa-file-import"></i>
                        <span>Adicionar Itens Selecionados à Lista da OS</span>
                      </button>
                    </div>
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default WorkOrdersView;
