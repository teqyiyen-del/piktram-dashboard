'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDate } from '@/lib/utils'
import { Card } from '@/components/sections/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { FolderKanban, PlusCircle, Trash2, Pencil } from 'lucide-react'
import { useCustomer } from '@/components/providers/customer-provider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CustomerLike = { id: string } | string | null | undefined
const getCustomerId = (c: CustomerLike) =>
  typeof c === 'string' ? c : c && 'id' in c ? c.id : undefined

export default function ProjectsPage() {
  const supabase = createClientComponentClient<Database>()
  const { selectedCustomer } = useCustomer()

  const [projects, setProjects] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [progress, setProgress] = useState(0)
  const [type, setType] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Kullanıcı rolünü al
  useEffect(() => {
    const fetchRole = async () => {
      const { data: auth } = await supabase.auth.getUser()
      const uid = (auth as any)?.user?.id || (auth as any)?.id
      if (!uid) { setRole(null); return }
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', uid)
        .single()
      if (error) { setRole(null); return }
      setRole(data?.role || null)
    }
    fetchRole()
  }, [])

  // Projeleri getir
  useEffect(() => {
    const cid = getCustomerId(selectedCustomer)
    if (role === 'admin') fetchProjects(cid)
    else if (role === 'user' && cid) fetchProjects(cid)
    else if (role === 'user') setProjects([])
    else if (role === 'admin' && !cid) fetchProjects()
  }, [role, selectedCustomer])

  async function fetchProjects(clientId?: string) {
    setErrorMsg(null)

    let query = supabase
      .from('projects')
      .select('id, title, description, due_date, progress, type, user_id, client_id, is_completed')
      .order('due_date', { ascending: false, nullsFirst: true })

    if ((role === 'user' && clientId) || (role === 'admin' && clientId)) {
      query = query.eq('client_id', clientId)
    }

    const { data, error } = await query
    if (error) {
      console.error('[projects fetch error]', error)
      setErrorMsg(error.message)
      setProjects([])
      return
    }
    setProjects(data || [])
  }

  async function handleSaveProject() {
    const cid = getCustomerId(selectedCustomer)

    if (!title.trim()) return alert('Başlık zorunlu.')
    if (role === 'user' && !cid) return alert('Proje eklemek için önce müşteri seçmelisin!')
    if (!type) return alert('Proje türü seçmelisin!')

    setLoading(true)
    const { data: auth } = await supabase.auth.getUser()
    const uid = (auth as any)?.user?.id || (auth as any)?.id
    if (!uid) { alert('Kullanıcı bulunamadı.'); setLoading(false); return }

    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update({
          title,
          description,
          due_date: dueDate || null,
          progress: progress || 0,
          is_completed: progress === 100,
          client_id: cid ?? null,
          type,
        })
        .eq('id', editingProject.id)
      if (error) alert('Proje güncellenemedi: ' + error.message)
    } else {
      const { error } = await supabase.from('projects').insert([{
        title,
        description,
        due_date: dueDate || null,
        progress: progress || 0,
        is_completed: progress === 100,
        client_id: cid ?? null,
        user_id: uid,
        type,
      }])
      if (error) alert('Proje eklenemedi: ' + error.message)
    }

    setLoading(false)
    resetForm()
    const cid2 = getCustomerId(selectedCustomer)
    if (role === 'admin') fetchProjects(cid2)
    else if (role === 'user' && cid2) fetchProjects(cid2)
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Bu projeyi silmek istediğine emin misin?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) alert('Proje silinemedi: ' + error.message)
    const cid = getCustomerId(selectedCustomer)
    if (role === 'admin') fetchProjects(cid)
    else if (role === 'user' && cid) fetchProjects(cid)
  }

  async function updateProjectProgress(id: string, newProgress: number) {
    setProjects(prev =>
      prev.map(p =>
        p.id === id ? { ...p, progress: newProgress, is_completed: newProgress === 100 } : p
      )
    )
    const { error } = await supabase
      .from('projects')
      .update({ progress: newProgress, is_completed: newProgress === 100 })
      .eq('id', id)
    if (error) console.error('Proje progress güncellenemedi:', error.message)
    else {
      const cid = getCustomerId(selectedCustomer)
      if (role === 'admin') fetchProjects(cid)
      else if (role === 'user' && cid) fetchProjects(cid)
    }
  }

  async function toggleProjectComplete(id: string, current: boolean) {
    setProjects(prev =>
      prev.map(p =>
        p.id === id ? { ...p, progress: current ? 0 : 100, is_completed: !current } : p
      )
    )
    const { error } = await supabase
      .from('projects')
      .update({ is_completed: !current, progress: !current ? 100 : 0 })
      .eq('id', id)
    if (error) console.error('Proje tamamlanma güncellenemedi:', error.message)
    else {
      const cid = getCustomerId(selectedCustomer)
      if (role === 'admin') fetchProjects(cid)
      else if (role === 'user' && cid) fetchProjects(cid)
    }
  }

  function resetForm() {
    setTitle(''); setDescription(''); setDueDate(''); setProgress(0)
    setType(null); setEditingProject(null); setShowModal(false)
  }

  function openEditModal(project: any) {
    setEditingProject(project)
    setTitle(project.title)
    setDescription(project.description || '')
    setDueDate(project.due_date || '')
    setProgress(project.progress || 0)
    setType(project.type || null)
    setShowModal(true)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Header */}
      <header
        className="rounded-2xl p-6 flex items-center justify-between text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <FolderKanban className="h-6 w-6" />
            Projeler
          </h1>
          <p className="mt-1 text-sm text-white/90">
            {role === 'admin'
              ? 'Tüm projeleri yönetin veya müşteri seçerek filtreleyin.'
              : 'Seçili müşteri için projeleri yönetin, düzenleyin, silin veya yeni projeler ekleyin.'}
          </p>
        </div>
        <Button
          onClick={() => {
            const cid = getCustomerId(selectedCustomer)
            if (role === 'user' && !cid) {
              alert('Yeni proje eklemek için önce müşteri seçmelisin!')
              return
            }
            setShowModal(true)
          }}
          className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni Proje
        </Button>
      </header>

      {/* Hata göstergesi */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Hata: {errorMsg}
        </div>
      )}

      {/* Project List */}
      <Card>
        <div className="space-y-4">
          {role === 'user' && !getCustomerId(selectedCustomer) && (
            <p className="text-sm text-gray-500 text-center py-6">
              Projeleri görmek için bir müşteri seçmelisin.
            </p>
          )}

          {projects.map((project) => (
            <div
              key={project.id}
              className={`rounded-xl border p-4 shadow-sm hover:shadow-md transition ${
                project.is_completed ? 'bg-green-50 border-green-200' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{project.title}</h3>
                <span className="text-xs text-gray-500">
                  {project.due_date ? formatDate(project.due_date) : 'Teslim tarihi yok'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {project.description ?? 'Açıklama yok'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Kullanıcı ID: {project.user_id} {project.client_id ? `• Müşteri: ${project.client_id}` : ''}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Tür: {project.type || 'Seçilmemiş'}
              </p>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${
                      (project.progress || 0) === 100 ? 'bg-green-500' : 'bg-[#FF5E4A]'
                    }`}
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{project.progress || 0}%</span>
                  {!project.is_completed && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateProjectProgress(project.id, Math.min(100, (project.progress || 0) + 10))
                        }
                        className="rounded-full bg-[#FF5E4A] px-3 py-1 text-xs font-medium text-white hover:bg-[#e24d3d]"
                      >
                        +10%
                      </button>
                      <button
                        onClick={() =>
                          updateProjectProgress(project.id, Math.max(0, (project.progress || 0) - 10))
                        }
                        className="rounded-full bg-gray-500 px-3 py-1 text-xs font-medium text-white hover:bg-gray-600"
                      >
                        -10%
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => toggleProjectComplete(project.id, project.is_completed)}
                  className="rounded-full bg-[#FF5E4A] px-4 py-1 text-xs font-semibold text-white hover:bg-[#e24d3d]"
                >
                  {project.is_completed ? 'Geri Al' : 'Tamamla'}
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(project)}
                  className="flex items-center gap-1"
                >
                  <Pencil className="h-4 w-4" /> Düzenle
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Sil
                </Button>
              </div>
            </div>
          ))}

          {projects.length === 0 && !errorMsg && (
            <p className="text-sm text-gray-500 text-center py-6">
              Henüz proje eklenmedi.
            </p>
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingProject ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}
      >
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Başlık" />
          <Input as="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Açıklama" />
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} placeholder="İlerleme (%)" />

          <Select value={type ?? ''} onValueChange={(val) => setType(val)}>
            <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Tür seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proje">Proje</SelectItem>
              <SelectItem value="reklam">Reklam</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm} disabled={loading}>İptal</Button>
            <Button onClick={handleSaveProject} disabled={loading} className="bg-[#FF5E4A] hover:bg-[#FA7C6B] text-white">
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
