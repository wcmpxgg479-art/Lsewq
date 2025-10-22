import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { getMotorDetails, MotorDetails } from '../../services/motorDetailsService'
import { ArrowLeft, Save } from 'lucide-react'
import { EditableReceptionPreview, ReceptionItem, AcceptedMotor, Reception } from '../../components/FinancialHierarchy/EditableReceptionPreview'
import { AddWorkGroupModal } from '../../components/FinancialHierarchy/AddWorkGroupModal'
import { AddServiceModal } from '../../components/FinancialHierarchy/AddServiceModal'
import { supabase } from '../../lib/supabase'

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year} г.`
}

export const EditMotorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [localReception, setLocalReception] = useState<Reception | null>(null)
  const [originalData, setOriginalData] = useState<MotorDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [showAddGroupModal, setShowAddGroupModal] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [currentGroupName, setCurrentGroupName] = useState('')
  const [currentMotorId, setCurrentMotorId] = useState<string | null>(null)

  useEffect(() => {
    loadMotorDetails()
  }, [id])

  const loadMotorDetails = async () => {
    if (!id) {
      setError('ID двигателя не указан')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getMotorDetails(id)

      if (!data) {
        setError('Двигатель не найден')
      } else {
        setOriginalData(data)

        const receptionItems: ReceptionItem[] = data.items.map(item => ({
          id: item.item_id,
          item_description: item.item_description,
          work_group: item.work_group || '',
          transaction_type: item.transaction_type || 'Доходы',
          quantity: item.quantity,
          price: item.price,
          upd_document_id: item.upd_document_id,
          upd_document_number: item.document_number,
        }))

        const motor: AcceptedMotor = {
          id: data.motor_id,
          position_in_reception: data.position_in_reception,
          motor_service_description: data.motor_service_description,
          motor_inventory_number: data.motor_inventory_number || '',
          subdivision_id: data.subdivision_id || '',
          subdivisions: {
            id: data.subdivision_id || '',
            name: data.subdivision_name || 'Не указано',
          },
          items: receptionItems,
        }

        const reception: Reception = {
          id: data.reception_id,
          reception_number: data.reception_number || '',
          reception_date: data.reception_date,
          counterparty_id: '',
          counterparties: {
            id: '',
            name: data.counterparty_name,
          },
          motors: [motor],
        }

        setLocalReception(reception)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных о двигателе')
    } finally {
      setLoading(false)
    }
  }

  const canEdit = localReception?.motors[0]?.items.some(item => !item.upd_document_id) ?? false

  const handleUpdateItem = async (itemId: string, updates: Partial<ReceptionItem>) => {
    if (!localReception) return

    setLocalReception(prev => {
      if (!prev) return prev

      const updatedMotors = prev.motors.map(motor => ({
        ...motor,
        items: motor.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      }))

      return { ...prev, motors: updatedMotors }
    })
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!localReception) return

    if (!confirm('Вы уверены, что хотите удалить эту позицию?')) return

    setLocalReception(prev => {
      if (!prev) return prev

      const updatedMotors = prev.motors.map(motor => ({
        ...motor,
        items: motor.items.filter(item => item.id !== itemId),
      }))

      return { ...prev, motors: updatedMotors }
    })

    setSuccessMessage('Позиция удалена')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleAddItem = async (motorId: string, item: Omit<ReceptionItem, 'id' | 'upd_document_id' | 'upd_document_number'>) => {
    if (!localReception) return

    const newItem: ReceptionItem = {
      ...item,
      id: crypto.randomUUID(),
      upd_document_id: null,
      upd_document_number: null,
    }

    setLocalReception(prev => {
      if (!prev) return prev

      const updatedMotors = prev.motors.map(motor =>
        motor.id === motorId
          ? { ...motor, items: [...motor.items, newItem] }
          : motor
      )

      return { ...prev, motors: updatedMotors }
    })
  }

  const handleServiceNameUpdate = (motorId: string, newServiceName: string) => {
    if (!localReception) return

    setLocalReception(prev => {
      if (!prev) return prev

      const updatedMotors = prev.motors.map(motor =>
        motor.id === motorId
          ? { ...motor, motor_service_description: newServiceName }
          : motor
      )

      return { ...prev, motors: updatedMotors }
    })

    setSuccessMessage(`Название позиции изменено на "${newServiceName}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleSubdivisionNameUpdate = (motorId: string, newSubdivisionName: string) => {
    if (!localReception) return

    setLocalReception(prev => {
      if (!prev) return prev

      const updatedMotors = prev.motors.map(motor =>
        motor.id === motorId
          ? {
              ...motor,
              subdivisions: { ...motor.subdivisions, name: newSubdivisionName }
            }
          : motor
      )

      return { ...prev, motors: updatedMotors }
    })

    setSuccessMessage(`Подразделение изменено на "${newSubdivisionName}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleAddGroupClick = (motorId: string) => {
    setCurrentMotorId(motorId)
    setShowAddGroupModal(true)
  }

  const handleAddItemToGroup = (motorId: string, workGroup: string) => {
    setCurrentMotorId(motorId)
    setCurrentGroupName(workGroup)
    setShowAddServiceModal(true)
  }

  const handleGroupNext = (groupName: string) => {
    setCurrentGroupName(groupName)
    setShowAddGroupModal(false)
    setShowAddServiceModal(true)
  }

  const handleServiceSave = async (services: Array<{
    name: string
    pricePerUnit: number
    quantity: number
    transactionType: 'Доходы' | 'Расходы'
  }>) => {
    if (!currentMotorId) {
      setError('Не выбран двигатель для добавления позиции')
      setTimeout(() => setError(null), 5000)
      return
    }

    for (const service of services) {
      await handleAddItem(currentMotorId, {
        item_description: service.name,
        work_group: currentGroupName,
        transaction_type: service.transactionType,
        quantity: service.quantity,
        price: service.pricePerUnit,
      })
    }

    setShowAddServiceModal(false)
    setCurrentGroupName('')
    setCurrentMotorId(null)
    const itemCount = services.length
    setSuccessMessage(`Добавлено ${itemCount} ${itemCount === 1 ? 'позиция' : itemCount < 5 ? 'позиции' : 'позиций'} в группу "${currentGroupName}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleSave = async () => {
    if (!localReception || !id) {
      setError('Нет данных для сохранения')
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const motor = localReception.motors[0]

      const { data: subdivisionData, error: subdivisionError } = await supabase
        .from('subdivisions')
        .select('id')
        .eq('name', motor.subdivisions.name)
        .maybeSingle()

      let subdivisionId = subdivisionData?.id

      if (!subdivisionData && motor.subdivisions.name !== 'Не указано') {
        const { data: newSubdivision, error: createSubdivisionError } = await supabase
          .from('subdivisions')
          .insert({
            name: motor.subdivisions.name,
            code: '',
            description: '',
          })
          .select()
          .single()

        if (createSubdivisionError) {
          throw new Error(`Ошибка создания подразделения: ${createSubdivisionError.message}`)
        }

        subdivisionId = newSubdivision.id
      }

      const { error: motorUpdateError } = await supabase
        .from('accepted_motors')
        .update({
          motor_service_description: motor.motor_service_description,
          subdivision_id: subdivisionId,
        })
        .eq('id', motor.id)

      if (motorUpdateError) {
        throw new Error(`Ошибка обновления двигателя: ${motorUpdateError.message}`)
      }

      const itemsToDelete = originalData!.items.filter(
        origItem => !motor.items.find(item => item.id === origItem.item_id)
      )

      for (const item of itemsToDelete) {
        if (item.upd_document_id) {
          throw new Error('Невозможно удалить элемент, который находится в УПД')
        }

        const { error: deleteError } = await supabase
          .from('reception_items')
          .delete()
          .eq('id', item.item_id)

        if (deleteError) {
          throw new Error(`Ошибка удаления позиции: ${deleteError.message}`)
        }
      }

      for (const item of motor.items) {
        const originalItem = originalData!.items.find(origItem => origItem.item_id === item.id)

        if (originalItem) {
          if (originalItem.upd_document_id) {
            continue
          }

          const { error: updateError } = await supabase
            .from('reception_items')
            .update({
              item_description: item.item_description,
              work_group: item.work_group,
              transaction_type: item.transaction_type,
              quantity: item.quantity,
              price: item.price,
            })
            .eq('id', item.id)

          if (updateError) {
            throw new Error(`Ошибка обновления позиции: ${updateError.message}`)
          }
        } else {
          const { error: insertError } = await supabase
            .from('reception_items')
            .insert({
              id: item.id,
              accepted_motor_id: motor.id,
              item_description: item.item_description,
              work_group: item.work_group,
              transaction_type: item.transaction_type,
              quantity: item.quantity,
              price: item.price,
            })

          if (insertError) {
            throw new Error(`Ошибка добавления позиции: ${insertError.message}`)
          }
        }
      }

      setSuccessMessage('Данные успешно сохранены')
      setTimeout(() => {
        navigate(`/app/motors/${id}`)
      }, 1500)
    } catch (error: any) {
      setError(error.message || 'Ошибка сохранения данных')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Загрузка...">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка информации о двигателе...</div>
        </div>
      </AppLayout>
    )
  }

  if (error && !localReception) {
    return (
      <AppLayout title="Ошибка">
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <Alert variant="error">
            {error || 'Двигатель не найден'}
          </Alert>
        </div>
      </AppLayout>
    )
  }

  if (!localReception) {
    return (
      <AppLayout title="Ошибка">
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <Alert variant="error">
            Двигатель не найден
          </Alert>
        </div>
      </AppLayout>
    )
  }

  const motor = localReception.motors[0]

  return (
    <AppLayout
      title={canEdit ? `Редактирование: ${motor.motor_service_description}` : `Просмотр: ${motor.motor_service_description}`}
      breadcrumbs={[
        { label: 'Архив Приемок', path: '/app/archive' },
        { label: `Двигатель ${motor.position_in_reception}`, path: `/app/motors/${id}` },
        { label: canEdit ? 'Редактирование' : 'Просмотр', path: `/app/motors/${id}/edit` },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/app/motors/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к просмотру
          </Button>
        </div>

        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!canEdit && (
          <Alert variant="info">
            Все элементы данного двигателя находятся в УПД. Редактирование невозможно.
          </Alert>
        )}

        <EditableReceptionPreview
          reception={localReception}
          onUpdateItem={canEdit ? handleUpdateItem : async () => {}}
          onDeleteItem={canEdit ? handleDeleteItem : async () => {}}
          onAddItem={canEdit ? handleAddItem : async () => {}}
          onServiceNameUpdate={canEdit ? handleServiceNameUpdate : undefined}
          onSubdivisionNameUpdate={canEdit ? handleSubdivisionNameUpdate : undefined}
          onAddGroupClick={canEdit ? handleAddGroupClick : undefined}
          onAddItemToGroup={canEdit ? handleAddItemToGroup : undefined}
        />

        {canEdit && (
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => navigate(`/app/motors/${id}`)}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Сохранить позиции
                </>
              )}
            </Button>
          </div>
        )}

        <AddWorkGroupModal
          isOpen={showAddGroupModal}
          onClose={() => setShowAddGroupModal(false)}
          onNext={handleGroupNext}
        />

        <AddServiceModal
          isOpen={showAddServiceModal}
          onClose={() => {
            setShowAddServiceModal(false)
            setCurrentGroupName('')
            setCurrentMotorId(null)
          }}
          groupName={currentGroupName}
          onSave={handleServiceSave}
        />
      </div>
    </AppLayout>
  )
}
