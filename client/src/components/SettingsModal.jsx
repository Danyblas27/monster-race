import React, { useState } from 'react';
import { X, Settings, Download, Upload, RotateCcw, AlertTriangle, Edit3, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col p-5 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
          <Settings className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-base font-bold text-white">Configuración del Sistema</h3>
            <p className="text-xs text-slate-400">
              Gestión de datos persistentes y personalización
            </p>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* Persistence & Backup */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Copia de Seguridad y Archivo JSON</span>
            </h4>
            <p className="text-slate-400 mb-3">
              Todos los cambios se guardan automáticamente en <code className="bg-slate-900 px-1 py-0.5 rounded text-purple-300">data/monsters.json</code>.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Descargar JSON
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold border border-slate-700 transition cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {fileError && <div className="mt-2 text-rose-400">⚠️ {fileError}</div>}
          </div>

          {/* Edit Monster Names */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Nombres de los 10 Monstruos</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {monsters.map((m) => (
                <div
                  key={m.number}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-bold text-slate-400">#{m.number}</span>
                    <span>{m.emoji}</span>
                    {editingMonster === m.number ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-950 border border-purple-500 rounded px-1.5 py-0.5 text-xs text-white w-full"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-slate-200 truncate">{m.name}</span>
                    )}
                  </div>

                  <div className="ml-2">
                    {editingMonster === m.number ? (
                      <button
                        onClick={() => handleSaveEdit(m.number)}
                        className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(m)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Editar nombre"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone: Reset Race */}
          <div className="bg-rose-950/20 p-3.5 rounded-xl border border-rose-900/40">
            <h4 className="font-bold text-rose-300 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Reiniciar Votación</span>
            </h4>
            <p className="text-slate-400 mb-2.5">
              Esta acción borrará todas las membresías y dejará todos los votos en 0.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="text"
                placeholder='Escribe "REINICIAR"'
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                className="bg-slate-950 border border-rose-800/60 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
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
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  resetConfirmText === 'REINICIAR'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                Reiniciar Todos los Votos
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
