// 添加亲属页
// - 从本人节点添加亲属（路由 /add-relative）
// - 从任意人员添加亲属（路由 /add-relative/:fromPersonId）
//
// 支持匹配已有亲属：
// - 当添加的角色可能匹配到已存在人员时，提示"检测到已有亲属，是否匹配"
// - 匹配时建立关系到已有人员，不创建新人员
// - 避免组合家庭中错误地重复创建人员

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, UserCheck, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PartialDateInput } from '@/components/common/PartialDateInput';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import {
  RELATION_OPTIONS,
  findMatchCandidates,
  resolveFromRole,
  type RelationOption,
} from '@/services/relationshipService';
import { getDisplayName, getLifeSpan, getGenderLabel } from '@/utils/helpers';
import type { Gender, RelationCategory, SiblingType, Person } from '@/types';

export function AddRelativePage() {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuthStore();
  const { selfPerson, persons, relationships, loadFamily, addRelative, linkRelative } = useFamilyStore();

  // 从哪个人员添加亲属（默认是本人）
  const fromPersonId = params.fromPersonId || selfPerson?.id || null;
  const fromPerson = persons.find((p) => p.id === fromPersonId) || selfPerson;

  // 选中的关系选项
  const [selectedOption, setSelectedOption] = useState<RelationOption | null>(null);

  // 新亲属的资料
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<Gender>('unknown');
  const [birthDate, setBirthDate] = useState('');
  const [isAlive, setIsAlive] = useState(true);
  const [deathDate, setDeathDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');

  // 关系类别
  const [category, setCategory] = useState<RelationCategory>('BLOOD');

  // 兄弟姐妹血缘类型（仅 SIBLING 关系用）
  const [siblingType, setSiblingType] = useState<SiblingType>('FULL');

  // 结婚日期（配偶关系时显示）
  const [startDate, setStartDate] = useState('');

  // 匹配模式：null=未选择, 'new'=新建, 'match'=匹配已有
  const [mode, setMode] = useState<'new' | 'match' | null>(null);
  // 选中的匹配候选
  const [selectedCandidate, setSelectedCandidate] = useState<Person | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !selfPerson) {
      loadFamily(user.id);
    }
  }, [user, selfPerson, loadFamily]);

  // 检测匹配候选
  const matchCandidates = useMemo(() => {
    if (!selectedOption || !fromPersonId) return [];
    return findMatchCandidates(fromPersonId, selectedOption, persons, relationships);
  }, [selectedOption, fromPersonId, persons, relationships]);

  // 选择关系时，重置状态
  const handleSelectRelation = (option: RelationOption) => {
    setSelectedOption(option);
    setMode(null);
    setSelectedCandidate(null);
    if (option.defaultGender) {
      setGender(option.defaultGender);
    }
  };

  // 检查是否已存在相同关系（防止重复添加）
  // 核心逻辑：检查 fromPerson 是否已有 toRole 角色的父母
  const checkDuplicate = (): string | null => {
    if (!selectedOption || !fromPersonId) return null;

    // 父母角色：检查是否已有同角色的父母
    if (selectedOption.toRole === 'FATHER' || selectedOption.toRole === 'MOTHER') {
      for (const rel of relationships) {
        if (rel.relationType !== 'PARENT_CHILD') continue;
        // 找到涉及 fromPerson 的 PARENT_CHILD 关系
        if (rel.fromPersonId === fromPersonId || rel.toPersonId === fromPersonId) {
          // 检查对方是否是 fromPerson 的 FATHER/MOTHER
          const isFrom = rel.fromPersonId === fromPersonId;
          const otherRole = isFrom ? rel.toRole : rel.fromRole;
          if (otherRole === selectedOption.toRole) {
            return `已添加过${selectedOption.label}，不能重复添加`;
          }
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fromPersonId) {
      setError('请先创建本人节点');
      return;
    }

    if (!selectedOption) {
      setError('请选择关系');
      return;
    }

    // 检查重复
    const dupError = checkDuplicate();
    if (dupError) {
      setError(dupError);
      return;
    }

    setLoading(true);
    try {
      // 根据添加者性别动态确定 fromRole
      const resolvedFromRole = resolveFromRole(selectedOption, fromPerson);

      if (mode === 'match' && selectedCandidate) {
        // 匹配模式：关联到已有人员
        await linkRelative(fromPersonId, selectedCandidate.id, {
          relationType: selectedOption.relationType,
          relationCategory: category,
          fromRole: resolvedFromRole,
          toRole: selectedOption.toRole,
          siblingType: selectedOption.relationType === 'SIBLING' ? siblingType : null,
          startDate: selectedOption.relationType === 'SPOUSE' ? (startDate || null) : null,
        });
      } else {
        // 新建模式
        if (!displayName.trim()) {
          setError('请输入姓名');
          setLoading(false);
          return;
        }

        await addRelative(fromPersonId, {
          relationType: selectedOption.relationType,
          relationCategory: category,
          fromRole: resolvedFromRole,
          toRole: selectedOption.toRole,
          siblingType: selectedOption.relationType === 'SIBLING' ? siblingType : null,
          startDate: selectedOption.relationType === 'SPOUSE' ? (startDate || null) : null,
          personInput: {
            displayName: displayName.trim(),
            gender,
            birthDate: birthDate || null,
            deathDate: !isAlive && deathDate ? deathDate : null,
            isAlive,
            birthPlace: birthPlace.trim() || null,
            currentAddress: currentAddress.trim() || null,
          },
        });
      }

      // 添加成功，返回详情页
      navigate(`/person/${fromPersonId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败');
    } finally {
      setLoading(false);
    }
  };

  // 如果没有本人节点，引导创建
  if (user && !selfPerson) {
    return (
      <>
        <PageHeader title="添加亲属" showBack />
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-ink-500 mb-4">请先完善本人资料，再添加亲属</p>
          <Button onClick={() => navigate('/profile/new')}>
            完善个人资料
          </Button>
        </div>
      </>
    );
  }

  // 按关系类型分组
  const groupedOptions: Record<string, RelationOption[]> = {
    '父母': RELATION_OPTIONS.filter((o) => ['父亲', '母亲'].includes(o.label)),
    '配偶': RELATION_OPTIONS.filter((o) => ['丈夫', '妻子'].includes(o.label)),
    '子女': RELATION_OPTIONS.filter((o) => ['儿子', '女儿'].includes(o.label)),
    '兄弟姐妹': RELATION_OPTIONS.filter((o) => ['哥哥', '弟弟', '姐姐', '妹妹'].includes(o.label)),
    '祖父母': RELATION_OPTIONS.filter((o) => ['爷爷', '奶奶', '外公', '外婆'].includes(o.label)),
  };

  // 是否可提交：匹配模式需要选中候选；新建模式需要姓名
  // 无候选时 mode 为 null，视为新建模式
  const canSubmit = selectedOption && (
    mode === 'match' ? !!selectedCandidate :
    !!displayName.trim()
  );

  return (
    <>
      <PageHeader
        title="添加亲属"
        showBack
        right={
          <button
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className="text-cinnabar-600 hover:text-cinnabar-700 disabled:opacity-30"
          >
            <Check size={20} />
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5">
        {/* 从哪个人员添加 */}
        {fromPerson && (
          <div className="rounded-lg bg-xuan-100 border border-xuan-300 px-3 py-2">
            <p className="text-xs text-ink-500">
              为 <span className="font-medium text-ink-700">{getDisplayName(fromPerson)}</span> 添加亲属
            </p>
          </div>
        )}

        {/* 关系选择 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">
            选择关系 *
          </label>
          <div className="space-y-3">
            {Object.entries(groupedOptions).map(([groupName, options]) => (
              <div key={groupName}>
                <p className="text-xs text-ink-400 mb-1.5">{groupName}</p>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleSelectRelation(option)}
                      className={cn(
                        'px-3.5 h-9 rounded-lg border text-sm font-medium transition-all',
                        selectedOption?.label === option.label
                          ? 'border-cinnabar-400 bg-cinnabar-50 text-cinnabar-700'
                          : 'border-xuan-300 bg-white text-ink-600',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 匹配候选提示 */}
        {selectedOption && matchCandidates.length > 0 && mode === null && (
          <div className="rounded-xl bg-gold-50 border border-gold-300 p-4">
            <div className="flex items-start gap-2 mb-3">
              <UserCheck size={18} className="text-gold-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gold-800">
                  检测到已有亲属，是否匹配？
                </p>
                <p className="text-xs text-gold-700 mt-0.5">
                  系统发现已有可能是同一人的亲属资料。匹配可避免重复创建，明确谁和谁的关系。
                </p>
              </div>
            </div>

            {/* 候选列表 */}
            <div className="space-y-2 mb-3">
              {matchCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setMode('match');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-gold-200 hover:border-gold-400 transition-colors text-left"
                >
                  <Avatar person={candidate} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-800 truncate">
                      {getDisplayName(candidate)}
                    </p>
                    <p className="text-xs text-ink-500">
                      {getGenderLabel(candidate.gender)}
                      {getLifeSpan(candidate) ? ` · ${getLifeSpan(candidate)}` : ''}
                    </p>
                  </div>
                  <span className="text-xs text-gold-600 font-medium shrink-0">
                    选择匹配
                  </span>
                </button>
              ))}
            </div>

            {/* 新建按钮 */}
            <button
              type="button"
              onClick={() => setMode('new')}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-ink-500 hover:text-ink-700"
            >
              <UserPlus size={12} />
              不匹配，新建亲属资料
            </button>
          </div>
        )}

        {/* 已选择匹配 */}
        {mode === 'match' && selectedCandidate && (
          <div className="rounded-xl bg-bamboo-50 border border-bamboo-300 p-4">
            <div className="flex items-center gap-3">
              <Avatar person={selectedCandidate} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-800 truncate">
                  {getDisplayName(selectedCandidate)}
                </p>
                <p className="text-xs text-ink-500">
                  将匹配为 {selectedOption?.label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode(null);
                  setSelectedCandidate(null);
                }}
                className="text-xs text-ink-500 hover:text-cinnabar-600"
              >
                重新选择
              </button>
            </div>
          </div>
        )}

        {/* 新建模式：显示资料表单 */}
        {mode === 'new' && (
          <>
            {/* 关系类别（仅父母-子女关系可选） */}
            {selectedOption?.relationType === 'PARENT_CHILD' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  关系类别
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'BLOOD' as const, label: '亲生' },
                    { value: 'ADOPTION' as const, label: '收养' },
                    { value: 'STEP' as const, label: '继' },
                    { value: 'SWORN' as const, label: '义' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCategory(opt.value)}
                      className={cn(
                        'px-3 h-8 rounded-md border text-xs font-medium transition-all',
                        category === opt.value
                          ? 'border-gold-400 bg-gold-50 text-gold-700'
                          : 'border-xuan-300 bg-white text-ink-500',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 兄弟姐妹血缘类型（仅 SIBLING 关系用） */}
            {selectedOption?.relationType === 'SIBLING' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  血缘关系
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'FULL' as const, label: '同父同母' },
                    { value: 'PATERNAL' as const, label: '同父异母' },
                    { value: 'MATERNAL' as const, label: '同母异父' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSiblingType(opt.value)}
                      className={cn(
                        'px-3 h-8 rounded-md border text-xs font-medium transition-all',
                        siblingType === opt.value
                          ? 'border-gold-400 bg-gold-50 text-gold-700'
                          : 'border-xuan-300 bg-white text-ink-500',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-ink-400">
                  同父同母会共享父母双方；同父异母只共享父亲；同母异父只共享母亲
                </p>
              </div>
            )}

            {/* 结婚日期（配偶关系时显示） */}
            {selectedOption?.relationType === 'SPOUSE' && (
              <PartialDateInput
                label="结婚日期"
                value={startDate}
                onChange={setStartDate}
                placeholder="如 1990 或 1990-05"
              />
            )}

            {/* 亲属资料 */}
            <div className="pt-2 border-t border-xuan-200">
              <p className="text-sm font-medium text-ink-700 mb-3">亲属资料</p>
            </div>

            <Input
              label="姓名 *"
              placeholder="请输入姓名"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
            />

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

            <PartialDateInput
              label="出生日期"
              value={birthDate}
              onChange={setBirthDate}
            />

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

            {!isAlive && (
              <PartialDateInput
                label="逝世日期"
                value={deathDate}
                onChange={setDeathDate}
              />
            )}

            <Input
              label="籍贯"
              placeholder="如：山东济南"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
            />

            <Input
              label="居住地"
              placeholder="如：北京朝阳"
              value={currentAddress}
              onChange={(e) => setCurrentAddress(e.target.value)}
            />
          </>
        )}

        {/* 无候选且已选关系：直接显示新建表单 */}
        {selectedOption && matchCandidates.length === 0 && mode === null && (
          <>
            {/* 关系类别 */}
            {selectedOption?.relationType === 'PARENT_CHILD' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  关系类别
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'BLOOD' as const, label: '亲生' },
                    { value: 'ADOPTION' as const, label: '收养' },
                    { value: 'STEP' as const, label: '继' },
                    { value: 'SWORN' as const, label: '义' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCategory(opt.value)}
                      className={cn(
                        'px-3 h-8 rounded-md border text-xs font-medium transition-all',
                        category === opt.value
                          ? 'border-gold-400 bg-gold-50 text-gold-700'
                          : 'border-xuan-300 bg-white text-ink-500',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 兄弟姐妹血缘类型（无候选时） */}
            {selectedOption?.relationType === 'SIBLING' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  血缘关系
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'FULL' as const, label: '同父同母' },
                    { value: 'PATERNAL' as const, label: '同父异母' },
                    { value: 'MATERNAL' as const, label: '同母异父' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSiblingType(opt.value)}
                      className={cn(
                        'px-3 h-8 rounded-md border text-xs font-medium transition-all',
                        siblingType === opt.value
                          ? 'border-gold-400 bg-gold-50 text-gold-700'
                          : 'border-xuan-300 bg-white text-ink-500',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-ink-400">
                  同父同母会共享父母双方；同父异母只共享父亲；同母异父只共享母亲
                </p>
              </div>
            )}

            {selectedOption?.relationType === 'SPOUSE' && (
              <PartialDateInput
                label="结婚日期"
                value={startDate}
                onChange={setStartDate}
                placeholder="如 1990 或 1990-05"
              />
            )}

            <div className="pt-2 border-t border-xuan-200">
              <p className="text-sm font-medium text-ink-700 mb-3">亲属资料</p>
            </div>

            <Input
              label="姓名 *"
              placeholder="请输入姓名"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
            />

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

            <PartialDateInput
              label="出生日期"
              value={birthDate}
              onChange={setBirthDate}
            />

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

            {!isAlive && (
              <PartialDateInput
                label="逝世日期"
                value={deathDate}
                onChange={setDeathDate}
              />
            )}

            <Input
              label="籍贯"
              placeholder="如：山东济南"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
            />

            <Input
              label="居住地"
              placeholder="如：北京朝阳"
              value={currentAddress}
              onChange={(e) => setCurrentAddress(e.target.value)}
            />
          </>
        )}

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
          disabled={loading || !canSubmit}
        >
          {loading
            ? '添加中...'
            : mode === 'match'
              ? '确认匹配'
              : '添加亲属'}
        </Button>
      </form>
    </>
  );
}
