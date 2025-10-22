import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Zap,
  ListChecks,
  FileText,
  Archive,
  Settings,
  Menu,
  X,
  Users,
  Warehouse,
  Gauge,
  FolderArchive,
  Cable,
  Circle,
  Wallet,
  Fan,
  FileSpreadsheet,
} from 'lucide-react'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  isCollapsed?: boolean
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center ${isCollapsed ? 'justify-center' : ''} p-3 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
      }`
    }
    title={isCollapsed ? label : undefined}
  >
    {icon}
    {!isCollapsed && <span className="ml-3 font-medium">{label}</span>}
  </NavLink>
)

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    {
      to: '/app/acceptance',
      icon: <ListChecks className="w-5 h-5" />,
      label: 'Создать приемку',
    },
    {
      to: '/upd',
      icon: <FileText className="w-5 h-5" />,
      label: 'Создать УПД',
    },
    {
      to: '/app/archive',
      icon: <Archive className="w-5 h-5" />,
      label: 'Архив Приемок',
    },
    {
      to: '/app/upd-archive',
      icon: <FolderArchive className="w-5 h-5" />,
      label: 'Архив УПД',
    },
  ]

  const referenceItems = [
    {
      to: '/app/reference/motors',
      icon: <Gauge className="w-5 h-5" />,
      label: 'Справочник Двигателей',
    },
    {
      to: '/app/reference/counterparties',
      icon: <Users className="w-5 h-5" />,
      label: 'Контрагенты',
    },
    {
      to: '/app/reference/subdivisions',
      icon: <Warehouse className="w-5 h-5" />,
      label: 'Подразделения',
    },
    {
      to: '/app/reference/wires',
      icon: <Cable className="w-5 h-5" />,
      label: 'Провод',
    },
    {
      to: '/app/reference/bearings',
      icon: <Circle className="w-5 h-5" />,
      label: 'Подшипники',
    },
    {
      to: '/app/reference/impellers',
      icon: <Fan className="w-5 h-5" />,
      label: 'Крыльчатки',
    },
    {
      to: '/app/reference/labor-payments',
      icon: <Wallet className="w-5 h-5" />,
      label: 'Оплата труда',
    },
    {
      to: '/app/reference/special-documents',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      label: 'Документы спец',
    },
  ]

  const content = (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} p-2 mb-8`}>
        <Zap className="w-8 h-8 text-indigo-600" />
        {!isCollapsed && <span className="ml-2 text-xl font-bold text-gray-900">MotorFlow</span>}
      </div>

      {/* Main Navigation */}
      <nav className="space-y-2 flex-grow">
        {!isCollapsed && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Операции
          </p>
        )}
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} isCollapsed={isCollapsed} />
        ))}

        {!isCollapsed && (
          <p className="pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Справочники
          </p>
        )}
        {referenceItems.map((item) => (
          <NavItem key={item.to} {...item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Settings/Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <NavItem
          to="/app/settings"
          icon={<Settings className="w-5 h-5" />}
          label="Настройки"
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg text-indigo-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block ${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 fixed h-full transition-all duration-300`}>
        {content}
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </div>
    </>
  )
}
