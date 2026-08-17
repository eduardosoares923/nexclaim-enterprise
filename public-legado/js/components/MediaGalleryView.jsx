const { React, useEffect, useState } = window;

window.MediaGalleryView = function MediaGalleryView() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    fetch('/api/media')
      .then(r => r.json())
      .then(data => setMedia(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Frente', 'Traseira', 'Lateral', 'Interior', 'Danos', 'Local do acidente', 'Terceiros', 'Documentos'];
  const filteredMedia = media.filter(m => !selectedCategory || m.category === selectedCategory);

  return (
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">Galeria de Fotos & Registros Visuais</h2>
        <p class="text-xs text-slate-500 mt-0.5">Inspeção visual de avarias, local dos sinistros e mídias da frota.</p>
      </div>

      {/* Category Pills */}
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setSelectedCategory('')}
          class={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          Todas ({media.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            class={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Image Gallery Grid */}
      {loading ? (
        <div class="p-8 text-center text-xs text-slate-400">Carregando galeria...</div>
      ) : (
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredMedia.map(med => (
            <div 
              key={med.id}
              onClick={() => setLightboxImg(med)}
              class="group relative bg-slate-900 rounded-xl overflow-hidden shadow-xs cursor-pointer aspect-square"
            >
              <img src={med.url} alt={med.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span class="badge bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded w-fit mb-1 font-bold">{med.category}</span>
                <p class="text-white font-bold text-xs truncate">{med.title}</p>
                <p class="text-slate-300 text-[10px] truncate">{med.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {lightboxImg && (
        <div class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightboxImg(null)}>
          <div class="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg.url} alt={lightboxImg.title} class="max-h-[75vh] w-auto rounded-lg object-contain" />
            <div class="text-white mt-3 text-center">
              <span class="badge bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded font-bold mb-1 inline-block">{lightboxImg.category}</span>
              <h4 class="font-bold text-base">{lightboxImg.title}</h4>
              <p class="text-xs text-slate-300 mt-1">{lightboxImg.description}</p>
              <p class="text-[10px] text-slate-400 mt-2">Enviado por {lightboxImg.uploadedBy} em {window.formatDate(lightboxImg.uploadDate)}</p>
            </div>
            <button onClick={() => setLightboxImg(null)} class="absolute -top-10 right-0 text-white text-2xl">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
