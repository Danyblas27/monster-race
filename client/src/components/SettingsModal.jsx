import React, { useState } from 'react';
import { X, Settings, Download, Upload, RotateCcw, AlertTriangle, Edit3, Check, RefreshCw } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  monsters,
  onResetVotes,
  onRestoreDefaults,
  onUpdateMonster,
  onExport,
  onImport
}) {
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [editingMonster, setEditingMonster] = useState(null);
  const [editName, setEditName] = useState('');
  const [fileError, setFileError] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (m) => {
    setEditingMonster(m.number);
    setEditName(m.name);
  };

  const handleSaveEdit = async (number) => {
    if (editName.trim()) {
      await onUpdateMonster(number, { name: editName.trim() });
    }
    setEditingMonster(null);
  };

  const handleFileUpload = (e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('El archivo no contiene un arreglo válido de monstruos');
        }
        await onImport(parsed);
        alert('¡Datos importados con éxito!');
        onClose();
      } catch (err) {
        setFileError(err.message || 'Error al procesar el archivo JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Configuración del Sistema</h3>
            <p className="text-xs text-slate-400">
              Gestión de nombres, persistencia del JSON y reinicio de votos
            </p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Backup / Export / Import */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Persistencia y Copias de Seguridad (JSON)</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Todos los cambios se escriben automáticamente en el archivo <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">data/monsters.json</code>. Puedes descargar una copia o restaurar una existente:
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Descargar JSON actual
              </button>

              <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer">
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Importar respaldo JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {fileError && (
              <div className="mt-2 text-xs text-rose-400">
                ⚠️ {fileError}
              </div>
            )}
          </div>

          {/* Edit Monster Names */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Personalizar Nombres de los 10 Monstruos</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {monsters.map((m) => (
                <div
                  key={m.number}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-bold text-slate-400">#{m.number}</span>
                    <span>{m.emoji}</span>
                    {editingMonster === m.number ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-950 border border-purple-500 rounded px-2 py-0.5 text-xs text-white w-full"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-slate-200 truncate">{m.name}</span>
                    )}
                  </div>

                  <div className="ml-2">
                    {editingMonster === m.number ? (
                      <button
                        onClick={() => handleSaveEdit(m.number)}
                        className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(m)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Editar nombre"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone: Reset Race */}
          <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-500/30">
            <h4 className="text-sm font-bold text-rose-300 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Zona de Peligro: Reiniciar Votos</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Esta acción borrará todas las membresías y dejará todos los votos en 0 para iniciar una nueva carrera.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="text"
                placeholder='Escribe "REINICIAR" para confirmar'
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                className="bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                disabled={resetConfirmText !== 'REINICIAR'}
                onClick={async () => {
                  if (resetConfirmText === 'REINICIAR') {
                    await onResetVotes();
                    setResetConfirmText('');
                    alert('¡Todos los votos han sido reiniciados a cero!');
                    onClose();
                  }
                }}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  resetConfirmText === 'REINICIAR'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 cursor-pointer'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar Todos los Votos
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
