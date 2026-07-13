// 人员资料编辑页
// - 首次创建本人节点（路由 /profile/new）
// - 编辑已有人员（路由 /person/:id/edit）

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PartialDateInput } from '@/components/common/PartialDateInput';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import type { Gender, Person, PersonInput } from '@/types';

export function PersonEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { user, setPerson } = useAuthStore();
  const { selfPerson, loadPerson, createSelf, update } = useFamilyStore();

  // 是否是首次创建本人节点
  const isNewSelf = params.id === 'new' || !params.id;
  const editingId = !isNewSelf ? params.id : null;

  // 表单状态
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<Gender>('unknown');
  const [birthDate, setBirthDate] = useState('');
  const [isAlive, setIsAlive] = useState(true);
  const [deathDate, setDeathDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 加载已有数据（编辑模式）
  useEffect(() => {
    if (isNewSelf) {
      // 首次创建，如果有 selfPerson 说明已创建过，直接跳转
      if (selfPerson) {
        navigate(`/person/${selfPerson.id}`, { replace: true });
        return;
      }
      return;
    }

    // 编辑模式：加载人员数据
    const load = async () => {
      let person: Person | null = null;

      // 先从 store 找
      if (selfPerson?.id === editingId) {
        person = selfPerson;
      } else {
        person = await loadPerson(editingId!);
      }

      if (person) {
        setDisplayName(person.displayName);
        setGender(person.gender);
        setBirthDate(person.birthDate || '');
        setIsAlive(person.isAlive);
        setDeathDate(person.deathDate || '');
        setBirthPlace(person.birthPlace || '');
        setCurrentAddress(person.currentAddress || '');
        setBio(person.bio || '');
        setAvatar(person.avatar);
      }
    };
    load();
  }, [isNewSelf, editingId, selfPerson, loadPerson, navigate]);

  // 头像上传（转为 data URL 存本地）
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('头像文件不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target?.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('请输入姓名');
      return;
    }

    if (!user) {
      setError('请先登录');
      return;
    }

    const input: PersonInput = {
      displayName: displayName.trim(),
      gender,
      birthDate: birthDate || null,
      deathDate: !isAlive && deathDate ? deathDate : null,
      isAlive,
      birthPlace: birthPlace.trim() || null,
      currentAddress: currentAddress.trim() || null,
      avatar,
      bio: bio.trim() || null,
    };

    setLoading(true);
    try {
      if (isNewSelf) {
        // 创建本人节点
        const person = await createSelf(user.id, input);
        await setPerson(person.id);
        navigate(`/person/${person.id}`, { replace: true });
      } else {
        // 更新已有人员
        await update(editingId!, input);
        navigate(`/person/${editingId}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={isNewSelf ? '完善资料' : '编辑资料'}
        showBack
        right={
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-cinnabar-600 hover:text-cinnabar-700 disabled:opacity-50"
          >
            <Check size={20} />
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">
        {/* 头像 */}
        <div className="flex flex-col items-center py-4">
          <label className="relative cursor-pointer group">
            <div className="w-24 h-24 rounded-full bg-xuan-200 overflow-hidden flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <div className="text-ink-400 text-3xl font-serif">
                  {displayName[0] || '?'}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-cinnabar-500 flex items-center justify-center border-2 border-white">
              <Camera size={14} className="text-white" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
          <p className="mt-2 text-xs text-ink-400">点击上传头像</p>
        </div>

        {/* 姓名 */}
        <Input
          label="姓名 *"
          placeholder="请输入姓名"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={20}
        />

        {/* 性别 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            性别
          </label>
          <div className="flex gap-2">
            {[
              { value: 'male' as const, label: '男' },
              { value: 'female' as const, label: '女' },
              { value: 'unknown' as const, label: '未知' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGender(opt.value)}
                className={cn(
                  'flex-1 h-11 rounded-lg border text-sm font-medium transition-all',
                  gender === opt.value
                    ? 'border-cinnabar-400 bg-cinnabar-50 text-cinnabar-700'
                    : 'border-xuan-300 bg-white text-ink-500',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 出生日期 */}
        <PartialDateInput
          label="出生日期"
          value={birthDate}
          onChange={setBirthDate}
        />

        {/* 在世状态 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            状态
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsAlive(true)}
              className={cn(
                'flex-1 h-11 rounded-lg border text-sm font-medium transition-all',
                isAlive
                  ? 'border-bamboo-400 bg-bamboo-50 text-bamboo-700'
                  : 'border-xuan-300 bg-white text-ink-500',
              )}
            >
              在世
            </button>
            <button
              type="button"
              onClick={() => setIsAlive(false)}
              className={cn(
                'flex-1 h-11 rounded-lg border text-sm font-medium transition-all',
                !isAlive
                  ? 'border-ink-400 bg-ink-50 text-ink-700'
                  : 'border-xuan-300 bg-white text-ink-500',
              )}
            >
              已故
            </button>
          </div>
        </div>

        {/* 逝世日期（仅在已故时显示） */}
        {!isAlive && (
          <PartialDateInput
            label="逝世日期"
            value={deathDate}
            onChange={setDeathDate}
          />
        )}

        {/* 籍贯 */}
        <Input
          label="籍贯"
          placeholder="如：山东济南"
          value={birthPlace}
          onChange={(e) => setBirthPlace(e.target.value)}
        />

        {/* 现居地 */}
        <Input
          label="现居地"
          placeholder="如：北京朝阳"
          value={currentAddress}
          onChange={(e) => setCurrentAddress(e.target.value)}
        />

        {/* 简介 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            简介
          </label>
          <textarea
            placeholder="介绍一下自己..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-xuan-300 bg-white text-ink-800 placeholder:text-ink-400 focus:outline-none focus:border-cinnabar-400 focus:ring-2 focus:ring-cinnabar-100 transition-colors resize-none"
          />
          <p className="mt-1 text-right text-xs text-ink-400">
            {bio.length}/200
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="px-3 py-2 rounded-lg bg-cinnabar-50 border border-cinnabar-200">
            <p className="text-xs text-cinnabar-700">{error}</p>
          </div>
        )}

        {/* 提交按钮 */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={loading}
        >
          {loading ? '保存中...' : isNewSelf ? '创建' : '保存'}
        </Button>
      </form>
    </>
  );
}
