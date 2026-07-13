// 人员详情页
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Pencil,
  Calendar,
  MapPin,
  Phone,
  BookOpen,
  User as UserIcon,
  UserPlus,
  ChevronRight,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFamilyStore } from '@/store/familyStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import {
  getDisplayName,
  getGenderLabel,
  getLifeSpan,
  formatDateChinese,
} from '@/utils/helpers';
import {
  deriveAllRelationships,
  calculateGenerations,
  getGenerationGroup,
  getSubGroupTitle,
  type DerivedRelationship,
  type GenerationGroup,
} from '@/services/relationDerivation';
import type { Person } from '@/types';

export function PersonDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuthStore();
  const { selfPerson, loadPerson, persons, relationships, removeRelative } = useFamilyStore();

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ name: string; relId: string } | null>(null);

  useEffect(() => {
    const id = params.id;
    if (!id) return;

    const load = async () => {
      setLoading(true);

      // 先从 store 找
      if (selfPerson?.id === id) {
        setPerson(selfPerson);
        setLoading(false);
        return;
      }

      // 再从 DB 加载
      const p = await loadPerson(id);
      setPerson(p);
      setLoading(false);
    };

    load();
  }, [params.id, selfPerson, loadPerson]);

  const isSelf = person?.ownerUserId === user?.id;

  if (loading) {
    return (
      <>
        <PageHeader title="资料" showBack />
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-ink-400">加载中...</div>
        </div>
      </>
    );
  }

  if (!person) {
    return (
      <>
        <PageHeader title="资料" showBack />
        <EmptyState
          icon={<UserIcon size={48} strokeWidth={1.5} />}
          title="未找到人员"
          description="该人员不存在或已被删除"
        />
      </>
    );
  }

  // 推导所有关系（直接 + 传递）
  const allRels = deriveAllRelationships(person.id, persons, relationships);

  // 计算辈分
  const generations = calculateGenerations(persons, relationships, person.id);

  // 过滤显示范围：直系3代 + 旁系2代
  const myGen = generations.get(person.id) || 0;
  const filteredRels = allRels.filter((rel) => {
    const otherGen = generations.get(rel.toPersonId);
    if (otherGen === undefined) return false;

    const genDiff = Math.abs(otherGen - myGen);

    // 直系关系（PARENT_CHILD）允许 3 代
    if (rel.relationType === 'PARENT_CHILD') {
      return genDiff <= 3;
    }

    // 旁系关系（SPOUSE/SIBLING）允许 2 代
    return genDiff <= 2;
  });

  // 按辈分三层分组
  const ancestorRels = filterByGroup(filteredRels, 'ancestor', person.id, generations);
  const peerRels = filterByGroup(filteredRels, 'peer', person.id, generations);
  const descendantRels = filterByGroup(filteredRels, 'descendant', person.id, generations);

  // 删除亲属关系
  const handleDeleteRelative = async () => {
    if (!deleteTarget) return;
    await removeRelative(deleteTarget.relId);
    setDeleteTarget(null);
  };

  // 查找直接关系的 ID
  const findRelId = (toPersonId: string, relationType: string): string | null => {
    const rel = relationships.find(
      (r) =>
        r.relationType === relationType &&
        ((r.fromPersonId === person?.id && r.toPersonId === toPersonId) ||
         (r.toPersonId === person?.id && r.fromPersonId === toPersonId)),
    );
    return rel?.id || null;
  };

  return (
    <>
      <PageHeader
        title="资料"
        showBack
        right={
          isSelf ? (
            <button
              onClick={() => navigate(`/person/${person.id}/edit`)}
              className="text-cinnabar-600 hover:text-cinnabar-700"
            >
              <Pencil size={18} />
            </button>
          ) : undefined
        }
      />

      <div className="px-4 py-4">
        {/* 头部：头像 + 姓名 */}
        <div className="flex flex-col items-center py-6">
          <Avatar person={person} size="xl" />
          <h2 className="mt-3 text-xl font-serif font-bold text-ink-800">
            {getDisplayName(person)}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
            <span>{getGenderLabel(person.gender)}</span>
            {getLifeSpan(person) && (
              <span className={person.isAlive ? 'text-bamboo-600' : 'text-ink-400'}>
                · {getLifeSpan(person)}
              </span>
            )}
            {isSelf && (
              <span className="px-2 py-0.5 rounded-full bg-cinnabar-100 text-cinnabar-600 text-[10px] font-medium">
                本人
              </span>
            )}
          </div>
        </div>

        {/* 添加亲属按钮 */}
        <button
          onClick={() => navigate(`/add-relative/${person.id}`)}
          className="w-full mb-4 rounded-xl bg-gradient-to-r from-cinnabar-500 to-cinnabar-600 text-white py-2.5 px-4 flex items-center justify-center gap-2 shadow-paper hover:shadow-paper-md transition-shadow"
        >
          <UserPlus size={16} />
          <span className="text-sm font-medium">为 TA 添加亲属</span>
        </button>

        {/* 详细信息卡片 */}
        <div className="rounded-xl bg-white border border-xuan-200 divide-y divide-xuan-100 mb-4">
          {/* 生卒信息 */}
          {(person.birthDate || person.deathDate || !person.isAlive) && (
            <InfoRow
              icon={<Calendar size={16} className="text-ink-400" />}
              label={person.isAlive ? '出生日期' : '生卒'}
              value={
                person.isAlive
                  ? `${formatDateChinese(person.birthDate)}${
                      getLifeSpan(person) ? ` · ${getLifeSpan(person)}` : ''
                    }`
                  : getLifeSpan(person)
              }
            />
          )}

          {/* 籍贯 */}
          {person.birthPlace && (
            <InfoRow
              icon={<MapPin size={16} className="text-ink-400" />}
              label="籍贯"
              value={person.birthPlace}
            />
          )}

          {/* 居住地 */}
          {person.currentAddress && (
            <InfoRow
              icon={<MapPin size={16} className="text-ink-400" />}
              label="居住地"
              value={person.currentAddress}
            />
          )}

          {/* 手机号（仅本人可见） */}
          {isSelf && person.phone && (
            <InfoRow
              icon={<Phone size={16} className="text-ink-400" />}
              label="手机号"
              value={person.phone}
            />
          )}

          {/* 简介 */}
          {person.bio && (
            <InfoRow
              icon={<BookOpen size={16} className="text-ink-400" />}
              label="简介"
              value={person.bio}
            />
          )}
        </div>

        {/* 长辈分组 */}
        {ancestorRels.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gold-700 mb-2 px-1">长辈</p>
            <div className="space-y-3">
              {groupBySubGroup(ancestorRels, 'ancestor').map((sub) => (
                <div key={sub.title}>
                  <p className="text-[11px] text-ink-400 mb-1.5 px-1">
                    {sub.title}（{sub.items.length}）
                  </p>
                  <div className="rounded-xl bg-white border border-xuan-200 divide-y divide-xuan-100">
                    {sub.items.map((item) => (
                      <RelativeCard
                        key={`${item.toPersonId}-${item.label}`}
                        rel={item}
                        persons={persons}
                        onClick={() => navigate(`/person/${item.toPersonId}`)}
                        onDelete={
                          !item.isDerived && findRelId(item.toPersonId, item.relationType)
                            ? () => {
                                const relId = findRelId(item.toPersonId, item.relationType);
                                const targetPerson = persons.find((p) => p.id === item.toPersonId);
                                if (relId && targetPerson) {
                                  setDeleteTarget({ name: getDisplayName(targetPerson), relId });
                                }
                              }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 平辈分组 */}
        {peerRels.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-bamboo-700 mb-2 px-1">平辈</p>
            <div className="space-y-3">
              {groupBySubGroup(peerRels, 'peer').map((sub) => (
                <div key={sub.title}>
                  <p className="text-[11px] text-ink-400 mb-1.5 px-1">
                    {sub.title}（{sub.items.length}）
                  </p>
                  <div className="rounded-xl bg-white border border-xuan-200 divide-y divide-xuan-100">
                    {sub.items.map((item) => (
                      <RelativeCard
                        key={`${item.toPersonId}-${item.label}`}
                        rel={item}
                        persons={persons}
                        onClick={() => navigate(`/person/${item.toPersonId}`)}
                        onDelete={
                          !item.isDerived && findRelId(item.toPersonId, item.relationType)
                            ? () => {
                                const relId = findRelId(item.toPersonId, item.relationType);
                                const targetPerson = persons.find((p) => p.id === item.toPersonId);
                                if (relId && targetPerson) {
                                  setDeleteTarget({ name: getDisplayName(targetPerson), relId });
                                }
                              }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 晚辈分组 */}
        {descendantRels.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-cinnabar-700 mb-2 px-1">晚辈</p>
            <div className="space-y-3">
              {groupBySubGroup(descendantRels, 'descendant').map((sub) => (
                <div key={sub.title}>
                  <p className="text-[11px] text-ink-400 mb-1.5 px-1">
                    {sub.title}（{sub.items.length}）
                  </p>
                  <div className="rounded-xl bg-white border border-xuan-200 divide-y divide-xuan-100">
                    {sub.items.map((item) => (
                      <RelativeCard
                        key={`${item.toPersonId}-${item.label}`}
                        rel={item}
                        persons={persons}
                        onClick={() => navigate(`/person/${item.toPersonId}`)}
                        onDelete={
                          !item.isDerived && findRelId(item.toPersonId, item.relationType)
                            ? () => {
                                const relId = findRelId(item.toPersonId, item.relationType);
                                const targetPerson = persons.find((p) => p.id === item.toPersonId);
                                if (relId && targetPerson) {
                                  setDeleteTarget({ name: getDisplayName(targetPerson), relId });
                                }
                              }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 无亲属提示 */}
        {allRels.length === 0 && (
          <div className="rounded-xl bg-xuan-100 border border-xuan-300 p-4 text-center mb-4">
            <p className="text-sm text-ink-500 mb-1">暂无亲属</p>
            <p className="text-xs text-ink-400">
              点击上方按钮为 TA 添加亲属
            </p>
          </div>
        )}

        {/* 查看家族树提示 */}
        {allRels.length > 0 && (
          <button
            onClick={() => navigate('/tree')}
            className="w-full rounded-xl bg-xuan-100 border border-xuan-300 p-3 flex items-center gap-3 hover:bg-xuan-200 transition-colors mb-4"
          >
            <div className="w-8 h-8 rounded-full bg-bamboo-100 flex items-center justify-center">
              <NetworkIcon size={14} className="text-bamboo-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-ink-700">查看完整家族树</p>
              <p className="text-xs text-ink-400">可视化展示所有亲属关系</p>
            </div>
            <ChevronRight size={16} className="text-ink-400" />
          </button>
        )}

        {/* 编辑按钮 */}
        {isSelf && (
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            onClick={() => navigate(`/person/${person.id}/edit`)}
            className="mb-4"
          >
            <Pencil size={16} />
            编辑资料
          </Button>
        )}

        {/* 阶段提示 */}
        <div className="rounded-lg bg-xuan-100 border border-xuan-300 p-3">
          <p className="text-xs text-ink-500">
            点击右上角铅笔可编辑本人资料。亲属卡片右侧垃圾桶可移除直接添加的关系（推导关系不可删除）。
          </p>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-xl shadow-paper-lg p-5 w-full max-w-[300px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-ink-800 mb-1">确认移除亲属？</p>
            <p className="text-xs text-ink-500 mb-4">
              将移除与「{deleteTarget.name}」的亲属关系，对方资料仍保留。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 rounded-lg border border-xuan-300 text-sm text-ink-600 hover:bg-xuan-50"
              >
                取消
              </button>
              <button
                onClick={handleDeleteRelative}
                className="flex-1 h-10 rounded-lg bg-cinnabar-500 text-white text-sm font-medium hover:bg-cinnabar-600"
              >
                确认移除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ========== 辅助组件 ==========

// 亲属卡片
function RelativeCard({
  rel,
  persons,
  onClick,
  onDelete,
}: {
  rel: DerivedRelationship;
  persons: Person[];
  onClick: () => void;
  onDelete?: () => void;
}) {
  const person = persons.find((p) => p.id === rel.toPersonId);
  if (!person) return null;

  return (
    <div className="w-full flex items-center gap-3 px-4 py-3 hover:bg-xuan-50 transition-colors">
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-3 text-left min-w-0"
      >
        <Avatar person={person} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-ink-800 truncate">
              {getDisplayName(person)}
            </p>
            {rel.isDerived && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gold-50 text-gold-600 text-[9px] font-medium shrink-0">
                <Sparkles size={8} />
                推导
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500">
            {rel.label}
            {getLifeSpan(person) ? ` · ${getLifeSpan(person)}` : ''}
          </p>
        </div>
      </button>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-ink-400 hover:text-cinnabar-600 hover:bg-cinnabar-50 transition-colors"
          title="移除亲属关系"
        >
          <Trash2 size={14} />
        </button>
      )}
      <ChevronRight size={16} className="text-ink-400 shrink-0" />
    </div>
  );
}

// 信息行组件
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-400 mb-0.5">{label}</p>
        <p className="text-sm text-ink-800 break-words">{value}</p>
      </div>
    </div>
  );
}

// 引入 Network 图标
function NetworkIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="2" width="6" height="6" />
      <rect x="2" y="16" width="6" height="6" />
      <rect x="16" y="16" width="6" height="6" />
      <path d="M12 8v4M5 16v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

// ========== 分组辅助函数 ==========

function filterByGroup(
  rels: DerivedRelationship[],
  group: GenerationGroup,
  currentPersonId: string,
  generations: Map<string, number>,
): DerivedRelationship[] {
  return rels.filter((rel) => getGenerationGroup(rel, currentPersonId, generations) === group);
}

interface SubGroup {
  title: string;
  items: DerivedRelationship[];
}

function groupBySubGroup(
  rels: DerivedRelationship[],
  group: GenerationGroup,
): SubGroup[] {
  const groups: Record<string, DerivedRelationship[]> = {};

  for (const rel of rels) {
    const title = getSubGroupTitle(rel, group);
    if (!groups[title]) groups[title] = [];
    groups[title].push(rel);
  }

  // 按固定顺序排列（长辈从上到下：祖父母 → 外祖父母 → 父母 → 伯叔姑 → 舅姨）
  const orderMap: Record<GenerationGroup, string[]> = {
    ancestor: ['祖父母', '外祖父母', '父母', '伯叔姑', '舅姨', '长辈'],
    peer: ['配偶', '兄弟姐妹', '平辈'],
    descendant: ['子女', '孙辈', '侄', '甥', '晚辈'],
  };

  return orderMap[group]
    .filter((title) => groups[title]?.length > 0)
    .map((title) => ({ title, items: groups[title] }));
}
