import React from "react";
import ComparisonChart from "./ComparisonChart";
import CountChart from "./CountChart";
import HistogramChart from "./HistogramChart";
import IprChart from "./IprChart";
import Timeline from "./Timeline";

export default function ChartsView({ statsObj, turns }) {
  if (!statsObj)
    return (
      <div className="alert alert-secondary">
        Analiza un log primero (pestaña "Cargar").
      </div>
    );

  return (
    <div>
      <h3>Gráficos</h3>
      <p className="small-muted">
        Vista principal: línea de tiempo de turnos (arriba). Debajo,
        comparativas por columnas.
      </p>

      <div style={{ marginBottom: 18 }}>
        <Timeline turns={turns} statsObj={statsObj} />
      </div>

      <div className="row">
        <div className="col-md-6">
          <IprChart statsObj={statsObj} />
        </div>
        <div className="col-md-6">
          <ComparisonChart statsObj={statsObj} />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-md-6">
          <HistogramChart turns={turns} />
        </div>
        <div className="col-md-6">
          <CountChart statsObj={statsObj} />
        </div>
      </div>
    </div>
  );
}
