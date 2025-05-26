import React, { useState, useRef, useEffect } from "react";
import { UserCircle } from "lucide-react";
import { Button } from "./button";

/**
 * Props interface for UserProfileMenu component.
 */
interface UserProfileMenuProps {
  onLogout: () => void;
  onAccount: () => void;
  showAccountOption?: boolean;
  icon: React.ReactNode;
  userName: string;
  avatarUrl: string | null;
  buttonTestId?: string;
  menuTestId?: string;
  className?: string;
  menuClassName?: string;
}

/**
 * UserProfileMenu — Botón de usuario rediseñado, más visible y atractivo.
 * - Fondo circular con gradiente y sombra.
 * - Avatar, iniciales o ícono.
 * - Tooltip en desktop.
 * - Animación de hover.
 * - API flexible.
 */
export default function UserProfileMenu({
  onLogout,
  onAccount,
  showAccountOption = true,
  icon,
  userName,
  avatarUrl,
  buttonTestId = "profile-menu-button",
  menuTestId = "profile-menu-dropdown",
  className = "",
  menuClassName = "",
}: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú si se hace click fuera
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Log para debugging de apertura/cierre
  useEffect(() => {
    if (isOpen) {
      console.log("[UserProfileMenu] Menú abierto");
    }
  }, [isOpen]);

  // Deriva iniciales del nombre de usuario
  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Renderiza avatar, iniciales, ícono personalizado o UserCircle
  const renderProfileVisual = () => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="profile-avatar"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            objectFit: "cover",
            background: "#fff",
          }}
        />
      );
    }
    if (userName) {
      return (
        <span
          className="profile-initials"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#6C47D6",
          }}
        >
          {getInitials(userName)}
        </span>
      );
    }
    if (icon) return icon;
    return <UserCircle className="h-9 w-9 text-[#6C47D6]" />;
  };

  return (
    <div className={`relative profile-menu-enhanced ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((open) => !open)}
        data-testid={buttonTestId}
        aria-label="Open profile menu"
        className="profile-menu-enhanced-btn group"
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6C47D6 60%, #FFA726 100%)",
          boxShadow:
            "0 2px 8px rgba(108,71,214,0.10), 0 1.5px 4px rgba(0,0,0,0.08)",
          border: "2.5px solid #fff",
          position: "relative",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        tabIndex={0}
        title="Mi perfil"
      >
        {renderProfileVisual()}
        {/* Tooltip solo en desktop */}
        <span
          className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
          style={{ whiteSpace: "nowrap" }}
        >
          Mi perfil
        </span>
      </Button>
      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute right-0 mt-2 w-52 bg-card border border-border rounded shadow-lg z-50 ${menuClassName}`}
          data-testid={menuTestId}
        >
          {/* Opcional: Mostrar nombre/avatar */}
          {userName && (
            <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border flex items-center gap-2">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-6 w-6 rounded-full object-cover"
                />
              )}
              <span className="truncate">{userName}</span>
            </div>
          )}
          {showAccountOption && onAccount && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-accent profile-menu-item"
              onClick={() => {
                setIsOpen(false);
                onAccount();
              }}
              data-testid="profile-menu-account"
            >
              My Account
            </button>
          )}
          <button
            className="w-full text-left px-4 py-2 hover:bg-accent text-destructive border-t border-border profile-menu-item"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            data-testid="profile-menu-logout"
          >
            Log out
          </button>
        </div>
      )}
      {/* Inline styles y clases para facilitar iteración visual */}
      <style>{`
        .profile-menu-enhanced-btn:hover,
        .profile-menu-enhanced-btn:focus-visible {
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(108, 71, 214, 0.18),
            0 2px 8px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </div>
  );
}
// Logs clave: apertura/cierre, click fuera, props relevantes
// El menú es responsivo por CSS y puede usarse en mobile/desktop
// El botón ahora es mucho más visible y atractivo visualmente
