import React from "react";

export default function LoadView({ rawLog, setRawLog, onAnalyze, setTab }) {
  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawLog(String(reader.result || ""));
    };
    reader.readAsText(f);
  }

  async function analyzeAndSwitch() {
    await onAnalyze();
    setTab("summary");
  }

  return (
    <div>
      <h3>Cargar log</h3>
      <p className="small-muted">
        Pega el contenido del log o sube el archivo <code>log.txt</code>.
      </p>

      <div className="mb-3">
        <input type="file" accept="text/*" onChange={onFile} />
      </div>

      <div className="mb-3">
        <textarea
          className="form-control"
          rows={10}
          value={rawLog}
          onChange={(e) => setRawLog(e.target.value)}
        />
      </div>

      <div>
        <button className="btn btn-primary me-2" onClick={analyzeAndSwitch}>
          Analizar y ver resumen
        </button>
      </div>
    </div>
  );
}
