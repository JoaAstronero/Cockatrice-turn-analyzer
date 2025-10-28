import React from "react";

export default function Explanation() {
  return (
    <div className="card" style={{ background: "var(--card-bg)" }}>
      <div className="card-body">
        <h5 className="card-title">Guía rápida de métricas</h5>
        <p className="small-muted">
          Explicaciones sencillas para quienes no manejan estadística.
        </p>

        <ul>
          <li>
            <strong>Promedio individual</strong>: duración media de los turnos
            del jugador. Formato mm:ss.
          </li>
          <li>
            <strong>Turno mínimo / máximo</strong>: muestra la variabilidad de
            tiempos.
          </li>
          <li>
            <strong>σ (desviación estándar)</strong>: cuánto varían los turnos.
            σ pequeña → más consistente.
          </li>
          <li>
            <strong>IPR (Índice de desempeño relativo)</strong>: se calcula como
            la media global μ menos cada turno, promediado por jugador. Valor
            positivo → tiende a jugar más rápido que la media; negativo → más
            lento.
          </li>
          <li>
            <strong>% más rápido</strong>: porcentaje de turnos del jugador que
            fueron más rápidos que la media global.
          </li>
          <li>
            <strong>Outliers</strong>: turnos extremos señalados con ⚠️ (mayores
            a 300s o &gt;3σ).
          </li>
        </ul>

        <h6>Leyenda de colores</h6>
        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{ background: "var(--accent)" }}
          ></span>{" "}
          IPR positivo: más rápido que la media
        </div>
        <div className="legend-item">
          <span
            className="legend-swatch"
            style={{ background: "var(--danger)" }}
          ></span>{" "}
          IPR negativo: más lento que la media
        </div>

        <p className="mt-2 small-muted">
          Consejo: ordenamos la tabla por <em>IPR</em> para que sea más fácil
          ver quién juega consistentemente más rápido o más lento.
        </p>
      </div>
    </div>
  );
}
