import { useMemo, useState } from 'react'
import { Toolbar } from '../components/ui/Toolbar'
import { Modal } from '../components/ui/Modal'
import { StudentAccessLinkForm } from '../components/forms/StudentAccessLinkForm'
import { StudentAccessLinksTable } from '../components/tables/StudentAccessLinksTable'
import { StudentAccessQrCard } from '../components/student-access/StudentAccessQrCard'
import { useStudents } from '../hooks/useStudents'
import {
  useCreateStudentAccessLink,
  useReissueStudentAccessLink,
  useRevokeStudentAccessLink,
  useStudentAccessLinks,
} from '../hooks/useStudentAccessLinks'
import { useToast } from '../hooks/useToast'
import { extractErrorMessage } from '../utils/errors'
import type { StudentAccessLinkItem } from '../types/studentAccessLink'
import { useConfirm } from '../hooks/useConfirm'

function buildCheckinUrl(rawToken: string) {
  return `${window.location.origin}/student-checkin/start?token=${rawToken}`
}

export function StudentAccessLinksPage() {
  const { data, isLoading, error } = useStudentAccessLinks()
  const studentsQuery = useStudents()
  const createMutation = useCreateStudentAccessLink()
  const revokeMutation = useRevokeStudentAccessLink()
  const reissueMutation = useReissueStudentAccessLink()
  const toast = useToast()
  const { confirm } = useConfirm()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [qrStudentName, setQrStudentName] = useState('')
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  return (
    <div className="page-grid">
      <Toolbar
        title="Ссылки check-in студентов"
        onAdd={() => setIsCreateOpen(true)}
        addLabel="Выдать ссылку"
      />

      {isLoading && <div className="panel">Загрузка...</div>}
      {error && <div className="panel">Ошибка загрузки ссылок</div>}

      {data && (
        <StudentAccessLinksTable
          items={data}
          onShowQr={(item) => {
            toast.info('QR можно показать после создания или перевыпуска ссылки')
          }}
          onReissue={async (item) => {
            const ok = await confirm({
              title: 'Перевыпустить ссылку?',
              description: 'Старая ссылка будет отозвана, и будет создана новая.',
              confirmText: 'Перевыпустить',
            })
            if (!ok) return

            try {
              const result = await reissueMutation.mutateAsync(item.id)
              const checkinUrl = buildCheckinUrl(result.raw_access_token)
              setQrStudentName(item.student?.full_name ?? `Студент #${item.student_id}`)
              setQrUrl(checkinUrl)
              toast.success('Ссылка перевыпущена')
            } catch (err) {
              toast.error('Не удалось перевыпустить ссылку', extractErrorMessage(err))
            }
          }}
          onRevoke={async (item) => {
            const ok = await confirm({
              title: 'Отозвать ссылку?',
              description: 'После этого студент не сможет начать новую check-in сессию по этой ссылке.',
              confirmText: 'Отозвать',
              tone: 'danger',
            })
            if (!ok) return

            try {
              await revokeMutation.mutateAsync(item.id)
              toast.success('Ссылка отозвана')
            } catch (err) {
              toast.error('Не удалось отозвать ссылку', extractErrorMessage(err))
            }
          }}
        />
      )}

      {isCreateOpen && (
        <Modal title="Выдать ссылку студенту" onClose={() => setIsCreateOpen(false)}>
          <StudentAccessLinkForm
            students={studentsQuery.data?.items ?? []}
            onSubmit={async (payload) => {
              try {
                const result = await createMutation.mutateAsync(payload)
                const checkinUrl = buildCheckinUrl(result.raw_access_token)
                setQrStudentName(result.item.student?.full_name ?? `Студент #${result.item.student_id}`)
                setQrUrl(checkinUrl)
                setIsCreateOpen(false)
                toast.success('Ссылка создана')
              } catch (err) {
                toast.error('Не удалось создать ссылку', extractErrorMessage(err))
              }
            }}
          />
        </Modal>
      )}

      {qrUrl && (
        <Modal title="QR-код ссылки" onClose={() => setQrUrl(null)}>
          <StudentAccessQrCard
            studentName={qrStudentName}
            checkinUrl={qrUrl}
            onClose={() => setQrUrl(null)}
          />
        </Modal>
      )}
    </div>
  )
}