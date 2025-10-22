import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Plus } from 'lucide-react'

export const AcceptanceMode: React.FC = () => {
  const navigate = useNavigate()

  const handleNewAcceptance = () => {
    navigate('/app/acceptance/new')
  }

  // Placeholder for Acceptance Mode (Step 5)
  return (
    <AppLayout title="Создать приемку
      ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Текущие заказы на ремонт
        </h2>
        <Button variant="primary" onClick={handleNewAcceptance}>
          <Plus className="w-5 h-5 mr-2" />
          Новая Приемка
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <p className="text-gray-500">
          Здесь будет список принятых заказов, функционал поиска и фильтрации.
          (Шаг 5)
        </p>
        <div className="mt-4 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Список заказов (Repair Orders)</p>
        </div>
      </div>
    </AppLayout>
  )
}
