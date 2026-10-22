import { User, Logout } from "lucide-react";

export default function Navbar() {
    return (
        <header className = "bg-blue-900 text-white px-6 py-3.5 flex justify-between items-center shadow-md">
            {/* Branding AquaChile */}
            <div className = "flex items-center space-x-3">
                <span className = "font-bold text-xl tracking-wide">AquaChile</span>
                <span className = "text-xs bg-blue-800 text-blue-200 px-2.5 py-1 rounded-full font-medium">Psicolaboral</span>
            </div>
            {/* Usuario Activo y Perfil */}
            <div className = "flex items-center space-x-4">
                <div className = "flex items-center space-x-2 text-sm">
                    <div className = "p-1.5 bg-blue-800 rounded-full">
                        <User className = "w-4 h-4 text-blue-200" />
                    </div>
                    <div>
                        <p className = "font-semibold leading-tight">Analista de Reclutamiento</p>
                        <p className = "text-xs text-blue-200 leading-tight">analista@aquachile.cl</p>
                    </div>
                </div>
                <button className = "p-2 hover:bg-blue-800 rounded-lg text-blue-200 hover:text-white transition-colors" title="Cerrar Sesión">
                    <Logout className = "w-4 h-4" />
                </button>
            </div>
        </header>
    )
}