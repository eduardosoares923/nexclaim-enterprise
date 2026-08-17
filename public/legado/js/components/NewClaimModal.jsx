const { React, useState } = window;

window.NewClaimModal = function NewClaimModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    occurrenceType: 'Colisão Traseira',
    priority: 'Média',
    status: 'Novo',
    date: new Date().toISOString().split('T')[0],
    time: '14:30',
    location: 'Av. Paulista, 1500',
    city: 'São Paulo',
    state: 'SP',
    vehiclePlate: 'ABC-8E19',
    vehicleModel: 'Toyota Corolla Cross',
    driverName: 'João Carlos Silva',
    insurer: 'Porto Seguro Cia de Seguros',
    policyNumber: 'AP-99201928-01',
    boNumber: 'BO-SP-48912/2026',
    estimatedCost: '5000',
    assignedUser: 'Mariana Souza',
    description: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
      <div class="flex justify-between items-center border-b border-slate-200 pb-3">
        <div>
          <h3 class="font-bold text-slate-900 text-base">Cadastrar Novo Sinistro ou Ocorrência</h3>
          <p class="text-xs text-slate-500">Preencha os dados oficiais para abertura do dossiê digital.</p>
        </div>
        <button onClick={onClose} class="text-slate-400 hover:text-slate-700 text-lg">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} class="space-y-4 text-xs">
        {/* Section 1: Basic Info */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label class="form-label text-xs">Tipo de Ocorrência *</label>
            <select name="occurrenceType" value={formData.occurrenceType} onChange={handleChange} class="form-select text-xs" required>
              <option value="Colisão Traseira">Colisão Traseira</option>
              <option value="Colisão Frontal / Lateral">Colisão Frontal / Lateral</option>
              <option value="Avaria em Estacionamento">Avaria em Estacionamento</option>
              <option value="Furto Parcial">Furto Parcial / Acessórios</option>
              <option value="Roubo / Furto Total">Roubo / Furto Total</option>
              <option value="Danos por Granizo / Naturais">Danos por Granizo / Naturais</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <div>
            <label class="form-label text-xs">Prioridade *</label>
            <select name="priority" value={formData.priority} onChange={handleChange} class="form-select text-xs" required>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>

          <div>
            <label class="form-label text-xs">Status Inicial *</label>
            <select name="status" value={formData.status} onChange={handleChange} class="form-select text-xs" required>
              <option value="Novo">Novo</option>
              <option value="Em análise">Em análise</option>
              <option value="Aguardando documentos">Aguardando documentos</option>
              <option value="Aguardando seguradora">Aguardando seguradora</option>
            </select>
          </div>
        </div>

        {/* Section 2: Date & Location */}
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label class="form-label text-xs">Data da Ocorrência *</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} class="form-input text-xs" required />
          </div>
          <div>
            <label class="form-label text-xs">Horário *</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} class="form-input text-xs" required />
          </div>
          <div class="sm:col-span-2">
            <label class="form-label text-xs">Local da Ocorrência *</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Endereço / Via pública" class="form-input text-xs" required />
          </div>
        </div>

        {/* Section 3: Vehicle & Driver */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="form-label text-xs">Placa do Veículo *</label>
            <input type="text" name="vehiclePlate" value={formData.vehiclePlate} onChange={handleChange} class="form-input text-xs font-bold uppercase" required />
          </div>
          <div>
            <label class="form-label text-xs">Modelo do Veículo *</label>
            <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} class="form-input text-xs" required />
          </div>
          <div>
            <label class="form-label text-xs">Nome do Condutor *</label>
            <input type="text" name="driverName" value={formData.driverName} onChange={handleChange} class="form-input text-xs" required />
          </div>
        </div>

        {/* Section 4: Insurer & Police Report */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="form-label text-xs">Seguradora</label>
            <input type="text" name="insurer" value={formData.insurer} onChange={handleChange} class="form-input text-xs" />
          </div>
          <div>
            <label class="form-label text-xs">Número da Apólice</label>
            <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange} class="form-input text-xs" />
          </div>
          <div>
            <label class="form-label text-xs">Boletim de Ocorrência (B.O.)</label>
            <input type="text" name="boNumber" value={formData.boNumber} onChange={handleChange} class="form-input text-xs" />
          </div>
        </div>

        {/* Section 5: Description */}
        <div>
          <label class="form-label text-xs">Descrição Detalhada do Fato *</label>
          <textarea 
            name="description" 
            rows="3" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Descreva a dinâmica do acidente, avarias aparentes e partes envolvidas..." 
            class="form-textarea text-xs" 
            required
          ></textarea>
        </div>

        <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <button type="button" onClick={onClose} class="btn btn-secondary text-xs px-4 py-2">
            Cancelar
          </button>
          <button type="submit" disabled={loading} class="btn bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2">
            {loading ? 'Salvando...' : 'Cadastrar Sinistro'}
          </button>
        </div>
      </form>
    </div>
  );
};
