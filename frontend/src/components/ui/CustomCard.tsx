import React from "react";
import PropTypes from "prop-types";

/**
 * CustomCard — Componente base reutilizable para tarjetas con glassmorphism, bordes custom, hover y estilos personalizados.
 * Permite mantener consistencia visual y flexibilidad en la landing y otras secciones.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenido de la tarjeta.
 * @param {string} [props.className] - Clases adicionales para personalización.
 * @param {boolean} [props.glass] - Si aplica efecto glassmorphism.
 * @param {string} [props.borderColor] - Color del borde inferior.
 * @param {boolean} [props.hoverEffect] - Si aplica efecto de hover.
 * @param {boolean} [props.compact] - Si usa padding compacto.
 * @param {object} [props.style] - Estilos inline adicionales.
 * @param {any} [props.rest] - Otros props.
 */
function CustomCard({
  children,
  className = "",
  glass = true,
  borderColor = "#FFA726",
  hoverEffect = false,
  compact = false,
  style = {},
  ...rest
}) {
  // Log para monitoreo de renderizado
  React.useEffect(() => {
    console.log("[CustomCard] Rendered", { glass, borderColor, hoverEffect, compact });
  }, [glass, borderColor, hoverEffect, compact]);

  return (
    <div
      className={`rounded-2xl shadow-lg border ${glass ? "backdrop-blur-xl bg-white/10" : "bg-[#23284A]/80"} ${compact ? "p-6 md:py-8 md:px-10" : "p-8 md:p-12"} ${hoverEffect ? "transition-transform duration-200 hover:scale-105 hover:shadow-2xl" : ""} border-b-4 ${className}`}
      style={{
        borderBottomColor: borderColor,
        boxShadow: glass ? "0 8px 40px 0 rgba(44, 24, 80, 0.18)" : undefined,
        ...style,
      }}
      tabIndex={0}
      {...rest}
    >
      {children}
    </div>
  );
}

CustomCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  glass: PropTypes.bool,
  borderColor: PropTypes.string,
  hoverEffect: PropTypes.bool,
  compact: PropTypes.bool,
  style: PropTypes.object,
};

export default CustomCard; 